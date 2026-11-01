import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiSearch, FiGrid, FiSliders, FiClock,
  FiBookOpen, FiFileText, FiInbox
} from 'react-icons/fi';
import { BiReceipt } from 'react-icons/bi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getFeeReports } from '../../../services/dataService';


const FeeOverview = () => {
  const { activeRole, user, currentBranchContext, feeRefreshTrigger } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Paid' | 'Partial' | 'Due' | 'Overdue'
  const [selectedYear, setSelectedYear] = useState('ALL');


  const branchId = activeRole?.toUpperCase() === 'MAIN_ADMIN'
    ? currentBranchContext?.id || null
    : user?.branchId || null;

  // Fetch real-time student fee plans and payment history
  const { data: rawFeePlans } = useDataFetch(
    () => getFeeReports({ branchId }),
    [branchId, feeRefreshTrigger],
    { defaultValue: { students: [] }, pollInterval: 15000, skip: !branchId }
  );

  const studentsList = useMemo(() => rawFeePlans?.students || [], [rawFeePlans]);

  const availableYears = useMemo(() => [...new Set(studentsList.flatMap((student) =>
    (student.reportFeePlans || [])
      .filter((plan) => plan.isActive !== false && plan.academicYear)
      .map((plan) => Number(plan.academicYear))
  ))].sort((a, b) => b - a), [studentsList]);


  // Parse actual student ledger records from DB
  const studentLedgers = useMemo(() => {
    return studentsList.map(s => {
      const activePlans = (s.reportFeePlans || []).filter((plan) =>
        plan.isActive !== false && (selectedYear === 'ALL' || Number(plan.academicYear) === selectedYear)
      );
      if (!activePlans.length) {
        return {
          id: s.id,
          fullName: s.fullName,
          className: `${s.academicClass?.name || ''} - ${s.section?.name || ''}`.trim().replace(/^-|-$/, ''),
          paidAmount: 0,
          dueAmount: 0,
          totalAmount: 0,
          concessionAmount: 0,
          status: 'DUE',
          percent: 0
        };
      }

      const totals = activePlans.reduce((summary, plan) => {
        const planPaid = (plan.reportFeePayments || []).reduce((sum, payment) =>
          String(payment.status || 'RECORDED').toUpperCase() === 'REVERSED'
            ? sum
            : sum + Number(payment.amount || 0), 0);
        summary.total += Number(plan.totalAmount || 0);
        summary.paid += planPaid;
        summary.concession += Number(plan.concessionAmount || 0);
        return summary;
      }, { total: 0, paid: 0, concession: 0 });

      const due = Math.max(totals.total - totals.paid, 0);
      const pct = totals.total > 0 ? Math.round((totals.paid / totals.total) * 100) : 0;
      let status = 'DUE';
      if (due === 0) status = 'PAID';
      else if (totals.paid > 0) status = 'PARTIAL';

      return {
        id: s.id,
        fullName: s.fullName,
        className: `${s.academicClass?.name || ''} - ${s.section?.name || ''}`.trim().replace(/^-|-$/, ''),
        paidAmount: totals.paid,
        dueAmount: due,
        totalAmount: totals.total,
        concessionAmount: totals.concession,
        status,
        percent: pct
      };
    });
  }, [studentsList, selectedYear]);

  // Aggregated values calculation (collected, pending, waiver, and percentage)
  const aggregatedStats = useMemo(() => {
    let total = 0;
    let paid = 0;
    let due = 0;
    let paidCount = 0;
    let pendingCount = 0;

    const listToUse = studentLedgers;

    listToUse.forEach(item => {
      total += item.totalAmount;
      paid += item.paidAmount;
      due += item.dueAmount;
      if (item.totalAmount > 0) {
        if (item.dueAmount === 0) paidCount++;
        else pendingCount++;
      }
    });

    const rate = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, due, paidCount, pendingCount, rate, list: listToUse };
  }, [studentLedgers]);

  // Filter students based on active filters and queries
  const filteredLedgers = useMemo(() => {
    let res = aggregatedStats.list;
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(item => item.fullName.toLowerCase().includes(q) || item.className.toLowerCase().includes(q));
    }
    if (activeTab !== 'All') {
      const targetStatus = activeTab === 'Overdue' ? 'DUE' : activeTab.toUpperCase();
      res = res.filter(item => item.status === targetStatus);
    }
    return res;
  }, [aggregatedStats.list, search, activeTab]);

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
    { label: 'Class Fees', sub: 'Setup', icon: <FiGrid className="w-5 h-5 animate-pulse" /> },
    { label: 'Fee Plans', sub: 'Manage', icon: <FiSliders className="w-5 h-5 animate-pulse" /> },
    { label: 'Collection', sub: 'Record', icon: <BiReceipt className="w-5 h-5 animate-pulse" /> },
    { label: 'History', sub: 'View', icon: <FiClock className="w-5 h-5 animate-pulse" /> },
    { label: 'Ledger', sub: 'Open', icon: <FiBookOpen className="w-5 h-5 animate-pulse" /> },
    { label: 'Reports', sub: 'View', icon: <FiFileText className="w-5 h-5 animate-pulse" /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Fees</h1>
      </header>

      {/* Top Curved Blue Header Card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Subtitle */}
        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE DESK</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Fee Dashboard</h2>
        <p className="text-xs text-white/80 font-medium relative z-10">Collection, dues, and student ledger overview</p>
      </div>

      {/* Academic year filters */}
      <div className="flex gap-2.5 select-none">
        <button onClick={() => setSelectedYear('ALL')} className={`px-5 py-2 rounded-full text-[10px] font-extrabold shadow-sm border ${selectedYear === 'ALL' ? 'bg-[#1597E5] text-white border-[#1597E5]' : 'bg-white border-[#e2e8f0] text-secondaryText'}`}>
          All Years
        </button>
        {availableYears.map((year) => (
          <button key={year} onClick={() => setSelectedYear(year)} className={`px-5 py-2 rounded-full text-[10px] font-extrabold shadow-sm border ${selectedYear === year ? 'bg-[#1597E5] text-white border-[#1597E5]' : 'bg-white border-[#e2e8f0] text-secondaryText'}`}>
            AY {year}
          </button>
        ))}
      </div>

      {/* Collection Rate Summary Card */}
      <div className="bg-white rounded-[28px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-black text-dark block leading-none">
              Collection Rate
            </span>
            <p className="text-[10px] text-[#A0AEC0] font-bold">
              {aggregatedStats.paidCount} paid · {aggregatedStats.pendingCount} pending
            </p>
          </div>
          <span className="text-2xl font-black text-rose-500">{aggregatedStats.rate}%</span>
        </div>

        {/* Collection progress bar */}
        <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#1597E5] h-full rounded-full transition-all duration-500"
            style={{ width: `${aggregatedStats.rate}%` }}
          />
        </div>

        {/* Triple column statistics */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center divide-x divide-[#e2e8f0]/75">
          <div className="space-y-0.5">
            <p className="text-xs font-black text-dark">Rs {aggregatedStats.total.toLocaleString()}</p>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Total</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-emerald-500">Rs {aggregatedStats.paid.toLocaleString()}</p>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Paid</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-rose-500 flex items-center justify-center gap-0.5">
              Rs {aggregatedStats.due.toLocaleString()}
            </p>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Due</p>
          </div>
        </div>
      </div>

      {/* 6 Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleAction(action.label)}
            className="bg-white rounded-[24px] p-4 border border-[#e2e8f0]/45 card-shadow flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue/30 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center mb-2 transition-all group-hover:scale-105 border border-brand-blue/5">
              {action.icon}
            </div>
            <span className="text-[10px] font-extrabold text-dark block leading-tight">{action.label}</span>
            <span className="text-[7.5px] text-[#A0AEC0] font-bold uppercase mt-0.5 block tracking-wider">{action.sub}</span>
          </button>
        ))}
      </div>

      {/* STUDENT LEDGERS Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1">
          Student Ledgers
        </h3>

        {/* Search Input */}
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

        {/* Filter Tabs matching Screenshot 1 */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none select-none">
          {['All', 'Paid', 'Partial', 'Due', 'Overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-brand-blue/20'
                  : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Student Cards List */}
        <div className="space-y-4">
          {filteredLedgers.map((ledger) => {
            const accent = ledger.status === 'PAID' || ledger.dueAmount === 0 ? 'bg-[#20B98B]' : 'bg-[#F5A400]';
            return (
              <article key={ledger.id} className="relative min-h-[250px] overflow-hidden rounded-[30px] border border-[#B8DDF5] bg-white px-7 pb-7 pt-8 shadow-[0_8px_20px_rgba(34,136,201,0.14)] sm:px-8">
                <span className={`absolute inset-x-0 top-0 h-[5px] ${accent}`} />

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-[13px] font-black uppercase leading-tight tracking-[0.08em] text-[#111827] sm:text-sm">{ledger.fullName}</h4>
                    <p className="mt-2 text-[12px] font-semibold text-[#64748B] sm:text-sm">{ledger.className}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-xs font-extrabold capitalize ${
                    ledger.status === 'PAID' ? 'bg-[#E4F8EF] text-[#18A875]' :
                    ledger.status === 'PARTIAL' ? 'bg-[#FFF1D5] text-[#D88C00]' :
                    'bg-[#FFE4E6] text-[#EF476F]'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${ledger.status === 'PAID' ? 'bg-[#20B98B]' : ledger.status === 'PARTIAL' ? 'bg-[#F5A400]' : 'bg-[#FF445D]'}`} />
                    {ledger.status.toLowerCase()}
                  </span>
                </div>

                <div className="mt-7 h-3 w-full overflow-hidden rounded-full bg-[#E3F0FF]">
                  {ledger.percent > 0 && <div className={`h-full rounded-full ${accent}`} style={{ width: `${ledger.percent}%` }} />}
                </div>

                <div className="mt-7 grid grid-cols-[1fr_1fr_auto] items-end gap-4 font-sans">
                  <div className="text-left">
                    <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#475569]">Paid</span>
                    <p className="mt-3 text-[25px] font-black leading-none text-[#20B98B]">Rs {ledger.paidAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#475569]">Due</span>
                    <p className={`mt-3 text-[25px] font-black leading-none ${ledger.dueAmount > 0 ? 'text-[#F04444]' : 'text-[#111827]'}`}>Rs {ledger.dueAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`mb-[-2px] flex min-w-[68px] items-center justify-center rounded-full px-4 py-3 text-sm font-black leading-none ${
                    ledger.status === 'PAID' ? 'bg-[#E4F8EF] text-[#18A875]' :
                    ledger.status === 'PARTIAL' ? 'bg-[#F2F8FC] text-[#F5A400]' :
                    'bg-[#F2F8FC] text-[#20B98B]'
                  }`}>{ledger.percent}%</span>
                </div>
              </article>
            );
          })}

          {filteredLedgers.length === 0 && (
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
      </div>
    </motion.div>
  );
};

export default FeeOverview;
