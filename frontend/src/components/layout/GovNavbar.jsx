import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Upload, ShieldCheck, Activity, BarChart2, MessageSquare, History } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

import { useLanguage } from '../../store/languageStore';

const NAV_ITEMS = [
  { path: '/dashboard', key: 'dashboard', label: 'Dashboard', icon: Home },
  { path: '/upload', key: 'upload', label: 'Upload Bid', icon: Upload },
  { path: '/processing', key: 'processing', label: 'Processing', icon: Activity },
  { path: '/compliance', key: 'compliance', label: 'Compliance', icon: FileText },
  { path: '/fraud', key: 'fraud', label: 'Fraud Detection', icon: ShieldCheck },
  { path: '/risk', key: 'risk', label: 'Risk Analysis', icon: BarChart2 },
  { path: '/history', key: 'history', label: 'Verification History', icon: History },
  { path: '/ai-assistant', key: 'ai_assistant', label: 'AI Assistant', icon: MessageSquare },
  { path: '/admin', key: 'admin', label: 'Admin Panel', icon: Activity },
];

export default function GovNavbar() {
  const { t } = useLanguage();

  return (
    <nav className="bg-[#003c8f] text-white w-full print:hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap">
        {NAV_ITEMS.map((item) => (
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
            {t(item.key, item.label)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
