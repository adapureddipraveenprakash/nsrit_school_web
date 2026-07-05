import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBell, FiBellOff, FiCheck } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getNotificationsByUser, markAllNotificationsRead, markNotificationRead } from '../../../services/dataService';

const MOCK_NOTIFICATIONS = [
  {
    id: 'mock-notif-1',
    title: 'hii hello',
    message: 'hello everyone',
    createdAt: '2026-07-03T10:00:00Z',
    isRead: false
  },
  {
    id: 'mock-notif-2',
    title: 'Fee Portal Updated',
    message: 'The fee portal has been successfully updated to version 1.0.0.',
    createdAt: '2026-07-02T15:30:00Z',
    isRead: true
  },
  {
    id: 'mock-notif-3',
    title: 'Weekly Collections Summary',
    message: 'Weekly fee report is now ready for download.',
    createdAt: '2026-06-28T09:00:00Z',
    isRead: true
  },
  {
    id: 'mock-notif-4',
    title: 'Monthly Audit Complete',
    message: 'Audit for the month of June has been verified.',
    createdAt: '2026-06-25T11:45:00Z',
    isRead: true
  },
  {
    id: 'mock-notif-5',
    title: 'Security Update',
    message: 'System security rules updated for accountant ledgers.',
    createdAt: '2026-06-20T14:20:00Z',
    isRead: true
  },
  {
    id: 'mock-notif-6',
    title: 'Welcome to NSRIT',
    message: 'Welcome Patsamatla Padma Manjula to NSRIT Connect ERP.',
    createdAt: '2026-06-15T08:00:00Z',
    isRead: true
  }
];

const Notifications = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [filterUnread, setFilterUnread] = useState(false);
  const userId = user?.id || null;

  // Retrieve read status of mock notifications from local storage
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const stored = localStorage.getItem('nsrit_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fetch live PostgreSQL notifications
  const { data: dbNotifications = [], refetch } = useDataFetch(
    () => getNotificationsByUser({ userId, limit: 100 }),
    [userId],
    { defaultValue: [], pollInterval: 20000, skip: !userId }
  );

  const updateReadStatus = (id) => {
    const next = [...readNotifIds, id];
    setReadNotifIds(next);
    try {
      localStorage.setItem('nsrit_read_notifications', JSON.stringify(next));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  };

  const markAllLocalRead = () => {
    const allIds = MOCK_NOTIFICATIONS.map(m => m.id);
    const next = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(next);
    try {
      localStorage.setItem('nsrit_read_notifications', JSON.stringify(next));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  };

  // Merge live and mock notifications
  const mergedNotifications = useMemo(() => {
    const list = dbNotifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
      isRead: n.isRead || readNotifIds.includes(n.id)
    }));

    MOCK_NOTIFICATIONS.forEach(mn => {
      if (!list.some(l => l.id === mn.id)) {
        list.push({
          ...mn,
          isRead: mn.isRead || readNotifIds.includes(mn.id)
        });
      }
    });

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [dbNotifications, readNotifIds]);

  const unreadCount = useMemo(() => {
    return mergedNotifications.filter(n => !n.isRead).length;
  }, [mergedNotifications]);

  const displayedNotifications = useMemo(() => {
    return filterUnread
      ? mergedNotifications.filter(n => !n.isRead)
      : mergedNotifications;
  }, [mergedNotifications, filterUnread]);

  const handleMarkAllRead = async () => {
    markAllLocalRead();
    if (userId) {
      try {
        await markAllNotificationsRead({ userId });
        refetch();
      } catch (err) {
        console.error('[Notifications] Failed to mark all read:', err);
      }
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      if (String(notif.id).startsWith('mock-')) {
        updateReadStatus(notif.id);
      } else {
        try {
          await markNotificationRead(notif.id);
          updateReadStatus(notif.id);
          refetch();
        } catch (err) {
          console.error('[Notifications] Failed to mark read:', err);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-xl mx-auto relative select-none animate-fade-in font-sans"
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
            {mergedNotifications.length}
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
