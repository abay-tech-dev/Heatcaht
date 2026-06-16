import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token requis' }, { status: 400 })
  }

  const { supabaseAdmin } = await import('@/lib/supabase')

  // Récupère l'user par son widget_token
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('widget_token', token)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 404 })
  }

  // Récupère le dernier score
  const { data: score } = await supabaseAdmin
    .from('scores')
    .select('hype_score, engagement_score, toxicity_score, summary, top_emotes, recorded_at')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  if (!score) {
    return NextResponse.json({
      hypeScore: 0,
      engagementScore: 0,
      toxicityScore: 0,
      summary: 'En attente du chat...',
      topEmotes: [],
    })
  }

  // Si le dernier score date de plus de 60s → chat inactif, retour à 0
  const age = Date.now() - new Date(score.recorded_at).getTime()
  if (age > 60_000) {
    return NextResponse.json({
      hypeScore: 0,
      engagementScore: 0,
      toxicityScore: 0,
      summary: 'Chat inactif...',
      topEmotes: [],
    })
  }

  return NextResponse.json({
    hypeScore: score.hype_score,
    engagementScore: score.engagement_score,
    toxicityScore: score.toxicity_score,
    summary: score.summary,
    topEmotes: score.top_emotes ?? [],
    recordedAt: score.recorded_at,
  })
}
