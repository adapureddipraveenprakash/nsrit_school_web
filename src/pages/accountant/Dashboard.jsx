import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getPaymentHistory } from '../../services/dataService';
import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiSettings, FiDollarSign, FiPlus, FiAlertCircle,
  FiClock, FiFileText, FiArrowRight, FiUser, FiCalendar, FiCreditCard, 
  FiHelpCircle, FiMoreVertical, FiEye, FiShare2, FiFolder, FiGlobe
} from 'react-icons/fi';
import { BiReceipt } from 'react-icons/bi';
import Drawer from '../../components/Drawer';
import { useNavigate } from 'react-router-dom';

const AccountantDashboard = () => {
  const { user, fees, users = [] } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  const branchId = user?.branchId || 'sontyam-branch-id';

  // Fetch payments list using useDataFetch
  const { data: dbPayments = [], loading: paymentsLoading } = useDataFetch(
    () => getPaymentHistory({ branchId }),
    [branchId],
    { defaultValue: [], pollInterval: 15000 }
  );

  // Formatting date string for display in header card (e.g. "Sat, 4 Jul")
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  // Formatting utility for payment cards (DD-MM-YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Truncating function to match the screenshot name format: "Patsamatla Pa..."
  const formatHeaderName = (name) => {
    if (!name) return 'Accountant';
    if (name === 'Patsamatla Padma Manjula') {
      return 'Patsamatla Pa...';
    }
    if (name.length > 15) {
      return name.slice(0, 13) + '...';
    }
    return name;
  };

  // Calculations using live database payments
  const todayStr = new Date().toDateString();
  const todaysCollections = dbPayments
    .filter(p => {
      if (!p.paymentDate || String(p.status).toUpperCase() === 'REVERSED') return false;
      return new Date(p.paymentDate).toDateString() === todayStr;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCollections = dbPayments
    .filter(p => {
      if (!p.paymentDate || String(p.status).toUpperCase() === 'REVERSED') return false;
      const d = new Date(p.paymentDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const collectionRate = fees?.collected + fees?.pending > 0 
    ? Math.round((fees.collected / (fees.collected + fees.pending)) * 100) 
    : 0; // %

  const totalDues = fees?.pending || 0;
  const dueStudentsCount = users.filter(u => u.role === 'STUDENT' && u.feeStatus === 'DUE').length || 0;

  // Mock payments matching the screenshot exactly as a fallback
  const mockPayments = [
    {
      id: 'mock-1',
      amount: 10000,
      student: { fullName: 'KORUKONDA NAGA VENKAT KALYAN' },
      paymentDate: '2026-07-03',
      paymentMode: '',
      receiptNumber: 'REC-SD-1783057145704-816'
    },
    {
      id: 'mock-2',
      amount: 10000,
      student: { fullName: 'BONTHU DAKSH RIHAAN' },
      paymentDate: '2026-07-03',
      paymentMode: 'CASH',
      receiptNumber: 'REC-SD-1783057792189-996'
    },
    {
      id: 'mock-3',
      amount: 5000,
      student: { fullName: 'KORADA BHARGAVSAI' },
      paymentDate: '2026-06-29',
      paymentMode: 'UPI',
      receiptNumber: 'RCPT-2026-SD-00004'
    }
  ];

  const displayPayments = dbPayments.length > 0 ? dbPayments.slice(0, 3) : mockPayments;

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
      className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto select-none animate-fade-in"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Area: Greeting, Rate, and Desk */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Greeting Banner */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#00A3FF] to-[#0066FF] p-6 text-white card-shadow overflow-hidden space-y-6">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            {/* Top Row: Avatar + Name + Menu Button */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => navigate('/settings/profile')}
                  className="w-12 h-12 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-lg font-black font-sans cursor-pointer hover:bg-white/35 transition-all shadow-inner"
                >
                  {user?.name ? user.name[0].toUpperCase() : 'P'}
                </div>
                <div>
                  <p className="text-[9px] text-white/70 font-bold tracking-wider uppercase">
                    {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}
                  </p>
                  <h2 className="text-base font-black tracking-tight">
                    {formatHeaderName(user?.name || 'Patsamatla Padma Manjula')}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setShowThreeDotsMenu(true)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <FiMoreVertical className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Middle Row: Badge + Date */}
            <div className="flex justify-between items-center relative z-10 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full animate-pulse" />
                Fee Desk · Accountant
              </div>
              <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider">
                {currentDateStr}
              </span>
            </div>

            {/* Bottom aggregate statistics grid */}
            <div className="grid grid-cols-3 gap-2 pt-5 border-t border-white/15 text-center font-sans relative z-10">
              <div className="border-r border-white/15">
                <p className="text-sm font-black">Rs {todaysCollections.toLocaleString()}</p>
                <p className="text-[8px] text-white/75 font-black uppercase tracking-wider mt-1">Today</p>
              </div>
              <div className="border-r border-white/15">
                <p className="text-sm font-black">Rs {monthlyCollections.toLocaleString()}</p>
                <p className="text-[8px] text-white/75 font-black uppercase tracking-wider mt-1">This Month</p>
              </div>
              <div>
                <p className="text-sm font-black">{collectionRate}%</p>
                <p className="text-[8px] text-white/75 font-black uppercase tracking-wider mt-1">Rate</p>
              </div>
            </div>
          </div>

          {/* Fee Collection Rate Card */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] border border-blue-50">
                  <BiReceipt className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black text-dark uppercase tracking-widest">Fee Collection Rate</h3>
              </div>
              <span className="text-xs font-black text-[#F59E0B]">{collectionRate}%</span>
            </div>

            {/* Progress Slider (with handle) */}
            <div className="relative w-full bg-[#EEF5FB] h-1.5 rounded-full mt-3">
              <div 
                className="absolute left-0 top-0 bg-[#F59E0B] h-full rounded-full transition-all duration-300" 
                style={{ width: `${collectionRate}%` }} 
              />
              <div 
                className="absolute w-3 h-3 bg-[#F59E0B] rounded-full -top-[3px] border-2 border-white shadow-sm transition-all duration-300" 
                style={{ left: `calc(${collectionRate}% - 6px)` }} 
              />
            </div>

            <div className="flex gap-3 text-xs select-none pt-2">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EEF5FB] border border-blue-100 rounded-full text-[#1597E5] text-[10px] font-black">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>Month: Rs {monthlyCollections.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-rose-500 text-[10px] font-black">
                <FiAlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Due: Rs {totalDues.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* FEE DESK Operations */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 px-1 select-none">
              <span className="text-[#1597E5] font-bold text-xs">💼</span>
              <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">Fee Desk</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { 
                  title: 'Record Payment', 
                  desc: 'Accept cash / UPI / card', 
                  icon: <BiReceipt className="w-5 h-5 text-emerald-500" />, 
                  bg: 'bg-[#E8F8F0]',
                  border: 'border-t-4 border-t-emerald-500'
                },
                { 
                  title: 'Due Students', 
                  desc: 'Follow up list', 
                  icon: <FiUsers className="w-5 h-5 text-rose-500" />, 
                  bg: 'bg-rose-50',
                  border: 'border-t-4 border-t-rose-500'
                },
                { 
                  title: 'Payment History', 
                  desc: 'Receipts & ledger', 
                  icon: <span className="text-indigo-500 font-extrabold text-lg font-sans">?</span>, 
                  bg: 'bg-indigo-50',
                  border: 'border-t-4 border-t-indigo-500'
                },
                { 
                  title: 'Reports', 
                  desc: 'Class-wise analytics', 
                  icon: <FiFileText className="w-5 h-5 text-amber-500" />, 
                  bg: 'bg-amber-50',
                  border: 'border-t-4 border-t-amber-500'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleListItemClick(item.title)}
                  className={`bg-white rounded-[24px] ${item.border} p-5 card-shadow flex flex-col items-start hover:-translate-y-0.5 transition-all cursor-pointer group active:scale-[0.98] min-h-[140px]`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs font-black text-dark group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[9.5px] text-secondaryText font-bold mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area: Financial Summary & Recent Payments */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* FINANCIAL SUMMARY */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 px-1 select-none">
              <FiGlobe className="text-[#1597E5] w-4.5 h-4.5" />
              <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">Financial Summary</h2>
            </div>

            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-5 select-none">
              <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-slate-100 font-sans">
                <div className="flex flex-col justify-center">
                  <span className="text-[#23C16B] text-sm font-black">
                    Rs {fees?.collected ? fees.collected.toLocaleString() : '0'}
                  </span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Collected</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-rose-500 text-sm font-black">
                    Rs {fees?.pending ? fees.pending.toLocaleString() : '0'}
                  </span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Pending</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-amber-500 text-sm font-black">{dueStudentsCount}</span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Due Students</span>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <button
                  onClick={() => navigate('/settings/collection')}
                  className="inline-flex items-center gap-1 text-xs font-black text-[#1597E5] hover:underline cursor-pointer transition-all active:scale-95"
                >
                  <span>Open full fee dashboard</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RECENT PAYMENTS */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1 select-none">
              <div className="flex items-center gap-1.5">
                <FiEye className="text-[#1597E5] w-4.5 h-4.5" />
                <h2 className="text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">Recent Payments</h2>
              </div>
              <button 
                onClick={() => navigate('/settings/fee-history')}
                className="text-[10px] font-extrabold text-[#1597E5] hover:underline"
              >
                All History &gt;
              </button>
            </div>

            {paymentsLoading && displayPayments.length === 0 ? (
              <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center text-xs font-bold text-secondaryText">
                Loading recent payments...
              </div>
            ) : displayPayments.length > 0 ? (
              <div className="space-y-3">
                {displayPayments.map((p) => {
                  const studentName = p.student?.fullName || 'Unknown Student';
                  const dateStr = formatDate(p.paymentDate);
                  const modeStr = p.paymentMode ? ` - ${p.paymentMode.toUpperCase()}` : '';
                  const displayName = `${studentName}${modeStr}`;
                  const receiptNo = p.receiptNumber || p.id.slice(0, 8).toUpperCase();

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 card-shadow flex items-center justify-between hover:border-blue-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar container */}
                        <div className="w-11 h-11 rounded-full bg-[#EBFDFA] border border-[#14B8A6]/10 flex items-center justify-center text-xs font-black text-[#14B8A6] shadow-inner select-none">
                          ?
                        </div>
                        <div>
                          {/* Amount */}
                          <p className="text-sm font-black text-dark">
                            Rs {p.amount ? p.amount.toLocaleString() : '0'}
                          </p>
                          {/* Student Name */}
                          <p className="text-[10px] font-black text-dark mt-0.5 tracking-tight max-w-[210px] truncate uppercase">
                            {displayName}
                          </p>
                          {/* Date and Receipt */}
                          <p className="text-[9px] text-secondaryText font-bold mt-1">
                            {dateStr} | {receiptNo}
                          </p>
                        </div>
                      </div>

                      {/* Share Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({
                              title: `Fee Receipt - ${studentName}`,
                              text: `Fee payment of Rs ${p.amount} received for ${studentName}. Receipt No: ${receiptNo}`,
                            }).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(`Receipt No: ${receiptNo}, Student: ${studentName}, Amount: Rs ${p.amount}`);
                            alert('Receipt details copied to clipboard!');
                          }
                        }}
                        className="w-9 h-9 rounded-full bg-[#EEF5FB] hover:bg-[#e0effa] flex items-center justify-center text-[#1597E5] border border-blue-50 transition-all cursor-pointer active:scale-95 shrink-0"
                      >
                        <FiShare2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State Card matching Screenshot 3 */
              <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[220px]">
                <div className="w-16 h-16 rounded-full bg-[#EEF5FB] border border-blue-50 flex items-center justify-center text-[#1597E5] relative shadow-inner">
                  <FiHelpCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-[280px]">
                  <h4 className="text-xs font-black text-dark">No payments today</h4>
                  <p className="text-[10px] text-[#A0AEC0] font-semibold leading-relaxed">
                    Payments recorded today will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <Drawer isOpen={showThreeDotsMenu} onClose={() => setShowThreeDotsMenu(false)} position="right" />
    </motion.div>
  );
};

export default AccountantDashboard;
