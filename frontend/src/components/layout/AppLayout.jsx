import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Bot, Send, X, Maximize2, Sparkles } from 'lucide-react'
import GovHeader from './GovHeader'
import GovNavbar from './GovNavbar'
import { useUIStore } from '../../store/uiStore'
import { AI_API_BASE_URL } from '../../lib/api'
import { useLanguage } from '../../store/languageStore'

export default function AppLayout() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { chatWidgetOpen, setChatWidgetOpen } = useUIStore()
  const [widgetMessages, setWidgetMessages] = useState([
    {
      id: 0,
      from: 'ai',
      text: 'Hello! I am BidVerify AI. Ask me about any bidder, compliance clause, or fraud alert.',
    },
  ])
  const [widgetInput, setWidgetInput] = useState('')
  const [widgetLoading, setWidgetLoading] = useState(false)
  const widgetBottomRef = useRef(null)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  useEffect(() => {
    if (chatWidgetOpen) {
      widgetBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [widgetMessages, chatWidgetOpen])

  const sendWidgetMessage = async (text) => {
    const query = (text || widgetInput).trim()
    if (!query) return
    setWidgetInput('')
    setWidgetMessages((prev) => [...prev, { id: Date.now(), from: 'user', text: query }])
    setWidgetLoading(true)
    try {
      const res = await fetch(`${AI_API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setWidgetMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'ai', text: (data.response || 'No response').replace(/\*\*/g, '') },
      ])
    } catch {
      setWidgetMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'ai', text: 'Could not reach AI service.' },
      ])
    } finally {
      setWidgetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-body flex flex-col">
      {/* Official Government Header */}
      <GovHeader />
      
      {/* Official Government Navbar */}
      <GovNavbar />

      {/* Main content area */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 bg-transparent">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 min-h-[60vh]">
          <Outlet />
        </div>
      </main>

      {/* Floating AI Chatbot Launcher & Widget */}
      {location.pathname !== '/ai-assistant' && (
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
          {chatWidgetOpen ? (
            <div className="w-80 sm:w-96 bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[460px] animate-fade-in">
              <div className="bg-[#003c8f] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#ff9933]" />
                  <span className="font-display font-bold text-sm">BidVerify AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChatWidgetOpen(false)
                      navigate('/ai-assistant')
                    }}
                    className="p-1 hover:bg-white/15 rounded text-white/90"
                    title="Open Full Screen AI Assistant"
                  >
                    <Maximize2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatWidgetOpen(false)}
                    className="p-1 hover:bg-white/15 rounded text-white/90"
                    title="Close Chat"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#f8f9fa] text-xs">
                {widgetMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[82%] whitespace-pre-line leading-relaxed ${
                        m.from === 'user'
                          ? 'bg-[#003c8f] text-white font-semibold'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {widgetLoading && (
                  <div className="text-xs text-gray-500 italic px-2">BidVerify AI is analyzing...</div>
                )}
                <div ref={widgetBottomRef} />
              </div>

              <div className="px-3 py-1.5 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto">
                {['Compare all bidders', 'Show fraud alerts', 'Latest upload status'].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendWidgetMessage(prompt)}
                    className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#e3f2fd] text-[#003c8f] hover:bg-[#bbdefb] font-semibold"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendWidgetMessage()
                }}
                className="p-2.5 bg-white border-t border-gray-200 flex gap-2"
              >
                <input
                  type="text"
                  value={widgetInput}
                  onChange={(e) => setWidgetInput(e.target.value)}
                  placeholder="Ask about bids, risk, or compliance..."
                  className="flex-1 text-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#003c8f]"
                />
                <button
                  type="submit"
                  disabled={!widgetInput.trim() || widgetLoading}
                  className="bg-[#138808] hover:bg-[#0f6b06] disabled:opacity-50 text-white px-3 py-2 rounded flex items-center justify-center"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setChatWidgetOpen(true)}
              className="bg-[#003c8f] hover:bg-[#002b66] text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm transition-transform hover:scale-105 border-2 border-white"
            >
              <Bot size={18} className="text-[#ff9933]" />
              <span>{t('ask_ai', 'Ask AI')}</span>
            </button>
          )}
        </div>
      )}
      
      {/* Official Government Footer */}
      <footer className="w-full bg-[#002b66] text-white py-6 mt-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-sm flex flex-col md:flex-row justify-between items-center text-gray-300">
          <p>{t('all_rights_reserved', '© 2026 Government of India. All rights reserved.')}</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-white">{t('privacy_policy', 'Privacy Policy')}</button>
            <button onClick={() => navigate('/terms-of-use')} className="hover:text-white">{t('terms_of_use', 'Terms of Use')}</button>
            <button onClick={() => navigate('/ai-assistant')} className="hover:text-white">{t('ai_help', 'AI Help')}</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
