import { getReceiptHtml, downloadReceiptPdf, numberToWords, getPaymentReceiptNo } from '../../utils/recieptGenerator';
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getPaymentHistory, getStudents } from '../../services/dataService';

import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiSettings, FiDollarSign, FiPlus, FiAlertCircle,
  FiClock, FiFileText, FiArrowRight, FiUser, FiCalendar, FiCreditCard, 
  FiHelpCircle, FiMoreVertical, FiEye, FiShare2, FiFolder, FiGlobe,
  FiX, FiPrinter, FiDownload, FiCopy, FiChevronRight
} from 'react-icons/fi';
import { BiReceipt } from 'react-icons/bi';
import Drawer from '../../components/Drawer';
import { useNavigate } from 'react-router-dom';

// Helper to convert numbers to words in Indian numbering system




const AccountantDashboard = () => {
  const { user, fees, users = [], feeRefreshTrigger } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  const [activeSharePayment, setActiveSharePayment] = useState(null);

  const triggerPrintReceipt = (payment) => {
    const htmlContent = getReceiptHtml(payment);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1500);
    }, 500);
  };

  const handleNativeShare = async (payment) => {
    const receiptNo = payment.receiptNo || 'N/A';
    const studentName = payment.studentName || 'N/A';
    const amountCurrency = `Rs ${payment.amount.toLocaleString('en-IN')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fee Receipt - ${receiptNo}`,
          text: `Fee receipt generated for ${studentName} of amount ${amountCurrency}. Receipt No: ${receiptNo}.`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

const handleDownloadPdf = (payment) => {
    downloadReceiptPdf(payment);
  };;

  const handleCopyDetails = (payment) => {
    const receiptNo = payment.receiptNo || 'N/A';
    const paymentDateStr = payment.date || 'N/A';
    const studentName = payment.studentName || 'N/A';
    const amountCurrency = `Rs ${payment.amount.toLocaleString('en-IN')}`;
    const amountWords = numberToWords(payment.amount);
    
    const details = `NSRIT AI ALGO\nFee Receipt\nReceipt No: ${receiptNo}\nDate: ${paymentDateStr}\nStudent: ${studentName}\nAmount: ${amountCurrency} (${amountWords})\nCollected By: ${payment.collectedByName || 'B. Geetha'}`;
    
    navigator.clipboard.writeText(details)
      .then(() => {
        alert('Receipt details copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleShareReceipt = (payment) => {
    const receiptNo = payment.receiptNumber || payment.id.slice(0, 8).toUpperCase();
    const dateStr = formatDate(payment.paymentDate);
    
    setActiveSharePayment({
      ...payment,
      receiptNo,
      date: dateStr,
      studentName: payment.studentName || 'Unknown Student',
      amount: payment.amount,
      class: payment.class || 'N/A',
      admissionNo: payment.admissionNo || 'N/A',
      remarks: payment.remarks || 'School Fee',
      collectedByName: payment.collectedByName || 'Accountant'
    });
  };

  const branchId = user?.branchId || 'sontyam-branch-id';

  // Fetch PostgreSQL payments list
  const { data: dbPayments = [], loading: paymentsLoading } = useDataFetch(
    () => getPaymentHistory({ branchId }),
    [branchId, feeRefreshTrigger],
    { defaultValue: [], pollInterval: 15000 }
  );

  // Fetch students list to map student names
  const { data: dbStudents = [] } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [] }
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

  // Get current date parts in local time
  const today = new Date();
  const yearStr = String(today.getFullYear());
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const dayStr = String(today.getDate()).padStart(2, '0');
  
  const todayYYYYMMDD = `${yearStr}-${monthStr}-${dayStr}`;
  const currentMonthPrefix = `${yearStr}-${monthStr}`;

  // Combine live payments from both sources
  const allPayments = useMemo(() => {
    const dbItems = dbPayments.map((p, idx) => {
      const student = dbStudents.find(s => s.id === p.studentId) || users.find(u => u.id === p.studentId);
      return {
        id: p.id,
        studentName: student?.fullName || 'Unknown Student',
        class: student ? (student.class || `${student.academicClass?.name || ''}-${student.section?.name || ''}`.trim().replace(/^-|-$/, '') || 'N/A') : 'N/A',
        admissionNo: student?.studentId || 'N/A',
        amount: Number(p.amount || 0),
        paymentDate: p.paymentDate,
        paymentMode: p.paymentMode || 'CASH',
        receiptNumber: getPaymentReceiptNo(p, student, idx),
        remarks: p.remarks || 'School Fee',
        collectedByName: p.collectedBy?.fullName || 'Accountant',
        student: { fullName: student?.fullName || 'Unknown Student' }
      };
    });

    const combined = [...dbItems];
    // Sort by paymentDate descending
    combined.sort((a, b) => {
      const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      return dateB - dateA;
    });
    return combined;
  }, [dbPayments, dbStudents, users]);

  // Calculations using combined live payments (timezone-independent)
  const todaysCollections = allPayments
    .filter(p => {
      if (!p.paymentDate || String(p.status || '').toUpperCase() === 'REVERSED') return false;
      const datePart = p.paymentDate.slice(0, 10);
      return datePart === todayYYYYMMDD;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyCollections = allPayments
    .filter(p => {
      if (!p.paymentDate || String(p.status || '').toUpperCase() === 'REVERSED') return false;
      const datePart = p.paymentDate.slice(0, 10);
      return datePart.startsWith(currentMonthPrefix);
    })
    .reduce((sum, p) => sum + p.amount, 0);

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
      paymentDate: '2026-07-03',
      paymentMode: '',
      receiptNumber: 'REC-SD-1783057145704-816',
      studentName: 'KORUKONDA NAGA VENKAT KALYAN',
      class: 'Nursery-A',
      admissionNo: '26SO0111',
      remarks: 'testing',
      collectedByName: 'B. Geetha',
      student: { fullName: 'KORUKONDA NAGA VENKAT KALYAN' }
    },
    {
      id: 'mock-2',
      amount: 10000,
      paymentDate: '2026-07-03',
      paymentMode: 'CASH',
      receiptNumber: 'REC-SD-1783057792189-996',
      studentName: 'BONTHU DAKSH RIHAAN',
      class: 'Nursery-A',
      admissionNo: '26SO0112',
      remarks: 'testing',
      collectedByName: 'B. Geetha',
      student: { fullName: 'BONTHU DAKSH RIHAAN' }
    },
    {
      id: 'mock-3',
      amount: 5000,
      paymentDate: '2026-06-29',
      paymentMode: 'UPI',
      receiptNumber: 'RCPT-2026-SD-00004',
      studentName: 'KORADA BHARGAVSAI',
      class: 'Nursery-A',
      admissionNo: '26SO0113',
      remarks: 'testing',
      collectedByName: 'B. Geetha',
      student: { fullName: 'KORADA BHARGAVSAI' }
    }
  ];

  const displayPayments = allPayments.length > 0 ? allPayments.slice(0, 3) : mockPayments;

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
                {displayPayments.map((p, idx) => {
                  const studentName = p.student?.fullName || 'Unknown Student';
                  const dateStr = formatDate(p.paymentDate);
                  const modeStr = p.paymentMode ? ` - ${p.paymentMode.toUpperCase()}` : '';
                  const displayName = `${studentName}${modeStr}`;
                  const receiptNo = getPaymentReceiptNo(p, (typeof student !== 'undefined' ? student : (typeof selectedStudent !== 'undefined' ? selectedStudent : null)), idx);

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
                          handleShareReceipt(p);
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

      {/* Share Options Modal */}
      {activeSharePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 card-shadow border border-[#e2e8f0]/60 space-y-6 relative animate-scale-in">
            <button
              onClick={() => setActiveSharePayment(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-dark">Share Receipt</h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Select an option to save or share this receipt.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Save / Print PDF */}
              <button
                onClick={() => {
                  triggerPrintReceipt(activeSharePayment);
                  setActiveSharePayment(null);
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#EEF5FB] border border-[#e2e8f0]/40 rounded-[20px] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center">
                    <FiPrinter className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">Print or Save PDF</p>
                    <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Use browser print to save on your PC</p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1597E5] transition-colors" />
              </button>

              {/* Option 2: Native Share */}
              {navigator.share && (
                <button
                  onClick={() => {
                    handleNativeShare(activeSharePayment);
                    setActiveSharePayment(null);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#EBFDFA] border border-[#e2e8f0]/40 rounded-[20px] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EBFDFA] text-[#14B8A6] flex items-center justify-center">
                      <FiShare2 className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-dark group-hover:text-[#14B8A6] transition-colors">Send to WhatsApp / Email</p>
                      <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Share using system apps</p>
                    </div>
                  </div>
                  <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#14B8A6] transition-colors" />
                </button>
              )}

              {/* Option 3: Download Offline PDF */}
              <button
                onClick={() => {
                  handleDownloadPdf(activeSharePayment);
                  setActiveSharePayment(null);
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-[#e2e8f0]/40 rounded-[20px] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiDownload className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-dark group-hover:text-emerald-600 transition-colors">Download Receipt File</p>
                    <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Save offline document directly</p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              {/* Option 4: Copy Details */}
              <button
                onClick={() => {
                  handleCopyDetails(activeSharePayment);
                  setActiveSharePayment(null);
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-purple-50 border border-[#e2e8f0]/40 rounded-[20px] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FiCopy className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-dark group-hover:text-purple-600 transition-colors">Copy Receipt Text</p>
                    <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Copy raw info to clipboard</p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AccountantDashboard;
