import { NextRequest, NextResponse } from 'next/server'
import { analyzeChat } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
  }
  const analysis = await analyzeChat(messages)
  return NextResponse.json(analysis)
}
