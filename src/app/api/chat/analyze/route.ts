import { NextRequest, NextResponse } from 'next/server'
import { analyzeChat } from '@/lib/groq'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

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
    await supabaseAdmin.from('scores').insert({
      user_id: session.id,
      stream_id: session.id, // temporaire — on utilisera le vrai stream_id plus tard
      hype_score: analysis.hypeScore,
      engagement_score: analysis.engagementScore,
      toxicity_score: analysis.toxicityScore,
      summary: analysis.summary,
      top_emotes: analysis.topEmotes,
    })
  }

  return NextResponse.json(analysis)
}
