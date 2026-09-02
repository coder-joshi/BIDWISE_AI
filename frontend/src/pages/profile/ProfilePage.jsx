import { User, Mail, Shield, Building2, Phone, Briefcase, Award } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const displayUser = user || {
    id: 'PO-XXXX', name: 'Unknown', email: 'unknown@example.com', role: 'officer', department: 'N/A', division: 'N/A', designation: 'N/A'
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto animate-fade-in w-full">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">Officer Profile</h1>
        <p className="text-gray-600 font-body text-sm mt-1 m-0">
          Manage your government credentials, access logs, and personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#f8f9fa] border border-gray-200 rounded p-6 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-[#003c8f] flex items-center justify-center text-3xl font-bold font-display text-white mx-auto shadow-md border-4 border-white">
              {displayUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <h2 className="mt-4 font-display font-bold text-xl text-gray-900 m-0">
              {displayUser.name}
            </h2>
            <p className="text-sm text-gray-600 font-body mt-1 capitalize font-medium m-0">
              {(displayUser.role || 'procurement_officer').replace('_', ' ')}
            </p>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded bg-[#d4edda] text-[#155724] border border-[#c3e6cb] text-xs font-bold uppercase tracking-widest">
                Verified Identity
              </span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-left space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest m-0">Email Address</p>
                  <p className="text-sm text-gray-900 font-bold mt-0.5 m-0">{displayUser.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest m-0">Phone Number</p>
                  <p className="text-sm text-gray-900 font-bold mt-0.5 m-0">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Professional Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-[#003c8f] mb-6 flex items-center gap-2 m-0 border-b border-gray-200 pb-2">
              <Briefcase size={18} /> Professional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f8f9fa] border border-gray-200 rounded p-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold m-0">Department</p>
                <p className="text-sm font-bold text-gray-900 m-0">{displayUser.department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold m-0">Division</p>
                <p className="text-sm font-bold text-gray-900 m-0">{displayUser.division}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold m-0">Designation</p>
                <p className="text-sm font-bold text-gray-900 m-0">{displayUser.designation}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold m-0">Officer ID</p>
                <p className="text-sm font-bold text-gray-900 font-mono m-0">{displayUser.id}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">Request Transfer</button>
              <button className="px-4 py-2 bg-[#003c8f] text-white rounded font-bold text-sm hover:bg-[#002b66] transition-colors shadow-sm">Update Details</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-[#138808] mb-6 flex items-center gap-2 m-0 border-b border-gray-200 pb-2">
              <Shield size={18} /> Security & Access
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#d4edda] border border-[#c3e6cb] flex items-center justify-center">
                    <Shield size={20} className="text-[#155724]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 m-0">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500 font-medium m-0 mt-0.5">Enabled via Authenticator App</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 font-bold text-xs hover:bg-white transition-colors shadow-sm bg-gray-50">Manage</button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#e3f2fd] border border-[#bbdefb] flex items-center justify-center">
                    <Building2 size={20} className="text-[#003c8f]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 m-0">Access Level</p>
                    <p className="text-xs text-gray-500 font-medium m-0 mt-0.5">L3 - Senior Procurement Authorization</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#d4edda] text-[#155724] border border-[#c3e6cb] text-[10px] font-bold uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
