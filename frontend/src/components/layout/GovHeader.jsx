import React, { useState } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import emblem from '../../assets/Emblem_of_India.svg';

export default function GovHeader() {
  const { searchQuery, setSearchQuery } = useUIStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/history');
    }
  };

  const handleLogout = () => {
    // In a real app we'd clear auth tokens here
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="w-full bg-white shadow-sm print:hidden relative z-50">
      {/* Topmost utility bar */}
      <div className="w-full bg-[#f1f1f1] border-b border-gray-300 px-4 py-1 text-xs text-gray-700 flex flex-wrap justify-between items-center gap-x-4 min-h-8">
        <div className="flex gap-4 items-center">
          <span className="font-bold">GOVERNMENT OF INDIA</span>
          <a href="#main-content" className="hover:underline text-[#003c8f]">Skip to main content</a>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-1 items-center border-r border-gray-400 pr-4">
            <button className="px-1 hover:bg-gray-200" title="Decrease Text Size">A-</button>
            <button className="px-1 hover:bg-gray-200" title="Normal Text Size">A</button>
            <button className="px-1 hover:bg-gray-200" title="Increase Text Size">A+</button>
          </div>
          <div className="flex gap-2">
            <button className="w-4 h-4 bg-black border border-white" title="High Contrast"></button>
            <button className="w-4 h-4 bg-white border border-gray-400" title="Normal Contrast"></button>
          </div>
          <select className="bg-transparent border-none text-xs outline-none ml-2 cursor-pointer">
            <option>English</option>
            <option>हिन्दी</option>
          </select>
        </div>
      </div>

      {/* Main Header area */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        {/* Logo and Emblem */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <img src={emblem} alt="Emblem of India" width="40" height="56" className="w-10 h-14 object-contain" />
            <span className="text-[10px] font-semibold text-gray-800 mt-1">सत्यमेव जयते</span>
          </div>
          <div className="border-l-2 border-[#ff9933] pl-4">
            <span className="text-2xl font-bold text-[#003c8f] tracking-tight m-0 block">GeM BidVerify</span>
            <span className="text-sm font-medium text-gray-600 m-0 block">AI Compliance Platform</span>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full lg:w-auto">
          <form onSubmit={handleSearch} className="flex relative flex-1 min-w-0">
            <input 
              type="text" 
              placeholder="Search by Bidder Name, Tender ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-400 rounded-l-md px-4 py-2 w-full sm:w-72 min-w-0 text-sm focus:outline-none focus:border-[#003c8f]"
            />
            <button type="submit" className="bg-[#003c8f] hover:bg-[#002b66] text-white px-4 py-2 rounded-r-md transition-colors flex items-center justify-center">
              <Search size={16} />
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 relative sm:border-l border-gray-300 sm:pl-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in">
                  <div className="bg-[#f8f9fa] border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-xs text-[#003c8f] hover:underline">Mark all as read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-800 font-medium">New Bid Uploaded</p>
                      <p className="text-xs text-gray-500 mt-1">Bharat Engineering Solutions uploaded for TND-2026-X12</p>
                      <p className="text-xs text-gray-400 mt-1">2 mins ago</p>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-800 font-medium">Fraud Alert Detected</p>
                      <p className="text-xs text-gray-500 mt-1">High risk pattern found in BID-2026-0843 (Rajveer Tech)</p>
                      <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-2 text-center">
                    <button className="text-xs text-[#003c8f] font-semibold hover:underline">View All Activity</button>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleProfileClick}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
              title="Profile Settings"
            >
              <User size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-red-600 transition-colors ml-2 border border-red-200 bg-red-50"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
