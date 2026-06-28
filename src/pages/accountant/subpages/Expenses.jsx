import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';

const Expenses = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-2xl mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Expenses</h1>
      </header>

      {/* Blue Banner Header */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden text-center flex flex-col items-center">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="w-16 h-16 rounded-full bg-white/20 border border-white/35 flex items-center justify-center text-3xl mb-3 shadow-inner">
          <FiDollarSign className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-xl font-bold tracking-tight">Expenses</h2>
        <p className="text-xs text-white/85 font-medium mt-1">Track and manage branch expenditures</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-[32px] border border-[#e2e8f0]/45 p-8 card-shadow text-center flex flex-col items-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-inner">
          <FiClock className="w-7 h-7" />
        </div>

        <div className="space-y-2.5">
          <h3 className="text-base font-black text-dark">Coming in Next Release</h3>
          <p className="text-[11px] text-[#A0AEC0] font-semibold leading-relaxed max-w-sm mx-auto">
            Expense tracking, petty cash management, and vendor payments are being built. This feature will be available in the next update.
          </p>
        </div>

        {/* Feature Checkmarks List */}
        <div className="w-full max-w-xs bg-[#FAF9FF] border border-[#e2def0]/50 rounded-[24px] p-5 space-y-3.5 text-left text-xs font-bold text-secondaryText">
          {[
            'Petty cash entries',
            'Vendor payments',
            'Monthly expense reports',
            'Budget tracking'
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Expenses;
