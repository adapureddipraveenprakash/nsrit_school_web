import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiPlus,
  FiCalendar,
  FiUser,
  FiBell,
  FiTrash2,
  FiEdit2,
  FiBookmark,
  FiChevronDown,
  FiCheckCircle,
  FiInbox
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import {
  getNoticesByBranch,
  deleteNotice,
  updateNotice
} from '../../../services/dataService';

const NoticeBoard = () => {
  const { user, activeRole } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const tabs = ['All', 'Academic', 'Fee', 'Holiday', 'Event'];
  const branchId = user?.branchId || null;

  // Fetch real notices from the database
  const { data: notices = [], refetch, loading } = useDataFetch(
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
        setSubmittingId(id);
        await deleteNotice(id);
        setToastMessage('Notice deleted successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        refetch();
      } catch (err) {
        console.error('Error deleting notice:', err);
      } finally {
        setSubmittingId(null);
      }
    }
  };

  const handleTogglePin = async (notice) => {
    try {
      setSubmittingId(notice.id);
      await updateNotice({
        id: notice.id,
        title: notice.title,
        body: notice.body,
        category: notice.category,
        pinned: !notice.pinned
      });
      setToastMessage(notice.pinned ? 'Notice unpinned!' : 'Notice pinned!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      refetch();
    } catch (err) {
      console.error('Error pinning notice:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  const isPrincipal = activeRole === 'PRINCIPAL';

  // Helper to format date nicely (e.g. 5 Jul 2026)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-[640px] mx-auto relative select-none animate-fade-in font-sans"
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

      {/* Blue Header Card (Screenshot 2) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        
        <div className="flex items-center gap-3.5 mb-1.5 relative z-10 select-none">
          {/* Bulletin Board Icon */}
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center border border-white/15 shrink-0">
            <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2h-3m3 3h-3m3 3h-3m3 3h-3"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold font-sans">Notice Board</h2>
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-0.5 font-sans">
              {notices.length} {notices.length === 1 ? 'notice' : 'notices'} · {isPrincipal ? 'Principal Edition' : 'Staff Edition'}
            </p>
          </div>
        </div>

        {/* Tab switcher matching Screenshot 2 */}
        <div className="flex gap-2.5 mt-5 overflow-x-auto no-scrollbar relative z-10 select-none scrollbar-none">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-[#1597E5] shadow-sm font-black'
                    : 'bg-white/15 text-white/90 hover:bg-white/20 border border-white/5 font-semibold'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-header recent notices title */}
      <div className="flex items-center justify-between pt-1 select-none">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          RECENT NOTICES
        </span>
      </div>

      {/* Notices List or Empty State */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
            <div className="w-8 h-8 border-2 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-secondaryText font-bold">Loading notices...</span>
          </div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const isExpanded = expandedNoticeId === notice.id;
            
            return (
              <div
                key={notice.id}
                className={`bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300 ${
                  notice.pinned ? 'border-l-4 border-l-[#00A1FF]' : ''
                }`}
              >
                {/* Top badge and date */}
                <div className="flex justify-between items-center select-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1597E5] text-[8.5px] font-black rounded-full uppercase tracking-wider border border-blue-100/50">
                    <FiBell className="w-2.5 h-2.5 text-[#1597E5]" />
                    <span>{notice.category}</span>
                  </span>
                  <span className="text-[9.5px] text-[#A0AEC0] font-bold">
                    {formatDate(notice.date || notice.createdAt)}
                  </span>
                </div>

                {/* Title and Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-[#0F172A] leading-tight uppercase font-sans tracking-wide">
                    {notice.title}
                  </h3>
                  <p className={`text-xs text-secondaryText leading-relaxed font-sans ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {notice.body}
                  </p>
                </div>

                {/* Bottom Action Row (Matching Screenshot 2) */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[9.5px] text-[#A0AEC0] font-bold font-sans select-none">
                  {/* Left: Author Info */}
                  <span className="flex items-center gap-1.5 text-secondaryText">
                    <FiUser className="w-3.5 h-3.5" />
                    <span>{notice.author?.fullName || notice.authorName || 'Principal'}</span>
                  </span>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-4">
                    {/* Pin button */}
                    <button
                      onClick={() => handleTogglePin(notice)}
                      disabled={submittingId === notice.id}
                      className={`p-1 rounded-full transition-colors cursor-pointer hover:bg-slate-50 ${
                        notice.pinned ? 'text-[#00A1FF]' : 'text-[#A0AEC0]'
                      }`}
                      title={notice.pinned ? 'Unpin notice' : 'Pin notice'}
                    >
                      <FiBookmark className={`w-3.5 h-3.5 ${notice.pinned ? 'fill-current' : ''}`} />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => navigate(`/settings/post-notice?editId=${notice.id}`)}
                      disabled={submittingId === notice.id}
                      className="p-1 text-[#A0AEC0] hover:text-[#00A1FF] rounded-full transition-colors cursor-pointer hover:bg-slate-50"
                      title="Edit notice"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(notice.id)}
                      disabled={submittingId === notice.id}
                      className="p-1 text-[#A0AEC0] hover:text-[#EF4444] rounded-full transition-colors cursor-pointer hover:bg-slate-50"
                      title="Delete notice"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* More button */}
                    <button
                      onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                      className="flex items-center gap-0.5 text-secondaryText hover:text-dark transition-colors cursor-pointer"
                    >
                      <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      <span>More</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State matching Screenshot 2 */
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

      {/* Floating Action Button: Post Notice (Screenshot 2) */}
      {isPrincipal && (
        <button
          onClick={() => navigate('/settings/post-notice')}
          className="fixed bottom-6 right-6 py-3.5 px-6 bg-[#00A1FF] hover:bg-[#0088ff] text-white rounded-full font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer hover:scale-105 active:scale-95 z-45"
        >
          <FiPlus className="w-4.5 h-4.5" />
          <span>New Notice</span>
        </button>
      )}

      {/* Toast Alert */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-dark text-white px-6 py-3.5 rounded-full card-shadow flex items-center gap-3 z-50 select-none font-sans text-xs font-bold"
          >
            <FiCheckCircle className="text-emerald-500 w-5 h-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NoticeBoard;
