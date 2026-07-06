import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiPhone, FiMail, FiCreditCard, FiFlag, FiChevronRight } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { getCoordinatorDetails } from '../../../services/dataService';

const CoordinatorDetails = () => {
  const navigate = useNavigate();
  const { coordinatorId } = useParams();

  const [coordinator, setCoordinator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coordinatorId) return;
    const loadProfile = async () => {
      try {
        const data = await getCoordinatorDetails(coordinatorId);
        setCoordinator(data);
      } catch (err) {
        console.error('Error loading coordinator profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [coordinatorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coordinator) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-dark mb-4">Coordinator details not found.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#1597E5] text-white rounded-full text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const fullName = coordinator.user?.fullName || '';
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const phoneNumber = coordinator.user?.phoneNumber || '';
  const email = coordinator.email || '—';
  const employeeId = coordinator.employeeId || '';
  
  // Format Wing Assignment string
  const formatWing = (wingStr) => {
    if (!wingStr) return 'Primary';
    const clean = wingStr.replace('_', '-').toLowerCase();
    return clean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
  };

  const wing = formatWing(coordinator.wing);

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
        <h1 className="text-sm font-black text-dark pr-8 mx-auto tracking-tight">Coordinator Details</h1>
      </header>

      {/* Hero Blue Card (Screenshot 2 Match) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#00A1FF] to-[#1597E5] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        
        <div className="flex justify-between items-start z-10 relative">
          <div className="flex items-center gap-4">
            {/* Initials Avatar */}
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-black text-base border border-white/10">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight uppercase">
                {fullName}
              </h2>
              <p className="text-[10px] text-white/80 font-bold mt-1 tracking-wider">
                {wing}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => navigate(`/settings/edit-coordinator/${coordinatorId}`)}
            className="px-4 py-1.5 bg-white text-[#1597E5] text-[10.5px] font-black rounded-full flex items-center gap-1 hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <FiEdit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        {/* Active status indicator bottom left */}
        <div className="mt-6 flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full w-max border border-emerald-400/20">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Role Pill Badges (Screenshot 2 Match) */}
      <div className="flex items-center gap-2 px-1 select-none">
        <span className="bg-[#FAF5FF] text-[#9F7AEA] text-[9.5px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-1 border border-purple-100/50 shadow-sm">
          <span className="w-1 h-1 bg-[#9F7AEA] rounded-full" />
          Class Teacher
        </span>
        <span className="bg-[#FAF5FF] text-[#9F7AEA] text-[9.5px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-1 border border-purple-100/50 shadow-sm">
          <span className="w-1 h-1 bg-[#9F7AEA] rounded-full" />
          Coordinator
        </span>
      </div>

      {/* Contact & Identity Section (Screenshot 2 Match) */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">CONTACT & IDENTITY</span>
        </div>

        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          {/* Mobile */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiPhone className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Mobile</p>
              <p className="text-xs font-black text-dark mt-0.5">{phoneNumber || '—'}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiMail className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Email</p>
              <p className="text-xs font-black text-dark mt-0.5">{email}</p>
            </div>
          </div>

          {/* Employee ID */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiCreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Employee Id</p>
              <p className="text-xs font-black text-dark mt-0.5">{employeeId}</p>
            </div>
          </div>

          {/* Wing */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiFlag className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Wing</p>
              <p className="text-xs font-black text-dark mt-0.5">{wing}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoordinatorDetails;
