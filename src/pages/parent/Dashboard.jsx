import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getParentChildrenByUser } from '../../services/dataService';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowRight, FiUsers, FiCalendar, FiActivity, FiSettings,
  FiDollarSign, FiBookOpen, FiClock, FiCheckCircle, FiBell,
  FiMessageSquare, FiRefreshCw, FiUser, FiMoreVertical, FiCreditCard,
  FiHelpCircle, FiHome
} from 'react-icons/fi';
import Drawer from '../../components/Drawer';

const ParentDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  // Simulated children data matching screenshots exactly
  const children = [
    {
      id: 'child-1',
      fullName: 'PATCHAMATLA PR...',
      studentId: '26SO0066',
      class: '1',
      section: 'A',
      attendance: 100,
      feeSummary: { paid: 0, due: 41000, concession: 0 }
    },
    {
      id: 'child-2',
      fullName: 'PATCHAMATLA SEC...',
      studentId: '26SO0099',
      class: '2',
      section: 'B',
      attendance: 92,
      feeSummary: { paid: 15000, due: 26000, concession: 1000 }
    }
  ];

  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const parentUserId = user?.id || user?.uid || null;
  const { data: dbChildren = [] } = useDataFetch(
    () => getParentChildrenByUser(parentUserId),
    [parentUserId],
    { defaultValue: [], pollInterval: 20000 }
  );

  const childrenList = dbChildren.length > 0 ? dbChildren.map((child, idx) => ({
    id: child.id,
    fullName: child.fullName || child.name || 'Student',
    studentId: child.studentId || child.admissionNumber || '',
    class: child.academicClass?.name || '1',
    section: child.section?.name || 'A',
    attendance: child.attendanceRate ?? (idx === 0 ? 100 : 92),
    feeSummary: {
      paid: child.feeSummary?.paid ?? (idx === 0 ? 0 : 15000),
      due: child.feeSummary?.due ?? (idx === 0 ? 41000 : 26000),
      concession: child.feeSummary?.concession ?? (idx === 0 ? 0 : 1000)
    }
  })) : children;

  const activeChild = childrenList[selectedChildIndex] || childrenList[0];

  const toggleChild = () => {
    setSelectedChildIndex((prev) => (prev + 1) % childrenList.length);
  };

  const handleListItemClick = (item) => {
    if (item === 'Attendance') {
      navigate('/settings/attendance-overview');
    } else if (item === 'Fee Ledger' || item === 'Pay Fees' || item === 'Pay Now') {
      navigate('/settings/fee-overview');
    } else if (item === 'Timetable') {
      navigate('/settings/timetable');
    } else if (item === 'Notices') {
      navigate('/settings/notifications');
    } else if (item === 'Suggestions') {
      navigate('/settings/suggestions');
    } else if (item === 'Profile') {
      navigate('/settings/profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-6"
    >
      {/* Centered Page Header */}
      <div className="text-center py-1.5 shrink-0 select-none">
        <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">Home</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Greeting Banner & Selected Child Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Greeting Banner */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden select-none">
            {/* Floating background design elements */}
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-white/75 font-bold tracking-wider uppercase">Good Morning,</p>
                <h2 className="text-xl font-black mt-1 tracking-tight">Patsamatla Padma M...</h2>
                
                {/* Role Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 border border-white/25 rounded-full mt-4 text-[9px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                  Parent Portal
                </div>
              </div>

              <div className="flex flex-col items-end gap-5">
                <button
                  onClick={() => setShowThreeDotsMenu(true)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95 z-30"
                >
                  <FiMoreVertical className="w-4.5 h-4.5" />
                </button>
                
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Wed, 24 Jun</span>
              </div>
            </div>
          </div>

          {/* Selected Child Info & Attendance Card */}
          <div className="bg-white rounded-[28px] p-6 card-shadow border-t-4 border-[#00a6ff] border-x border-b border-[#e2e8f0]/40 flex flex-col gap-5 relative overflow-hidden select-none">
            
            {/* Child Header Row */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4">
                {/* Avatar Circle with initials */}
                <div className="w-14 h-14 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] font-bold text-xl border border-blue-100 shrink-0">
                  PP
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#0F172A] tracking-tight">{activeChild.fullName}</h3>
                  <p className="text-xs text-secondaryText font-bold mt-0.5">
                    {activeChild.class} · {activeChild.section}
                  </p>
                  <p className="text-[10px] text-secondaryText/60 mt-1 font-mono font-bold">{activeChild.studentId}</p>
                </div>
              </div>

              {/* Attendance Circle Ring SVG */}
              <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" className="stroke-slate-100" strokeWidth="5.5" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-[#00c853] transition-all duration-500"
                    strokeWidth="5.5"
                    fill="transparent"
                    strokeDasharray="163.3"
                    strokeDashoffset={163.3 - (163.3 * activeChild.attendance) / 100}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center font-sans">
                  <span className="text-[11px] font-black text-dark leading-none">{activeChild.attendance}%</span>
                  <span className="text-[7px] font-bold text-secondaryText uppercase tracking-widest mt-0.5">Att</span>
                </div>
              </div>
            </div>

            {/* 3 Metrics Badge Row */}
            <div className="grid grid-cols-3 gap-2">
              {/* Badge 1: Attendance */}
              <div className="flex items-center gap-2 p-2 border border-emerald-100 bg-[#f0fdf4]/30 rounded-[16px] flex-1">
                <div className="w-6 h-6 rounded-full bg-[#f0fdf4] border border-emerald-100 flex items-center justify-center text-[#059669] shrink-0">
                  <FiCalendar className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-[#059669] leading-tight">{activeChild.attendance}%</span>
                  <span className="text-[7.5px] font-bold text-secondaryText uppercase tracking-wider">Attendance</span>
                </div>
              </div>

              {/* Badge 2: Fee Due */}
              <div className="flex items-center gap-2 p-2 border border-amber-100 bg-[#fef3c7]/30 rounded-[16px] flex-1">
                <div className="w-6 h-6 rounded-full bg-[#fef3c7] border border-amber-100 flex items-center justify-center text-[#d97706] shrink-0">
                  <FiHelpCircle className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-[#d97706] leading-tight">Rs {activeChild.feeSummary.due.toLocaleString('en-IN')}</span>
                  <span className="text-[7.5px] font-bold text-secondaryText uppercase tracking-wider">Fee Due</span>
                </div>
              </div>

              {/* Badge 3: Class */}
              <div className="flex items-center gap-2 p-2 border border-purple-100 bg-[#f3e8ff]/30 rounded-[16px] flex-1">
                <div className="w-6 h-6 rounded-full bg-[#f3e8ff] border border-purple-100 flex items-center justify-center text-[#8b5cf6] shrink-0">
                  <FiBookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-[#8b5cf6] leading-tight">{activeChild.class}-{activeChild.section}</span>
                  <span className="text-[7.5px] font-bold text-secondaryText uppercase tracking-wider">Class</span>
                </div>
              </div>
            </div>

            {/* Switch Child Link */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => navigate('/settings/global-students')}
                className="text-[10px] font-extrabold text-[#0088ff] hover:underline flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <FiRefreshCw className="w-3 h-3" />
                Switch child
              </button>
            </div>

          </div>
        </div>

        {/* Column 2: Quick Actions & Fee Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* QUICK ACTIONS Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 px-1 select-none">
              <span className="text-[#0088ff] font-bold text-xs">⚡</span>
              <h2 className="text-[10.5px] font-extrabold text-secondaryText tracking-widest uppercase">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-4 pt-1 select-none">
              {[
                { title: 'Attendance', label: 'ATTENDANCE', icon: <FiCalendar className="w-5.5 h-5.5 text-[#00a896]" />, bg: 'bg-[#e6fbf7] border border-[#a8ebd9]' },
                { title: 'Fee Ledger', label: 'FEE LEDGER', icon: <FiDollarSign className="w-5.5 h-5.5 text-[#e5a93b]" />, bg: 'bg-[#fdf6e6] border border-[#f5e3be]' },
                { title: 'Pay Fees', label: 'PAY FEES', icon: <FiCreditCard className="w-5.5 h-5.5 text-[#00bfa5]" />, bg: 'bg-[#e0f7f4] border border-[#b2ebf2]' },
                { title: 'Timetable', label: 'TIMETABLE', icon: <FiClock className="w-5.5 h-5.5 text-[#1e88e5]" />, bg: 'bg-[#e3f2fd] border border-[#bbdefb]' },
                { title: 'Notices', label: 'NOTICES', icon: <FiBell className="w-5.5 h-5.5 text-[#8e24aa]" />, bg: 'bg-[#f3e5f5] border border-[#e1bee7]' },
                { title: 'Suggestions', label: 'SUGGESTIO...', icon: <FiMessageSquare className="w-5.5 h-5.5 text-[#d84315]" />, bg: 'bg-[#fbe9e7] border border-[#ffccbc]' },
                { title: 'Switch Child', label: 'SWITCH CH...', icon: <FiRefreshCw className="w-5.5 h-5.5 text-[#00acc1]" />, bg: 'bg-[#e0f7fa] border border-[#b2ebf2]' },
                { title: 'Profile', label: 'PROFILE', icon: <FiUser className="w-5.5 h-5.5 text-[#5e35b1]" />, bg: 'bg-[#ede7f6] border border-[#d1c4e9]' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.title === 'Switch Child') {
                      navigate('/settings/global-students');
                    } else if (item.title === 'Fee Ledger') {
                      navigate('/settings/ledger');
                    } else {
                      handleListItemClick(item.title);
                    }
                  }}
                  className="flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 group"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all ${item.bg}`}>
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-black text-secondaryText tracking-wider text-center uppercase group-hover:text-[#0088ff] transition-colors truncate max-w-[70px]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FEE SUMMARY Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1 select-none">
              <div className="flex items-center gap-1.5">
                <span className="text-[#0088ff] font-bold text-xs">💵</span>
                <h2 className="text-[10.5px] font-extrabold text-secondaryText tracking-widest uppercase">Fee Summary</h2>
              </div>
              <button
                onClick={() => navigate('/settings/fee-overview')}
                className="px-3 py-1 bg-[#EEF5FB] hover:bg-[#e0effa] text-brand-blue text-[9px] font-black rounded-full flex items-center gap-0.5 transition-all"
              >
                View All <span className="text-[7px]">&gt;</span>
              </button>
            </div>

            <div className="bg-white rounded-[28px] p-5 card-shadow border border-[#e2e8f0]/40 space-y-5 select-none">
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-slate-100">
                {/* Paid */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#e8f5e9] border border-green-100 flex items-center justify-center text-[#2e7d32] shrink-0">
                    <FiDollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#2e7d32]">Rs {activeChild.feeSummary.paid.toLocaleString('en-IN')}</p>
                    <p className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-0.5">Paid</p>
                  </div>
                </div>

                {/* Due */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#fedeeb] border border-pink-100 flex items-center justify-center text-[#c2185b] shrink-0">
                    <span className="text-sm font-black">?</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#c2185b]">Rs {activeChild.feeSummary.due.toLocaleString('en-IN')}</p>
                    <p className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-0.5">Due</p>
                  </div>
                </div>

                {/* Concession */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f3e5f5] border border-purple-100 flex items-center justify-center text-[#7b1fa2] shrink-0">
                    <FiSettings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#7b1fa2]">Rs {activeChild.feeSummary.concession.toLocaleString('en-IN')}</p>
                    <p className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-0.5">Concession</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/settings/fee-overview')}
                className="w-full py-3 bg-[#00a6ff] hover:bg-[#0088ff] text-white rounded-[16px] text-xs font-black transition-all shadow-md shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiCreditCard className="w-4 h-4" />
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <Drawer isOpen={showThreeDotsMenu} onClose={() => setShowThreeDotsMenu(false)} position="right" />
    </motion.div>
  );
};

export default ParentDashboard;

