import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiSend, FiMessageSquare, FiClock } from 'react-icons/fi';

const Suggestions = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([
    { id: 1, title: 'Improve library seating area', type: 'Suggestion', status: 'Under Review', date: '18 Jun 2026', body: 'The library needs more desks and chairs for high school students during peak study hours.' },
    { id: 2, title: 'Fix canteen drinking fountain', type: 'Complaint', status: 'Resolved', date: '15 Jun 2026', body: 'Water flow is extremely low at the cafeteria drinking fountain.' }
  ]);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Suggestion');
  const [body, setBody] = useState('');
  const [success, setSuccess] = useState(false);

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
