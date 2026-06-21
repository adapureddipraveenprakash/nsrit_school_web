import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBell, FiTrash2, FiClock } from 'react-icons/fi';
import { GoBellSlash } from 'react-icons/go';

const Notifications = () => {
  const { notifications, clearNotifications } = useApp();
  const navigate = useNavigate();

  const totalCount = notifications.length;
  // Simulating unread count based on recent messages (any created within past 2 hours or just default to 0 if all read)
  const unreadCount = 0; 

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ALL':
        return 'bg-brand-blue/10 text-brand-blue';
      case 'PRINCIPAL':
        return 'bg-accent-green/10 text-accent-green';
      case 'COORDINATOR':
        return 'bg-accent-purple/10 text-accent-purple';
      case 'TEACHER':
        return 'bg-accent-orange/10 text-accent-orange';
      default:
        return 'bg-secondaryText/10 text-secondaryText';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Header Bar matching Screenshot 2 */}
      <header className="flex justify-between items-center py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-dark">Notifications</span>
        </div>

        {totalCount > 0 && (
          <button
            onClick={clearNotifications}
            className="py-1.5 px-3 hover:bg-[#EEF5FB] rounded-xl text-xs font-bold text-accent-red flex items-center gap-1.5 transition-all cursor-pointer border border-[#EF4444]/15"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Heading and Filter Badges */}
        <div className="space-y-4 lg:col-span-1">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-dark tracking-tight">Notifications</h1>
            <p className="text-xs text-secondaryText font-semibold">All read</p>
          </div>

          {/* Filter Badges */}
          <div className="flex gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF5FB] border border-[#1597E5]/15 text-[#1597E5] rounded-full text-xs font-bold select-none">
              <FiBell className="w-3.5 h-3.5" />
              <span>{totalCount} Total</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] border border-[#EF4444]/15 text-[#EF4444] rounded-full text-xs font-bold select-none">
              <GoBellSlash className="w-3.5 h-3.5" />
              <span>{unreadCount} Unread</span>
            </div>
          </div>
        </div>

        {/* Right Column: Feed Items or Empty state */}
        <div className="lg:col-span-2 space-y-4">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              {/* Crossed out bell icon in circle */}
              <div className="w-20 h-20 rounded-full bg-[#EEF5FB]/70 border border-[#e2e8f0]/40 flex items-center justify-center text-secondaryText shadow-inner">
                <GoBellSlash className="w-8 h-8 text-secondaryText/60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-dark">All caught up!</h3>
                <p className="text-xs text-secondaryText max-w-[280px] leading-relaxed mx-auto font-medium">
                  You have no notifications yet. Attendance alerts and school updates will appear here.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-3 hover:border-brand-blue/25 transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${getRoleBadgeStyle(n.targetRole)}`}>
                    {n.targetRole}
                  </span>
                  <span className="text-[9px] text-secondaryText font-semibold flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5" />
                    {new Date(n.createdAt).toLocaleDateString('en-GB')} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-xs font-extrabold text-dark leading-tight">{n.title}</h3>
                <p className="text-[11px] text-secondaryText leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;
