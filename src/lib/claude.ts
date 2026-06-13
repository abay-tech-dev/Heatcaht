import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ChatAnalysis {
  hypeScore: number      // 0-100
  engagementScore: number // 0-100
  toxicityScore: number  // 0-100
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

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (message.content[0] as { type: string; text: string }).text
  return JSON.parse(text)
}
