import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBell, FiBellOff, FiCheck } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getNotificationsByUser, markAllNotificationsRead, markNotificationRead } from '../../services/dataService';

const Notifications = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [filterUnread, setFilterUnread] = useState(false);
  const userId = user?.id || null;

  const { data: dbNotifications = [], refetch } = useDataFetch(
    () => getNotificationsByUser({ userId, limit: 100 }),
    [userId],
    { defaultValue: [], pollInterval: 20000 }
  );

  const unreadCount = dbNotifications.filter(n => !n.isRead).length;
  const displayedNotifications = filterUnread
    ? dbNotifications.filter(n => !n.isRead)
    : dbNotifications;

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await markAllNotificationsRead({ userId });
      refetch();
    } catch (err) {
      console.error('[Notifications] Failed to mark all read:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif.id);
        refetch();
      } catch (err) {
        console.error('[Notifications] Failed to mark read:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-xl mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Notifications</h1>
      </header>

      {/* Title and Mark all read Row */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Notifications</h2>
          <p className="text-xs text-secondaryText font-bold mt-1">
            {unreadCount === 0 ? 'All read' : `${unreadCount} unread`}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#e2e8f0] hover:bg-[#EEF5FB] text-[#1597E5] text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm active:scale-95 animate-fade-in"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex bg-[#EEF5FB]/65 border border-[#e2e8f0]/45 p-1 rounded-full select-none">
        <button
          onClick={() => setFilterUnread(false)}
          className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            !filterUnread
              ? 'bg-white text-[#1597E5] shadow-sm'
              : 'text-secondaryText hover:text-[#1597E5]'
          }`}
        >
          <FiBell className="w-3.5 h-3.5" />
          <span>All</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
            !filterUnread ? 'bg-[#EEF5FB] text-[#1597E5]' : 'bg-[#E2E8F0] text-secondaryText'
          }`}>
            {dbNotifications.length}
          </span>
        </button>

        <button
          onClick={() => setFilterUnread(true)}
          className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            filterUnread
              ? 'bg-white text-[#1597E5] shadow-sm'
              : 'text-secondaryText hover:text-[#1597E5]'
          }`}
        >
          <FiBell className="w-3.5 h-3.5" />
          <span>Unread</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
            filterUnread ? 'bg-blue-50 text-[#1597E5]' : 'bg-[#E2E8F0] text-secondaryText'
          }`}>
            {unreadCount}
          </span>
        </button>
      </div>

      {/* Notification Cards List */}
      <div className="space-y-4 pt-2">
        {displayedNotifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleNotifClick(notif)}
            className={`bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex gap-4 relative items-start hover:border-brand-blue/15 transition-all cursor-pointer ${
              !notif.isRead ? 'border-l-4 border-l-[#1597E5]' : ''
            }`}
          >
            {/* Left Circle Bell Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
              !notif.isRead 
                ? 'bg-[#EEF5FB] text-[#1597E5] border-blue-50' 
                : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              <FiBell className="w-4 h-4" />
            </div>

            {/* Middle Content */}
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h3 className={`text-sm leading-snug ${!notif.isRead ? 'font-black text-[#0F172A]' : 'font-semibold text-slate-600'}`}>
                  {notif.title}
                </h3>
                <span className="text-[9px] text-[#A0AEC0] font-bold shrink-0">
                  {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                </span>
              </div>
              <p className={`text-[11px] font-medium leading-relaxed ${!notif.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                {notif.message}
              </p>
            </div>

            {/* Unread Indicator Dot */}
            {!notif.isRead && (
              <span className="w-2.5 h-2.5 bg-[#1597E5] rounded-full mt-1.5 shrink-0" />
            )}
          </div>
        ))}

        {displayedNotifications.length === 0 && (
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px] select-none animate-fade-in">
            {/* Empty State Bell Slash Icon with Ring */}
            <div className="w-16 h-16 rounded-full bg-[#EEF7FF] flex items-center justify-center text-[#1597E5] relative shadow-inner">
              <div className="absolute inset-[-6px] rounded-full border border-[#1597E5]/10" />
              <FiBellOff className="w-6 h-6 text-[#1597E5]" />
            </div>

            <div className="space-y-2 max-w-[280px]">
              <h3 className="text-sm font-extrabold text-dark">All caught up!</h3>
              <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
                You have no notifications yet. Attendance alerts and school updates will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
