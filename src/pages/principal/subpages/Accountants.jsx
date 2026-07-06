import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronRight, FiPhone, FiPlus, FiShield } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getAccountants } from '../../../services/dataService';

const Accountants = () => {
  const navigate = useNavigate();
  const { user, currentBranchContext } = useApp();
  const branchId = user?.branchId || currentBranchContext?.id || 'sontyam-branch-id';

  // Load real accountants from database
  const { data: dbAccountants = [], loading } = useDataFetch(
    () => getAccountants({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto select-none font-sans"
    >
      {/* Curved Blue Header */}
      <div className="relative -mx-4 -mt-4 md:-mx-8 md:-mt-8 rounded-b-[40px] bg-gradient-to-br from-[#1b5dfc] to-[#1597E5] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        
        {/* Subtitle and Back navigation */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white/15 rounded-full text-white/90 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL</span>
        </div>

        {/* Title and Count Badge */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">Accountants</h2>
          <span className="bg-white/25 border border-white/20 rounded-full px-3 py-0.5 text-xs font-bold font-sans">
            {dbAccountants.length}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-white/80 font-medium mb-5">Branch fee desk users</p>

        {/* Create Accountant Action Button (Screenshot 3 Navigation) */}
        <button
          onClick={() => navigate('/settings/create-accountant')}
          className="flex items-center gap-1.5 px-6 py-3 bg-white text-[#1597E5] rounded-full font-bold text-xs hover:bg-[#EEF5FB] transition-all cursor-pointer shadow-md active:scale-95"
        >
          <FiPlus className="w-4 h-4 font-bold" />
          <span>Add Accountant</span>
        </button>
      </div>

      {/* Accountants Card List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dbAccountants.map((acc) => {
          const name = acc.user?.fullName || 'Accountant';
          const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          const phone = acc.user?.phoneNumber || 'No phone';
          const code = acc.employeeId || '';

          return (
            <div
              key={acc.id}
              onClick={() => navigate(`/settings/accountant-profile/${acc.id}`)}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex flex-col justify-between hover:border-[#1597E5]/30 transition-all cursor-pointer relative group"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#e2e8f0]/50">
                <div className="flex items-center gap-3.5">
                  {/* Avatar with Initials */}
                  <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center font-bold text-sm select-none border border-[#1597E5]/15">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-dark group-hover:text-[#1597E5] transition-colors leading-tight">
                      {name}
                    </h3>
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-[#EEF5FB] text-[#1597E5] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100/50">
                        <FiShield className="w-2.5 h-2.5" />
                        {code}
                      </span>
                      <span className="bg-[#E8F8F0] text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-secondaryText group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Bottom row phone */}
              <div className="flex items-center gap-1.5 pt-3 text-[10px] text-secondaryText font-semibold">
                <FiPhone className="w-3.5 h-3.5 text-secondaryText" />
                <span>{phone}</span>
              </div>
            </div>
          );
        })}

        {!loading && dbAccountants.length === 0 && (
          <div className="bg-white rounded-[24px] border border-dashed border-[#e2e8f0] p-10 text-center text-xs font-bold text-[#A0AEC0]">
            No accountants registered for this branch.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Accountants;
