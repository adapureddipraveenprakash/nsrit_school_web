import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiMapPin, FiCheck, FiLogIn, FiChevronRight } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';

const BranchContext = () => {
  const { branches, currentBranchContext, setCurrentBranchContext, addLog } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = branches.filter(b => {
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.location.toLowerCase().includes(q);
  });

  const handleSelectBranch = (branch) => {
    setCurrentBranchContext(branch);
    addLog(`Entered branch context: ${branch ? branch.name : 'Global'}`);
    navigate('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto"
    >
      {/* Top Header Card */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MAIN ADMIN</p>
            <h2 className="text-xl font-bold md:text-2xl">Branch Context</h2>
          </div>
        </div>
        
        <p className="text-xs text-white/70 font-medium">Select a branch to operate with full administrative access</p>
        
        <div className="inline-block mt-4 bg-white/20 border border-white/25 rounded-full px-3 py-1 text-[10px] font-bold">
          {branches.length} {branches.length === 1 ? 'branch' : 'branches'} available
        </div>
      </div>

      {/* Search box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, code, city, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
      </div>

      {/* Search results count */}
      <p className="text-[10px] font-bold text-secondaryText tracking-widest uppercase">
        {filtered.length} {filtered.length === 1 ? 'RESULT' : 'RESULTS'}
      </p>

      {/* Result Cards */}
      <div className="space-y-4">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex flex-col justify-between hover:border-brand-blue/30 transition-all relative"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <BiBuildingHouse className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-dark leading-tight">{b.name}</h3>
                    <span className="bg-[#EEF5FB] text-brand-blue text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {b.code}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F8F0] text-accent-green">
                      <span className="w-1 h-1 bg-accent-green rounded-full" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-4 gap-2 my-5 text-center">
              <div className="bg-[#EEF5FB] p-2.5 rounded-xl border border-[#e2e8f0]/20">
                <p className="text-sm font-extrabold text-brand-blue">{b.studentsCount}</p>
                <p className="text-[8px] font-bold text-secondaryText uppercase tracking-wider mt-0.5">Students</p>
              </div>
              <div className="bg-[#EEF5FB] p-2.5 rounded-xl border border-[#e2e8f0]/20">
                <p className="text-sm font-extrabold text-brand-blue">{b.facultyCount}</p>
                <p className="text-[8px] font-bold text-secondaryText uppercase tracking-wider mt-0.5">Faculty & Staff</p>
              </div>
              <div className="bg-[#EEF5FB] p-2.5 rounded-xl border border-[#e2e8f0]/20">
                <p className="text-sm font-extrabold text-accent-purple">{b.coordinatorsCount}</p>
                <p className="text-[8px] font-bold text-secondaryText uppercase tracking-wider mt-0.5">Coordinators</p>
              </div>
              <div className="bg-[#E8F8F0] p-2.5 rounded-xl border border-[#23C16B]/10 flex flex-col justify-center items-center">
                <FiCheck className="w-4 h-4 text-accent-green" />
                <p className="text-[8px] font-bold text-accent-green uppercase tracking-wider mt-0.5">Principal</p>
              </div>
            </div>

            {/* Pin Location */}
            <p className="text-[10px] text-secondaryText font-semibold flex items-center gap-1 mb-4">
              <FiMapPin className="w-3.5 h-3.5" />
              {b.location}
            </p>

            {/* Enter Context Button */}
            <button
              onClick={() => handleSelectBranch(b)}
              className="w-full py-3.5 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold text-xs flex items-center justify-between px-5 shadow-lg shadow-brand-blue/20 transition-all cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2">
                <FiLogIn className="w-4 h-4" />
                <span>Enter Branch Context</span>
              </div>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BranchContext;
