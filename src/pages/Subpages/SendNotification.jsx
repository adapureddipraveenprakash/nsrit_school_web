import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSend, FiAlertCircle, FiCheckCircle, FiInfo, FiUsers, FiBriefcase } from 'react-icons/fi';
import { HiOutlineUserGroup, HiOutlineBookOpen, HiOutlinePencil, HiOutlineExclamationTriangle } from 'react-icons/hi2';

const SendNotification = () => {
  const { addNotification } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('ALL'); // 'ALL' | 'PARENT' | 'TEACHER' | 'STUDENT'
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !message) {
      setError('Please fill in both the title and the message contents');
      return;
    }
    setError('');
    
    // Prefix with priority emoji if toggled
    const finalTitle = isHighPriority ? `🔴 ${title}` : title;

    addNotification({
      title: finalTitle,
      message,
      targetRole: targetType, // ALL, PRINCIPAL, COORDINATOR, TEACHER, PARENT
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate(-1);
    }, 1500);
  };

  const targets = [
    { key: 'ALL', label: 'All Recipients', icon: <FiUsers className="w-5 h-5" /> },
    { key: 'PARENT', label: 'Parents Only', icon: <HiOutlineUserGroup className="w-5 h-5" /> },
    { key: 'TEACHER', label: 'Teachers Only', icon: <FiBriefcase className="w-5 h-5" /> },
    { key: 'STUDENT', label: 'Students (via Parents)', icon: <HiOutlineBookOpen className="w-5 h-5" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-24 md:pb-12 max-w-5xl mx-auto space-y-6"
    >
      {/* Header bar matching Screenshot 3 */}
      <header className="flex items-center gap-4 py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-dark">Compose Notification</h1>
          <p className="text-[10px] text-secondaryText font-medium mt-0.5">Broadcast alerts to school stakeholders</p>
        </div>
      </header>

      {success && (
        <div className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3 flex items-center gap-2 text-xs text-accent-green font-bold">
          <FiCheckCircle className="w-4 h-4 shrink-0" />
          <span>Notification broadcasted successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3 flex items-center gap-2 text-xs text-accent-red font-bold">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Broadcast Target Selection */}
        <div className="space-y-4 md:col-span-1">
          <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1 block">
            BROADCAST TARGET
          </span>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {targets.map((t) => {
              const isSelected = targetType === t.key;
              return (
                <div
                  key={t.key}
                  onClick={() => setTargetType(t.key)}
                  className={`bg-white p-4 rounded-[20px] border flex flex-col justify-center items-center text-center cursor-pointer transition-all card-shadow ${
                    isSelected
                      ? 'border-[#1597E5] ring-2 ring-[#1597E5]/10 text-brand-blue'
                      : 'border-[#e2e8f0]/40 text-secondaryText hover:border-brand-blue/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
                    isSelected ? 'bg-brand-blue/10 text-brand-blue' : 'bg-[#EEF5FB] text-secondaryText'
                  }`}>
                    {t.icon}
                  </div>
                  <span className="text-[10px] font-extrabold leading-tight">{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Alert Details Composition & Broadcast Button */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-5">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1 block -mb-1">
              ALERT DETAILS
            </span>

            {/* Notification Title rounded-full input */}
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Notification Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-full card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
              />
              <HiOutlinePencil className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            {/* Notification Message textarea */}
            <textarea
              required
              rows="6"
              placeholder="Type your message details here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-5 py-4 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark resize-none placeholder:text-secondaryText"
            />

            {/* Mark as High Priority Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-[#EEF5FB]/35 border border-[#e2e8f0]/30 rounded-[20px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#e2e8f0]/40 flex items-center justify-center text-accent-orange shadow-sm">
                  <HiOutlineExclamationTriangle className="w-5 h-5 text-accent-orange" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-dark leading-snug">Mark as High Priority</p>
                  <p className="text-[9px] text-secondaryText font-semibold mt-0.5">Prefixes title with 🔴 priority indicator</p>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isHighPriority}
                  onChange={(e) => setIsHighPriority(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue" />
              </label>
            </div>

            {/* Info panel */}
            <div className="flex gap-3 p-4 bg-[#EEF5FB] border border-[#1597E5]/15 rounded-[20px] text-[10px] leading-relaxed text-brand-blue font-bold">
              <FiInfo className="w-4 h-4 shrink-0 mt-0.5 text-brand-blue" />
              <p>
                Notifications appear in each recipient's Notification Center immediately. Delivery is immediate — all matched users in your branch receive it.
              </p>
            </div>
          </div>

          {/* Broadcast button */}
          <button
            type="submit"
            className="w-full py-4 bg-[#1597E5] hover:bg-brand-secondary text-white rounded-full font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
          >
            <FiSend className="w-4 h-4" />
            Broadcast Notification
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default SendNotification;
