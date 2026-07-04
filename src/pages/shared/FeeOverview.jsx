import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiSearch, FiGrid, FiSliders, FiPlusCircle, FiClock,
  FiBookOpen, FiFileText, FiInbox, FiTrendingUp, FiCreditCard, FiChevronRight
} from 'react-icons/fi';
import { BiReceipt } from 'react-icons/bi';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getFeeReports, getStudentFeeProfile, getParentChildrenByUser } from '../../services/dataService';

const FeeOverview = () => {
  const { activeRole, user } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Paid' | 'Partial' | 'Due' | 'Other'

  // Parent Wards data fetching
  const parentUserId = user?.id || user?.uid || null;
  const { data: childrenWithFees, loading: parentLoading } = useDataFetch(
    async () => {
      if (activeRole !== 'PARENT' || !parentUserId) return [];
      const children = await getParentChildrenByUser(parentUserId);
      const studentDetails = await Promise.all(
        children.map(async (cp) => {
          const studentId = cp.student?.id;
          if (!studentId) return cp.student;
          try {
            const profile = await getStudentFeeProfile(studentId);
            return {
              ...cp.student,
              feeProfile: profile.student
            };
          } catch (err) {
            console.error('Error fetching fee profile for student:', studentId, err);
            return cp.student;
          }
        })
      );
      return studentDetails.filter(Boolean);
    },
    [parentUserId, activeRole],
    { defaultValue: [] }
  );

  // Calculate parent stats
  const parentStats = useMemo(() => {
    let totalPaid = 0;
    let outstanding = 0;

    childrenWithFees.forEach(student => {
      const activePlans = (student.feeProfile?.profileFeePlans || []).filter(fp => fp.isActive !== false);
      activePlans.forEach(plan => {
        outstanding += plan.totalAmount || 0;
        const paid = (plan.profileFeePayments || [])
          .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        totalPaid += paid;
      });
    });

    outstanding = Math.max(outstanding - totalPaid, 0);
    return { totalPaid, outstanding };
  }, [childrenWithFees]);

  // Staff Data Fetching (if activeRole !== 'PARENT')
  const branchId = user?.branchId || 'sontyam-branch-id';
  const { data: rawFeeReports, loading: staffLoading } = useDataFetch(
    () => getFeeReports({ branchId }),
    [branchId],
    { defaultValue: { students: [] }, skip: activeRole === 'PARENT', pollInterval: 15000 }
  );

  const allStudents = rawFeeReports?.students || [];

  // If coordinator, filter by wing
  const filteredStudentsForStaff = useMemo(() => {
    if (activeRole === 'COORDINATOR' && user?.wing) {
      return allStudents.filter(
        s => s.academicClass?.wing?.code?.toUpperCase() === user.wing.toUpperCase()
      );
    }
    return allStudents;
  }, [allStudents, activeRole, user?.wing]);

  // Compute staff aggregates
  const staffStats = useMemo(() => {
    let totalFees = 0;
    let totalCollected = 0;
    let totalDues = 0;
    let paidCount = 0;
    let pendingCount = 0;

    filteredStudentsForStaff.forEach(s => {
      const activePlans = (s.reportFeePlans || []).filter(fp => fp.isActive !== false);
      let studentTotal = 0;
      let studentPaid = 0;

      activePlans.forEach(plan => {
        studentTotal += plan.totalAmount || 0;
        studentPaid += (plan.reportFeePayments || [])
          .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      });

      totalFees += studentTotal;
      totalCollected += studentPaid;

      if (studentTotal > 0) {
        if (studentPaid >= studentTotal) {
          paidCount++;
        } else {
          pendingCount++;
        }
      }
    });

    totalDues = Math.max(totalFees - totalCollected, 0);
    const collectionRate = totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 0;

    return { totalFees, totalCollected, totalDues, collectionRate, paidCount, pendingCount };
  }, [filteredStudentsForStaff]);

  // Get and filter student records for the table/list
  const normalizedRecords = useMemo(() => {
    return filteredStudentsForStaff.map(s => {
      const activePlans = (s.reportFeePlans || []).filter(fp => fp.isActive !== false);
      let total = 0;
      let paid = 0;
      activePlans.forEach(plan => {
        total += plan.totalAmount || 0;
        paid += (plan.reportFeePayments || [])
          .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      });
      const due = Math.max(total - paid, 0);
      let status = 'DUE';
      if (total > 0) {
        if (paid >= total) status = 'PAID';
        else if (paid > 0) status = 'PARTIAL';
      } else {
        status = 'PAID'; // no fees assigned means paid
      }

      return {
        id: s.id,
        name: s.fullName || 'Unknown Student',
        class: `${s.academicClass?.name || 'N/A'}-${s.section?.name || 'N/A'}`.toUpperCase(),
        admissionNo: s.studentId || 'N/A',
        total,
        paid,
        due,
        status
      };
    });
  }, [filteredStudentsForStaff]);

  // Apply search and tab filters
  const searchedRecords = useMemo(() => {
    return normalizedRecords.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                            r.admissionNo.toLowerCase().includes(search.toLowerCase());

      const matchesTab = activeTab === 'All' ||
                         (activeTab === 'Paid' && r.status === 'PAID') ||
                         (activeTab === 'Partial' && r.status === 'PARTIAL') ||
                         (activeTab === 'Due' && r.status === 'DUE') ||
                         (activeTab === 'Other' && r.status !== 'PAID' && r.status !== 'PARTIAL' && r.status !== 'DUE');

      return matchesSearch && matchesTab;
    });
  }, [normalizedRecords, search, activeTab]);

  if (activeRole === 'PARENT') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto relative select-none animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fee Payments</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Curved blue card */}
            <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden space-y-5">
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

              {/* Header Row with Icon */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0">
                  <FiCreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Fee Payments</h2>
                  <p className="text-[11px] text-white/80 font-bold mt-0.5">Track and manage your ward's fee status</p>
                </div>
              </div>

              {/* Stat Block */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[9.5px] text-white/70 font-black uppercase tracking-wider">Total Paid</p>
                  <p className="text-lg font-black mt-0.5">Rs {parentStats.totalPaid.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[9.5px] text-white/70 font-black uppercase tracking-wider">Outstanding</p>
                  <p className="text-lg font-black mt-0.5 text-[#ffb4b4]">Rs {parentStats.outstanding.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* How to pay box */}
            <div className="bg-[#FAF7FF] border border-[#e2def0]/50 p-4 rounded-[24px] flex gap-3.5 card-shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#EBE5FF] text-[#7B4DFF] flex items-center justify-center shrink-0 border border-[#7B4DFF]/5">
                🏦
              </div>
              <div>
                <h4 className="text-xs font-black text-[#5C2BFF]">How to pay</h4>
                <p className="text-[10px] text-secondaryText font-bold mt-1 leading-relaxed">
                  Visit the school accounts office to pay fees in person. Bring the fee ledger as reference.
                </p>
              </div>
            </div>

            {parentLoading ? (
              <div className="text-center py-6 text-xs text-secondaryText font-bold">Loading ward fee status...</div>
            ) : childrenWithFees.length === 0 ? (
              <div className="text-center py-6 text-xs text-secondaryText font-bold">No registered wards found.</div>
            ) : childrenWithFees.map((student) => {
              let total = 0;
              let paid = 0;
              const activePlans = (student.feeProfile?.profileFeePlans || []).filter(fp => fp.isActive !== false);
              activePlans.forEach(plan => {
                total += plan.totalAmount || 0;
                paid += (plan.profileFeePayments || [])
                  .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
                  .reduce((sum, p) => sum + Number(p.amount || 0), 0);
              });
              const balance = Math.max(total - paid, 0);
              const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
              const initials = student.fullName ? student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ST';

              return (
                <div key={student.id} className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow flex flex-col gap-4 relative overflow-hidden">
                  {/* Header row */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] font-bold text-xs shrink-0 select-none">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-[#0F172A] leading-tight">
                          {student.fullName}
                        </h3>
                        <p className="text-[10px] text-secondaryText font-bold mt-0.5">
                          Class: {student.academicClass?.name || 'N/A'} - {student.section?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[8.5px] font-black rounded-lg uppercase tracking-wider border ${
                      balance === 0 ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-[#FF3B30] border-red-100'
                    }`}>
                      {balance === 0 ? 'Paid' : 'Due'}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 pt-3.5 font-sans">
                    <div>
                      <span className="text-[9.5px] font-bold text-secondaryText uppercase tracking-wider">Total</span>
                      <p className="text-xs font-black text-[#0F172A] mt-1">Rs {total.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-secondaryText uppercase tracking-wider">Paid</span>
                      <p className="text-xs font-black text-[#23C16B] mt-1">Rs {paid.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-secondaryText uppercase tracking-wider">Balance</span>
                      <p className="text-xs font-black text-[#FF3B30] mt-1">Rs {balance.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Progress Percent Text */}
                  <p className="text-[9.5px] font-black text-secondaryText mt-1">
                    {percent}% of fees paid
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#EEF5FB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0088ff] h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                  </div>

                  {/* View Fee Ledger Button */}
                  <button
                    onClick={() => navigate('/settings/ledger', { state: { studentId: student.id } })}
                    className="w-full py-3 bg-[#EEF5FB] hover:bg-[#e2effa] text-[#0088ff] rounded-[16px] text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Fee Ledger</span>
                    <span className="text-[9px]">&gt;</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="px-1 text-[10.5px] font-extrabold text-secondaryText tracking-wider uppercase">
              Accepted Payment Methods
            </h3>

            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/60 card-shadow">
              {[
                { title: 'Cash', desc: 'At the school accounts counter', icon: '💵', color: 'bg-emerald-50 text-emerald-600' },
                { title: 'Bank Transfer / NEFT', desc: 'Contact office for bank details', icon: '🏦', color: 'bg-blue-50 text-[#0088ff]' },
                { title: 'UPI / QR Code', desc: 'Scan at the accounts office', icon: '📱', color: 'bg-cyan-50 text-[#00acc1]' },
                { title: 'Cheque / DD', desc: 'Payable to school management', icon: '💳', color: 'bg-indigo-50 text-indigo-600' }
              ].map((method, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-[#EEF5FB]/10 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg border border-slate-100 ${method.color}`}>
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-dark">{method.title}</h4>
                    <p className="text-[9.5px] text-secondaryText font-bold mt-0.5">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleAction = (label) => {
    if (label === 'Class Fees') {
      navigate('/settings/class-fee-templates');
    } else if (label === 'Fee Plans') {
      navigate('/settings/fee-plans');
    } else if (label === 'Collection') {
      navigate('/settings/collection');
    } else if (label === 'Ledger') {
      navigate('/settings/ledger');
    } else if (label === 'History') {
      navigate('/settings/fee-history');
    } else if (label === 'Reports') {
      navigate('/settings/fee-reports');
    }
  };

  const quickActions = [
    { label: 'Class Fees', sub: 'Setup', icon: <FiGrid className="w-5 h-5" /> },
    { label: 'Fee Plans', sub: 'Manage', icon: <FiSliders className="w-5 h-5" /> },
    { label: 'Collection', sub: 'Record', icon: <BiReceipt className="w-5 h-5" /> },
    { label: 'Ledger', sub: 'Open', icon: <FiBookOpen className="w-5 h-5" /> },
    { label: 'History', sub: 'View', icon: <FiClock className="w-5 h-5" /> },
    { label: 'Reports', sub: 'View', icon: <FiFileText className="w-5 h-5" /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fees</h1>
      </header>

      {/* Top Curved Blue Header Card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Subtitle */}
        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE DESK</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10">Fee Dashboard</h2>
        <p className="text-xs text-white/80 font-medium relative z-10">Collection, dues, and student ledger overview</p>
      </div>

      {/* Collection Rate Summary Card */}
      <div className="bg-white rounded-[28px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-dark block leading-none">
              Collection Rate
            </span>
            <p className="text-[10px] text-[#A0AEC0] font-bold">
              {staffStats.paidCount} paid · {staffStats.pendingCount} pending
            </p>
          </div>
          <span className="text-2xl font-black text-accent-red">{staffStats.collectionRate}%</span>
        </div>

        {/* Thin progress bar */}
        <div className="w-full bg-[#EEF5FB] h-1.5 rounded-full overflow-hidden">
          <div className="bg-accent-red h-full rounded-full transition-all duration-300" style={{ width: `${staffStats.collectionRate}%` }} />
        </div>

        {/* Triple column statistics */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center divide-x divide-[#e2e8f0]/75">
          <div className="space-y-0.5">
            <p className="text-xs font-black text-dark">Rs {staffStats.totalFees.toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Total</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-accent-green">Rs {staffStats.totalCollected.toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Paid</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-accent-red flex items-center justify-center gap-0.5">
              Rs {staffStats.totalDues.toLocaleString('en-IN')}
              <span className="text-[8px] opacity-75">↗️</span>
            </p>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Due</p>
          </div>
        </div>
      </div>

      {/* 6 Quick Action Grid */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleAction(action.label)}
            className="bg-white rounded-[24px] p-5 border border-[#e2e8f0]/45 card-shadow flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue/30 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center mb-2.5 transition-all group-hover:scale-105 border border-brand-blue/5">
              {action.icon}
            </div>
            <span className="text-[11px] font-extrabold text-dark block leading-tight">{action.label}</span>
            <span className="text-[8px] text-[#A0AEC0] font-bold uppercase mt-1 block tracking-wider">{action.sub}</span>
          </button>
        ))}
      </div>

      {/* STUDENT LEDGERS Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
          Student Ledgers
        </h3>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search student fees"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none select-none">
          {['All', 'Paid', 'Partial', 'Due', 'Other'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results list */}
        {staffLoading ? (
          <div className="text-center py-12 text-xs font-bold text-secondaryText font-medium">
            Loading branch fee records...
          </div>
        ) : searchedRecords.length > 0 ? (
          <div className="space-y-3">
            {searchedRecords.map((student) => (
              <div
                key={student.id}
                onClick={() => navigate('/settings/ledger', { state: { studentId: student.id } })}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center text-xs font-black shadow-inner">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-[9.5px] text-[#A0AEC0] font-bold mt-0.5">
                      Class: {student.class} · ID: {student.admissionNo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                    student.status === 'PAID' ? 'bg-emerald-50 text-emerald-500' :
                    student.status === 'PARTIAL' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {student.status === 'PAID' ? 'Paid' : `Due: Rs ${student.due.toLocaleString('en-IN')}`}
                  </span>
                  <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State Panel */
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
            <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10">
              <FiInbox className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-[260px]">
              <h4 className="text-xs font-extrabold text-dark">No fee records</h4>
              <p className="text-[10px] text-[#A0AEC0] font-semibold leading-relaxed">
                Try another filter or search term.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FeeOverview;
