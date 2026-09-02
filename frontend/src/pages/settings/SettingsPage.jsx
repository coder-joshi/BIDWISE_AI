import { useState } from 'react'
import { Settings, Bell, Lock, Key, Smartphone, Mail, Shield, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [fraudAlerts, setFraudAlerts] = useState(true)
  const [autoVerify, setAutoVerify] = useState(false)

  const Toggle = ({ enabled, onChange }) => (
    <button 
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#003c8f] focus:ring-offset-2 ${enabled ? 'bg-[#003c8f]' : 'bg-gray-300'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto animate-fade-in w-full">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">Platform Settings</h1>
        <p className="text-gray-600 font-body text-sm mt-1 m-0">
          Configure notification preferences, security options, and platform behaviors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded bg-[#e3f2fd] border border-[#bbdefb] text-[#003c8f] text-sm font-bold transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm font-bold transition-colors">
            <Shield size={18} /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm font-bold transition-colors">
            <Settings size={18} /> Preferences
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm font-bold transition-colors">
            <Key size={18} /> API Keys
          </button>
        </div>

        {/* Main Settings Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Notifications Panel */}
          <div className="bg-white border border-gray-200 rounded p-6 lg:p-8 shadow-sm">
            <h3 className="font-display font-bold text-xl text-gray-900 mb-6 m-0 border-b border-gray-200 pb-2">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="bg-[#f8f9fa] p-2 rounded border border-gray-200 text-gray-600 mt-0.5">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 m-0">Email Notifications</h4>
                    <p className="text-sm text-gray-600 mt-1 m-0">Receive daily summaries and high-priority alerts via email.</p>
                  </div>
                </div>
                <Toggle enabled={emailNotif} onChange={setEmailNotif} />
              </div>
              
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="bg-[#f8f9fa] p-2 rounded border border-gray-200 text-gray-600 mt-0.5">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 m-0">Push Notifications</h4>
                    <p className="text-sm text-gray-600 mt-1 m-0">Instant browser alerts for bid processing completion.</p>
                  </div>
                </div>
                <Toggle enabled={pushNotif} onChange={setPushNotif} />
              </div>
              
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="bg-[#f8d7da] p-2 rounded border border-[#f5c6cb] text-[#721c24] mt-0.5">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 m-0">Fraud & Risk Alerts</h4>
                    <p className="text-sm text-gray-600 mt-1 m-0">Immediate notification when a high-risk anomaly is detected.</p>
                  </div>
                </div>
                <Toggle enabled={fraudAlerts} onChange={setFraudAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-[#d4edda] p-2 rounded border border-[#c3e6cb] text-[#155724] mt-0.5">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 m-0">Auto-Verify Low Risk</h4>
                    <p className="text-sm text-gray-600 mt-1 m-0">Automatically approve bids with 100% compliance and low risk.</p>
                  </div>
                </div>
                <Toggle enabled={autoVerify} onChange={setAutoVerify} />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
              <button className="px-4 py-2 bg-[#003c8f] text-white rounded font-bold text-sm hover:bg-[#002b66] transition-colors shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
