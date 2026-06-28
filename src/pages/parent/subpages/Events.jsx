import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiCheck } from 'react-icons/fi';

const Events = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Events</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Large circular calendar icon with border */}
        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center mb-4 relative z-10">
          <FiCalendar className="w-8 h-8 text-white" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl font-bold mb-1 relative z-10">Events</h2>
        <p className="text-xs text-white/80 font-medium relative z-10">School events and announcements</p>
      </div>

      {/* Main card with Coming Soon content */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-6 card-shadow flex flex-col items-center text-center space-y-6 select-none">
        
        {/* Blue/purple clock circle */}
        <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue shrink-0">
          <FiClock className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-dark">Coming Soon</h3>
          <p className="text-xs text-secondaryText font-medium max-w-[360px] leading-relaxed">
            Event scheduling, announcements, and coordination tools are being developed for the Coordinator role.
          </p>
        </div>

        {/* Checklist */}
        <div className="w-full max-w-[280px] text-left space-y-3.5 pt-2">
          {[
            'School event calendar',
            'Announcement broadcasting',
            'Parent notifications',
            'Event attendance tracking'
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[#E8F8F0] border border-[#23C16B]/15 flex items-center justify-center shrink-0 text-[#23C16B]">
                <FiCheck className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-dark">{item}</span>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
};

export default Events;
