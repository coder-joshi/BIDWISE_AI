import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Bell, User, LogOut, X, ShieldAlert, CheckCircle2, AlertTriangle, ChevronRight, MessageSquare
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { fetchBidsFromDb } from '../../lib/api';
import emblem from '../../assets/Emblem_of_India.svg';
import { useLanguage } from '../../store/languageStore';

const QUICK_PAGES = [
  { label: 'Dashboard Overview', path: '/dashboard', keywords: 'dashboard home overview stats kpi' },
  { label: 'Upload Bid Package', path: '/upload', keywords: 'upload new bid pdf docx' },
  { label: 'Tender Compliance', path: '/compliance', keywords: 'compliance requirements clauses tender pass fail' },
  { label: 'Fraud & Tampering Detection', path: '/fraud', keywords: 'fraud tampering forensic ela signature alert' },
  { label: 'AI Risk Analysis', path: '/risk', keywords: 'risk analysis score verdict recommendation' },
  { label: 'Bid Comparison Matrix', path: '/compare', keywords: 'compare comparison matrix bidders' },
  { label: 'Verification History', path: '/history', keywords: 'history audit trail logs records' },
  { label: 'GeM AI Assistant Chatbot', path: '/ai-assistant', keywords: 'ai assistant chat bot gemini question' },
];

