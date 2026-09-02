import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Upload, ShieldCheck, Activity, BarChart2, MessageSquare, History } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/upload', label: 'Upload Bid', icon: Upload },
  { path: '/processing', label: 'Processing', icon: Activity },
  { path: '/compliance', label: 'Compliance', icon: FileText },
  { path: '/fraud', label: 'Fraud Detection', icon: ShieldCheck },
  { path: '/risk', label: 'Risk Analysis', icon: BarChart2 },
  { path: '/history', label: 'Verification History', icon: History },
  { path: '/ai-assistant', label: 'AI Assistant', icon: MessageSquare },
  { path: '/admin', label: 'Admin Panel', icon: Activity },
];

export default function GovNavbar() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-[#003c8f] text-white w-full print:hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap">
        {NAV_ITEMS.filter(item => item.path !== '/admin' || isAdmin).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive 
                  ? 'bg-[#002b66] border-[#ff9933]' 
                  : 'border-transparent hover:bg-[#004bb5]'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
