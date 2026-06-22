import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiUsers, FiCalendar, FiActivity, FiSettings,
  FiDollarSign, FiPlus, FiLayers, FiAlertCircle, FiClipboard, FiFileText
} from 'react-icons/fi';
import {
  HiOutlineUserPlus, HiOutlineAcademicCap, HiOutlineClipboardDocumentList
} from 'react-icons/hi2';
import Drawer from '../components/Drawer';
import { useNavigate } from 'react-router-dom';

const CoordinatorDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  // Simulated metrics matching Coordinator Dashboard specs
  const studentsCount = 54;
  const collectedFee = 8000;
  const pendingFee = 2150000;
  const totalFee = collectedFee + pendingFee;
  const collectionRate = Math.round((collectedFee / totalFee) * 100) || 0;

  const handleListItemClick = (item) => {
    if (item === 'Wing Attendance') {
      navigate('/settings/attendance-overview');
    } else if (item === 'Correct Attendance') {
      navigate('/settings/attendance-overview');
    } else if (item === 'Wing Students') {
      navigate('/settings/global-students');
    } else if (item === 'Assign Teachers') {
      navigate('/settings/class-teachers');
    } else if (item === 'Add Student') {
      navigate('/settings/create-student');
    } else if (item === 'Student Management') {
      navigate('/settings/global-students');
    } else if (item === 'Teacher Management') {
      navigate('/settings/teachers');
    } else if (item === 'Wing Fees') {
      navigate('/settings/fee-overview');
    } else if (item === 'Post Notice') {
      navigate('/settings/send-notification');
    } else if (item === 'View Notices') {
      navigate('/settings/notifications');
    }
  };

  const wingName = user?.wing || user?.wingName || 'Primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Centered Page Header */}
      <div className="text-center py-2 shrink-0">
        <h1 className="text-lg font-bold text-dark tracking-tight">Coordinator Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Hero greeting banner (Info blue theme for Coordinator) */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#0EA5E9] to-[#38BDF8] p-6 md:p-8 text-white card-shadow overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl font-bold font-sans cursor-pointer hover:bg-white/30 transition-all select-none animate-[pulse_3s_infinite]"
                >
                  CO
                </button>
                <div>
                  <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Good Afternoon,</p>
                  <h2 className="text-2xl font-bold">{user?.name || 'Coordinator'}</h2>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/25 rounded-full mt-2 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                    {wingName} Coordinator
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={() => setShowThreeDotsMenu(true)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95 z-30"
                >
                  <FiSettings className="w-5 h-5" />
                </button>
                
                <span className="text-[10px] font-bold text-white/70 uppercase">Sun, 21 Jun</span>
              </div>
            </div>

            {/* Bottom aggregate statistics grid */}
            <div className="grid grid-cols-4 gap-2 pt-6 border-t border-white/15 text-center">
              <div className="border-r border-white/15 last:border-none">
                <p className="text-xl font-bold md:text-2xl">{studentsCount}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Wing Students</p>
              </div>
              <div className="border-r border-white/15 last:border-none">
                <p className="text-sm font-bold md:text-base">Rs {collectedFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Collected</p>
              </div>
              <div className="border-r border-white/15 last:border-none">
                <p className="text-sm font-bold md:text-base">Rs {pendingFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans font-medium">Pending</p>
              </div>
              <div>
                <p className="text-xl font-bold md:text-2xl">{collectionRate}%</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans font-medium">Rate</p>
              </div>
            </div>
          </div>

          {/* Collection Progress Card */}
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-dark">Wing Fee Collection</h3>
              </div>
              <span className="text-xs font-bold text-sky-600">{collectionRate}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${collectionRate || 0.2}%` }} />
            </div>

            <p className="text-[11px] text-secondaryText font-bold">
              Collected Rs {collectedFee.toLocaleString('en-IN')} of Rs {totalFee.toLocaleString('en-IN')}
            </p>
          </div>

        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          
          {/* WING OPERATIONS Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-sky-600">
                <span className="text-xs font-extrabold">?</span>
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Wing Operations</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Wing Attendance',
                  desc: 'Check and mark class registers',
                  icon: <FiClipboard className="w-5 h-5" />,
                  color: 'text-sky-600 bg-sky-50'
                },
                {
                  title: 'Correct Attendance',
                  desc: 'Edit past attendance rosters',
                  icon: <FiActivity className="w-5 h-5" />,
                  color: 'text-[#FF9F1C] bg-[#FFF8EE]'
                },
                {
                  title: 'Wing Students',
                  desc: 'View child records in your wing',
                  icon: <FiUsers className="w-5 h-5" />,
                  color: 'text-accent-purple bg-[#F3E8FF]'
                },
                {
                  title: 'Assign Teachers',
                  desc: 'Link teachers to periodic slots',
                  icon: <FiLayers className="w-5 h-5" />,
                  color: 'text-brand-blue bg-[#EEF5FB]'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleListItemClick(item.title)}
                  className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-dark group-hover:text-sky-600 transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-sky-50 flex items-center justify-center text-sky-600 transition-all">
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MANAGEMENT & COMMUNICATE Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-sky-600">
                <FiSettings className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Management & Notices</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Add Student',
                  desc: 'Register student profile',
                  icon: <HiOutlineUserPlus className="w-5 h-5" />,
                  color: 'text-[#23C16B] bg-[#E8F8F0]'
                },
                {
                  title: 'Student Management',
                  desc: 'Search student details',
                  icon: <FiUsers className="w-5 h-5" />,
                  color: 'text-[#1597E5] bg-[#EEF5FB]'
                },
                {
                  title: 'Teacher Management',
                  desc: 'View wing teachers list',
                  icon: <HiOutlineAcademicCap className="w-5 h-5" />,
                  color: 'text-accent-purple bg-[#F3E8FF]'
                },
                {
                  title: 'Wing Fees',
                  desc: 'Track pending wing payments',
                  icon: <FiDollarSign className="w-5 h-5" />,
                  color: 'text-[#FF9F1C] bg-[#FFF8EE]'
                },
                {
                  title: 'Post Notice',
                  desc: 'Publish text messages to parents',
                  icon: <FiFileText className="w-5 h-5" />,
                  color: 'text-indigo-600 bg-indigo-50'
                },
                {
                  title: 'View Notices',
                  desc: 'Read notice history',
                  icon: <FiActivity className="w-5 h-5" />,
                  color: 'text-brand-secondary bg-[#F1F5F9]'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleListItemClick(item.title)}
                  className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-dark group-hover:text-sky-600 transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-sky-50 flex items-center justify-center text-sky-600 transition-all">
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <Drawer isOpen={showThreeDotsMenu} onClose={() => setShowThreeDotsMenu(false)} position="right" />
    </motion.div>
  );
};

export default CoordinatorDashboard;
