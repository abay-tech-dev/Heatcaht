import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface ChatAnalysis {
  hypeScore: number
  engagementScore: number
  toxicityScore: number
  summary: string
  topEmotes: string[]
}

const HYPE_KEYWORDS = ['pog', 'poggers', 'lets go', 'letsgo', 'gg', 'winning', 'goat', 'cracked', 'insane', 'crazy', 'fire', 'hyped', 'hype', 'omg', 'lesgo', 'lfg', 'clutch', 'incredible', 'unreal', 'beast']
const HYPE_EMOTES = ['poggers', 'pog', 'pogu', 'pepelaugh', 'lul', 'lulw', 'kekw', 'omegalul', 'clap', 'peepoClap']
const TOXIC_KEYWORDS = ['trash', 'bad', 'noob', 'terrible', 'worst', 'hate', 'stupid', 'idiot', 'kys', 'die', 'garbage', 'awful']

function heuristicAnalysis(messages: string[]): ChatAnalysis {
  if (messages.length === 0) {
    return { hypeScore: 0, engagementScore: 0, toxicityScore: 0, summary: 'No messages.', topEmotes: [] }
  }

  const texts = messages.map(m => m.toLowerCase().trim())
  const total = messages.length

  // --- Anti-spam: ratio of unique messages vs total ---
  const uniqueMessages = new Set(texts).size
  const spamRatio = 1 - (uniqueMessages / total) // 0 = all unique, 1 = all duplicates
  const spamPenalty = Math.max(0, 1 - spamRatio * 1.5) // heavy penalty for spam

  // --- User diversity (parsed from "user: text" format) ---
  const users = messages.map(m => m.split(':')[0]?.trim()).filter(Boolean)
  const uniqueUsers = new Set(users).size
  const diversityBonus = Math.min(uniqueUsers / Math.max(total * 0.6, 1), 1) // reward diverse users

  // --- Message quality: average length (spammy = short) ---
  const avgLength = messages.reduce((acc, m) => acc + m.length, 0) / total
  const qualityFactor = Math.min(avgLength / 30, 1) // penalize very short messages

  // --- Caps ratio ---
  const capsRatio = messages.reduce((acc, m) => {
    const letters = m.replace(/[^a-zA-Z]/g, '')
    if (letters.length === 0) return acc
    return acc + (m.replace(/[^A-Z]/g, '').length / letters.length)
  }, 0) / total

  // --- Exclamations ---
  const exclamRatio = messages.filter(m => m.includes('!')).length / total

  // --- Hype keywords ---
  const hypeHits = texts.filter(m => HYPE_KEYWORDS.some(k => m.includes(k))).length / total

  // --- Hype emotes ---
  const emoteHits = texts.filter(m => HYPE_EMOTES.some(e => m.includes(e))).length / total

  // --- Toxicity ---
  const toxicHits = texts.filter(m => TOXIC_KEYWORDS.some(k => m.includes(k))).length / total

  // --- Top words ---
  const wordCount: Record<string, number> = {}
  texts.forEach(m => {
    m.split(/\s+/).forEach(w => {
      if (w.length > 2) wordCount[w] = (wordCount[w] || 0) + 1
    })
  })
  const topEmotes = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w.toUpperCase())

  // --- Volume: need real volume to score high ---
  // 0 msg = 0, 10 msg = 0.2, 20 = 0.45, 30 = 0.65, 50 = 0.85, 80+ = 1.0
  const volumeFactor = Math.min(Math.pow(total / 80, 0.6), 1)

  // --- Raw hype signal (0 to ~85 max, never naturally hits 100) ---
  // Each component is a ratio 0-1, weights sum to 85
  const rawSignal = capsRatio * 20 + exclamRatio * 15 + hypeHits * 30 + emoteHits * 20

  // --- Apply all modifiers ---
  // volumeFactor alone caps score: 10 msgs → ×0.18, 30 → ×0.42, 60 → ×0.72, 120+ → ×1.0
  const hypeScore = Math.min(95, Math.round(
    rawSignal
    * volumeFactor
    * spamPenalty
    * qualityFactor
    * (0.5 + diversityBonus * 0.5)
  ))

  const engagementScore = Math.min(100, Math.round(
    volumeFactor * 60 + diversityBonus * 40
  ))

  const toxicityScore = Math.min(100, Math.round(toxicHits * 100))

  const summary = hypeScore >= 70
    ? `Chat on fire! ${total} messages, high energy.`
    : hypeScore >= 40
    ? `Active chat — ${total} messages, good engagement.`
    : `Quiet chat — ${total} messages received.`

  return { hypeScore, engagementScore, toxicityScore, summary, topEmotes }
}

export async function analyzeChat(messages: string[]): Promise<ChatAnalysis> {
  if (messages.length < 15) {
    return heuristicAnalysis(messages)
  }

  const sample = messages.slice(-80)
  const heuristic = heuristicAnalysis(sample)
  const capsCount = sample.filter(m => {
    const letters = m.replace(/[^a-zA-Z]/g, '')
    return letters.length > 0 && m.replace(/[^A-Z]/g, '').length / letters.length > 0.3
  }).length
  const exclamCount = sample.filter(m => m.includes('!')).length
  const uniqueCount = new Set(sample.map(m => m.toLowerCase().trim())).size

  const prompt = `You are analyzing a Twitch chat with ${sample.length} messages. Be strict and realistic.

Messages:
${sample.join('\n')}

Context:
- ${Math.round(capsCount / sample.length * 100)}% of messages have high caps
- ${Math.round(exclamCount / sample.length * 100)}% have exclamation marks
- ${uniqueCount} unique messages out of ${sample.length} (spam ratio: ${Math.round((1 - uniqueCount/sample.length)*100)}%)

Scoring rules:
- hypeScore: needs VOLUME + DIVERSITY + QUALITY. Single keyword bursts = low score. 100 = massive engaged crowd going wild.
- engagementScore: based on message count and user diversity.
- toxicityScore: based on toxic keywords.
- Do NOT give high scores for low volume or repetitive spam.

Return ONLY a JSON object:
- hypeScore (integer 0-100)
- engagementScore (integer 0-100)
- toxicityScore (integer 0-100)
- summary (1 short sentence in English)
- topEmotes (array of 3 most used words/emotes in UPPERCASE)`

  try {
    const completion = await client.chat.completions.create({
      model: 'llama3-8b-8192',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(text)

    // Heuristic dominates (80%) — AI tends to inflate scores
    return {
      hypeScore: Math.min(95, Math.round(Number(parsed.hypeScore) * 0.2 + heuristic.hypeScore * 0.8)) || heuristic.hypeScore,
      engagementScore: Math.min(95, Math.round(Number(parsed.engagementScore) * 0.2 + heuristic.engagementScore * 0.8)) || heuristic.engagementScore,
      toxicityScore: Math.round(Number(parsed.toxicityScore) * 0.5 + heuristic.toxicityScore * 0.5) || heuristic.toxicityScore,
      summary: parsed.summary || heuristic.summary,
      topEmotes: Array.isArray(parsed.topEmotes) ? parsed.topEmotes : heuristic.topEmotes,
    }
  } catch (err) {
    console.error('Groq error:', err)
    return heuristic
  }
}
