import { NextRequest, NextResponse } from 'next/server'
import { createRushMoment, getRushMoments } from '@/lib/supabase'
import { getSession } from '@/lib/session'

// Logs a detected hype spike so the post-stream VOD worker can turn it into
// a downloaded, cut clip later. This does NOT touch Twitch's Clips API —
// see /api/clips for that (instant, 30s, hosted by Twitch).
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stream_id, hype_score } = await req.json()
  if (!stream_id) return NextResponse.json({ error: 'stream_id required' }, { status: 400 })

  const moment = await createRushMoment(stream_id, session.id, hype_score ?? 0)
  return NextResponse.json({ moment })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const moments = await getRushMoments(session.id)
  return NextResponse.json({ moments })
}
