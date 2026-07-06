import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiPhone, FiMail, FiCalendar, FiBriefcase, FiUser } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { getAccountantProfile } from '../../../services/dataService';

const AccountantProfile = () => {
  const navigate = useNavigate();
  const { accountantId } = useParams();

  const [accountant, setAccountant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountantId) return;
    const loadProfile = async () => {
      try {
        const data = await getAccountantProfile(accountantId);
        setAccountant(data);
      } catch (err) {
        console.error('Error loading accountant profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [accountantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!accountant) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-dark mb-4">Accountant profile not found.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#1597E5] text-white rounded-full text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const fullName = accountant.user?.fullName || '';
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const phoneNumber = accountant.user?.phoneNumber || '';
  const gender = accountant.gender || '—';
  const email = accountant.email || '—';
  const employeeId = accountant.employeeId || '';
  const designation = accountant.designation || 'Accountant';
  const branchName = accountant.branch?.name || 'Sontyam';

  // Format joining date to DD-MM-YYYY
  const formatJoiningDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
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
        <h1 className="text-sm font-black text-dark pr-8 mx-auto tracking-tight">Accountant Profile</h1>
      </header>

      {/* Hero Blue Card (Screenshot 3 Match) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1b5dfc] to-[#1597E5] p-6 text-white card-shadow overflow-hidden">
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
              <p className="text-[10px] text-white/80 font-bold mt-1 tracking-wider uppercase">
                {employeeId} · {branchName}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => navigate(`/settings/edit-accountant/${accountantId}`)}
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

      {/* Personal Information Card (Screenshot 3 Match) */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">PERSONAL INFORMATION</span>
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

          {/* Gender */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiUser className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Gender</p>
              <p className="text-xs font-black text-dark mt-0.5">{gender}</p>
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
        </div>
      </div>

      {/* Employment Information Card (Screenshot 3 Match) */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">EMPLOYMENT INFORMATION</span>
        </div>

        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          {/* Joining Date */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiCalendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Joining Date</p>
              <p className="text-xs font-black text-dark mt-0.5">{formatJoiningDate(accountant.joiningDate)}</p>
            </div>
          </div>

          {/* Designation */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiBriefcase className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Designation</p>
              <p className="text-xs font-black text-dark mt-0.5">{designation}</p>
            </div>
          </div>

          {/* Branch */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Branch</p>
              <p className="text-xs font-black text-dark mt-0.5">{branchName}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountantProfile;
