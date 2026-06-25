import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBell, FiInbox, FiPlus, FiCheck } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

const Notifications = () => {
  const { activeRole } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [parentNotifications, setParentNotifications] = useState([
    { id: 1, title: 'Hi', body: 'Hello', location: '🏢 Sontyam', time: '2d ago', unread: false },
    { id: 2, title: '🔴 testing', body: 'Testing', location: '🏢 Sontyam', time: '2d ago', unread: false },
    { id: 3, title: 'School Holiday: Working', body: 'Sat, 20 Jun 2026 is declared as a school holiday — Working. No classes will be held.', location: '🏢 Sontyam', time: '4d ago', unread: false },
    { id: 4, title: 'School Holiday: Working', body: 'Mon, 20 Jul 2026 is declared as a school holiday — Working: It working No classes will be held.', location: '🏢 Sontyam', time: '4d ago', unread: false },
    { id: 5, title: 'School Holiday: Movie release', body: 'Sat, 20 Jun 2026 is declared as a school holiday — Movie release: Movie review No classes will be held.', location: '🏢 Sontyam', time: '4d ago', unread: false }
  ]);
  const [filterUnread, setFilterUnread] = useState(false);

  const tabs = ['All', 'Academic', 'Fee', 'Holiday', 'Event'];

  if (activeRole === 'PARENT' || activeRole === 'TEACHER' || activeRole === 'CLASS_TEACHER') {
    const unreadCount = parentNotifications.filter(n => n.unread).length;
    const displayedNotifications = filterUnread
      ? parentNotifications.filter(n => n.unread)
      : parentNotifications;

    const handleMarkAllRead = () => {
      setParentNotifications(parentNotifications.map(n => ({ ...n, unread: false })));
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 max-w-4xl mx-auto relative select-none animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Notifications</h1>
        </header>

        {/* Title and Mark all read Row */}
        <div className="flex justify-between items-center pt-2">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Notifications</h2>
            <p className="text-xs text-secondaryText font-bold mt-1">
              {unreadCount === 0 ? 'All read' : `${unreadCount} unread`}
            </p>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#e2e8f0] hover:bg-[#EEF5FB] text-[#0088ff] text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2.5 pt-2">
          {/* Total Pill */}
          <button
            onClick={() => setFilterUnread(false)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black border transition-all cursor-pointer bg-[#EEF5FB] border-[#0088ff]/25 text-[#0088ff] ${
              !filterUnread ? 'shadow-sm border-2' : 'opacity-80 border-[#0088ff]/10'
            }`}
          >
            <FiBell className="w-3.5 h-3.5" />
            <span>{parentNotifications.length} Total</span>
          </button>

          {/* Unread Pill */}
          <button
            onClick={() => setFilterUnread(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black border transition-all cursor-pointer bg-rose-50 border-rose-200 text-rose-500 ${
              filterUnread ? 'shadow-sm border-2' : 'opacity-80 border-rose-100'
            }`}
          >
            <FiBell className="w-3.5 h-3.5 text-rose-400" />
            <span>{unreadCount} Unread</span>
          </button>
        </div>

        {/* Notification Cards List */}
        <div className="space-y-4 pt-2">
          {displayedNotifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex gap-4 relative items-start hover:border-brand-blue/15 transition-all"
            >
              {/* Left Circle Bell Icon */}
              <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] shrink-0 border border-blue-50">
                <FiBell className="w-4 h-4" />
              </div>

              {/* Middle Content */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-black text-[#0F172A] leading-snug">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-[#A0AEC0] font-bold">
                    {notif.time}
                  </span>
                </div>
                <p className="text-[11px] text-secondaryText font-bold leading-relaxed">
                  {notif.body}
                </p>
                <div className="pt-1.5 flex items-center gap-1.5 text-[9px] text-[#A0AEC0] font-extrabold uppercase tracking-wider">
                  <span>🏢 Sontyam</span>
                </div>
              </div>

              {/* Unread Blue Dot Indicator */}
              {notif.unread && (
                <span className="w-2.5 h-2.5 bg-[#0088ff] rounded-full mt-1.5 shrink-0" />
              )}
            </div>
          ))}

          {displayedNotifications.length === 0 && (
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-12 text-center text-[#A0AEC0] text-xs font-bold leading-relaxed">
              No notifications to display.
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Coordinator/Staff View
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in animate-fade-in-long relative"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Notice Board</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="flex items-center gap-3 mb-1.5 relative z-10 select-none">
          {/* Bulletin/Notice Board Icon */}
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/15">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2h-3m3 3h-3m3 3h-3m3 3h-3"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">Notice Board</h2>
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">0 notices · Coordinator Edition</p>
          </div>
        </div>

        {/* Categories Tab Row */}
        <div className="flex gap-2.5 mt-5 overflow-x-auto no-scrollbar relative z-10 select-none">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-[#1597E5] shadow-sm'
                    : 'bg-white/15 text-white/90 hover:bg-white/20 border border-white/5'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Empty State card container */}
      <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px] select-none">
        {/* Empty State Folder Icon with Ring */}
        <div className="w-16 h-16 rounded-full bg-[#EBF8FF] flex items-center justify-center text-[#1597E5] relative">
          <div className="absolute inset-[-6px] rounded-full border border-[#1597E5]/10" />
          <svg className="w-7 h-7 text-[#1597E5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
        </div>

        <div className="space-y-2 max-w-[280px]">
          <h3 className="text-sm font-extrabold text-dark">No notices</h3>
          <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
            School notices and announcements will appear here automatically.
          </p>
        </div>
      </div>

      {/* Sticky Bottom New Notice Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:left-[288px]">
        <div className="max-w-[640px] mx-auto px-4 pb-0">
          <button
            onClick={() => navigate('/settings/post-notice')}
            className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-t-[32px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1597E5]/35 transition-all cursor-pointer active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            <span>New Notice</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;
