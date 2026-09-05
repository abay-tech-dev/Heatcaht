/**
 * Rush VOD worker (beta) — run this manually, outside Vercel.
 *
 * Downloads a broadcaster's latest Twitch VOD, cuts a short clip around each
 * pending hype moment recorded during the stream, and uploads the results to
 * Supabase Storage.
 *
 * This is intentionally a plain Node script, NOT a Next.js API route: the
 * download + cut steps can easily take several minutes for a long stream,
 * which is far beyond what a serverless function is allowed to run for.
 *
 * Requirements on the machine running this script:
 *   - yt-dlp installed and in PATH   (https://github.com/yt-dlp/yt-dlp)
 *   - ffmpeg installed and in PATH
 *   - The same env vars as the app: NEXT_PUBLIC_SUPABASE_URL,
 *     SUPABASE_SERVICE_ROLE_KEY, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET
 *     (a .env file in the project root is loaded automatically)
 *
 * Usage:
 *   npm run worker:process-vod -- <stream_id>
 *
 * The <stream_id> is the id returned by /api/streams/start — for a beta
 * test, grab it from the `streams` table in Supabase after the broadcaster
 * has finished streaming and stopped chat capture on the dashboard.
 */
import 'dotenv/config'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const execFileAsync = promisify(execFile)

const BUCKET = 'rush-clips'
const CLIP_PADDING_BEFORE_SECONDS = 10 // grab a bit of context before the spike
const CLIP_DURATION_SECONDS = 30

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getTwitchAppToken(): Promise<string> {
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to get Twitch app token: ' + JSON.stringify(data))
  return data.access_token as string
}

interface TwitchVod {
  id: string
  url: string
  created_at: string
  duration: string
}

async function getLatestVod(twitchUserId: string, appToken: string): Promise<TwitchVod> {
  const res = await fetch(
    `https://api.twitch.tv/helix/videos?user_id=${twitchUserId}&type=archive&first=1`,
    { headers: { Authorization: `Bearer ${appToken}`, 'Client-Id': process.env.TWITCH_CLIENT_ID! } }
  )
  const data = await res.json()
  const vod = data.data?.[0]
  if (!vod) {
    throw new Error(
      'No VOD found for this broadcaster. Make sure "Store past broadcasts" is enabled ' +
      'in the Twitch Creator Dashboard (Settings → Stream) and that the stream has ended.'
    )
  }
  return vod as TwitchVod
}

async function main() {
  const streamId = process.argv[2]
  if (!streamId) {
    console.error('Usage: npm run worker:process-vod -- <stream_id>')
    process.exit(1)
  }

  const { data: stream, error: streamErr } = await supabase
    .from('streams')
    .select('id, user_id, channel, started_at')
    .eq('id', streamId)
    .single()
  if (streamErr || !stream) throw new Error('Stream not found: ' + streamErr?.message)

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('twitch_id, twitch_username')
    .eq('id', stream.user_id)
    .single()
  if (userErr || !user) throw new Error('User not found for this stream: ' + userErr?.message)

  const { data: moments, error: momentsErr } = await supabase
    .from('rush_moments')
    .select('id, hype_score, occurred_at')
    .eq('stream_id', streamId)
    .eq('status', 'pending')
    .order('occurred_at', { ascending: true })
  if (momentsErr) throw new Error('Failed to load rush moments: ' + momentsErr.message)

  if (!moments || moments.length === 0) {
    console.log('No pending hype moments for this stream — nothing to do.')
    return
  }

  console.log(`Found ${moments.length} pending hype moment(s) for #${user.twitch_username}.`)

  const appToken = await getTwitchAppToken()
  const vod = await getLatestVod(user.twitch_id, appToken)
  console.log(`Using VOD ${vod.id} (started ${vod.created_at}) — ${vod.url}`)

  await supabase.from('streams').update({ twitch_vod_id: vod.id, twitch_vod_url: vod.url }).eq('id', streamId)

  // Best-effort: create the bucket if it doesn't exist yet. Public for the beta —
  // move to private + signed URLs before this goes out to real customers.
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  const vodStartMs = new Date(vod.created_at).getTime()
  const workDir = await mkdtemp(path.join(tmpdir(), 'heatchat-vod-'))
  const vodFile = path.join(workDir, 'vod.mp4')

  try {
    console.log('Downloading VOD with yt-dlp (this can take a while for long streams)...')
    await execFileAsync('yt-dlp', ['-f', 'best', '-o', vodFile, vod.url])

    for (const moment of moments) {
      const offsetSeconds = Math.max(
        0,
        Math.floor((new Date(moment.occurred_at).getTime() - vodStartMs) / 1000) - CLIP_PADDING_BEFORE_SECONDS
      )
      const outFile = path.join(workDir, `${moment.id}.mp4`)

      console.log(`Cutting moment ${moment.id} at offset ${offsetSeconds}s (hype ${moment.hype_score})...`)
      try {
        await execFileAsync('ffmpeg', [
          '-y', '-ss', String(offsetSeconds), '-i', vodFile,
          '-t', String(CLIP_DURATION_SECONDS), '-c', 'copy', outFile,
        ])

        const fileBuffer = await readFile(outFile)
        const storagePath = `${stream.user_id}/${moment.id}.mp4`
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, fileBuffer, { contentType: 'video/mp4', upsert: true })
        if (uploadErr) throw uploadErr

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
        await supabase
          .from('rush_moments')
          .update({
            status: 'processed',
            storage_path: storagePath,
            clip_url: pub.publicUrl,
            duration_seconds: CLIP_DURATION_SECONDS,
          })
          .eq('id', moment.id)

        console.log(`  -> ready: ${pub.publicUrl}`)
      } catch (err) {
        console.error(`  -> failed:`, err)
        await supabase.from('rush_moments').update({ status: 'failed' }).eq('id', moment.id)
      }
    }
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }

  console.log('Done.')
}

main().catch(err => {
  console.error('Worker failed:', err)
  process.exit(1)
})
