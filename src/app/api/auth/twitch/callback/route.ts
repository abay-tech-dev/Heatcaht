import { NextRequest, NextResponse } from 'next/server'
import { upsertUser } from '@/lib/supabase'
import { createSession, COOKIE_NAME } from '@/lib/session'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=no_code`)
  }

  // Échange le code contre un access token
  const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/twitch/callback`,
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=token_failed`)
  }

  // Récupère les infos du user Twitch
  const userRes = await fetch('https://api.twitch.tv/helix/users', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID!,
    },
  })

  const userData = await userRes.json()
  const twitchUser = userData.data?.[0]
  if (!twitchUser) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=user_failed`)
  }

  // Crée ou met à jour le user en base
  const user = await upsertUser(twitchUser.id, twitchUser.login, twitchUser.email)

  // Crée la session JWT
  const token = await createSession({
    id: user.id,
    twitch_id: user.twitch_id,
    twitch_username: user.twitch_username,
    plan: user.plan,
    widget_token: user.widget_token,
  })

  // Redirige vers le dashboard avec le cookie de session
  const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`)
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: '/',
  })

  return response
}
