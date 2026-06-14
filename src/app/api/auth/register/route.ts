import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSession, COOKIE_NAME } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { email, password, twitch_username } = await req.json()

  if (!email || !password || !twitch_username) {
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
  }

  // Crée le compte dans Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Crée le profil dans notre table users
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      twitch_id: `email_${authData.user.id}`,
      twitch_username: twitch_username.toLowerCase().replace('@', ''),
      email,
    })
    .select()
    .single()

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 })
  }

  const token = await createSession({
    id: user.id,
    twitch_id: user.twitch_id,
    twitch_username: user.twitch_username,
    plan: user.plan,
    widget_token: user.widget_token,
  })

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
