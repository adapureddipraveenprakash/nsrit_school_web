import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronRight, FiPhone, FiPlus, FiFlag } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getCoordinators } from '../../../services/dataService';

const Coordinators = () => {
  const navigate = useNavigate();
  const { user, currentBranchContext } = useApp();
  const branchId = user?.branchId || currentBranchContext?.id || 'sontyam-branch-id';

  // Load real coordinators from database
  const { data: dbCoordinators = [], loading } = useDataFetch(
    () => getCoordinators({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Normalize wing strings: PRE_PRIMARY -> Pre-Primary
  const formatWing = (wingStr) => {
    if (!wingStr) return 'Primary';
    const clean = wingStr.replace('_', '-').toLowerCase();
    return clean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 max-w-[640px] mx-auto select-none font-sans bg-gradient-to-b from-[#F3F8FC] to-[#F7FAFD] min-h-screen"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Coordinators</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Subtitle */}
        <div className="mb-1 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL</span>
        </div>

        {/* Title and Count Badge */}
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <h2 className="text-xl font-bold">Coordinators</h2>
          <span className="bg-white/20 border border-white/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
            {dbCoordinators.length}
          </span>
        </div>

        <p className="text-[11px] text-white/80 font-medium relative z-10 mb-4">
          One active coordinator per wing
        </p>

        {/* Create Coordinator Action Button */}
        <button
          onClick={() => navigate('/settings/create-coordinator')}
          className="relative z-10 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#1597E5] bg-white px-4 py-2.5 rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-md"
        >
          <span>+ Create Coordinator</span>
        </button>
      </div>

      {/* Coordinators Card List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dbCoordinators.map((coord) => {
          const name = coord.user?.fullName || 'Coordinator';
          const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          const phone = coord.user?.phoneNumber || 'No phone';

          return (
            <div
              key={coord.id}
              onClick={() => navigate(`/settings/coordinator-details/${coord.id}`)}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex flex-col justify-between hover:border-[#1597E5]/30 transition-all cursor-pointer relative group"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#e2e8f0]/50">
                <div className="flex items-center gap-3.5">
                  {/* Avatar with Initials */}
                  <div className="w-11 h-11 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center font-bold text-xs select-none border border-blue-50 shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark group-hover:text-[#1597E5] transition-colors leading-tight">
                      {name}
                    </h3>
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mt-1.5 select-none">
                      <span className="bg-[#EBF8FF] text-[#1597E5] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-100/50">
                        <FiFlag className="w-2.5 h-2.5 text-[#1597E5]" />
                        {formatWing(coord.wing)}
                      </span>
                      <span className="text-[#23C16B] text-[10px] font-bold flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Bottom row phone */}
              <div className="flex items-center gap-1.5 pt-3 text-[10px] text-secondaryText font-bold">
                <FiPhone className="w-3.5 h-3.5 text-[#A0AEC0]" />
                <span>{phone}</span>
              </div>
            </div>
          );
        })}

        {!loading && dbCoordinators.length === 0 && (
          <div className="bg-white rounded-[24px] border border-dashed border-[#e2e8f0] p-10 text-center text-xs font-bold text-[#A0AEC0]">
            No coordinators registered for this branch.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Coordinators;
