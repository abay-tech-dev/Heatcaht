'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Message {
  id: number
  user: string
  text: string
  timestamp: Date
}

interface Analysis {
  hypeScore: number
  engagementScore: number
  toxicityScore: number
  summary: string
  topEmotes: string[]
}

const DEMO_MESSAGES = [
  { user: 'xX_Gamer_Xx', text: 'POGGERS that play was insane!!' },
  { user: 'StreamFan99', text: 'W W W W W W W' },
  { user: 'TwitchViewer', text: 'bro actually carried the whole team' },
  { user: 'ChatLurker', text: 'this is so bad lmaooo' },
  { user: 'PogChamp2024', text: 'LUL LUL LUL' },
  { user: 'ViewerOne', text: 'first time watching, this guy is cracked' },
  { user: 'RegularViewer', text: 'KEKW not again' },
  { user: 'HypeTrainer', text: 'Clap Clap Clap lets gooo' },
]

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [analysis, setAnalysis] = useState<Analysis>({
    hypeScore: 72,
    engagementScore: 85,
    toxicityScore: 8,
    summary: 'Chat is highly engaged and excited about the gameplay.',
    topEmotes: ['POGGERS', 'W', 'LUL'],
  })
  const [input, setInput] = useState('')
  const [channel, setChannel] = useState('demo')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)
  const msgIdRef = useRef(0)
  const batchRef = useRef<string[]>([])

  // Simulate incoming messages in demo mode
  useEffect(() => {
    const interval = setInterval(() => {
      const demo = DEMO_MESSAGES[Math.floor(Math.random() * DEMO_MESSAGES.length)]
      addMessage(demo.user, demo.text)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  // Analyze batch every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (batchRef.current.length === 0) return
      const toAnalyze = [...batchRef.current]
      batchRef.current = []
      setIsAnalyzing(true)
      try {
        const res = await fetch('/api/chat/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: toAnalyze }),
        })
        if (res.ok) {
          const data = await res.json()
          setAnalysis(data)
        }
      } catch {
        // API not configured yet, keep demo scores
      } finally {
        setIsAnalyzing(false)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  function addMessage(user: string, text: string) {
    const msg: Message = { id: msgIdRef.current++, user, text, timestamp: new Date() }
    setMessages((prev) => [...prev.slice(-49), msg])
    batchRef.current.push(`${user}: ${text}`)
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    addMessage('You', input.trim())
    setInput('')
  }

  const scoreColor = (score: number) =>
    score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-purple-400">🔥 HeatChat</Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
            <span className="text-gray-400 text-sm">Channel:</span>
            <span className="text-white font-mono text-sm">#{channel}</span>
          </div>
          <Link href={`/widget/${channel}`} target="_blank" className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            OBS Widget ↗
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scores */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-300">Live Scores {isAnalyzing && <span className="text-purple-400 text-sm ml-2">analyzing...</span>}</h2>
          {[
            { label: '🔥 Hype', score: analysis.hypeScore },
            { label: '🎯 Engagement', score: analysis.engagementScore },
            { label: '☠️ Toxicity', score: analysis.toxicityScore },
          ].map(({ label, score }) => (
            <div key={label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300">{label}</span>
                <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all duration-1000"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-2">AI Summary</h3>
            <p className="text-white text-sm">{analysis.summary}</p>
          </div>

          {/* Top emotes */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-3">Top Emotes / Words</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.topEmotes.map((e) => (
                <span key={e} className="bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full text-sm">{e}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Chat feed */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 flex flex-col" style={{ height: '80vh' }}>
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold">Live Chat Feed</h2>
            <span className="text-xs text-gray-500">{messages.length} messages</span>
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 text-sm">
                <span className="text-purple-400 font-semibold shrink-0">{msg.user}:</span>
                <span className="text-gray-300">{msg.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-4 border-t border-gray-800 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message to test..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
