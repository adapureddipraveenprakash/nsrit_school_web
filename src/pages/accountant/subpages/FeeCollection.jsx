import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiClock, FiBookOpen, FiFileText } from 'react-icons/fi';
import { BiReceipt } from 'react-icons/bi';

const FeeCollection = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Paid', 'Partial', 'Due', 'Overdue'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-4xl mx-auto select-none animate-fade-in relative"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fee Collection</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="mb-1 relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE DESK</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Fee Dashboard</h2>
        <p className="text-[11px] text-white/80 font-bold relative z-10">
          Collection, dues, and student ledger overview
        </p>
      </div>

      {/* Collection Rate statistics card */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs sm:text-sm font-black text-[#0F172A]">Collection Rate</span>
            <p className="text-[10px] text-secondaryText font-bold mt-0.5">0 paid · 0 pending</p>
          </div>
          <span className="text-2xl font-black text-rose-500">0%</span>
        </div>

        {/* Progress bar track */}
        <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
          <div className="bg-[#0088ff] h-full rounded-full transition-all duration-300" style={{ width: '0%' }} />
        </div>

        {/* Triple stats row */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center font-sans text-xs">
          <div>
            <p className="font-black text-dark">Rs 0</p>
            <p className="text-[8.5px] font-black text-[#A0AEC0] uppercase tracking-widest mt-1">Total</p>
          </div>
          <div>
            <p className="font-black text-[#23C16B]">Rs 0</p>
            <p className="text-[8.5px] font-black text-[#A0AEC0] uppercase tracking-widest mt-1">Paid</p>
          </div>
          <div 
            onClick={() => navigate('/settings/global-students')}
            className="cursor-pointer hover:bg-slate-50 rounded-lg p-0.5 transition-colors"
          >
            <p className="font-black text-rose-500 flex items-center justify-center gap-0.5">
              Rs 0 <span className="text-[7.5px] font-extrabold">&gt;</span>
            </p>
            <p className="text-[8.5px] font-black text-[#A0AEC0] uppercase tracking-widest mt-1">Due</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid (4 cards side-by-side) */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Collection', sub: 'Record', path: '/settings/record-payment', icon: <BiReceipt className="w-5.5 h-5.5 text-[#00a896]" />, bg: 'bg-[#e6fbf7] border border-[#a8ebd9]' },
          { label: 'History', sub: 'View', path: '/settings/fee-history', icon: <FiClock className="w-5.5 h-5.5 text-[#e5a93b]" />, bg: 'bg-[#fdf6e6] border border-[#f5e3be]' },
          { label: 'Ledger', sub: 'Open', path: '/settings/ledger', icon: <FiBookOpen className="w-5.5 h-5.5 text-[#1e88e5]" />, bg: 'bg-[#e3f2fd] border border-[#bbdefb]' },
          { label: 'Reports', sub: 'View', path: '/settings/branch-reports', icon: <FiFileText className="w-5.5 h-5.5 text-[#8e24aa]" />, bg: 'bg-[#f3e5f5] border border-[#e1bee7]' }
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 group"
          >
            <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-sm hover:shadow-md transition-all ${item.bg}`}>
              {item.icon}
            </div>
            <div className="text-center">
              <span className="text-[9px] font-black text-secondaryText tracking-wider block uppercase group-hover:text-[#0088ff] transition-colors">
                {item.label}
              </span>
              <span className="text-[7.5px] text-[#A0AEC0] font-bold block">
                {item.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Student Ledgers Section */}
      <div className="space-y-3">
        <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
          Student Ledgers
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search student fees"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
        </div>

        {/* Filters chips row */}
        <div className="flex gap-2.5 pb-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-[10.5px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20'
                    : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Empty state Card matching Screenshot */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative">
            <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="space-y-1.5 max-w-[280px]">
            <h4 className="text-xs font-black text-dark">No fee records</h4>
            <p className="text-[10px] text-[#A0AEC0] font-semibold leading-relaxed">
              Try another filter or search term.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeeCollection;
