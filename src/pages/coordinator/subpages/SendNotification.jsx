import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiInfo, FiUsers, FiUser, FiBookOpen, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { broadcastNotification, getScheduledNotificationsByBranch, createScheduledNotification } from '../../../services/dataService';

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

  // Scheduled Notification states
  const todayStr = new Date().toISOString().split('T')[0];
  const currentHour = String(new Date().getHours()).padStart(2, '0');
  const currentMin = String(new Date().getMinutes()).padStart(2, '0');
  const timeStr = `${currentHour}:${currentMin}`;

  const [sendMode, setSendMode] = useState('now'); // 'now' | 'schedule'
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState(timeStr);
  const [scheduledList, setScheduledList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  const fetchQueue = async () => {
    if (!user?.branchId) return;
    setLoadingQueue(true);
    try {
      const list = await getScheduledNotificationsByBranch({ branchId: user.branchId });
      setScheduledList(list || []);
    } catch (err) {
      console.error('[SendNotification] Error fetching scheduled queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (sendMode === 'schedule') {
      if (!scheduledDate || !scheduledTime) {
        alert('Please specify date and time for scheduling.');
        return;
      }
      const scheduledDateTimeStr = `${scheduledDate}T${scheduledTime}`;
      const scheduledTimestamp = new Date(scheduledDateTimeStr).getTime();
      if (scheduledTimestamp <= Date.now()) {
        alert('Scheduled time must be in the future.');
        return;
      }

      setLoading(true);
      try {
        const fullTitle = isHighPriority ? `🔴 ${title}` : title;
        await createScheduledNotification({
          branchId: user?.branchId,
          title: fullTitle,
          message,
          target,
          scheduledTime: new Date(scheduledDateTimeStr).toISOString(),
          createdById: user?.id,
          createdByRole: user?.role || 'COORDINATOR',
        });

        setSuccess(true);
        setTitle('');
        setMessage('');
        setIsHighPriority(false);
        setSendMode('now');
        fetchQueue();
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (err) {
        console.error('[SendNotification] Error scheduling notification:', err);
        alert('Failed to schedule notification: ' + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

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
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto animate-fade-in animate-fade-in-long select-none"
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
              <span>{sendMode === 'schedule' ? 'Notification scheduled successfully!' : 'Broadcast dispatched successfully!'}</span>
            </div>
            {stats && (
              <p className="text-[10px] text-slate-500 font-semibold pl-6 mt-0.5">
                Sent to {stats.sent} recipients (Failed: {stats.failed})
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
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

          {/* SEND MODE SWITCHER */}
          <div className="space-y-3.5">
            <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase px-1">
              Delivery Schedule
            </h2>
            
            <div className="bg-white rounded-2xl border border-[#e2e8f0]/45 p-1 flex select-none card-shadow">
              <button
                type="button"
                onClick={() => setSendMode('now')}
                disabled={loading}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sendMode === 'now'
                    ? 'bg-[#1597E5] text-white shadow-sm'
                    : 'text-secondaryText hover:text-dark font-bold'
                }`}
              >
                Send Immediately
              </button>
              <button
                type="button"
                onClick={() => setSendMode('schedule')}
                disabled={loading}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sendMode === 'schedule'
                    ? 'bg-[#1597E5] text-white shadow-sm'
                    : 'text-secondaryText hover:text-dark font-bold'
                }`}
              >
                Schedule for Later
              </button>
            </div>
          </div>

          {/* DATE & TIME SELECTORS FOR SCHEDULING */}
          {sendMode === 'schedule' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-4 bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow"
            >
              <div>
                <label className="text-[10px] font-extrabold text-[#A0AEC0] uppercase tracking-wider block mb-1.5 pl-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#EEF5FB]/35 border border-[#e2e8f0] rounded-[18px] text-xs font-bold text-dark focus:outline-none focus:border-brand-blue/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-[#A0AEC0] uppercase tracking-wider block mb-1.5 pl-1">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#EEF5FB]/35 border border-[#e2e8f0] rounded-[18px] text-xs font-bold text-dark focus:outline-none focus:border-brand-blue/50"
                />
              </div>
            </motion.div>
          )}

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
              {sendMode === 'schedule'
                ? 'Scheduled notifications are processed automatically on the server at the chosen date and time. Make sure the scheduled time is in the future.'
                : 'Notifications appear in each recipient\'s Notification Center immediately. Delivery is immediate — all matched users in your branch receive it.'}
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
              <span>{sendMode === 'schedule' ? 'Schedule Notification' : 'Broadcast Notification'}</span>
            )}
          </button>
        </form>

        {/* Right Column: Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 select-none">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
                <FiClock className="w-3.5 h-3.5 text-[#1597E5]" />
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Scheduled Queue</h2>
            </div>
            <button
              type="button"
              onClick={fetchQueue}
              className="text-[10px] font-extrabold text-brand-blue hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {loadingQueue ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scheduledList.length > 0 ? (
            <div className="space-y-3">
              {scheduledList.map((item) => {
                const dateObj = new Date(item.scheduledTime);
                const formattedDate = dateObj.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });

                let badgeColor = 'bg-amber-50 text-amber-600 border border-amber-100';
                if (item.status === 'sent') {
                  badgeColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                } else if (item.status === 'processing') {
                  badgeColor = 'bg-blue-50 text-[#1597E5] border border-blue-100 animate-pulse';
                } else if (item.status === 'failed') {
                  badgeColor = 'bg-rose-50 text-rose-600 border border-rose-100';
                }

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4.5 card-shadow space-y-3 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-1 bg-slate-50 text-secondaryText text-[8.5px] font-black rounded-lg uppercase tracking-wider border border-slate-100">
                          Target: {item.target?.toUpperCase()}
                        </span>
                        <h3 className="text-xs font-black text-dark mt-2.5">{item.title}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide shrink-0 ${badgeColor}`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-secondaryText font-semibold leading-relaxed">
                      {item.message}
                    </p>

                    <div className="border-t border-slate-50 pt-2 flex items-center justify-between text-[9px] text-[#A0AEC0] font-bold font-sans">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3 text-brand-blue" />
                        {formattedDate} at {formattedTime}
                      </span>
                      {item.statsSent !== null && item.statsSent !== undefined && (
                        <span className="text-emerald-500 font-extrabold">
                          Sent to {item.statsSent} users
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-8 card-shadow text-center text-xs font-semibold text-[#A0AEC0]">
              No scheduled notifications in queue.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SendNotification;
