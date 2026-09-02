import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, AlertCircle, FileSearch, Scale } from 'lucide-react'

const QUICK_PROMPTS = [
  { icon: AlertCircle, text: 'Why did Rajveer Tech fail?' },
  { icon: FileSearch, text: 'Which document is missing?' },
  { icon: Scale, text: 'Compare bidder A and C' },
]

function formatResponse(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-[#212529] mb-2 leading-relaxed">{line.replace(/\*\*/g, '')}</p>
    }
    if (line.startsWith('•') || /^\d+\./.test(line)) {
      return <p key={i} className="ml-4 text-[#495057] mb-1 leading-relaxed font-semibold">{line.replace(/\*\*/g, '')}</p>
    }
    if (line.startsWith('|')) return null // Basic skip for markdown tables to keep UI clean
    return <p key={i} className="text-[#495057] mb-2 leading-relaxed">{line.replace(/\*\*/g, '')}</p>
  })
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    { id: 0, from: 'ai', text: `Hello! I'm BidVerify AI. I have full context on **Tender GeM/2026/TENDER/005821** and the processed bids. What would you like to investigate?` },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const query = text || input.trim()
    if (!query) return
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: query }])
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'ai', text: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'ai', text: "Error: Could not connect to AI Engine." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-4 lg:p-8 animate-fade-in max-w-4xl mx-auto w-full">
      <div className="mb-6 flex-shrink-0 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[#e3f2fd] border border-[#bbdefb] mb-3">
          <Sparkles size={24} className="text-[#003c8f]" />
        </div>
        <h1 className="font-display font-bold text-3xl text-[#212529] tracking-tight mb-2 m-0">
          GeM AI Assistant
        </h1>
        <p className="text-[#6c757d] font-body text-sm m-0">
          Natural language intelligence for procurement data.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white border border-[#dee2e6] rounded p-4 lg:p-8 space-y-6 mb-6 relative scroll-smooth shadow-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded flex-shrink-0 flex items-center justify-center shadow-sm border ${
              msg.from === 'ai' ? 'bg-[#f8f9fa] border-[#dee2e6] text-[#003c8f]' : 'bg-[#003c8f] border-[#002b66] text-white'
            }`}>
              {msg.from === 'ai' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`max-w-[85%] lg:max-w-[75%] px-5 py-4 text-sm shadow-sm rounded ${
              msg.from === 'user'
                ? 'bg-[#003c8f] text-white font-body'
                : 'bg-[#f8f9fa] border border-[#dee2e6] font-body'
            }`}>
              {msg.from === 'ai' ? formatResponse(msg.text) : <p className="text-white font-bold m-0">{msg.text}</p>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center shadow-sm">
              <Bot size={20} className="text-[#003c8f]" />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded px-5 py-4 flex items-center gap-2 h-12 shadow-sm">
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} className="w-2 h-2 bg-[#003c8f] rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 flex-shrink-0">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.text}
            onClick={() => send(p.text)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded bg-white border border-[#dee2e6] text-[#495057] hover:text-[#003c8f] hover:bg-[#e3f2fd] hover:border-[#bbdefb] transition-all font-body font-bold shadow-sm"
          >
            <p.icon size={16} />
            {p.text}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); send() }} className="relative flex-shrink-0">
        <input
          type="text"
          className="w-full bg-white border border-[#dee2e6] rounded py-4 pl-6 pr-16 text-base text-[#212529] placeholder-[#6c757d] focus:outline-none focus:border-[#003c8f] focus:ring-1 focus:ring-[#003c8f] transition-colors shadow-sm font-body"
          placeholder="Ask BidVerify AI to analyze data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <button type="submit" disabled={!input.trim() || loading} className="rounded px-4 py-2 bg-[#138808] text-white disabled:opacity-50 hover:bg-[#0f6b06] transition-colors shadow-sm">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
