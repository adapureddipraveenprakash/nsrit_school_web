import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiBarChart2, FiTrendingUp, FiAlertCircle, FiUsers, FiTag
} from 'react-icons/fi';

const BranchAnalytics = () => {
  const navigate = useNavigate();
  const { currentBranchContext, branches } = useApp();

  // Fallback to Sontyam if currentBranchContext is null
  const branch = currentBranchContext || branches.find(b => b.name === 'Sontyam') || branches[0] || {
    name: 'Sontyam'
  };

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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Branch Analytics</h1>
      </header>

      {/* Top curved purple header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Stats Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-5 border border-white/10">
          <FiBarChart2 className="w-6 h-6 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10">{branch.name} Analytics</h2>
        <p className="text-xs text-white/80 font-medium relative z-10 font-sans">
          Fee collection performance overview
        </p>

        {/* Sub-box with stats */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 gap-4 relative z-10">
          <div className="space-y-0.5">
            <span className="text-[9px] text-white/60 font-bold uppercase tracking-wider block">Collection Rate</span>
            <span className="text-lg font-black block">0%</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] text-white/60 font-bold uppercase tracking-wider block">Total Collected</span>
            <span className="text-lg font-black block">Rs 0</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-4 relative z-10">
          <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: '0%' }} />
        </div>
      </div>

      {/* Grid of four metrics cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Collected */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-accent-green flex items-center justify-center shrink-0">
            <FiTrendingUp className="w-5 h-5 text-[#23C16B]" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">Collected</span>
            <span className="text-base font-black text-[#23C16B] block">Rs 0</span>
            <span className="text-[9px] text-secondaryText font-medium block">0% of fees</span>
          </div>
        </div>

        {/* Card 2: Outstanding */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-accent-red flex items-center justify-center shrink-0">
            <FiAlertCircle className="w-5 h-5 text-accent-red" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">Outstanding</span>
            <span className="text-base font-black text-accent-red block">Rs 0</span>
            <span className="text-[9px] text-secondaryText font-medium block">Pending dues</span>
          </div>
        </div>

        {/* Card 3: Students */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-brand-blue flex items-center justify-center shrink-0">
            <FiUsers className="w-5 h-5 text-[#1597E5]" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">Students</span>
            <span className="text-base font-black text-brand-blue block">0</span>
            <span className="text-[9px] text-secondaryText font-medium block">With fee records</span>
          </div>
        </div>

        {/* Card 4: Concessions */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] text-[#FF9F1C] flex items-center justify-center shrink-0">
            <FiTag className="w-5 h-5 text-[#FF9F1C]" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">Concessions</span>
            <span className="text-base font-black text-[#FF9F1C] block">Rs 0</span>
            <span className="text-[9px] text-secondaryText font-medium block">Waivers granted</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BranchAnalytics;
