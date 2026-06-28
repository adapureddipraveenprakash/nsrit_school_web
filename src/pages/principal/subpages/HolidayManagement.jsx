import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

const HolidayManagement = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in text-center"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Holiday Management</h1>
      </header>

      {/* Main content empty/placeholder state */}
      <div className="flex flex-col items-center justify-center py-20 px-6 space-y-6 select-none min-h-[460px]">
        {/* Custom SVG Red Calendar with X inside */}
        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm relative">
          <div className="absolute inset-[-6px] rounded-full border border-red-50" />
          <svg
            className="w-12 h-12 text-[#E53E3E]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <line x1="9" y1="14" x2="15" y2="20"></line>
            <line x1="15" y1="14" x2="9" y2="20"></line>
          </svg>
        </div>

        <div className="space-y-2 max-w-[340px]">
          <h2 className="text-lg font-black text-dark">Holiday Management</h2>
          <p className="text-xs text-[#E53E3E] font-extrabold uppercase tracking-widest">Coming Soon</p>
          <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed pt-2">
            Manage school holidays and public holidays for your branch. This feature will be available in a future update.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HolidayManagement;
