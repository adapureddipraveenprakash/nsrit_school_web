import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';

const GraduateStudents = () => {
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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Graduate Students</h1>
      </header>

      {/* Top curved green header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#23C16B] to-[#2ecc71] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Subtitle */}
        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL · CLASS 12</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10">Graduate Students</h2>
        <p className="text-xs text-white/80 font-medium relative z-10 mb-5">
          Mark Class 12 students as graduated. This cannot be undone.
        </p>

        {/* Multi stats widget inside card */}
        <div className="relative z-10 bg-white/15 border border-white/20 rounded-[20px] p-3 py-3.5 flex justify-between items-center text-center divide-x divide-white/20 select-none">
          <div className="flex-1">
            <p className="text-base font-extrabold">0</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Sections</p>
          </div>
          <div className="flex-1">
            <p className="text-base font-extrabold">0</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Active students</p>
          </div>
          <div className="flex-1">
            <p className="text-base font-extrabold">0</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Selected</p>
          </div>
        </div>
      </div>

      {/* Main body empty state card */}
      <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px] select-none">
        {/* Cap Icon in light container */}
        <div className="w-20 h-20 rounded-full bg-[#EBF8FF] border border-[#BEE3F8] flex items-center justify-center text-[#3182CE] relative">
          <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
          <HiOutlineAcademicCap className="w-9 h-9 text-[#1597E5]" />
        </div>

        <div className="space-y-2 max-w-[280px]">
          <h3 className="text-sm font-extrabold text-dark">No Class 12 Sections</h3>
          <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
            Create Class 12 sections in Academic Structure first.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default GraduateStudents;
