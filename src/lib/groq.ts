import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface ChatAnalysis {
  hypeScore: number
  engagementScore: number
  toxicityScore: number
  summary: string
  topEmotes: string[]
}

export async function analyzeChat(messages: string[]): Promise<ChatAnalysis> {
  const prompt = `Analyze these Twitch chat messages and return a JSON object with:
- hypeScore (0-100): how hype/excited the chat is
- engagementScore (0-100): how engaged viewers are
- toxicityScore (0-100): how toxic/negative the chat is
- summary (string): 1 sentence describing the chat mood
- topEmotes (string[]): top 3 emotes or recurring words

Messages:
${messages.join('\n')}

Return ONLY valid JSON, no markdown.`

  const completion = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const text = completion.choices[0].message.content ?? '{}'
  return JSON.parse(text)
}
