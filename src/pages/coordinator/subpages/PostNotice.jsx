import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiCalendar,
  FiGift,
  FiBookOpen,
  FiDollarSign,
  FiSend,
  FiCheckCircle,
  FiInfo
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import {
  createNotice,
  updateNotice,
  getNotice
} from '../../../services/dataService';

const PostNotice = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  // Parse editId from query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const editId = queryParams.get('editId');

  const [category, setCategory] = useState('Academic'); // 'Academic' | 'Fee' | 'Holiday' | 'Event'
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  // Fetch existing notice details if in edit mode
  useEffect(() => {
    if (!editId) return;

    const fetchNoticeDetails = async () => {
      try {
        setFetching(true);
        const data = await getNotice(editId);
        if (data) {
          setTitle(data.title || '');
          setMessage(data.body || '');
          setCategory(data.category || 'Academic');
          setIsPinned(!!data.pinned);
        }
      } catch (err) {
        console.error('Error fetching notice details:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchNoticeDetails();
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message || loading) return;

    setLoading(true);
    try {
      if (editId) {
        // Edit Mode: update notice
        await updateNotice({
          id: editId,
          title,
          body: message,
          category,
          pinned: isPinned
        });
      } else {
        // Create Mode: post new notice
        await createNotice({
          branchId: user.branchId,
          authorId: user.id, // ID of the principal/creator in the users table
          title,
          body: message,
          category,
          pinned: isPinned,
          date: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error('Error saving notice:', err);
      alert('Failed to save notice. Please make sure all fields are valid.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Academic': return { bg: 'bg-[#EBF8FF]', border: 'border-[#1597E5]', text: 'text-[#1597E5]' };
      case 'Fee': return { bg: 'bg-[#FEF3C7]', border: 'border-[#D97706]', text: 'text-[#D97706]' };
      case 'Holiday': return { bg: 'bg-[#ECFDF5]', border: 'border-[#059669]', text: 'text-[#059669]' };
      case 'Event': return { bg: 'bg-[#FDF2F8]', border: 'border-[#DB2777]', text: 'text-[#DB2777]' };
      default: return { bg: 'bg-[#EEF5FB]', border: 'border-[#1597E5]', text: 'text-[#1597E5]' };
    }
  };

  const categories = [
    { name: 'Academic', icon: <FiBookOpen className="w-4 h-4" /> },
    { name: 'Fee', icon: <FiDollarSign className="w-4 h-4" /> },
    { name: 'Holiday', icon: <FiCalendar className="w-4 h-4" /> },
    { name: 'Event', icon: <FiGift className="w-4 h-4" /> }
  ];

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-secondaryText font-bold">Loading notice details...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in font-sans"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">
          {editId ? 'Edit Notice' : 'Post Notice'}
        </h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/15">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="17" y1="9" x2="17" y2="15"></line>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {editId ? 'Update Notice' : 'Post a Notice'}
            </h2>
            <p className="text-[11px] text-white/70 font-semibold mt-0.5">
              This will be visible to all parents and staff members
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3 flex items-center gap-2 text-xs text-[#23C16B] font-bold select-none"
          >
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>Notice {editId ? 'updated' : 'posted'} successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category selector Card */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3 select-none">
          <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
            Category
          </span>

          <div className="flex gap-2.5 overflow-x-auto pt-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = category === cat.name;
              const catStyles = getCategoryColor(cat.name);

              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? `${catStyles.bg} ${catStyles.border} ${catStyles.text} shadow-sm`
                      : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                  }`}
                >
                  <span className={isSelected ? catStyles.text : 'text-[#718096]'}>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notice Title input Card */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
          <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
            Notice Title *
          </span>

          <div className="relative">
            <input
              type="text"
              required
              maxLength={120}
              placeholder="Enter a clear, concise title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[18px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]/60 animate-fade-in"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-sm text-[#A0AEC0]">T</span>
          </div>

          <div className="text-right text-[10px] font-bold text-secondaryText/70 select-none">
            {title.length}/120
          </div>
        </div>

        {/* Notice Content textarea Card */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
          <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
            Notice Content *
          </span>

          <textarea
            required
            rows={5}
            maxLength={2000}
            placeholder="Write the full notice here. Be clear and specific about dates, actions needed, and who it applies to."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[18px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark resize-none placeholder:text-[#A0AEC0]/60 leading-relaxed"
          />

          <div className="text-right text-[10px] font-bold text-secondaryText/70 select-none">
            {message.length}/2000
          </div>
        </div>

        {/* Options Card */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFEAEB] text-[#FF4D4F] flex items-center justify-center border border-[#FF4D4F]/5 shrink-0">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-4 h-4 text-[#FF4D4F]" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs font-extrabold text-dark leading-snug">Pin this notice</p>
              <p className="text-[10px] text-[#A0AEC0] font-semibold mt-0.5">Pinned notices appear at the top</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1597E5]" />
          </label>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3 select-none">
          <span className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
            Preview
          </span>

          <div className="border border-[#e2e8f0]/60 rounded-[18px] p-4 bg-slate-50/50 space-y-2">
            <span className="inline-block bg-[#EBF8FF] text-[#1597E5] px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border border-blue-100">
              {category}
            </span>
            <p className="text-xs font-extrabold text-dark leading-tight">
              {title || 'Your notice title will appear here'}
            </p>
          </div>
        </div>

        {/* Post Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-[22px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1597E5]/35 transition-all cursor-pointer active:scale-[0.98] disabled:bg-slate-300 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiSend className="w-4 h-4" />
            )}
            <span>{loading ? 'Posting...' : editId ? 'Update Notice' : 'Post Notice'}</span>
          </button>
        </div>
      </form>

      {/* Cancel Link */}
      <div className="text-center select-none pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs font-extrabold text-secondaryText hover:text-dark transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default PostNotice;
