import { NextRequest, NextResponse } from 'next/server'
import { startStream } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channel } = await req.json()
  if (!channel) return NextResponse.json({ error: 'channel required' }, { status: 400 })

  const stream = await startStream(session.id, channel)
  return NextResponse.json({ stream })
}
