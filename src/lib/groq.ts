import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface ChatAnalysis {
  hypeScore: number
  engagementScore: number
  toxicityScore: number
  summary: string
  topEmotes: string[]
}

const HYPE_KEYWORDS = ['pog', 'poggers', 'lets go', 'letsgo', 'gg', 'w', 'winning', 'goat', 'cracked', 'insane', 'crazy', 'fire', 'based', 'hyped', 'hype', 'go', 'wow', 'omg', 'yes', 'yess', 'lesgo', 'lfg', 'clutch', 'ez']
const HYPE_EMOTES = ['poggers', 'pog', 'pogu', 'pepelaugh', 'lul', 'lulw', 'kekw', 'omegalul', 'pepehands', 'monkas', 'widepeeposad', 'peeposad', 'clap', 'peepoClap', '5head', 'pepega']
const TOXIC_KEYWORDS = ['trash', 'bad', 'noob', 'terrible', 'worst', 'hate', 'stupid', 'idiot', 'kys', 'die', 'garbage', 'awful']

function heuristicAnalysis(messages: string[]): ChatAnalysis {
  if (messages.length === 0) {
    return { hypeScore: 0, engagementScore: 0, toxicityScore: 0, summary: 'No messages.', topEmotes: [] }
  }

  const texts = messages.map(m => m.toLowerCase())
  const total = messages.length

  // Caps ratio — beaucoup de majuscules = hype
  const capsRatio = messages.reduce((acc, m) => {
    const letters = m.replace(/[^a-zA-Z]/g, '')
    if (letters.length === 0) return acc
    return acc + (m.replace(/[^A-Z]/g, '').length / letters.length)
  }, 0) / total

  // Exclamations
  const exclamRatio = messages.filter(m => m.includes('!')).length / total

  // Hype keywords
  const hypeHits = texts.filter(m => HYPE_KEYWORDS.some(k => m.includes(k))).length / total

  // Hype emotes
  const emoteHits = texts.filter(m => HYPE_EMOTES.some(e => m.includes(e))).length / total

  // Toxicité
  const toxicHits = texts.filter(m => TOXIC_KEYWORDS.some(k => m.includes(k))).length / total

  // Compte les mots/emotes récurrents
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

  // Volume bonus — plus il y a de messages, plus c'est engagé
  const volumeBonus = Math.min(total / 30, 1) * 20

  // Score brut — divisé par 2 pour éviter de monter trop vite
  const rawHype = (capsRatio * 15 + exclamRatio * 15 + hypeHits * 25 + emoteHits * 15) * 100
  // Pénalité si peu de messages
  const volumePenalty = total < 3 ? 0.1 : total < 5 ? 0.3 : total < 10 ? 0.6 : 1
  const hypeScore = Math.min(100, Math.round(rawHype * volumePenalty + volumeBonus * 0.5))
  const engagementScore = Math.min(100, Math.round(volumeBonus * 2 + hypeScore * 0.2))
  const toxicityScore = Math.min(100, Math.round(toxicHits * 80))

  const summary = hypeScore >= 70
    ? `Chat on fire! ${total} messages with a lot of hype.`
    : hypeScore >= 40
    ? `Active chat with ${total} messages.`
    : `Quiet chat — ${total} messages received.`

  return { hypeScore, engagementScore, toxicityScore, summary, topEmotes }
}

export async function analyzeChat(messages: string[]): Promise<ChatAnalysis> {
  // Moins de 8 messages → heuristique pure (pas besoin d'IA)
  if (messages.length < 8) {
    return heuristicAnalysis(messages)
  }

  const sample = messages.slice(-50)
  const heuristic = heuristicAnalysis(sample)
  const capsCount = sample.filter(m => {
    const letters = m.replace(/[^a-zA-Z]/g, '')
    return letters.length > 0 && m.replace(/[^A-Z]/g, '').length / letters.length > 0.3
  }).length
  const exclamCount = sample.filter(m => m.includes('!')).length

  const prompt = `You are analyzing a Twitch chat. Here are ${sample.length} messages:
${sample.join('\n')}

Context clues:
- High caps in ${Math.round(capsCount / sample.length * 100)}% of messages
- Exclamation marks in ${Math.round(exclamCount / sample.length * 100)}% of messages

Return ONLY a JSON object with:
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

    // Mixe heuristique + IA pour plus de précision
    return {
      hypeScore: Math.round((Number(parsed.hypeScore) + heuristic.hypeScore) / 2) || heuristic.hypeScore,
      engagementScore: Math.round((Number(parsed.engagementScore) + heuristic.engagementScore) / 2) || heuristic.engagementScore,
      toxicityScore: Math.round((Number(parsed.toxicityScore) + heuristic.toxicityScore) / 2) || heuristic.toxicityScore,
      summary: parsed.summary || heuristic.summary,
      topEmotes: Array.isArray(parsed.topEmotes) ? parsed.topEmotes : heuristic.topEmotes,
    }
  } catch (err) {
    console.error('Groq error:', err)
    return heuristic
  }
}
