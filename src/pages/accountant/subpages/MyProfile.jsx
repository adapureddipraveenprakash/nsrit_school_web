import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiLogOut, FiPhone, FiDatabase, FiGlobe, 
  FiShield, FiMonitor, FiCheckCircle, FiAward, FiFileText, FiEdit2, FiCheck, FiUser,
  FiMail, FiCalendar, FiDroplet, FiGrid, FiBookOpen, FiBriefcase
} from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';

const MyProfile = () => {
  const { user, logout, activeRole, switchRole } = useApp();
  const navigate = useNavigate();
  const [offlineCache, setOfflineCache] = useState(true);
  const [timeoutActive, setTimeoutActive] = useState(true);
  const [biometricActive, setBiometricActive] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Fallback data matching user screenshot
  const userName = user?.name || 'Branch Admin';
  const userPhone = user?.phoneNumber || user?.phone || '+919505985859';
  const userRole = user?.role ? user.role.replace('_', ' ') : 'Branch Admin';
  const userId = user?.id || 'd082706b-d293-4fe4-ab2a-bc3d9c87d7b1';
  const branchName = user?.branchName || 'Sontyam';

  const accountDetails = [
    { label: 'Branch', value: branchName, icon: <BiBuildingHouse className="w-4 h-4 text-[#A0AEC0]" /> },
    { label: 'Phone', value: userPhone, icon: <FiPhone className="w-4 h-4 text-[#A0AEC0]" /> },
    { label: 'User ID', value: userId, icon: <span className="text-[10px] font-black text-[#A0AEC0] select-none uppercase tracking-wider leading-none">ID</span>, isLarge: true },
    { label: 'Role', value: userRole, icon: <FiShield className="w-4 h-4 text-[#A0AEC0]" /> }
  ];

  const systemDetails = [
    { label: 'App Version', value: 'v1.0.0 (Release)', icon: <FiMonitor className="w-4 h-4 text-[#A0AEC0]" /> },
    { label: 'Database', value: 'Firebase Data Connect', icon: <FiDatabase className="w-4 h-4 text-[#A0AEC0]" /> },
    { label: 'Region', value: 'asia-south1 (Live)', icon: <FiGlobe className="w-4 h-4 text-[#A0AEC0]" /> }
  ];

  if (activeRole === 'PRINCIPAL') {
    const prinName = user?.name || 'B. Geetha';
    const prinPhone = user?.phone || user?.phoneNumber || '+919100046512';
    const prinEmpId = user?.employeeId || '26SOTS016';
    const prinBranch = user?.branchName || 'Sontyam';

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 max-w-[640px] mx-auto relative select-none animate-fade-in"
      >
        {/* Top curved blue header card with Concentric Circles */}
        <div className="relative rounded-[32px] bg-[#1597E5] p-6 text-white text-center flex flex-col items-center card-shadow pb-8 overflow-hidden select-none">
          {/* Back navigation button inside card */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-1.5 hover:bg-white/15 rounded-full text-white transition-colors cursor-pointer z-10"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-full bg-white/20 border border-white/35 flex items-center justify-center text-2xl font-extrabold font-sans mb-3.5 mt-4 shadow-inner">
            {getInitials(prinName)}
          </div>

          {/* Name */}
          <h2 className="text-lg font-black tracking-tight">{prinName}</h2>
          
          {/* Principal Pill */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-white/25 border border-white/30 rounded-full mt-2.5 text-[9px] font-black uppercase tracking-wider">
            Principal
          </div>

          <div className="text-[11px] text-white/80 font-bold mt-2">
            {prinPhone}
          </div>
        </div>

        {/* Account Details Card */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4">
          <h3 className="text-[10px] font-extrabold text-[#1597E5] uppercase tracking-widest px-1">
            Account Details
          </h3>

          <div className="divide-y divide-[#e2e8f0]/60 text-xs">
            {/* Branch */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] shrink-0">
                  <BiBuildingHouse className="w-4 h-4 text-brand-blue" />
                </div>
                Branch
              </span>
              <span className="text-dark font-extrabold">{prinBranch}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] shrink-0">
                  <FiPhone className="w-4 h-4 text-brand-blue" />
                </div>
                Phone
              </span>
              <span className="text-dark font-extrabold">{prinPhone}</span>
            </div>

            {/* Employee ID */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] shrink-0">
                  <span className="text-[9px] font-black text-brand-blue select-none uppercase tracking-wider leading-none">ID</span>
                </div>
                Employee ID
              </span>
              <span className="text-dark font-extrabold">{prinEmpId}</span>
            </div>

            {/* Role */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] shrink-0">
                  <FiShield className="w-4 h-4 text-brand-blue" />
                </div>
                Role
              </span>
              <span className="text-dark font-extrabold">Principal</span>
            </div>
          </div>
        </div>

        {/* System Details Card */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4">
          <h3 className="text-[10px] font-extrabold text-[#1597E5] uppercase tracking-widest px-1">
            System
          </h3>

          <div className="divide-y divide-[#e2e8f0]/60 text-xs">
            {/* App Version */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] shrink-0">
                  <FiMonitor className="w-4 h-4 text-brand-blue" />
                </div>
                App Version
              </span>
              <span className="text-dark font-extrabold">v1.0.0 (Release)</span>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] shrink-0">
                  <FiDatabase className="w-4 h-4 text-brand-blue" />
                </div>
                Database
              </span>
              <span className="text-dark font-extrabold">Firebase Data Connect</span>
            </div>

            {/* Region */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] shrink-0">
                  <FiGlobe className="w-4 h-4 text-brand-blue" />
                </div>
                Region
              </span>
              <span className="text-dark font-extrabold">asia-south1 (Live)</span>
            </div>
          </div>
        </div>

        {/* Red Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-[#EF4444]/25 transition-all cursor-pointer active:scale-95 mt-4"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Sign Out of ERP</span>
        </button>
      </motion.div>
    );
  }

  if (activeRole === 'COORDINATOR') {
    const coordName = user?.name || 'Raghupatruni Roopakala';
    const coordPhone = user?.phoneNumber || user?.phone || '+918297191669';
    const coordUserId = user?.id || '172d3779-1edc-45e2-9519-ccb74445e765';
    const coordBranch = user?.branchName || 'Sontyam';

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 max-w-[640px] mx-auto relative select-none animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Profile</h1>
        </header>

        {/* Top curved blue header card with Concentric Circles */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] via-[#2F65F8] to-[#4076FF] p-6 text-white text-center flex flex-col items-center card-shadow pb-8 overflow-hidden select-none">
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full border-[16px] border-white/5" />
          <div className="absolute top-[-20px] right-[-20px] w-36 h-36 rounded-full border-[12px] border-white/10" />

          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-full bg-white/20 border border-white/35 flex items-center justify-center text-2xl font-extrabold font-sans mb-3.5 mt-4 shadow-inner">
            {getInitials(coordName)}
          </div>

          {/* Name */}
          <h2 className="text-lg font-black tracking-tight">{coordName}</h2>
          
          {/* Coordinator Pill */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-white/15 border border-white/25 rounded-full mt-2.5 text-[9px] font-black tracking-widest uppercase">
            Coordinator
          </div>

          <div className="text-[11px] text-white/80 font-bold mt-2">
            {coordPhone}
          </div>
        </div>

        {/* Account Details Card */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
            Account Details
          </h3>

          <div className="divide-y divide-[#e2e8f0]/60 text-xs">
            {/* Branch */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] shrink-0">
                  <BiBuildingHouse className="w-4 h-4 text-brand-blue" />
                </div>
                Branch
              </span>
              <span className="text-dark font-extrabold">{coordBranch}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] shrink-0">
                  <FiPhone className="w-4 h-4 text-brand-blue" />
                </div>
                Phone
              </span>
              <span className="text-dark font-extrabold">{coordPhone}</span>
            </div>

            {/* User ID */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] shrink-0">
                  <span className="text-[9px] font-black text-brand-blue select-none uppercase tracking-wider leading-none">ID</span>
                </div>
                User ID
              </span>
              <span className="text-dark font-extrabold text-[10px] truncate max-w-[150px] md:max-w-none">{coordUserId}</span>
            </div>

            {/* Role */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] shrink-0">
                  <FiShield className="w-4 h-4 text-brand-blue" />
                </div>
                Role
              </span>
              <span className="text-dark font-extrabold">Coordinator</span>
            </div>
          </div>
        </div>

        {/* System Details Card */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
            System
          </h3>

          <div className="divide-y divide-[#e2e8f0]/60 text-xs">
            {/* App Version */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] shrink-0">
                  <FiMonitor className="w-4 h-4 text-brand-blue" />
                </div>
                App Version
              </span>
              <span className="text-dark font-extrabold">v1.0.0 (Release)</span>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] shrink-0">
                  <FiDatabase className="w-4 h-4 text-brand-blue" />
                </div>
                Database
              </span>
              <span className="text-dark font-extrabold">Firebase Data Connect</span>
            </div>

            {/* Region */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-secondaryText font-bold flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] shrink-0">
                  <FiGlobe className="w-4 h-4 text-brand-blue" />
                </div>
                Region
              </span>
              <span className="text-dark font-extrabold">asia-south1 (Live)</span>
            </div>
          </div>
        </div>

        {/* Red Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-[#EF4444]/25 transition-all cursor-pointer active:scale-95 mt-4"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Sign Out of ERP</span>
        </button>
      </motion.div>
    );
  }

  if (activeRole === 'TEACHER' || activeRole === 'CLASS_TEACHER') {
    const tchrName = user?.name || 'Salapu Vasanthi';
    const tchrPhone = user?.phoneNumber || user?.phone || '+919347339048';
    const tchrBranch = user?.branchName || 'Sontyam';
    const tchrEmpId = user?.employeeId || '26SOTS004';

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-20 max-w-[640px] mx-auto relative select-none animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Teacher Profile</h1>
        </header>

        {/* Blue Header Card */}
        <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden pb-12">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          {/* User Row */}
          <div className="flex items-center gap-4 relative z-10 select-none">
            {/* Avatar circle */}
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/35 flex items-center justify-center text-xl font-black font-sans shadow-inner shrink-0">
              {getInitials(tchrName)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{tchrName}</h2>
              <p className="text-xs text-white/80 font-semibold mt-0.5">{user?.wing ? `${user.wing} Teacher` : 'Teacher'} · {tchrBranch}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-5 mt-5 border-t border-white/15 text-center font-sans relative z-10 select-none">
            <div>
              <p className="text-lg font-black">1</p>
              <p className="text-[9px] text-white/70 font-black uppercase tracking-wider mt-0.5">Sections</p>
            </div>
            <div>
              <p className="text-lg font-black">14</p>
              <p className="text-[9px] text-white/70 font-black uppercase tracking-wider mt-0.5">Students</p>
            </div>
            <div>
              <p className="text-lg font-black">56</p>
              <p className="text-[9px] text-white/70 font-black uppercase tracking-wider mt-0.5">Att. Marked</p>
            </div>
          </div>

          {/* Active status indicator badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest pointer-events-none">
            <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full animate-pulse" />
            <span>Active</span>
          </div>
        </div>

        {/* Role badges row */}
        <div className="flex gap-2 select-none">
          <span className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold bg-[#F3E8FF] text-[#8B5CF6] border border-[#8B5CF6]/15 uppercase tracking-wider">
            ● Class Teacher
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold bg-[#F3E8FF] text-[#8B5CF6] border border-[#8B5CF6]/15 uppercase tracking-wider">
            ● Teacher
          </span>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
            Personal Information
          </h3>

          <div className="divide-y divide-[#e2e8f0]/60 text-xs">
            {[
              { label: 'MOBILE', value: tchrPhone, icon: <FiPhone className="w-4 h-4 text-brand-blue" /> },
              { label: 'GENDER', value: 'Female', icon: <FiUser className="w-4 h-4 text-brand-blue" /> },
              { label: 'EMAIL', value: '—', icon: <FiMail className="w-4 h-4 text-brand-blue" /> },
              { label: 'DATE OF BIRTH', value: '—', icon: <FiCalendar className="w-4 h-4 text-brand-blue" /> },
              { label: 'BLOOD GROUP', value: '—', icon: <FiDroplet className="w-4 h-4 text-brand-blue" /> }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3.5">
                <span className="text-secondaryText font-extrabold flex items-center gap-2.5 uppercase tracking-wider text-[10px]">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  {item.label}
                </span>
                <span className="text-dark font-extrabold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
            Employment Information
          </h3>

          <div className="divide-y divide-[#e2e8f0]/60 text-xs">
            {[
              { label: 'EMPLOYEE ID', value: tchrEmpId, icon: <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">ID</span> },
              { label: 'JOINING DATE', value: '03-04-2026', icon: <FiCalendar className="w-4 h-4 text-brand-blue" /> },
              { label: 'DESIGNATION', value: 'LKG Teacher', icon: <FiAward className="w-4 h-4 text-brand-blue" /> },
              { label: 'QUALIFICATION', value: '—', icon: <FiAward className="w-4 h-4 text-brand-blue" /> },
              { label: 'EXPERIENCE', value: '—', icon: <FiBriefcase className="w-4 h-4 text-brand-blue" /> }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3.5">
                <span className="text-secondaryText font-extrabold flex items-center gap-2.5 uppercase tracking-wider text-[10px]">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  {item.label}
                </span>
                <span className="text-dark font-extrabold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Assignments */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
            Academic Assignments
          </h3>

          <div className="divide-y divide-[#e2e8f0]/60 text-xs">
            {[
              { label: 'ASSIGNED SUBJECTS', value: 'None', icon: <FiBookOpen className="w-4 h-4 text-brand-blue" /> },
              { label: 'CLASS TEACHER', value: '1-A (Class Teacher)', icon: <FiUser className="w-4 h-4 text-brand-blue" /> },
              { label: 'ASSIGNED SECTIONS', value: '1-A', icon: <FiGrid className="w-4 h-4 text-brand-blue" /> }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3.5">
                <span className="text-secondaryText font-extrabold flex items-center gap-2.5 uppercase tracking-wider text-[10px]">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  {item.label}
                </span>
                <span className="text-dark font-extrabold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeRole === 'PARENT') {
    const parentName = user?.name || 'P PEDDI RAJU';
    const parentPhone = user?.phoneNumber || user?.phone || '+919550440714';

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto relative select-none animate-fade-in"
      >
        {/* Centered Page Header */}
        <div className="text-center py-1.5 shrink-0">
          <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Blue Profile Card */}
            <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white text-center flex flex-col items-center shadow-lg pb-8 overflow-hidden select-none">
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

              {/* Back navigation button inside card */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 p-1.5 hover:bg-white/15 rounded-full text-white transition-colors cursor-pointer z-10"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>

              {/* Avatar circle */}
              <div className="w-20 h-20 rounded-full bg-white/20 border border-white/35 flex items-center justify-center text-2xl font-extrabold font-sans mb-3 mt-4 shadow-inner">
                {getInitials(parentName)}
              </div>

              {/* Name & Phone */}
              <h2 className="text-lg font-black tracking-tight">{parentName}</h2>
              
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/15 border border-white/25 rounded-full mt-2.5 text-[10px] font-black uppercase tracking-wider">
                📞 {parentPhone}
              </div>

              <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/20 border border-white/25 rounded-full mt-3.5 text-[9px] font-black tracking-widest uppercase">
                Parent Account
              </div>
            </div>

            {/* Subportal switches matching screenshot */}
            <div className="flex bg-white rounded-2xl border border-[#e2e8f0]/60 p-1.5 shadow-sm gap-2 select-none">
              <button
                onClick={() => switchRole('PARENT')}
                className="flex-1 py-2 px-3 rounded-xl text-[11px] font-black border border-[#7C3AED]/20 bg-[#F3E8FF] text-[#7C3AED] transition-all cursor-pointer"
              >
                ● Parent
              </button>
              <button
                onClick={() => {
                  switchRole('ACCOUNTANT');
                  navigate('/dashboard');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-[11px] font-black text-secondaryText hover:text-dark hover:bg-slate-50 transition-all cursor-pointer"
              >
                ● Accountant
              </button>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-[#EF4444]/25 transition-all cursor-pointer active:scale-95"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign Out of ERP</span>
            </button>
          </div>

          {/* Column 2 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Family Details Card */}
            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4 select-none">
              <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
                Family Details
              </h3>

              <div className="divide-y divide-[#e2e8f0]/60 text-xs">
                {/* Father */}
                <div className="flex items-center gap-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] text-brand-blue flex items-center justify-center border border-blue-50 shrink-0">
                    👨
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-secondaryText uppercase tracking-wider">Father</p>
                    <p className="text-xs font-black text-dark mt-0.5">{parentName}</p>
                  </div>
                </div>

                {/* Mother */}
                <div className="flex items-center gap-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center border border-pink-100 shrink-0">
                    👩
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-secondaryText uppercase tracking-wider">Mother</p>
                    <p className="text-xs font-black text-dark mt-0.5">P PADMA MANJU</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Children Card */}
            <div className="space-y-4 select-none">
              <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
                Linked Children (1)
              </div>

              <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] font-bold text-sm shrink-0 border border-blue-100">
                    PP
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A] leading-tight">
                      PATCHAMATLA PRANEETH VARMA
                    </h3>
                    <p className="text-xs text-secondaryText font-bold mt-0.5">
                      Class: 1-A · #26SO0066
                    </p>
                  </div>
                </div>

                {/* Stats block */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center select-none font-sans">
                  <div>
                    <p className="text-sm font-black text-[#23C16B]">100%</p>
                    <p className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Attendance</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#FF3B30]">Rs 41,000</p>
                    <p className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Fee Due</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#0F172A]">0%</p>
                    <p className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Paid</p>
                  </div>
                </div>
              </div>
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
      className="p-4 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center mx-auto pr-8">
          <h1 className="text-sm font-extrabold text-dark tracking-tight">Account Settings</h1>
          <p className="text-[10px] text-secondaryText font-medium mt-0.5">Manage credentials & portal configurations</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1 - Profile Card & Switch Portal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-6 card-shadow flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#EEF5FB] border border-blue-100 flex items-center justify-center text-[#0088ff] text-2xl font-bold font-sans mb-3.5 shadow-inner">
              {getInitials(userName)}
            </div>
            <h2 className="text-base font-black text-[#0F172A] tracking-tight">{userName}</h2>
            <p className="text-xs text-secondaryText font-semibold mt-1">{userRole}</p>
            
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#EEF5FB] text-[#0088ff] rounded-full mt-3.5 text-[9.5px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full mr-0.5" />
              {activeRole === 'ACCOUNTANT' ? 'CPA Verified' : 'System Verified'}
            </div>
          </div>

          {/* Switch Role portal tabs */}
          {(user?.phoneNumber?.includes('9951335377') || user?.phone === '9951335377') && (
            <div className="flex bg-white rounded-2xl border border-[#e2e8f0]/60 p-1.5 shadow-sm gap-2 select-none">
              <button
                onClick={() => {
                  switchRole('PARENT');
                  navigate('/dashboard');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-[11px] font-black text-secondaryText hover:text-dark hover:bg-slate-50 transition-all cursor-pointer"
              >
                ● Parent
              </button>
              <button
                onClick={() => switchRole('ACCOUNTANT')}
                className="flex-1 py-2 px-3 rounded-xl text-[11px] font-black border border-[#7C3AED]/20 bg-[#F3E8FF] text-[#7C3AED] transition-all cursor-pointer"
              >
                ● Accountant
              </button>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 bg-white hover:bg-rose-50/50 border border-rose-200 text-rose-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
          
          <div className="text-center text-[10px] font-semibold text-secondaryText/50">
            System Portal Version 2.4.1 (Build 108)
          </div>
        </div>

        {/* Column 2 - Details & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
            <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
              Personal Information
            </h3>

            <div className="divide-y divide-[#e2e8f0]/60 text-xs">
              {/* Phone */}
              <div className="flex items-center justify-between py-3.5">
                <span className="text-secondaryText font-bold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff]">
                    <FiPhone className="w-4 h-4" />
                  </div>
                  Registered Phone
                </span>
                <span className="text-dark font-extrabold">{userPhone}</span>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between py-3.5">
                <span className="text-secondaryText font-bold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff]">
                    <FiShield className="w-4 h-4" />
                  </div>
                  Designation Role
                </span>
                <span className="text-dark font-extrabold text-right">{userRole} (User ID: {userId.slice(0, 8)})</span>
              </div>

              {/* Branch */}
              <div className="flex items-center justify-between py-3.5">
                <span className="text-secondaryText font-bold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff]">
                    <BiBuildingHouse className="w-4 h-4" />
                  </div>
                  Allocated Branch
                </span>
                <span className="text-dark font-extrabold">{branchName}</span>
              </div>
            </div>
          </div>

          {/* Credentials & Compliance */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
            <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
              Credentials & Compliance
            </h3>

            <div className="divide-y divide-[#e2e8f0]/60 text-xs">
              {/* License Code */}
              <div className="flex items-center justify-between py-3.5">
                <span className="text-secondaryText font-bold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff]">
                    <FiAward className="w-4 h-4" />
                  </div>
                  License Code
                </span>
                <span className="text-dark font-extrabold">CPA-IN-2026-89412</span>
              </div>

              {/* Signing Authority */}
              <div className="flex items-center justify-between py-3.5">
                <span className="text-secondaryText font-bold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#0088ff]">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  Signing Authority
                </span>
                <span className="text-dark font-extrabold text-right">Authorized (Level II Voucher Approver)</span>
              </div>
            </div>
          </div>

          {/* Preferences with Toggles */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
            <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
              Portal Preferences
            </h3>

            <div className="divide-y divide-[#e2e8f0]/60 text-xs">
              {/* Offline cache */}
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <h4 className="font-extrabold text-dark text-xs">Offline Ledger Cache</h4>
                  <p className="text-[10px] text-secondaryText font-bold mt-0.5">Keep fee registries available offline</p>
                </div>
                <button
                  onClick={() => setOfflineCache(!offlineCache)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                    offlineCache ? 'bg-[#0088ff]' : 'bg-[#e2e8f0]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      offlineCache ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Session timeout */}
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <h4 className="font-extrabold text-dark text-xs">Automatic Session Timeout</h4>
                  <p className="text-[10px] text-secondaryText font-bold mt-0.5">Log out after 15 minutes of idle state</p>
                </div>
                <button
                  onClick={() => setTimeoutActive(!timeoutActive)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                    timeoutActive ? 'bg-[#0088ff]' : 'bg-[#e2e8f0]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      timeoutActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Biometrics */}
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <h4 className="font-extrabold text-dark text-xs">Biometric Verification</h4>
                  <p className="text-[10px] text-secondaryText font-bold mt-0.5">Verify fingerprints on payments upload</p>
                </div>
                <button
                  onClick={() => setBiometricActive(!biometricActive)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                    biometricActive ? 'bg-[#0088ff]' : 'bg-[#e2e8f0]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      biometricActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MyProfile;
