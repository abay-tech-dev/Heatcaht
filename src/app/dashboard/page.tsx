'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface SessionUser {
  id: string
  twitch_username: string
  plan: string
  widget_token: string
}

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
    hypeScore: 0,
    engagementScore: 0,
    toxicityScore: 0,
    summary: 'Waiting for analysis...',
    topEmotes: [],
  })
  const [input, setInput] = useState('')
  const [channel, setChannel] = useState('demo')
  const [channelInput, setChannelInput] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const twitchClientRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(u => {
      if (u) {
        setSessionUser(u)
        setChannel(u.twitch_username)
        setChannelInput(u.twitch_username)
      }
    })
  }, [])
  const feedRef = useRef<HTMLDivElement>(null)
  const msgIdRef = useRef(0)
  const batchRef = useRef<string[]>([])


  // Analyze batch every 5 seconds
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
          credentials: 'include',
          body: JSON.stringify({ messages: toAnalyze }),
        })
        if (res.ok) {
          const data = await res.json()
          console.log('Groq response:', data)
          if (data.hypeScore !== undefined) {
            setAnalysis(data)
          }
        }
      } catch {
        // API not configured yet, keep demo scores
      } finally {
        setIsAnalyzing(false)
      }
    }, 5000)
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

  function connectTwitch() {
    if (twitchClientRef.current) {
      twitchClientRef.current.close()
    }
    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
    twitchClientRef.current = ws

    ws.onopen = () => {
      ws.send('PASS oauth:anonymous')
      ws.send('NICK justinfan12345')
      ws.send(`JOIN #${channelInput.toLowerCase()}`)
      setIsLive(true)
      setChannel(channelInput.toLowerCase())
      setMessages([])
    }

    ws.onmessage = (event) => {
      const line = event.data as string
      if (line.startsWith('PING')) {
        ws.send('PONG :tmi.twitch.tv')
        return
      }
      const match = line.match(/^:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/)
      if (match) {
        addMessage(match[1], match[2].trim())
      }
    }

    ws.onclose = () => setIsLive(false)
    ws.onerror = () => setIsLive(false)
  }

  function disconnectTwitch() {
    twitchClientRef.current?.close()
    twitchClientRef.current = null
    setIsLive(false)
  }

  const scoreColor = (score: number) =>
    score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-purple-400">🔥 HeatChat</Link>
        <div className="flex items-center gap-4">
          {sessionUser ? (
            <>
              <span className="text-gray-400 text-sm">#{sessionUser.twitch_username}</span>
              <span className="bg-purple-900/40 text-purple-300 text-xs px-2 py-1 rounded-full">{sessionUser.plan}</span>
              <Link href={`/widget/${sessionUser.widget_token}`} target="_blank" className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                OBS Widget ↗
              </Link>
              <a href="/api/auth/logout" className="text-gray-400 hover:text-white text-sm transition-colors">
                Log out
              </a>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-sm">Channel:</span>
                <span className="text-white font-mono text-sm">#{channel}</span>
              </div>
              <Link href={`/widget/${channel}`} target="_blank" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                OBS Widget ↗
              </Link>
              <a href="/api/auth/twitch" className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Connect Twitch
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Barre de connexion Twitch */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <span className="text-gray-400 text-sm shrink-0">#</span>
          <input
            value={channelInput}
            onChange={e => setChannelInput(e.target.value)}
            placeholder="twitch username"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
          />
        </div>
        {isLive ? (
          <button onClick={disconnectTwitch} className="bg-red-600 hover:bg-red-500 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Stop
          </button>
        ) : (
          <button onClick={connectTwitch} disabled={!channelInput.trim()} className="bg-green-600 hover:bg-green-500 disabled:opacity-40 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
            ▶ Connect chat
          </button>
        )}
        {isLive && (
          <span className="text-green-400 text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live — #{channel}
          </span>
        )}
      </div>

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
            {messages.length === 0 && !isLive && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="text-4xl">💬</div>
                <p className="text-gray-400 text-sm font-medium">Connect your Twitch channel to see the chat live</p>
                <p className="text-gray-600 text-xs">Enter your username above and click "Connect chat"</p>
              </div>
            )}
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
