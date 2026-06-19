import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import { createSession, COOKIE_NAME } from '@/lib/session'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const origin = req.nextUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const response = NextResponse.redirect(`${origin}/dashboard`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session) {
    console.error('OAuth error:', error?.message)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  const { session, user } = data
  const twitchId = user.user_metadata?.provider_id ?? user.id
  const twitchUsername = user.user_metadata?.preferred_username ?? user.user_metadata?.name ?? 'unknown'
  const email = user.email ?? ''
  const providerToken = session.provider_token ?? ''

  // Preserve existing widget_token on re-login
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id, widget_token, plan')
    .eq('twitch_id', twitchId)
    .single()

  let dbUser
  if (existing) {
    const { data: updated } = await supabaseAdmin
      .from('users')
      .update({ twitch_access_token: providerToken, twitch_username: twitchUsername, email })
      .eq('twitch_id', twitchId)
      .select()
      .single()
    dbUser = updated
  } else {
    const { data: created } = await supabaseAdmin
      .from('users')
      .insert({
        twitch_id: twitchId,
        twitch_username: twitchUsername,
        email,
        twitch_access_token: providerToken,
        widget_token: crypto.randomUUID(),
        plan: 'free',
      })
      .select()
      .single()
    dbUser = created
  }

  if (!dbUser) {
    return NextResponse.redirect(`${origin}/login?error=db_error`)
  }

  const token = await createSession({
    id: dbUser.id,
    twitch_id: twitchId,
    twitch_username: twitchUsername,
    plan: dbUser.plan ?? 'free',
    widget_token: dbUser.widget_token,
  })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
