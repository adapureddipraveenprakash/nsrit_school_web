import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiUsers, FiCalendar, FiActivity, FiSettings,
  FiDollarSign, FiBookOpen, FiClock, FiPercent, FiPlus, FiAlertCircle
} from 'react-icons/fi';
import {
  HiOutlineUserPlus, HiOutlineAcademicCap, HiOutlineClipboardDocumentList
} from 'react-icons/hi2';
import Drawer from '../components/Drawer';
import { useNavigate } from 'react-router-dom';

const PrincipalDashboard = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  // Simulated metrics matching Principal Dashboard specs
  const studentsCount = 107;
  const teachersCount = 12;
  const sectionsCount = 6;
  const pendingPromotions = 4;

  const collectedFee = 10000;
  const pendingFee = 4369000;
  const concessionFee = 0;
  const totalFee = collectedFee + pendingFee;
  const collectionRate = Math.round((collectedFee / totalFee) * 100) || 0;

  const handleListItemClick = (item) => {
    if (item === 'Add Student') {
      navigate('/settings/create-student');
    } else if (item === 'Manage Students') {
      navigate('/settings/global-students');
    } else if (item === 'View Attendance') {
      navigate('/settings/attendance-overview');
    } else if (item === 'Class Fee Setup') {
      navigate('/settings/class-fee-templates');
    } else if (item === 'Timetable') {
      navigate('/settings/timetable');
    } else if (item === 'Promotion Management') {
      navigate('/settings/promotions');
    } else if (item === 'Notice Board') {
      navigate('/settings/notifications');
    } else if (item === 'Teachers') {
      navigate('/settings/teachers');
    } else if (item === 'Assign Class Teacher') {
      navigate('/settings/class-teachers');
    } else if (item === 'Manage Staff') {
      navigate('/users');
    }
  };

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
        <h1 className="text-lg font-bold text-dark tracking-tight">Principal Desk</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Hero greeting banner (Purple theme for Principal) */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] p-6 md:p-8 text-white card-shadow overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl font-bold font-sans cursor-pointer hover:bg-white/30 transition-all select-none animate-[pulse_3s_infinite]"
                >
                  PR
                </button>
                <div>
                  <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Good Afternoon,</p>
                  <h2 className="text-2xl font-bold">{user?.name || 'Principal'}</h2>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/25 rounded-full mt-2 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                    Principal
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
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Students</p>
              </div>
              <div className="border-r border-white/15 last:border-none">
                <p className="text-xl font-bold md:text-2xl">{teachersCount}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Teachers</p>
              </div>
              <div className="border-r border-white/15 last:border-none">
                <p className="text-xl font-bold md:text-2xl">{sectionsCount}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans font-medium">Sections</p>
              </div>
              <div>
                <p className="text-xl font-bold md:text-2xl">{pendingPromotions}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Pending</p>
              </div>
            </div>
          </div>

          {/* Fee collection card */}
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-accent-purple">
                  <FiDollarSign className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <h3 className="text-sm font-extrabold text-dark">Fee Collection Progress</h3>
              </div>
              <span className="text-xs font-bold text-accent-purple">{collectionRate}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
              <div className="bg-[#7C3AED] h-full rounded-full transition-all duration-500" style={{ width: `${collectionRate || 0.2}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs divide-x divide-slate-100 font-bold">
              <div>
                <p className="text-accent-green">Rs {collectedFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Collected</p>
              </div>
              <div>
                <p className="text-accent-red">Rs {pendingFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Pending</p>
              </div>
              <div>
                <p className="text-brand-blue">Rs {concessionFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Concessions</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          
          {/* ACADEMIC WORKFLOWS Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
                <span className="text-xs font-extrabold text-[#7C3AED]">?</span>
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Academic Workflows</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Add Student',
                  desc: 'Enrol a new student',
                  icon: <HiOutlineUserPlus className="w-5 h-5" />,
                  color: 'text-[#23C16B] bg-[#E8F8F0]'
                },
                {
                  title: 'Manage Students',
                  desc: 'View and edit student profiles',
                  icon: <FiBookOpen className="w-5 h-5" />,
                  color: 'text-[#1597E5] bg-[#EEF5FB]'
                },
                {
                  title: 'View Attendance',
                  desc: 'Check branch attendance records',
                  icon: <FiCalendar className="w-5 h-5" />,
                  color: 'text-accent-purple bg-[#F3E8FF]'
                },
                {
                  title: 'Timetable',
                  desc: 'Set weekly schedules and timing',
                  icon: <FiClock className="w-5 h-5" />,
                  color: 'text-accent-orange bg-[#FFF8EE]'
                },
                {
                  title: 'Promotion Management',
                  desc: 'Configure student grade promotions',
                  icon: <FiAlertCircle className="w-5 h-5" />,
                  color: 'text-[#FF9F1C] bg-[#FFF8EE]'
                },
                {
                  title: 'Notice Board',
                  desc: 'Publish announcements',
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
                      <h3 className="text-xs font-bold text-dark group-hover:text-[#7C3AED] transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] transition-all">
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STAFF MANAGEMENT Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
                <FiUsers className="w-3.5 h-3.5 text-[#7C3AED]" />
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Staff Management</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Teachers',
                  desc: 'Roster and assignments',
                  icon: <HiOutlineAcademicCap className="w-5 h-5" />,
                  color: 'text-accent-purple bg-[#F3E8FF]'
                },
                {
                  title: 'Assign Class Teacher',
                  desc: 'Link teacher to section roster',
                  icon: <HiOutlineClipboardDocumentList className="w-5 h-5" />,
                  color: 'text-[#1597E5] bg-[#EEF5FB]'
                },
                {
                  title: 'Manage Staff',
                  desc: 'Coordinators and Accountants panel',
                  icon: <FiUsers className="w-5 h-5" />,
                  color: 'text-secondaryText bg-[#F1F5F9]'
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
                      <h3 className="text-xs font-bold text-[#7C3AED] group-hover:text-[#7C3AED] transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] transition-all">
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

export default PrincipalDashboard;
