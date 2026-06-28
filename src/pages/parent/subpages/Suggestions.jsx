import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiSend, FiMessageSquare, FiClock } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';

const Suggestions = () => {
  const { activeRole } = useApp();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([
    { id: 1, title: 'Improve library seating area', type: 'Suggestion', status: 'Under Review', date: '18 Jun 2026', body: 'The library needs more desks and chairs for high school students during peak study hours.' },
    { id: 2, title: 'Fix canteen drinking fountain', type: 'Complaint', status: 'Resolved', date: '15 Jun 2026', body: 'Water flow is extremely low at the cafeteria drinking fountain.' }
  ]);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Suggestion');
  const [body, setBody] = useState('');
  const [success, setSuccess] = useState(false);

  // Parent specific states
  const [parentSubject, setParentSubject] = useState('');
  const [parentDetails, setParentDetails] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [parentSubmissions, setParentSubmissions] = useState([
    {
      id: 'sub-1',
      title: 'Improve Bus Route Coverage',
      body: 'Many students from the southern zone do not have bus coverage. Could the school consider adding a route for ar...',
      date: '10 Jun 2026',
      status: 'Reviewed',
      badgeBg: 'bg-[#F3E8FF] text-[#7C3AED] border border-[#d8b4fe]/30',
      response: 'Thank you for the feedback. The transport department is surveying the Sontyam southern sector. A route extension plan will be presented by July 1st.'
    },
    {
      id: 'sub-2',
      title: 'Request for Extra Tuition Classes',
      body: 'My child is struggling with Mathematics in Grade IX. It would be great if the school could arrange extra classes...',
      date: '28 May 2026',
      status: 'Resolved',
      badgeBg: 'bg-[#E8F8F0] text-[#23C16B] border border-[#a7f3d0]/30',
      response: 'Extra remedial classes have been configured for Mathematics starting next week. Parents can opt-in via their dashboard settings.'
    }
  ]);

  const handleParentSubmit = (e) => {
    e.preventDefault();
    if (!parentSubject || !parentDetails) return;

    const newSub = {
      id: 'sub-' + Date.now(),
      title: parentSubject,
      body: parentDetails,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Under Review',
      badgeBg: 'bg-amber-50 text-amber-600 border border-amber-200/55',
      response: 'Thank you for your feedback. Our administration is reviewing your suggestion.'
    };

    setParentSubmissions([newSub, ...parentSubmissions]);
    setParentSubject('');
    setParentDetails('');
  };

  if (activeRole === 'PARENT') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto relative select-none animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Suggestions</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Blue Banner Card */}
            <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden space-y-5">
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0">
                  <FiMessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Suggestions</h2>
                  <p className="text-[11px] text-white/80 font-bold mt-0.5">Share feedback with school management</p>
                </div>
              </div>
            </div>

            {/* New Suggestion Form */}
            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
              <h3 className="text-xs font-extrabold text-secondaryText uppercase tracking-widest px-1">
                New Suggestion
              </h3>

              <form onSubmit={handleParentSubmit} className="space-y-4 pt-1">
                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={parentSubject}
                    onChange={(e) => setParentSubject(e.target.value)}
                    placeholder="Brief title for your suggestion..."
                    className="w-full px-4 py-3 bg-[#EEF5FB]/30 border border-[#e2e8f0]/70 rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Details
                  </label>
                  <textarea
                    rows="4"
                    maxLength="500"
                    value={parentDetails}
                    onChange={(e) => setParentDetails(e.target.value)}
                    placeholder="Describe your suggestion in detail..."
                    className="w-full px-4 py-3 bg-[#EEF5FB]/30 border border-[#e2e8f0]/70 rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue resize-none"
                  />
                  <div className="flex justify-end text-[10px] font-bold text-secondaryText/60">
                    {parentDetails.length}/500
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!parentSubject || !parentDetails}
                  className={`w-full py-4 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    parentSubject && parentDetails
                      ? 'bg-[#00a6ff] hover:bg-brand-blue text-white shadow-md shadow-blue-500/10 active:scale-95'
                      : 'bg-[#EEF5FB] text-secondaryText/50 border border-slate-100 cursor-not-allowed'
                  }`}
                >
                  <FiSend className="w-4 h-4" />
                  <span>Submit Suggestion</span>
                </button>
              </form>
            </div>
          </div>

          {/* Column 2 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
              Your Submissions
            </div>

            <div className="space-y-4">
              {parentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3.5"
                >
                  <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${sub.badgeBg}`}>
                      {sub.status}
                    </span>
                    <span className="text-[9px] text-[#A0AEC0] font-bold">{sub.date}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-[#0F172A] leading-snug">{sub.title}</h4>
                    <p className="text-[10px] text-secondaryText font-bold leading-relaxed mt-1">{sub.body}</p>
                  </div>

                  {sub.id === 'sub-1' ? (
                    <div className="pt-2 border-t border-slate-100/60">
                      <button
                        onClick={() => setShowResponse(!showResponse)}
                        className="text-[10.5px] font-black text-[#00a6ff] hover:underline flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <span>{showResponse ? '▲ Hide Response' : '▼ View Response'}</span>
                      </button>

                      {showResponse && (
                        <div className="mt-3 p-3 bg-[#EEF5FB]/55 rounded-2xl border border-blue-50 text-[9.5px] text-secondaryText font-bold leading-relaxed">
                          <p className="text-[#0088ff] font-black uppercase tracking-wider text-[8px] mb-1">Admin Response:</p>
                          {sub.response}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !body) return;

    const newSuggestion = {
      id: Date.now(),
      title,
      type,
      status: 'Under Review',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      body
    };

    setSuggestions([newSuggestion, ...suggestions]);
    setTitle('');
    setBody('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Centered Page Header */}
      <div className="relative flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          Suggestions Box
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-4">
            <h3 className="text-sm font-extrabold text-dark flex items-center gap-1.5">
              <FiMessageSquare className="w-4 h-4 text-rose-500" />
              Submit Feedback
            </h3>
            <p className="text-[11px] text-secondaryText font-medium">Have a suggestion or request? Submit your feedback anonymously or with details to the school management.</p>

            {success ? (
              <div className="bg-[#E8F8F0] border border-[#23C16B]/25 rounded-xl p-4 flex items-center gap-2 text-xs text-accent-green font-bold">
                Feedback submitted successfully! Under review by administrator.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Category
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    >
                      <option>Suggestion</option>
                      <option>Complaint</option>
                      <option>Academics</option>
                      <option>Infrastructure</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Title Summary
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Broken bench in room 3"
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Message Body
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter details here..."
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-500/10 active:scale-95 cursor-pointer"
                  >
                    <FiSend className="w-4 h-4" /> Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column - Past Suggestions */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" /> History ({suggestions.length})
            </span>

            <div className="space-y-4 divide-y divide-[#e2e8f0]/60 max-h-[400px] overflow-y-auto pr-1">
              {suggestions.map((s, idx) => (
                <div key={s.id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''}`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full select-none ${
                      s.type === 'Complaint' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-sky-50 text-[#1597E5] border border-sky-100'
                    }`}>
                      {s.type}
                    </span>
                    <span className="text-[9px] text-secondaryText font-bold">{s.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-dark mt-1.5">{s.title}</h4>
                  <p className="text-[10px] text-secondaryText mt-1 line-clamp-2 leading-relaxed">{s.body}</p>
                  
                  <div className="flex justify-between items-center mt-2.5 text-[9px] font-bold">
                    <span className={`flex items-center gap-1 select-none ${
                      s.status === 'Resolved' ? 'text-accent-green' : 'text-amber-500'
                    }`}>
                      ● {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Suggestions;
