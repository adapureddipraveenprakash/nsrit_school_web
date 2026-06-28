import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiUsers, FiCalendar, FiActivity, FiSettings,
  FiBookOpen, FiClock, FiClipboard, FiFileText, FiMoreVertical, FiChevronRight, FiCheckCircle, FiUser, FiBell
} from 'react-icons/fi';
import Drawer from '../../components/Drawer';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user, activeRole } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleListItemClick = (item) => {
    if (item === 'Students List' || item === 'Parent Information') {
      navigate('/settings/teacher-students');
    } else if (item === 'Homework') {
      navigate('/settings/homework');
    } else if (item === 'Class Reports') {
      navigate('/settings/attendance-overview');
    } else if (item === 'My Timetable') {
      navigate('/settings/timetable');
    } else if (item === 'Notice Board') {
      navigate('/settings/notice-board');
    } else if (item === 'Teacher Profile') {
      navigate('/settings/profile');
    } else if (item === 'Mark Attendance') {
      navigate('/settings/take-attendance');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-2xl mx-auto space-y-6"
    >
      {/* Centered Page Header */}
      <div className="text-center py-2 shrink-0 select-none">
        <h1 className="text-sm font-extrabold text-dark tracking-tight">Teacher</h1>
      </div>

      {/* Hero Greeting Card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        {/* Background design elements */}
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar circle "S" */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl font-black font-sans cursor-pointer hover:bg-white/30 transition-all select-none"
            >
              S
            </button>
            <div>
              <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Good Afternoon</p>
              <h2 className="text-xl font-bold">{user?.name || 'Salapu Vasanthi'}</h2>
              
              {/* Active Section Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/25 rounded-full mt-2 text-[10px] font-bold uppercase tracking-wide">
                <span className="w-2.5 h-2 bg-white/20 rounded flex items-center justify-center text-[7px]">▤</span>
                1-A
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95 z-30"
          >
            <FiMoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Mark Attendance call to action block */}
      <div className="rounded-[24px] bg-[#1597E5] p-6 text-white card-shadow flex justify-between items-center relative overflow-hidden select-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center text-white shrink-0">
            <FiClipboard className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Attendance</h3>
            <p className="text-xs text-white/75 font-semibold mt-0.5">1 session pending</p>
          </div>
        </div>
        <button
          onClick={() => handleListItemClick('Mark Attendance')}
          className="bg-white hover:bg-slate-50 text-[#1597E5] px-5 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
        >
          Open <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TODAY'S SNAPSHOT section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <svg className="w-4 h-4 text-[#1597E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
            Today's Snapshot
          </span>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow grid grid-cols-4 gap-2 text-center divide-x divide-[#e2e8f0]/80">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-black text-[#1597E5] mb-1 select-none leading-none h-6 flex items-center justify-center font-sans">?</div>
            <p className="text-xl font-black text-dark leading-none">14</p>
            <p className="text-[9px] sm:text-[10px] text-secondaryText font-bold uppercase tracking-wider mt-2 leading-normal">Students</p>
          </div>
          <div className="pl-1 flex flex-col items-center">
            <div className="text-2xl text-[#1597E5] flex items-center justify-center mb-1 select-none h-6"><FiBookOpen className="w-5.5 h-5.5 text-[#1597E5]" /></div>
            <p className="text-xl font-black text-dark leading-none">0</p>
            <p className="text-[9px] sm:text-[10px] text-secondaryText font-bold uppercase tracking-wider mt-2 leading-normal">Subjects</p>
          </div>
          <div className="pl-1 flex flex-col items-center">
            <div className="text-2xl text-[#23C16B] flex items-center justify-center mb-1 select-none h-6"><FiCheckCircle className="w-5.5 h-5.5 text-[#23C16B]" /></div>
            <p className="text-xl font-black text-dark leading-none">0</p>
            <p className="text-[9px] sm:text-[10px] text-secondaryText font-bold uppercase tracking-wider mt-2 leading-normal">Marked</p>
          </div>
          <div className="pl-1 flex flex-col items-center">
            <div className="text-2xl text-[#8B5CF6] flex items-center justify-center mb-1 select-none h-6">
              <FiUser className="w-5.5 h-5.5 text-[#8B5CF6]" />
            </div>
            <p className="text-xl font-black text-dark leading-none">1</p>
            <p className="text-[9px] sm:text-[10px] text-secondaryText font-bold uppercase tracking-wider mt-2 leading-normal">Class Tchr</p>
          </div>
        </div>
      </div>

      {/* ASSIGNED SECTIONS section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#1597E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
              Assigned Sections
            </span>
          </div>
          
          <button
            onClick={() => navigate('/settings/teacher-students')}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#EEF5FB] rounded-full text-[10px] font-extrabold text-[#1597E5] select-none cursor-pointer active:scale-95"
          >
            <span>All Students</span>
            <FiChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          onClick={() => navigate('/settings/take-attendance')}
          className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex justify-between items-center cursor-pointer hover:border-[#1597E5]/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#EEF5FB] rounded-full flex items-center justify-center text-[#1597E5] shrink-0 select-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-dark group-hover:text-brand-blue transition-colors">
                1 – Section A
              </h3>
              <p className="text-xl font-bold text-[#1597E5] mt-1 leading-none">
                — students
              </p>
              <p className="text-[11px] text-secondaryText font-semibold mt-1.5 leading-snug">
                No subjects linked
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#EEF5FB] group-hover:bg-[#1597E5]/10 flex items-center justify-center text-[#1597E5] transition-all">
            <FiChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* MORE section */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 px-1">
          <svg className="w-4 h-4 text-[#1597E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
            More
          </span>
        </div>

        <div className="space-y-[18px] select-none">
          {[
            {
              title: 'Students List',
              val: 'View',
              desc: activeRole === 'CLASS_TEACHER' ? 'Assigned class teacher section roster' : 'Full roster of your assigned sections',
              icon: <FiUsers className="w-5.5 h-5.5 text-[#1597E5]" />,
              color: 'bg-[#EEF5FB]',
              textColor: 'text-[#1597E5]',
              show: true
            },
            {
              title: 'Homework',
              val: 'Class',
              desc: 'Assigned section homework',
              icon: <FiBookOpen className="w-5.5 h-5.5 text-[#1597E5]" />,
              color: 'bg-[#EEF5FB]',
              textColor: 'text-[#1597E5]',
              show: activeRole === 'CLASS_TEACHER'
            },
            {
              title: 'Parent Information',
              val: 'View',
              desc: 'Open student profiles for parent contacts',
              icon: <FiUser className="w-5.5 h-5.5 text-[#1597E5]" />,
              color: 'bg-[#EEF5FB]',
              textColor: 'text-[#1597E5]',
              show: activeRole === 'CLASS_TEACHER'
            },
            {
              title: 'Class Reports',
              val: 'View',
              desc: 'Attendance and fee reports for assigned section',
              icon: <FiFileText className="w-5.5 h-5.5 text-[#1597E5]" />,
              color: 'bg-[#EEF5FB]',
              textColor: 'text-[#1597E5]',
              show: activeRole === 'CLASS_TEACHER'
            },
            {
              title: 'My Timetable',
              val: 'Weekly',
              desc: 'View your assigned periods and classes',
              icon: <FiCalendar className="w-5.5 h-5.5 text-[#1597E5]" />,
              color: 'bg-[#EEF5FB]',
              textColor: 'text-[#1597E5]',
              show: true
            },
            {
              title: 'Notice Board',
              val: 'View',
              desc: 'School announcements and notices',
              icon: <FiBell className="w-5.5 h-5.5 text-[#8B5CF6]" />,
              color: 'bg-[#F3E8FF]',
              textColor: 'text-[#8B5CF6]',
              show: true
            },
            {
              title: 'Teacher Profile',
              val: 'View',
              desc: 'Your assignments, subjects, and bio',
              icon: <FiUser className="w-5.5 h-5.5 text-[#8B5CF6]" />,
              color: 'bg-[#F3E8FF]',
              textColor: 'text-[#8B5CF6]',
              show: true
            }
          ].filter(opt => opt.show).map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleListItemClick(item.title)}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex justify-between items-center cursor-pointer hover:border-brand-blue/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-dark group-hover:text-brand-blue transition-colors">
                    {item.title}
                  </h4>
                  <p className={`text-xl font-semibold mt-1 leading-none ${item.textColor}`}>
                    {item.val}
                  </p>
                  <p className="text-[11px] text-secondaryText font-semibold mt-1.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${item.color} ${item.textColor}`}>
                <FiChevronRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION FEE VISIBILITY metrics card */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <svg className="w-4 h-4 text-[#1597E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
            Section Fee Visibility
          </span>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex justify-around items-center text-center divide-x divide-[#e2e8f0]/80 select-none">
          <div className="w-1/3">
            <p className="text-sm font-black text-[#23C16B]">Rs 0</p>
            <p className="text-[10px] text-secondaryText font-extrabold uppercase mt-1.5 leading-none">Paid</p>
          </div>
          <div className="w-1/3 pl-1">
            <p className="text-sm font-black text-[#EF4444]">Rs 0</p>
            <p className="text-[10px] text-secondaryText font-extrabold uppercase mt-1.5 leading-none">Due</p>
          </div>
          <div className="w-1/3 pl-1">
            <p className="text-sm font-black text-brand-blue">0%</p>
            <p className="text-[10px] text-secondaryText font-extrabold uppercase mt-1.5 leading-none">Rate</p>
          </div>
        </div>
      </div>

      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} position="right" />
    </motion.div>
  );
};

export default TeacherDashboard;
