import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/session'

export async function GET() {
  const response = NextResponse.redirect(process.env.NEXTAUTH_URL!)
  response.cookies.delete(COOKIE_NAME)
  return response
}
