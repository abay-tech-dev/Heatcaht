import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.TWITCH_CLIENT_ID!
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/twitch/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'user:read:email',
  })

  return NextResponse.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`)
}
