import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'fallback-secret-change-me')
const COOKIE = 'heatchat_session'

export interface SessionUser {
  id: string
  twitch_id: string
  twitch_username: string
  plan: string
  widget_token: string
}

export async function createSession(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return (payload as { user: SessionUser }).user
  } catch {
    return null
  }
}

export const COOKIE_NAME = COOKIE