export default function GovHeader() {
  const {
    searchQuery,
    setSearchQuery,
    setSelectedBidId,
    readNotificationIds,
    markAsRead,
    markAllAsRead,
    notifications: customNotifications,
    chatWidgetOpen,
    setChatWidgetOpen,
  } = useUIStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [bids, setBids] = useState([]);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchBidsFromDb()
      .then(({ bids: allBids }) => setBids(allBids || []))
      .catch(() => {});
  }, [showNotifications, showSearchDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dynamicNotifications = useMemo(() => {
    const items = [...(customNotifications || [])];
    bids.forEach((b) => {
      const timeLabel = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent';
      const alerts = b.fraudAlerts || [];
      if (alerts.length > 0) {
        items.push({
          id: `notif-alert-${b.id}`,
          bidId: b.id,
          type: 'error',
          title: `Forensic Alert: ${alerts[0].type}`,
          message: `${b.bidderName} (${b.id}) — ${alerts[0].detail}`,
          time: timeLabel,
          targetPath: '/fraud',
        });
      }
      items.push({
        id: `notif-bid-${b.id}`,
        bidId: b.id,
        type: b.status === 'verified' ? 'success' : 'warning',
        title: b.status === 'verified' ? 'Bid Verification Passed' : 'Compliance Failure Flagged',
        message: `${b.bidderName} (${b.id}) scored ${b.complianceScore}% compliance · Risk ${b.riskScore}/100`,
        time: timeLabel,
        targetPath: b.status === 'verified' ? '/risk' : '/compliance',
      });
    });
    return items.slice(0, 10).map((item) => ({
      ...item,
      read: item.read || readNotificationIds.includes(item.id),
    }));
  }, [bids, customNotifications, readNotificationIds]);

  const unreadCount = dynamicNotifications.filter((n) => !n.read).length;

  const qLower = (searchQuery || '').trim().toLowerCase();
  const matchedBids = useMemo(() => {
    if (!qLower) return bids.slice(0, 4);
    return bids.filter(
      (b) =>
        (b.bidderName || '').toLowerCase().includes(qLower) ||
        (b.id || '').toLowerCase().includes(qLower) ||
        (b.tenderId || '').toLowerCase().includes(qLower) ||
        (b.gstNumber || '').toLowerCase().includes(qLower) ||
        (b.status || '').toLowerCase().includes(qLower)
    );
  }, [bids, qLower]);

  const matchedPages = useMemo(() => {
    if (!qLower) return [];
    return QUICK_PAGES.filter(
      (p) => p.label.toLowerCase().includes(qLower) || p.keywords.includes(qLower)
    );
  }, [qLower]);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    if (matchedBids.length === 1 && qLower) {
      setSelectedBidId(matchedBids[0].id);
    }
    navigate('/history');
  };

  const handleSelectBidResult = (bid) => {
    setSelectedBidId(bid.id);
    setShowSearchDropdown(false);
    navigate('/compliance');
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    if (notif.bidId) {
      setSelectedBidId(notif.bidId);
    }
    setShowNotifications(false);
    navigate(notif.targetPath || '/compliance');
  };

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const adjustFontSize = (scale) => {
    document.documentElement.style.fontSize = `${scale}px`;
  };

  return (
    <div className="w-full bg-white shadow-sm print:hidden relative z-50">
      {/* Topmost utility bar */}
      <div className="w-full bg-[#f1f1f1] border-b border-gray-300 px-4 py-1 text-xs text-gray-700 flex flex-wrap justify-between items-center gap-x-4 min-h-8">
        <div className="flex gap-4 items-center">
          <span className="font-bold">{t('gov_of_india', 'GOVERNMENT OF INDIA')}</span>
          <a href="#main-content" className="hover:underline text-[#003c8f]">
            {t('skip_to_main', 'Skip to main content')}
          </a>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-1 items-center border-r border-gray-400 pr-4">
            <button onClick={() => adjustFontSize(14)} className="px-1 hover:bg-gray-200" title={t('decrease_font', 'Decrease Text Size')}>A-</button>
            <button onClick={() => adjustFontSize(16)} className="px-1 hover:bg-gray-200" title={t('normal_font', 'Normal Text Size')}>A</button>
            <button onClick={() => adjustFontSize(18)} className="px-1 hover:bg-gray-200" title={t('increase_font', 'Increase Text Size')}>A+</button>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border border-gray-300 rounded px-1.5 py-0.5 text-xs outline-none ml-2 cursor-pointer font-medium text-gray-800"
            aria-label="Language selection"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>

      {/* Main Header area */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        {/* Logo and Emblem */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="flex flex-col items-center">
            <img src={emblem} alt="Emblem of India" width="40" height="56" className="w-10 h-14 object-contain" />
            <span className="text-[10px] font-semibold text-gray-800 mt-1">{t('satyameva_jayate', 'सत्यमेव जयते')}</span>
          </div>
          <div className="border-l-2 border-[#ff9933] pl-4">
            <span className="text-2xl font-bold text-[#003c8f] tracking-tight m-0 block">GeM BidVerify</span>
            <span className="text-sm font-medium text-gray-600 m-0 block">{t('ai_compliance_platform', 'AI Compliance Platform')}</span>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 w-full lg:w-auto">
          <div ref={searchRef} className="relative flex-1 min-w-0">
            <form onSubmit={handleSearch} className="flex relative w-full">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  placeholder={t('search_placeholder', 'Search Bidder, Audit ID, Tender...')}
                  value={searchQuery}
                  onFocus={() => setShowSearchDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  className="border border-gray-400 rounded-l-md pl-4 pr-8 py-2 w-full sm:w-72 min-w-0 text-sm focus:outline-none focus:border-[#003c8f]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-[#003c8f] hover:bg-[#002b66] text-white px-4 py-2 rounded-r-md transition-colors flex items-center justify-center"
                title="Search"
              >
                <Search size={16} />
              </button>
            </form>

            {/* Live Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-11 left-0 right-0 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="bg-[#f8f9fa] px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    {qLower ? `${t('matching_bids', 'Matching Bids')} (${matchedBids.length})` : t('recent_bids', 'Recent Bids')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearchDropdown(false);
                      navigate('/history');
                    }}
                    className="text-xs font-semibold text-[#003c8f] hover:underline"
                  >
                    {t('full_search', 'Full Search →')}
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {matchedBids.length === 0 && matchedPages.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No matching bids or pages found for "{searchQuery}"
                    </div>
                  ) : (
                    <>
                      {matchedBids.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectBidResult(b)}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#e3f2fd]/50 transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate m-0">{b.bidderName}</p>
                            <p className="text-xs text-gray-500 font-mono m-0">
                              {b.id} · {b.tenderId}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                b.status === 'verified'
                                  ? 'bg-[#d4edda] text-[#155724]'
                                  : 'bg-[#f8d7da] text-[#721c24]'
                              }`}
                            >
                              {b.complianceScore}%
                            </span>
                            <ChevronRight size={14} className="text-gray-400" />
                          </div>
                        </button>
                      ))}

                      {matchedPages.length > 0 && (
                        <div className="bg-[#f8f9fa] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Portal Modules
                        </div>
                      )}
                      {matchedPages.map((p) => (
                        <button
                          key={p.path}
                          type="button"
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate(p.path);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-xs font-semibold text-[#003c8f]"
                        >
                          <span>{p.label}</span>
                          <ChevronRight size={14} />
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 relative sm:border-l border-gray-300 sm:pl-5">
            {/* Quick AI Chatbot Toggle */}
            <button
              onClick={() => setChatWidgetOpen(!chatWidgetOpen)}
              className="px-3 py-2 rounded-full bg-[#e3f2fd] hover:bg-[#bbdefb] text-[#003c8f] text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Open AI Assistant Chatbot"
            >
              <MessageSquare size={15} />
              <span className="hidden sm:inline">AI Chat</span>
            </button>

            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors relative"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
                  <div className="bg-[#f8f9fa] border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => markAllAsRead(dynamicNotifications.map((n) => n.id))}
                      className="text-xs text-[#003c8f] font-semibold hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {dynamicNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-500">{t('no_notifications', 'No notifications')}</div>
                    ) : (
                      dynamicNotifications.map((notif) => (
                        <button
                          key={notif.id}
                          type="button"
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                            !notif.read ? 'bg-[#e3f2fd]/30' : 'bg-white opacity-80'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {notif.type === 'error' ? (
                              <ShieldAlert size={16} className="text-red-600" />
                            ) : notif.type === 'warning' ? (
                              <AlertTriangle size={16} className="text-amber-600" />
                            ) : (
                              <CheckCircle2 size={16} className="text-[#138808]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-gray-900 truncate m-0">{notif.title}</p>
                              {!notif.read && <span className="w-2 h-2 rounded-full bg-[#003c8f] flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 m-0">{notif.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1 m-0">{notif.time}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/history');
                      }}
                      className="text-xs text-[#003c8f] font-semibold hover:underline"
                    >
                      {t('view_all_history', 'View All Activity in Audit History →')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleProfileClick}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
              title={t('profile_settings', 'Profile Settings')}
            >
              <User size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-red-600 transition-colors ml-1 border border-red-200 bg-red-50"
              title={t('logout', 'Logout')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
