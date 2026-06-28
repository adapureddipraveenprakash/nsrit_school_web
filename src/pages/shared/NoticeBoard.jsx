import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';

const NoticeBoard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Academic', 'Fee', 'Holiday', 'Events'];

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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Notice Board</h1>
      </header>

      {/* Blue Header Card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-1.5 relative z-10 select-none">
          {/* Bulletin/Megaphone Icon */}
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center border border-white/15 shrink-0">
            <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2h-3m3 3h-3m3 3h-3m3 3h-3"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Notice Board</h2>
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-0.5">0 notices • Teacher Edition</p>
          </div>
        </div>

        {/* Tab switcher */}
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

      {/* Empty State Card */}
      <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px]">
        {/* Empty state icon */}
        <div className="w-16 h-16 rounded-full bg-[#EBF8FF] flex items-center justify-center text-[#1597E5] relative shadow-inner">
          <div className="absolute inset-[-6px] rounded-full border border-[#1597E5]/10" />
          <svg className="w-7 h-7 text-[#1597E5]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
        </div>

        <div className="space-y-2 max-w-[280px]">
          <h3 className="text-sm font-extrabold text-dark">No notices</h3>
          <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
            School notices and announcements will appear here automatically.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default NoticeBoard;
