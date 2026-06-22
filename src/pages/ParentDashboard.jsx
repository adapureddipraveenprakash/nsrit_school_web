import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiUsers, FiCalendar, FiActivity, FiSettings,
  FiDollarSign, FiBookOpen, FiClock, FiCheckCircle
} from 'react-icons/fi';
import Drawer from '../components/Drawer';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  // Simulated children data
  const children = [
    {
      id: 'child-1',
      fullName: 'P. Sai Kumar',
      studentId: 'NSR26SOT078',
      class: 'Class 5',
      section: 'Section A',
      attendance: 92,
      feeSummary: { paid: 10000, due: 0, concession: 0 }
    },
    {
      id: 'child-2',
      fullName: 'P. Divya',
      studentId: 'NSR26SOT104',
      class: 'Class 3',
      section: 'Section B',
      attendance: 88,
      feeSummary: { paid: 5000, due: 15000, concession: 500 }
    }
  ];

  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const activeChild = children[selectedChildIndex];

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
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Centered Page Header */}
      <div className="text-center py-2 shrink-0">
        <h1 className="text-lg font-bold text-dark tracking-tight">Parent Portal</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Hero greeting banner (Teal theme for Parent) */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#10B981] to-[#059669] p-6 md:p-8 text-white card-shadow overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl font-bold font-sans cursor-pointer hover:bg-white/30 transition-all select-none animate-[pulse_3s_infinite]"
                >
                  PA
                </button>
                <div>
                  <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Good Afternoon,</p>
                  <h2 className="text-2xl font-bold">{user?.name || 'Parent'}</h2>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/25 rounded-full mt-2 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                    Parent / Guardian
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
            <div className="pt-6 border-t border-white/15 text-left">
              <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mb-2">Linked Children</p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {children.map((child, index) => {
                  const isSelected = index === selectedChildIndex;
                  return (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildIndex(index)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-white text-[#059669] shadow-md' 
                          : 'bg-white/20 text-white hover:bg-white/30 border border-white/10'
                      }`}
                    >
                      <FiBookOpen className="w-3.5 h-3.5" />
                      {child.fullName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Child Info & Attendance Card */}
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            {/* Left Child Details */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <span className="text-2xl font-bold font-sans">👶</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-dark">{activeChild.fullName}</h3>
                <p className="text-xs text-secondaryText mt-0.5 font-semibold">
                  {activeChild.class} · {activeChild.section}
                </p>
                <p className="text-[10px] text-secondaryText/60 mt-1 font-mono font-bold">{activeChild.studentId}</p>
              </div>
            </div>

            {/* Attendance Ring SVG simulation */}
            <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-emerald-500 transition-all duration-500"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="213"
                  strokeDashoffset={213 - (213 * activeChild.attendance) / 100}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center font-sans">
                <span className="text-sm font-extrabold text-dark">{activeChild.attendance}%</span>
                <span className="text-[7px] font-bold text-secondaryText uppercase tracking-widest">Attendance</span>
              </div>
            </div>
          </div>

          {/* Child Fee Summary Card */}
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-dark">Fee status</h3>
              </div>
              {activeChild.feeSummary.due === 0 ? (
                <div className="flex items-center gap-1 text-xs text-accent-green font-bold bg-[#E8F8F0] px-3 py-1 rounded-full">
                  <FiCheckCircle className="w-3.5 h-3.5" /> All Cleared
                </div>
              ) : (
                <span className="text-xs font-bold text-accent-red">Dues Pending</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs divide-x divide-slate-100 font-bold">
              <div>
                <p className="text-accent-green">Rs {activeChild.feeSummary.paid.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Paid</p>
              </div>
              <div>
                <p className="text-accent-red">Rs {activeChild.feeSummary.due.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Due Amount</p>
              </div>
              <div>
                <p className="text-brand-blue">Rs {activeChild.feeSummary.concession.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Concessions</p>
              </div>
            </div>

            {activeChild.feeSummary.due > 0 && (
              <button
                onClick={() => handleListItemClick('Pay Now')}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer"
              >
                Pay Now
              </button>
            )}
          </div>

        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          
          {/* QUICK ACTIONS Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-emerald-600">
                <span className="text-xs font-extrabold">⚡</span>
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Quick Actions</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Attendance',
                  desc: 'Check child daily logs',
                  icon: <FiCalendar className="w-5 h-5" />,
                  color: 'text-emerald-600 bg-emerald-50'
                },
                {
                  title: 'Fee Ledger',
                  desc: 'Full transactions record',
                  icon: <FiDollarSign className="w-5 h-5" />,
                  color: 'text-[#FF9F1C] bg-[#FFF8EE]'
                },
                {
                  title: 'Pay Fees',
                  desc: 'Pay academic dues securely',
                  icon: <FiActivity className="w-5 h-5" />,
                  color: 'text-[#23C16B] bg-[#E8F8F0]'
                },
                {
                  title: 'Timetable',
                  desc: 'Syllabus and period schedule',
                  icon: <FiClock className="w-5 h-5" />,
                  color: 'text-brand-blue bg-[#EEF5FB]'
                },
                {
                  title: 'Notices',
                  desc: 'Read messages from principal',
                  icon: <FiBookOpen className="w-5 h-5" />,
                  color: 'text-indigo-600 bg-indigo-50'
                },
                {
                  title: 'Suggestions',
                  desc: 'Send suggestions to board',
                  icon: <FiSettings className="w-5 h-5" />,
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
                      <h3 className="text-xs font-bold text-dark group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-emerald-50 flex items-center justify-center text-emerald-600 transition-all">
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

export default ParentDashboard;
