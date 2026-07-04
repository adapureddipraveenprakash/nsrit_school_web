import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiGrid, FiCalendar, FiUser, FiInfo } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getNoticesByBranch, deleteNotice } from '../../../services/dataService';

const NoticeBoard = () => {
  const { user, activeRole } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Academic', 'Fee', 'Holiday', 'Event'];
  const branchId = user?.branchId || null;

  // Fetch real notices from the database
  const { data: notices = [], refetch } = useDataFetch(
    () => getNoticesByBranch({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  const filteredNotices = useMemo(() => {
    if (activeTab === 'All') return notices;
    return notices.filter(n => String(n.category || '').toUpperCase() === activeTab.toUpperCase());
  }, [notices, activeTab]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNotice(id);
        refetch();
      } catch (err) {
        console.error('Error deleting notice:', err);
      }
    }
  };

  const isPrincipal = activeRole === 'PRINCIPAL';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-[640px] mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Notice Board</h1>
      </header>

      {/* Blue Header Card (Screenshot 3) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-1.5 relative z-10 select-none">
          {/* Bulletin Board Icon */}
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center border border-white/15 shrink-0">
            <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2h-3m3 3h-3m3 3h-3m3 3h-3"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans">Notice Board</h2>
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-0.5 font-sans">
              {notices.length} notices · {isPrincipal ? 'Principal Edition' : 'Staff Edition'}
            </p>
          </div>
        </div>

        {/* Tab switcher matching Screenshot 3 */}
        <div className="flex gap-2.5 mt-5 overflow-x-auto no-scrollbar relative z-10 select-none scrollbar-none">
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

      {/* Notices List or Empty State */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col gap-3 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 bg-blue-50 text-[#1597E5] text-[8.5px] font-black rounded-lg uppercase tracking-wider border border-blue-100">
                    {notice.category}
                  </span>
                  <h3 className="text-sm font-black text-[#0F172A] mt-2 font-sans">{notice.title}</h3>
                </div>
                {isPrincipal && (
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors cursor-pointer"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p className="text-xs text-secondaryText leading-relaxed font-sans">{notice.content}</p>
              <div className="border-t border-slate-50 pt-2 flex items-center justify-between text-[9px] text-[#A0AEC0] font-bold font-sans">
                <span className="flex items-center gap-1">
                  <FiUser className="w-3 h-3" /> By {notice.authorName || 'Principal'}
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" /> {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          /* Empty State matching Screenshot 3 */
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] border border-[#1597E5]/10">
              <svg className="w-8 h-8 text-[#1597E5]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
              </svg>
            </div>

            <div className="space-y-2 max-w-[280px]">
              <h3 className="text-sm font-extrabold text-dark font-sans">No notices yet</h3>
              <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed font-sans">
                Tap the button below to post your first notice for parents and staff.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button: Post Notice (Screenshot 3) */}
      {isPrincipal && (
        <button
          onClick={() => navigate('/settings/post-notice')}
          className="fixed bottom-6 right-6 py-3.5 px-6 bg-[#00A1FF] hover:bg-[#0088ff] text-white rounded-full font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer hover:scale-105 active:scale-95 z-45"
        >
          <FiPlus className="w-4.5 h-4.5" />
          <span>New Notice</span>
        </button>
      )}
    </motion.div>
  );
};

export default NoticeBoard;
