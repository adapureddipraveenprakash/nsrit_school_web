import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiSend, FiBook, FiFolder, FiTrash2 } from 'react-icons/fi';

const Homework = () => {
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState([
    { id: 1, title: 'Maths exercise 4.2 solving', section: 'Class 5-A', subject: 'Maths', date: '21 Jun 2026', desc: 'Complete questions 1 to 10 from page 45 and upload the solved worksheet.' },
    { id: 2, title: 'Telugu grammar lesson 2 reading', section: 'Class 7-A', subject: 'Telugu', date: '19 Jun 2026', desc: 'Read Telugu chapter 2 grammar section and write 10 difficult terms.' }
  ]);

  const [title, setTitle] = useState('');
  const [section, setSection] = useState('Class 5-A');
  const [subject, setSubject] = useState('Maths');
  const [desc, setDesc] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !desc) return;

    const newHomework = {
      id: Date.now(),
      title,
      section,
      subject,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      desc
    };

    setHomeworks([newHomework, ...homeworks]);
    setTitle('');
    setDesc('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleDelete = (id) => {
    setHomeworks(homeworks.filter((h) => h.id !== id));
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
          Homework Assignments
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-4">
            <h3 className="text-sm font-extrabold text-dark flex items-center gap-1.5">
              <FiBook className="w-4 h-4 text-brand-blue" />
              Create Homework Assignment
            </h3>

            {success ? (
              <div className="bg-[#E8F8F0] border border-[#23C16B]/25 rounded-xl p-4 flex items-center gap-2 text-xs text-accent-green font-bold">
                Homework assignment created and published to section feeds!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                      Target Section
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    >
                      <option>Class 5-A</option>
                      <option>Class 7-A</option>
                      <option>Class 6-B</option>
                      <option>Class 4-B</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    >
                      <option>Maths</option>
                      <option>Telugu</option>
                      <option>English</option>
                      <option>Science</option>
                      <option>Social</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Exercise 4.2 Worksheet"
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
                    Instructions / Description
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Enter exercise numbers, criteria, or worksheets description..."
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-blue hover:bg-brand-secondary text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-brand-blue/10 active:scale-95 cursor-pointer"
                  >
                    <FiSend className="w-4 h-4" /> Publish Homework
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column - Recently Posted logs */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block flex items-center gap-1">
              <FiFolder className="w-3.5 h-3.5" /> Recent Posts ({homeworks.length})
            </span>

            <div className="space-y-4 divide-y divide-[#e2e8f0]/60 max-h-[400px] overflow-y-auto pr-1">
              {homeworks.map((h, idx) => (
                <div key={h.id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full select-none">
                      {h.section}
                    </span>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1 text-secondaryText/60 hover:text-accent-red rounded transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-dark mt-1.5">{h.title}</h4>
                  <p className="text-[9px] text-[#1597E5] font-extrabold mt-0.5">{h.subject} · {h.date}</p>
                  <p className="text-[10px] text-secondaryText mt-1.5 leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Homework;
