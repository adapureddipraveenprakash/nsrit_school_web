import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiUsers, FiCalendar, FiActivity, FiSettings,
  FiDollarSign, FiBookOpen, FiClock, FiClipboard, FiFileText
} from 'react-icons/fi';
import Drawer from '../components/Drawer';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  // Simulated metrics matching Teacher Dashboard specs
  const totalStudents = 105;
  const totalSubjects = 3;
  const markedAttendance = 24;
  const classTeacherSections = 1;

  const collectedFee = 10000;
  const pendingFee = 4369000;
  const totalFee = collectedFee + pendingFee;
  const collectionRate = Math.round((collectedFee / totalFee) * 105) || 0;

  const handleListItemClick = (item) => {
    if (item === 'Take Attendance' || item === 'Mark Attendance') {
      navigate('/settings/attendance-overview');
    } else if (item === 'Students List' || item === 'Students') {
      navigate('/settings/global-students');
    } else if (item === 'Homework') {
      navigate('/settings/homework');
    } else if (item === 'My Timetable') {
      navigate('/settings/timetable');
    } else if (item === 'Notice Board') {
      navigate('/settings/notifications');
    } else if (item === 'Teacher Profile') {
      navigate('/settings/profile');
    }
  };

  const assignedSections = [
    { id: 1, class: 'Class 5', section: 'Section A', subject: 'Telugu', students: 30 },
    { id: 2, class: 'Class 7', section: 'Section A', subject: 'Maths', students: 35 },
    { id: 3, class: 'Class 6', section: 'Section B', subject: 'Science', students: 40 }
  ];

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
        <h1 className="text-lg font-bold text-dark tracking-tight">Teacher Roster</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Hero greeting banner (Deep blue theme for Teacher) */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#4F46E5] to-[#818CF8] p-6 md:p-8 text-white card-shadow overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl font-bold font-sans cursor-pointer hover:bg-white/30 transition-all select-none animate-[pulse_3s_infinite]"
                >
                  TE
                </button>
                <div>
                  <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Good Afternoon,</p>
                  <h2 className="text-2xl font-bold">{user?.name || 'Teacher'}</h2>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/25 rounded-full mt-2 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                    Class Teacher
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
                <p className="text-xl font-bold md:text-2xl">{totalStudents}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Students</p>
              </div>
              <div className="border-r border-white/15 last:border-none">
                <p className="text-xl font-bold md:text-2xl">{totalSubjects}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Subjects</p>
              </div>
              <div className="border-r border-white/15 last:border-none">
                <p className="text-xl font-bold md:text-2xl">{markedAttendance}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans font-medium">Marked</p>
              </div>
              <div>
                <p className="text-xl font-bold md:text-2xl">{classTeacherSections}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Class Tchr</p>
              </div>
            </div>
          </div>

          {/* Mark Attendance Call to Action Card */}
          <div className="rounded-[28px] bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 text-white card-shadow flex justify-between items-center relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-white/5" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-white">
                <FiClipboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Mark Daily Attendance</h3>
                <p className="text-[10px] text-white/60 font-semibold mt-0.5">Submit student rolls call for today</p>
              </div>
            </div>
            <button
              onClick={() => handleListItemClick('Take Attendance')}
              className="bg-white hover:bg-slate-100 text-indigo-900 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Open <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section Fee Visibility Card */}
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#4F46E5]">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-dark">Section Fee Status</h3>
              </div>
              <span className="text-xs font-bold text-[#4F46E5]">{collectionRate}% Paid</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
              <div className="bg-[#4F46E5] h-full rounded-full transition-all duration-500" style={{ width: `${collectionRate || 0.2}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs divide-x divide-slate-100 font-bold">
              <div>
                <p className="text-accent-green">Rs {collectedFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Paid Amount</p>
              </div>
              <div>
                <p className="text-accent-red">Rs {pendingFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Due Amount</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          
          {/* ASSIGNED SECTIONS Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#4F46E5]">
                <span className="text-xs font-extrabold">📌</span>
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Assigned Sections</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {assignedSections.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => handleListItemClick('Take Attendance')}
                  className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex flex-col items-center justify-center text-[#4F46E5] shrink-0 font-sans">
                      <span className="text-[10px] font-extrabold">{sec.class.split(' ')[1]}</span>
                      <span className="text-[8px] font-bold tracking-tight uppercase">{sec.section.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-dark group-hover:text-[#4F46E5] transition-colors">{sec.subject}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{sec.students} Students Roster</p>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-indigo-50 flex items-center justify-center text-[#4F46E5] transition-all">
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MORE FEATURES Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#4F46E5]">
                <FiSettings className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">More Options</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Students List',
                  desc: 'Roster lists of classes',
                  icon: <FiUsers className="w-5 h-5" />,
                  color: 'text-indigo-600 bg-indigo-50'
                },
                {
                  title: 'Homework',
                  desc: 'Create or review class assignments',
                  icon: <FiBookOpen className="w-5 h-5" />,
                  color: 'text-sky-600 bg-sky-50'
                },
                {
                  title: 'My Timetable',
                  desc: 'View periodic week schedule',
                  icon: <FiClock className="w-5 h-5" />,
                  color: 'text-amber-600 bg-amber-50'
                },
                {
                  title: 'Notice Board',
                  desc: 'Announcements from management',
                  icon: <FiFileText className="w-5 h-5" />,
                  color: 'text-emerald-600 bg-emerald-50'
                },
                {
                  title: 'Teacher Profile',
                  desc: 'View personal subject assignments',
                  icon: <FiActivity className="w-5 h-5" />,
                  color: 'text-rose-600 bg-rose-50'
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
                      <h3 className="text-xs font-bold text-dark group-hover:text-[#4F46E5] transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-indigo-50 flex items-center justify-center text-[#4F46E5] transition-all">
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

export default TeacherDashboard;
