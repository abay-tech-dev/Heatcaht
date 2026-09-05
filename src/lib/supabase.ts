import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface User {
  id: string
  twitch_id: string
  twitch_username: string
  email?: string
  plan: 'free' | 'starter' | 'pro' | 'agency'
  stripe_customer_id?: string
  widget_token: string
  created_at: string
}

export interface Stream {
  id: string
  user_id: string
  channel: string
  started_at: string
  ended_at?: string
  twitch_vod_id?: string
  twitch_vod_url?: string
}

export interface RushMoment {
  id: string
  stream_id: string
  user_id: string
  hype_score: number
  occurred_at: string
  status: 'pending' | 'processed' | 'failed'
  storage_path?: string
  clip_url?: string
  duration_seconds?: number
  created_at: string
}

export interface Score {
  id: string
  stream_id: string
  user_id: string
  hype_score: number
  engagement_score: number
  toxicity_score: number
  summary?: string
  top_emotes?: string[]
  recorded_at: string
}

export async function upsertUser(twitch_id: string, twitch_username: string, email?: string): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert({ twitch_id, twitch_username, email }, { onConflict: 'twitch_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function startStream(user_id: string, channel: string): Promise<Stream> {
  const { data, error } = await supabaseAdmin
    .from('streams')
    .insert({ user_id, channel })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function endStream(stream_id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('streams')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', stream_id)
  if (error) throw error
}

export async function saveScore(
  stream_id: string,
  user_id: string,
  hype_score: number,
  engagement_score: number,
  toxicity_score: number,
  summary: string,
  top_emotes: string[]
): Promise<Score> {
  const { data, error } = await supabaseAdmin
    .from('scores')
    .insert({ stream_id, user_id, hype_score, engagement_score, toxicity_score, summary, top_emotes })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getStreamScores(stream_id: string): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('stream_id', stream_id)
    .order('recorded_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getUserByWidgetToken(token: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('widget_token', token)
    .single()
  return data
}

// --- Rush (VOD highlight extraction, beta) ---

export async function createRushMoment(stream_id: string, user_id: string, hype_score: number): Promise<RushMoment> {
  const { data, error } = await supabaseAdmin
    .from('rush_moments')
    .insert({ stream_id, user_id, hype_score })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRushMoments(user_id: string): Promise<RushMoment[]> {
  const { data, error } = await supabaseAdmin
    .from('rush_moments')
    .select('*')
    .eq('user_id', user_id)
    .order('occurred_at', { ascending: false })
  if (error) throw error
  return data
}
