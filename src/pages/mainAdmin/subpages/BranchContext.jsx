import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiSearch, FiMapPin, FiCheck, FiLogIn, FiChevronRight,
  FiLogOut, FiGrid, FiUser, FiUsers, FiCalendar, FiBookOpen, FiBarChart2, FiSettings
} from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { FaCashRegister } from 'react-icons/fa';

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
  };

  const handleLeaveContext = () => {
    setCurrentBranchContext(null);
    addLog('Cleared branch context');
  };

  // Render Branch Modules Dashboard if in a Branch Context
  if (currentBranchContext) {
    const modules = [
      {
        label: 'Overview',
        icon: <FiGrid className="w-5 h-5 text-brand-blue" />,
        color: 'bg-[#EEF5FB] text-brand-blue',
        path: '/settings/branch-analytics'
      },
      {
        label: 'Students',
        icon: <span className="text-lg font-black font-sans leading-none text-brand-blue">?</span>,
        color: 'bg-[#EEF5FB] text-brand-blue',
        path: '/settings/global-students'
      },
      {
        label: 'Teachers',
        icon: <FiUser className="w-5 h-5 text-indigo-500" />,
        color: 'bg-indigo-50/70 text-indigo-600',
        path: '/settings/teachers'
      },
      {
        label: 'Class Teachers',
        icon: (
          <div className="relative">
            <FiUsers className="w-5 h-5 text-indigo-500" />
            <span className="absolute -bottom-1 -right-1 bg-white rounded-full px-0.5 text-[8px] border border-indigo-200">🔄</span>
          </div>
        ),
        color: 'bg-indigo-50/70 text-indigo-600',
        path: '/settings/class-teachers'
      },
      {
        label: 'Coordinators',
        icon: <HiOutlineUserGroup className="w-5 h-5 text-purple-500" />,
        color: 'bg-purple-50/70 text-purple-600',
        path: '/settings/coordinators'
      },
      {
        label: 'Accountants',
        icon: (
          <div className="relative">
            <FiUser className="w-5 h-5 text-amber-500" />
            <span className="absolute -bottom-1 -right-1 bg-white rounded-full px-0.5 text-[8px] border border-amber-200">💵</span>
          </div>
        ),
        color: 'bg-amber-50/70 text-amber-600',
        path: '/settings/accountants'
      },
      {
        label: 'Attendance',
        icon: <FiCalendar className="w-5 h-5 text-emerald-500" />,
        color: 'bg-emerald-50/70 text-emerald-600',
        path: '/settings/attendance-overview'
      },
      {
        label: 'Fees',
        icon: <FaCashRegister className="w-5 h-5 text-rose-500" />,
        color: 'bg-rose-50/70 text-rose-600',
        path: '/settings/fee-overview'
      },
      {
        label: 'Sections',
        icon: <FiGrid className="w-5 h-5 text-sky-500" />,
        color: 'bg-sky-50/75 text-sky-600',
        path: '/settings/sections'
      },
      {
        label: 'Classes',
        icon: <FiBookOpen className="w-5 h-5 text-brand-blue" />,
        color: 'bg-[#EEF5FB] text-brand-blue',
        path: '/settings/classes'
      },
      {
        label: 'Reports',
        icon: <FiBarChart2 className="w-5 h-5 text-brand-blue" />,
        color: 'bg-[#EEF5FB] text-brand-blue',
        path: '/settings/global-reports'
      },
      {
        label: 'Branch Settings',
        icon: <FiSettings className="w-5 h-5 text-slate-500" />,
        color: 'bg-slate-100 text-slate-600',
        path: '/settings/branch-settings'
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto"
      >
        {/* Top Curved Header */}
        <div className="relative -mx-4 -mt-4 md:-mx-8 md:-mt-8 rounded-b-[40px] bg-gradient-to-br from-brand-blue to-brand-secondary p-8 text-white card-shadow overflow-hidden mb-6">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

          <div className="flex justify-between items-center relative z-10">
            <button
              onClick={handleLeaveContext}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-500/10 border border-red-500/25 text-[#FF6B6B] hover:bg-red-500/20 hover:text-white transition-all font-bold text-xs active:scale-95 cursor-pointer shadow-sm"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Leave Context</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Branch Context</span>
              <h2 className="text-lg font-bold md:text-xl">{currentBranchContext.name}</h2>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div>
          <h2 className="text-[11px] font-extrabold text-secondaryText tracking-widest uppercase mb-4 px-1">
            Branch Modules
          </h2>

          {/* 3x4 Modules Grid */}
          <div className="grid grid-cols-3 gap-4">
            {modules.map((mod) => (
              <div
                key={mod.label}
                onClick={() => navigate(mod.path)}
                className="bg-white rounded-[28px] p-4 card-shadow border border-[#e2e8f0]/45 flex flex-col items-center justify-center aspect-square cursor-pointer hover:border-brand-blue/30 hover:shadow-md transition-all hover:-translate-y-0.5 group active:scale-95"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${mod.color}`}>
                  {mod.icon}
                </div>
                <span className="text-[11px] font-extrabold text-dark tracking-tight leading-tight px-1 text-center">
                  {mod.label}
                </span>
              </div>
            ))}

            {/* Parent Data - Spans Full Width */}
            <div
              onClick={() => navigate('/settings/global-students')}
              className="col-span-3 bg-white rounded-[28px] p-5 card-shadow border border-[#e2e8f0]/45 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue/30 hover:shadow-md transition-all hover:-translate-y-0.5 group active:scale-95"
            >
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <FiUser className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-extrabold text-dark tracking-tight">Parent Data</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

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
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-5 text-center">
              <div className="bg-[#EEF5FB] p-1.5 sm:p-2.5 rounded-xl border border-[#e2e8f0]/20 min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-brand-blue leading-none">{b.studentsCount}</p>
                <p className="text-[7.5px] sm:text-[8px] font-bold text-secondaryText uppercase tracking-wider mt-1 whitespace-nowrap leading-none">Students</p>
              </div>
              <div className="bg-[#EEF5FB] p-1.5 sm:p-2.5 rounded-xl border border-[#e2e8f0]/20 min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-brand-blue leading-none">{b.facultyCount}</p>
                <p className="text-[7.5px] sm:text-[8px] font-bold text-secondaryText uppercase tracking-wider mt-1 whitespace-nowrap leading-none">Faculty & Staff</p>
              </div>
              <div className="bg-[#EEF5FB] p-1.5 sm:p-2.5 rounded-xl border border-[#e2e8f0]/20 min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-accent-purple leading-none">{b.coordinatorsCount}</p>
                <p className="text-[7.5px] sm:text-[8px] font-bold text-secondaryText uppercase tracking-wider mt-1 whitespace-nowrap leading-none">Coordinators</p>
              </div>
              <div className="bg-[#E8F8F0] p-1.5 sm:p-2.5 rounded-xl border border-[#23C16B]/10 flex flex-col justify-center items-center min-w-0">
                <FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-green shrink-0" />
                <p className="text-[7.5px] sm:text-[8px] font-bold text-accent-green uppercase tracking-wider mt-1 whitespace-nowrap leading-none">Principal</p>
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
