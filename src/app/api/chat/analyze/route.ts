import { NextRequest, NextResponse } from 'next/server'
import { analyzeChat } from '@/lib/groq'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { messages, stream_id } = await req.json()

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

  // Sauvegarde le score si l'utilisateur est connecté
  const session = await getSession()
  if (session) {
    const { error } = await supabaseAdmin.from('scores').insert({
      user_id: session.id,
      stream_id: stream_id ?? null,
      hype_score: analysis.hypeScore,
      engagement_score: analysis.engagementScore,
      toxicity_score: analysis.toxicityScore,
      summary: analysis.summary,
      top_emotes: analysis.topEmotes,
    })
    if (error) console.error('Score save error:', error.message)
  }

  return NextResponse.json(analysis)
}
