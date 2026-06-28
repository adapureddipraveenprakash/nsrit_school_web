import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiSettings, FiDollarSign, FiPlus, FiAlertCircle,
  FiClock, FiFileText, FiArrowRight, FiUser, FiCalendar, FiCreditCard, FiHelpCircle
} from 'react-icons/fi';
import { BiReceipt } from 'react-icons/bi';
import Drawer from '../../components/Drawer';
import { useNavigate } from 'react-router-dom';

const AccountantDashboard = () => {
  const { user, fees, users = [] } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  // Stats matching Screenshot 1 (using live scoped fees context data)
  const todaysCollections = 0;
  const monthlyCollections = fees?.collected || 0;
  const collectionRate = fees?.collected + fees?.pending > 0 
    ? Math.round((fees.collected / (fees.collected + fees.pending)) * 100) 
    : 0; // %
  const totalDues = fees?.pending || 0;
  const dueStudentsCount = users.filter(u => u.role === 'STUDENT' && u.feeStatus === 'DUE').length || 0;

  const handleListItemClick = (item) => {
    if (item === 'Record Payment') {
      navigate('/settings/record-payment');
    } else if (item === 'Due Students') {
      navigate('/settings/global-students');
    } else if (item === 'Payment History') {
      navigate('/settings/fee-history');
    } else if (item === 'Reports') {
      navigate('/settings/branch-reports');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-6 select-none animate-fade-in"
    >
      {/* Centered Page Header */}
      <div className="text-center py-1.5 shrink-0">
        <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Greeting Banner */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden space-y-6">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => navigate('/settings/profile')}
                  className="w-14 h-14 rounded-full bg-white/20 border border-white/45 flex items-center justify-center text-xl font-bold font-sans cursor-pointer hover:bg-white/35 transition-all shadow-inner"
                >
                  P
                </div>
                <div>
                  <p className="text-[10px] text-white/75 font-bold tracking-wider uppercase">Good Morning</p>
                  <h2 className="text-xl font-black mt-0.5 tracking-tight">Patsamatla Padma Manjula</h2>
                  
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/25 rounded-full mt-3 text-[9px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full animate-pulse" />
                    Fee Desk - Accountant
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-5">
                <button
                  onClick={() => setShowThreeDotsMenu(true)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95 z-30"
                >
                  <FiSettings className="w-4.5 h-4.5" />
                </button>
                
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Wed, 24 Jun</span>
              </div>
            </div>

            {/* Bottom aggregate statistics grid */}
            <div className="grid grid-cols-3 gap-2 pt-5 border-t border-white/15 text-center font-sans">
              <div className="border-r border-white/15">
                <p className="text-sm font-black">Rs {todaysCollections}</p>
                <p className="text-[8px] text-white/75 font-black uppercase tracking-wider mt-1">Today</p>
              </div>
              <div className="border-r border-white/15">
                <p className="text-sm font-black">Rs {monthlyCollections}</p>
                <p className="text-[8px] text-white/75 font-black uppercase tracking-wider mt-1">This Month</p>
              </div>
              <div>
                <p className="text-sm font-black">{collectionRate}%</p>
                <p className="text-[8px] text-white/75 font-black uppercase tracking-wider mt-1">Rate</p>
              </div>
            </div>
          </div>

          {/* Collection Rate Card */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] border border-blue-50">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-extrabold text-secondaryText uppercase tracking-widest">Fee Collection Rate</h3>
              </div>
              <span className="text-xs font-black text-amber-500">{collectionRate}%</span>
            </div>

            <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
              <div className="bg-[#0088ff] h-full rounded-full transition-all duration-300" style={{ width: `${collectionRate}%` }} />
            </div>

            <div className="flex gap-3 text-xs select-none pt-1">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EEF5FB]/75 border border-blue-100 rounded-xl text-[#0088ff] text-[10px] font-black">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>Month: Rs {monthlyCollections}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-[10px] font-black">
                <FiAlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Due: Rs {totalDues}</span>
              </div>
            </div>
          </div>

          {/* FEE DESK Operations */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 px-1 select-none">
              <span className="text-[#0088ff] font-bold text-xs">💼</span>
              <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">Fee Desk</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Record Payment', desc: 'Accept cash / UPI / card', icon: <BiReceipt className="w-6 h-6 text-emerald-500" />, bg: 'bg-[#E8F8F0] border border-emerald-100/50' },
                { title: 'Due Students', desc: 'Follow up list', icon: <FiUsers className="w-6 h-6 text-rose-500" />, bg: 'bg-rose-50 border border-rose-100/50' },
                { title: 'Payment History', desc: 'Receipts & ledger', icon: <FiClock className="w-6 h-6 text-indigo-500" />, bg: 'bg-indigo-50 border border-indigo-100/50' },
                { title: 'Reports', desc: 'Class-wise analytics', icon: <FiFileText className="w-6 h-6 text-amber-500" />, bg: 'bg-amber-50 border border-amber-100/50' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleListItemClick(item.title)}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.bg}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-dark group-hover:text-brand-blue transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-secondaryText font-bold mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#EEF5FB] group-hover:bg-blue-50 flex items-center justify-center text-[#0088ff] transition-all">
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT PAYMENTS */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1 select-none">
              <div className="flex items-center gap-1.5">
                <span className="text-[#0088ff] font-bold text-xs">🕒</span>
                <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">Recent Payments</h2>
              </div>
              <button 
                onClick={() => navigate('/settings/fee-history')}
                className="text-[10px] font-extrabold text-[#0088ff] hover:underline"
              >
                All History &gt;
              </button>
            </div>

            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[220px]">
              <div className="w-16 h-16 rounded-full bg-[#EEF5FB] border border-blue-50 flex items-center justify-center text-[#0088ff] relative shadow-inner">
                <FiHelpCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-[280px]">
                <h4 className="text-xs font-black text-dark">No payments today</h4>
                <p className="text-[10px] text-[#A0AEC0] font-semibold leading-relaxed">
                  Payments recorded today will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="lg:col-span-1 space-y-6">
          {/* FINANCIAL SUMMARY */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 px-1 select-none">
              <span className="text-[#0088ff] font-bold text-xs">🌐</span>
              <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">Financial Summary</h2>
            </div>

            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-5 select-none">
              <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-slate-100 font-sans">
                <div className="flex flex-col justify-center">
                  <span className="text-[#23C16B] text-sm font-black">Rs {monthlyCollections}</span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Collected</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-rose-500 text-sm font-black">Rs {totalDues}</span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Pending</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-amber-500 text-sm font-black">{dueStudentsCount}</span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Due Students</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/settings/collection')}
                className="w-full py-3.5 bg-[#EEF5FB] hover:bg-[#e0effa] text-[#0088ff] rounded-[16px] text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-blue-50"
              >
                <span>Open full fee dashboard</span>
                <FiArrowRight className="w-3.5 h-3.5" />
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

export default AccountantDashboard;
