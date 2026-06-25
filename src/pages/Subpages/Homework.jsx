import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlusCircle, FiFileText, FiCheckCircle, FiHelpCircle, FiCalendar } from 'react-icons/fi';

const Homework = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Pending');

  const tabs = ['Pending', 'Submitted', 'Graded'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 max-w-[640px] mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Homework</h1>
      </header>

      {/* Blue Header Card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-1.5 relative z-10 select-none">
          {/* Book Icon */}
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/15 shrink-0">
            <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Homework</h2>
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-0.5">Manage assignments for your students</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="bg-white border border-[#e2e8f0]/45 p-1.5 rounded-[20px] flex select-none">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-black rounded-[16px] transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1597E5] text-white shadow-sm'
                  : 'text-secondaryText hover:text-dark font-bold'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Feature Card */}
      <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-10 card-shadow text-center flex flex-col items-center justify-center space-y-5">
        {/* Rocket Icon */}
        <div className="w-16 h-16 rounded-full bg-[#EBF8FF] flex items-center justify-center text-[#1597E5] relative shadow-inner">
          <div className="absolute inset-[-6px] rounded-full border border-[#1597E5]/10" />
          <svg className="w-7 h-7 text-[#1597E5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5L19 5m0 0l-3.5 1.5M19 5v4m-8.5 7.5L5 21m0 0l1.5-3.5M5 21v-4M8.5 8.5C6.5 10.5 6 13 6 13s2.5-.5 4.5-2.5 2.5-4.5 2.5-4.5-2.5 0-4.5 2.5z"></path>
          </svg>
        </div>

        <div className="space-y-2 max-w-[280px]">
          <h3 className="text-sm font-extrabold text-dark">Homework Management</h3>
          <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
            The homework module is coming soon. Assign tasks, track submissions, and grade student work — all from the app.
          </p>
        </div>
      </div>

      {/* "What's coming" section */}
      <div className="space-y-4 pt-1">
        <h4 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block px-1">What's coming</h4>

        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          {[
            { text: 'Create assignments with due dates', icon: <FiPlusCircle className="w-4 h-4 text-[#1597E5]" /> },
            { text: 'Students submit via the parent app', icon: <FiFileText className="w-4 h-4 text-[#1597E5]" /> },
            { text: 'Grade and provide feedback', icon: <FiCheckCircle className="w-4 h-4 text-[#1597E5]" /> },
            { text: 'Track completion rates by class', icon: <FiHelpCircle className="w-4 h-4 text-[#1597E5]" /> }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3.5 text-xs text-dark font-semibold">
              <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:left-[288px] select-none">
        <div className="max-w-[640px] mx-auto px-4 pb-2.5">
          <button
            onClick={() => navigate('/settings/take-attendance')}
            className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-[24px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1597E5]/35 transition-all cursor-pointer active:scale-95"
          >
            <FiCalendar className="w-4 h-4" />
            <span>Take Attendance Instead</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Homework;
