import { NextRequest, NextResponse } from 'next/server'
import { endStream } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stream_id } = await req.json()
  if (!stream_id) return NextResponse.json({ error: 'stream_id required' }, { status: 400 })

  await endStream(stream_id)
  return NextResponse.json({ success: true })
}
