import { NextRequest, NextResponse } from 'next/server'
import { analyzeChat } from '@/lib/groq'
import { saveScore } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { messages, stream_id, user_id } = await req.json()

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
  }

  let analysis
  try {
    analysis = await analyzeChat(messages)
  } catch (err) {
    console.error('analyzeChat error:', err)
    return NextResponse.json({ error: 'Analyse échouée' }, { status: 500 })
  }

  // Sauvegarde en base si on a un stream actif
  if (stream_id && user_id) {
    await saveScore(
      stream_id,
      user_id,
      analysis.hypeScore,
      analysis.engagementScore,
      analysis.toxicityScore,
      analysis.summary,
      analysis.topEmotes
    )
  }

  return NextResponse.json(analysis)
}
