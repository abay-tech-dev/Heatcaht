import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { hype_score } = await req.json()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('twitch_id, twitch_access_token')
    .eq('id', session.id)
    .single()

  if (!user?.twitch_access_token) {
    return NextResponse.json({ error: 'No Twitch token — please log in with Twitch' }, { status: 400 })
  }

  // Crée le clip via l'API Twitch
  const clipRes = await fetch(
    `https://api.twitch.tv/helix/clips?broadcaster_id=${user.twitch_id}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.twitch_access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID!,
      },
    }
  )

  const clipBody = await clipRes.json()
  console.log('Twitch clip response:', clipRes.status, JSON.stringify(clipBody))

  if (!clipRes.ok) {
    return NextResponse.json({ error: 'Clip creation failed', detail: clipBody }, { status: 500 })
  }

  const clip = clipBody.data?.[0]
  if (!clip) return NextResponse.json({ error: 'No clip returned', detail: clipBody }, { status: 500 })

  // Sauvegarde immédiatement sans attendre Twitch (évite timeout serverless)
  const { data: saved, error: dbError } = await supabaseAdmin
    .from('clips')
    .insert({
      user_id: session.id,
      clip_id: clip.id,
      clip_url: `https://clips.twitch.tv/${clip.id}`,
      thumbnail_url: null,
      hype_score: hype_score ?? 0,
    })
    .select()
    .single()

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'DB save failed', detail: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, clip: saved })
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: clips } = await supabaseAdmin
    .from('clips')
    .select('*')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ clips: clips ?? [] })
}
