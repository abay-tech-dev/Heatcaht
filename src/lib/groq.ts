import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface ChatAnalysis {
  hypeScore: number
  engagementScore: number
  toxicityScore: number
  summary: string
  topEmotes: string[]
}

const DEFAULT: ChatAnalysis = {
  hypeScore: 50,
  engagementScore: 50,
  toxicityScore: 10,
  summary: 'Chat actif.',
  topEmotes: [],
}

export async function analyzeChat(messages: string[]): Promise<ChatAnalysis> {
  // Limite à 50 messages max pour éviter de dépasser le context
  const sample = messages.slice(-50)

  const prompt = `Analyze these Twitch chat messages and return a JSON object with exactly these fields:
- hypeScore (integer 0-100): how hype/excited the chat is
- engagementScore (integer 0-100): how engaged viewers are
- toxicityScore (integer 0-100): how toxic/negative the chat is
- summary (string): 1 short sentence describing the chat mood
- topEmotes (array of 3 strings): top emotes or recurring words

Messages:
${sample.join('\n')}

Return ONLY a valid JSON object.`

  try {
    const completion = await client.chat.completions.create({
      model: 'llama3-8b-8192',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(text)

    return {
      hypeScore: Number(parsed.hypeScore) || DEFAULT.hypeScore,
      engagementScore: Number(parsed.engagementScore) || DEFAULT.engagementScore,
      toxicityScore: Number(parsed.toxicityScore) || DEFAULT.toxicityScore,
      summary: parsed.summary || DEFAULT.summary,
      topEmotes: Array.isArray(parsed.topEmotes) ? parsed.topEmotes : DEFAULT.topEmotes,
    }
  } catch (err) {
    console.error('Groq error:', err)
    return DEFAULT
  }
}
