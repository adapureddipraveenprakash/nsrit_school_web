import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiInfo, FiUsers, FiUser, FiBookOpen, FiCheckCircle } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { broadcastNotification } from '../../../services/dataService';

const SendNotification = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const [target, setTarget] = useState('all'); // 'all' | 'parents' | 'teachers' | 'students'
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const fullTitle = isHighPriority ? `🔴 ${title}` : title;
      const res = await broadcastNotification({
        branchId: user?.branchId,
        title: fullTitle,
        message,
        target,
      });

      setStats(res);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error('[SendNotification] Broadcast error:', err);
    } finally {
      setLoading(false);
    }
  };

  const targets = [
    { id: 'all', label: 'All Recipients', icon: <FiUsers className="w-4 h-4" /> },
    { id: 'parents', label: 'Parents Only', icon: <FiUsers className="w-4 h-4" /> },
    { id: 'teachers', label: 'Teachers Only', icon: <FiUser className="w-4 h-4" /> },
    { id: 'students', label: 'Students (via Parents)', icon: <FiBookOpen className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in animate-fade-in-long select-none"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          disabled={loading}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center mx-auto pr-8">
          <h1 className="text-sm font-bold text-dark font-sans leading-none">Compose Notification</h1>
          <p className="text-[10px] text-secondaryText font-bold mt-1">Broadcast alerts to school stakeholders</p>
        </div>
      </header>

      {/* Success Modal/Banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-4 flex flex-col gap-1 text-xs text-[#23C16B] font-bold"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 shrink-0 text-[#23C16B]" />
              <span>Broadcast dispatched successfully!</span>
            </div>
            {stats && (
              <p className="text-[10px] text-slate-500 font-semibold pl-6 mt-0.5">
                Sent to {stats.sent} recipients (Failed: {stats.failed})
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BROADCAST TARGET SELECTOR */}
        <div className="space-y-3.5">
          <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase px-1">
            Broadcast Target
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {targets.map((tgt) => {
              const isSelected = target === tgt.id;
              return (
                <button
                  key={tgt.id}
                  type="button"
                  onClick={() => setTarget(tgt.id)}
                  disabled={loading}
                  className={`p-4 rounded-[20px] border-2 text-xs font-black transition-all flex items-center justify-start gap-3.5 cursor-pointer text-left shadow-sm ${
                    isSelected
                      ? 'border-[#1597E5] bg-[#EEF5FB] text-[#1597E5]'
                      : 'border-[#e2e8f0]/80 bg-white text-secondaryText hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                    isSelected
                      ? 'bg-white border-blue-50 text-[#1597E5]'
                      : 'bg-slate-50 border-slate-100 text-secondaryText'
                  }`}>
                    {tgt.icon}
                  </div>
                  <span>{tgt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ALERT DETAILS */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase px-1">
            Alert Details
          </h2>

          <div className="space-y-4 bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow">
            {/* Title Input */}
            <div className="relative flex items-center border border-[#e2e8f0] rounded-xl px-3.5 focus-within:border-[#1597E5] transition-all">
              <FiEdit2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Notification Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="w-full py-3.5 pl-3 text-xs font-bold text-dark placeholder-slate-400/80 bg-transparent border-none outline-none"
              />
            </div>

            {/* Message Body */}
            <div className="border border-[#e2e8f0] rounded-xl p-3.5 focus-within:border-[#1597E5] transition-all">
              <textarea
                placeholder="Type your message details here..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={loading}
                className="w-full text-xs font-semibold text-slate-700 placeholder-slate-400/80 bg-transparent border-none outline-none resize-none"
              />
            </div>

            {/* High Priority Toggle */}
            <div className="flex justify-between items-center py-2.5 px-1.5 border-t border-[#e2e8f0]/70 select-none">
              <div>
                <h4 className="font-extrabold text-dark text-xs flex items-center gap-1.5">
                  Mark as High Priority
                </h4>
                <p className="text-[10px] text-secondaryText font-semibold mt-0.5">
                  Prefixes title with 🔴 priority indicator
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHighPriority(!isHighPriority)}
                disabled={loading}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  isHighPriority ? 'bg-[#1597E5]' : 'bg-[#e2e8f0]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    isHighPriority ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#EEF7FF] rounded-[20px] p-4 flex gap-3 text-[10px] text-[#1597E5] font-semibold leading-normal border border-blue-50/10">
          <FiInfo className="w-4 h-4 shrink-0 text-[#1597E5] mt-0.5" />
          <p>
            Notifications appear in each recipient's Notification Center immediately. Delivery is immediate — all matched users in your branch receive it.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || !title.trim() || !message.trim()}
          className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1597E5]/30 transition-all cursor-pointer active:scale-95"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Broadcast Notification</span>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default SendNotification;
