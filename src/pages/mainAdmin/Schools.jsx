import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiMapPin, FiUser, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import CreateBranchModal from './subpages/CreateBranch';

const Schools = () => {
  const { branches, currentBranchContext, setCurrentBranchContext, addLog } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredBranches = branches.filter((b) => {
    const query = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(query) ||
      b.code.toLowerCase().includes(query) ||
      b.location.toLowerCase().includes(query)
    );
  });

  const handleSelectBranch = (branch) => {
    setCurrentBranchContext(branch);
    addLog(`Switched branch context to ${branch.name} from Schools page`);
    navigate('/settings/branch-analytics');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8"
    >
      {/* Top Banner Card */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />

        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Main Admin</p>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold md:text-2xl">All Branches</h2>
              <span className="bg-white/20 border border-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {branches.length}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1 font-medium">Live classes and student totals per branch</p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="py-3 px-4 bg-white hover:bg-[#EEF5FB] text-brand-blue rounded-btn font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <FiPlus className="w-4 h-4 font-bold" />
            Add Branch
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative w-full max-w-[540px] mx-auto">
        <input
          type="text"
          placeholder="Search branch, code, location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
      </div>

      {/* Branch Count */}
      <p className="text-[10px] font-bold text-secondaryText tracking-widest uppercase">
        {filteredBranches.length} {filteredBranches.length === 1 ? 'BRANCH' : 'BRANCHES'}
      </p>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBranches.map((branch) => (
          <div
            key={branch.id}
            onClick={() => handleSelectBranch(branch)}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex flex-col justify-between hover:border-brand-blue/30 hover:shadow-lg transition-all relative group cursor-pointer active:scale-[0.99]"
          >
            {/* Header: icon, title, active pill */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <BiBuildingHouse className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-dark leading-tight">{branch.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      branch.active ? 'bg-[#E8F8F0] text-accent-green' : 'bg-[#EF4444]/10 text-accent-red'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${branch.active ? 'bg-accent-green' : 'bg-accent-red'}`} />
                      {branch.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 bg-[#EEF5FB] text-brand-blue text-[9px] font-bold rounded">
                      {branch.code}
                    </span>
                    <span className="text-[10px] text-secondaryText font-semibold flex items-center gap-1">
                      <FiMapPin className="w-3.5 h-3.5" />
                      {branch.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow details indicator */}
              <div className="p-2 text-brand-blue rounded-full bg-brand-blue/5 group-hover:bg-brand-blue group-hover:text-white transition-all">
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 my-5 sm:my-6">
              {/* Students count block */}
              <div className="bg-[#EEF5FB] hover:bg-[#1597E5]/5 transition-colors p-2 sm:p-3 rounded-2xl text-center border border-[#e2e8f0]/20 min-w-0">
                <p className="text-sm sm:text-base font-extrabold text-brand-blue leading-none">{branch.studentsCount}</p>
                <p className="text-[8px] sm:text-[9px] font-bold text-secondaryText uppercase tracking-wider mt-1 whitespace-nowrap leading-none">Students</p>
              </div>

              {/* Faculty count block */}
              <div className="bg-[#EEF5FB] hover:bg-[#1597E5]/5 transition-colors p-2 sm:p-3 rounded-2xl text-center border border-[#e2e8f0]/20 min-w-0">
                <p className="text-sm sm:text-base font-extrabold text-brand-blue leading-none">{branch.facultyCount}</p>
                <p className="text-[8px] sm:text-[9px] font-bold text-secondaryText uppercase tracking-wider mt-1 whitespace-nowrap leading-none">Faculty & Staff</p>
              </div>

              {/* Coordinator count block */}
              <div className="bg-[#EEF5FB] hover:bg-[#1597E5]/5 transition-colors p-2 sm:p-3 rounded-2xl text-center border border-[#e2e8f0]/20 min-w-0">
                <p className="text-sm sm:text-base font-extrabold text-accent-purple leading-none">{branch.coordinatorsCount}</p>
                <p className="text-[8px] sm:text-[9px] font-bold text-secondaryText uppercase tracking-wider mt-1 whitespace-nowrap leading-none">Coordinators</p>
              </div>
            </div>

            {/* Card Footer: Principal, Date */}
            <div className="flex justify-between items-center pt-4 border-t border-[#e2e8f0]/80 text-[10px] text-secondaryText font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5 text-secondaryText" />
                Principal: {branch.principal || 'Unassigned'}
              </span>
              <span className="flex items-center gap-1.5 font-medium lowercase">
                <FiCalendar className="w-3.5 h-3.5 text-secondaryText" />
                Created {branch.createdAt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Branch Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <CreateBranchModal isOpen={true} onClose={() => setIsAddOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Schools;
