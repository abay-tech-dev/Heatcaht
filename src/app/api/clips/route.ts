import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { hype_score } = await req.json()

  // Récupère le token Twitch de l'utilisateur
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('twitch_id, twitch_access_token')
    .eq('id', session.id)
    .single()

  if (!user?.twitch_access_token) {
    return NextResponse.json({ error: 'No Twitch token' }, { status: 400 })
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

  if (!clipRes.ok) {
    const err = await clipRes.text()
    console.error('Twitch clip error:', err)
    return NextResponse.json({ error: 'Clip creation failed', detail: err }, { status: 500 })
  }

  const clipData = await clipRes.json()
  const clip = clipData.data?.[0]
  if (!clip) return NextResponse.json({ error: 'No clip returned' }, { status: 500 })

  // Attend 15s que Twitch génère le clip, puis récupère les infos complètes
  await new Promise(r => setTimeout(r, 15000))

  const infoRes = await fetch(
    `https://api.twitch.tv/helix/clips?id=${clip.id}`,
    {
      headers: {
        'Authorization': `Bearer ${user.twitch_access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID!,
      },
    }
  )

  const infoData = await infoRes.json()
  const clipInfo = infoData.data?.[0]

  // Sauvegarde en base
  const { data: saved } = await supabaseAdmin
    .from('clips')
    .insert({
      user_id: session.id,
      clip_id: clip.id,
      clip_url: clipInfo?.url ?? `https://clips.twitch.tv/${clip.id}`,
      thumbnail_url: clipInfo?.thumbnail_url ?? null,
      hype_score,
    })
    .select()
    .single()

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
