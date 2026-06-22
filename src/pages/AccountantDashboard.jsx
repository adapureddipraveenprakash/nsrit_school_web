import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiUsers, FiCalendar, FiActivity, FiSettings,
  FiDollarSign, FiPlus, FiAlertCircle, FiClock, FiFileText
} from 'react-icons/fi';
import Drawer from '../components/Drawer';
import { useNavigate } from 'react-router-dom';

const AccountantDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  // Simulated metrics matching Accountant Dashboard specs
  const todaysCollections = 15000;
  const monthlyCollections = 105000;
  const totalDues = 4369000;
  const collectionRate = 2; // %
  const dueStudentsCount = 98;

  const handleListItemClick = (item) => {
    if (item === 'Record Payment') {
      navigate('/settings/fee-overview');
    } else if (item === 'Due Students') {
      navigate('/settings/global-students');
    } else if (item === 'Payment History') {
      navigate('/settings/fee-overview');
    } else if (item === 'Reports') {
      navigate('/settings/fee-overview');
    }
  };

  const recentPayments = [
    { id: 1, name: 'P. Sai Kumar', class: 'Class 5-A', amount: 5000, type: 'Cash', date: '21 Jun 2026' },
    { id: 2, name: 'S. Deepika', class: 'Class 4-B', amount: 8000, type: 'UPI', date: '21 Jun 2026' },
    { id: 3, name: 'M. Lavanya', class: 'Class 6-A', amount: 2000, type: 'Card', date: '21 Jun 2026' }
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
        <h1 className="text-lg font-bold text-dark tracking-tight">Accountant Desk</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Hero greeting banner (Classic blue theme for Accountant) */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 md:p-8 text-white card-shadow overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl font-bold font-sans cursor-pointer hover:bg-white/30 transition-all select-none animate-[pulse_3s_infinite]"
                >
                  AC
                </button>
                <div>
                  <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Good Afternoon,</p>
                  <h2 className="text-2xl font-bold">{user?.name || 'Accountant'}</h2>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/25 rounded-full mt-2 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                    Branch Accountant
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
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/15 text-center font-sans">
              <div className="border-r border-white/15 last:border-none">
                <p className="text-sm font-bold md:text-base">Rs {todaysCollections.toLocaleString('en-IN')}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Today Collections</p>
              </div>
              <div className="border-r border-white/15 last:border-none">
                <p className="text-sm font-bold md:text-base">Rs {monthlyCollections.toLocaleString('en-IN')}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Month Collections</p>
              </div>
              <div>
                <p className="text-xl font-bold md:text-2xl">{collectionRate}%</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-medium">Rate</p>
              </div>
            </div>
          </div>

          {/* Collection Progress Card */}
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] flex items-center justify-center text-[#1597E5]">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-dark">Branch Collection Progress</h3>
              </div>
              <span className="text-xs font-bold text-brand-blue">{collectionRate}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
              <div className="bg-[#1597E5] h-full rounded-full transition-all duration-500" style={{ width: `${collectionRate || 0.2}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs divide-x divide-slate-100 font-bold">
              <div>
                <p className="text-accent-green">Rs {monthlyCollections.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">This Month Collected</p>
              </div>
              <div>
                <p className="text-accent-red">Rs {totalDues.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">Remaining Dues</p>
              </div>
            </div>
          </div>

          {/* Recent Payments Section */}
          <div className="space-y-3">
            <div className="px-1 text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Recent Transactions (Today)
            </div>

            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80 card-shadow">
              {recentPayments.map((pay) => (
                <div key={pay.id} className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                      +
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-dark">{pay.name}</h4>
                      <p className="text-[9px] text-secondaryText font-medium mt-0.5">{pay.class} · {pay.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-accent-green">+ Rs {pay.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[9px] text-secondaryText mt-0.5">{pay.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          
          {/* FEE DESK Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
                <span className="text-xs font-extrabold text-[#1597E5]">💵</span>
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Fee Desk Operations</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Record Payment',
                  desc: 'Record cash / UPI / cheq collection',
                  icon: <FiPlus className="w-5 h-5" />,
                  color: 'text-emerald-600 bg-emerald-50'
                },
                {
                  title: 'Due Students',
                  desc: 'Students list with pending collections',
                  icon: <FiAlertCircle className="w-5 h-5" />,
                  color: 'text-rose-600 bg-rose-50'
                },
                {
                  title: 'Payment History',
                  desc: 'Receipt history and print ledger',
                  icon: <FiClock className="w-5 h-5" />,
                  color: 'text-indigo-600 bg-indigo-50'
                },
                {
                  title: 'Reports',
                  desc: 'Class-wise collections statements',
                  icon: <FiFileText className="w-5 h-5" />,
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
                      <h3 className="text-xs font-bold text-dark group-hover:text-brand-blue transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-[#1597E5]/10 flex items-center justify-center text-brand-blue transition-all">
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINANCIAL SUMMARY card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Financial Summary
            </span>
            <div className="divide-y divide-[#e2e8f0]/80">
              <div className="flex justify-between py-2.5 text-xs font-bold">
                <span className="text-secondaryText">Total Collected</span>
                <span className="text-accent-green">Rs {monthlyCollections.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs font-bold">
                <span className="text-secondaryText">Total Pending</span>
                <span className="text-accent-red">Rs {totalDues.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs font-bold">
                <span className="text-secondaryText">Due Students</span>
                <span className="text-dark">{dueStudentsCount}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <Drawer isOpen={showThreeDotsMenu} onClose={() => setShowThreeDotsMenu(false)} position="right" />
    </motion.div>
  );
};

export default AccountantDashboard;
