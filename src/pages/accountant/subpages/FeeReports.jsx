import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiInbox, FiFileText, FiGrid } from 'react-icons/fi';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getFeeReports } from '../../../services/dataService';

const FeeReports = () => {
  const navigate = useNavigate();
  const { user, feeRefreshTrigger } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [firestorePayments, setFirestorePayments] = useState({});

  const branchId = user?.branchId || null;

  // Fetch PostgreSQL fee data
  const { data: rawFeePlans, loading } = useDataFetch(
    () => getFeeReports({ branchId }),
    [branchId, feeRefreshTrigger],
    { defaultValue: { students: [] }, pollInterval: 15000, skip: !branchId }
  );

  const studentsList = rawFeePlans?.students || [];

  // Fetch Firestore payments in real-time
  useEffect(() => {
    if (!branchId) return;
    const unsub = onSnapshot(collection(db, 'fee_payments'), (snapshot) => {
      const mapping = {};
      snapshot.forEach(docSnap => {
        mapping[docSnap.id] = docSnap.data().list || [];
      });
      setFirestorePayments(mapping);
    }, (err) => {
      console.warn('[FeeReports] Firestore collection query failed (normal if rules restrict it):', err.message);
    });
    return () => unsub();
  }, [branchId]);

  // Normalize student records
  const normalizedStudents = useMemo(() => {
    return studentsList.map(s => {
      const fsList = firestorePayments[s.id] || [];
      const activePlan = (s.reportFeePlans || []).find(p => p.isActive !== false);
      let paid = 0;
      let total = 0;
      let concession = 0;
      let pending = 0;
      let booksFee = 0;
      let transportFee = 0;
      let fsPaidForPlan = 0;

      if (activePlan) {
        const pgReceipts = new Set();
        (activePlan.reportFeePayments || []).forEach(pay => {
          if (String(pay.status || 'RECORDED').toUpperCase() !== 'REVERSED') {
            paid += pay.amount || 0;
            if (pay.receiptNumber) {
              pgReceipts.add(pay.receiptNumber.toUpperCase());
            }
          }
        });

        // Sum only Firestore payments not in Postgres
        fsList.forEach(p => {
          const key = (p.id || p.receiptNumber || '').toUpperCase();
          if (key && !pgReceipts.has(key)) {
            fsPaidForPlan += Number(p.amount || 0);
          }
        });

        total = activePlan.totalAmount || 0;
        concession = activePlan.concessionAmount || 0;
        booksFee = activePlan.booksFee || 0;
        transportFee = activePlan.transportFee || 0;
        pending = Math.max(total - (paid + fsPaidForPlan), 0);
      } else {
        fsPaidForPlan = fsList.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        total = fsPaidForPlan;
        pending = 0;
      }

      const paidTotal = paid + fsPaidForPlan;
      
      let status = 'Due';
      if (pending === 0) {
        status = 'Paid';
      } else if (paidTotal > 0 && pending > 0) {
        status = 'Partial';
      }

      return {
        id: s.id,
        fullName: s.fullName || 'Unknown Student',
        admissionNo: s.studentId || 'N/A',
        classId: s.academicClass?.id || '',
        className: s.academicClass?.name || 'N/A',
        sectionName: s.section?.name || '',
        classSection: `${s.academicClass?.name || ''}-${s.section?.name || ''}`.trim().replace(/^-|-$/, ''),
        paidAmount: paidTotal,
        dueAmount: pending,
        totalAmount: total,
        concessionAmount: concession,
        booksFee,
        transportFee,
        status
      };
    });
  }, [studentsList, firestorePayments]);

  // Compute overall branch statistics
  const stats = useMemo(() => {
    let total = 0;
    let collected = 0;
    let pending = 0;
    let concession = 0;

    normalizedStudents.forEach(s => {
      total += s.totalAmount;
      collected += s.paidAmount;
      pending += s.dueAmount;
      concession += s.concessionAmount;
    });

    return { total, collected, pending, concession };
  }, [normalizedStudents]);

  const formatINR = (val) => {
    return `Rs ${val.toLocaleString('en-IN')}`;
  };

  // Filter based on search query and tab pills
  const filteredStudents = useMemo(() => {
    let result = normalizedStudents;

    if (activeTab === 'Paid') {
      result = result.filter(s => s.status === 'Paid');
    } else if (activeTab === 'Partial') {
      result = result.filter(s => s.status === 'Partial');
    } else if (activeTab === 'Due') {
      result = result.filter(s => s.status === 'Due');
    } else if (activeTab === 'Concession') {
      result = result.filter(s => s.concessionAmount > 0);
    } else if (activeTab === 'Transport') {
      result = result.filter(s => s.transportFee > 0);
    } else if (activeTab === 'Books') {
      result = result.filter(s => s.booksFee > 0);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(s => 
        s.fullName.toLowerCase().includes(q) || 
        s.classSection.toLowerCase().includes(q)
      );
    }

    return result;
  }, [normalizedStudents, activeTab, search]);

  // Class-wise breakdown report (filtered by current search and tab context)
  const classBreakdown = useMemo(() => {
    const classMap = {};
    filteredStudents.forEach(s => {
      const cls = s.className;
      if (!classMap[cls]) {
        classMap[cls] = {
          name: cls,
          studentsCount: 0,
          collected: 0,
          pending: 0
        };
      }
      classMap[cls].studentsCount += 1;
      classMap[cls].collected += s.paidAmount;
      classMap[cls].pending += s.dueAmount;
    });

    const order = ['NURSERY', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
    return Object.values(classMap).sort((a, b) => {
      const idxA = order.indexOf(a.name.toUpperCase());
      const idxB = order.indexOf(b.name.toUpperCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredStudents]);

  // Exporters
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;
    const headers = ['Student Name', 'Admission No', 'Class-Section', 'Total Fee (Rs)', 'Paid Amount (Rs)', 'Pending Balance (Rs)', 'Concession (Rs)', 'Status'];
    const rows = filteredStudents.map(s => [
      s.fullName,
      s.admissionNo,
      s.classSection,
      s.totalAmount,
      s.paidAmount,
      s.dueAmount,
      s.concessionAmount,
      s.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_report_${activeTab.toLowerCase()}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) return;
    const headers = ['Student Name', 'Admission No', 'Class-Section', 'Total Fee (Rs)', 'Paid Amount (Rs)', 'Pending Balance (Rs)', 'Concession (Rs)', 'Status'];
    const rows = filteredStudents.map(s => [
      s.fullName,
      s.admissionNo,
      s.classSection,
      s.totalAmount,
      s.paidAmount,
      s.dueAmount,
      s.concessionAmount,
      s.status
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(e => e.join('\t'))].join('\n');
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const encodedUri = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_report_${activeTab.toLowerCase()}_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = ['All', 'Paid', 'Partial', 'Due', 'Concession', 'Transport', 'Books'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-[640px] mx-auto select-none animate-fade-in relative font-sans"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fee Reports</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10">Reports</h2>
        <p className="text-xs text-white/80 font-medium relative z-10 mb-4">
          Branch fee analytics
        </p>

        {/* Export Buttons */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#1597E5] text-[10px] font-black rounded-full border border-[#1597E5]/20 hover:bg-[#EEF5FB] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <FiFileText className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#1597E5] text-[10px] font-black rounded-full border border-[#1597E5]/20 hover:bg-[#EEF5FB] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <FiGrid className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Card */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 shadow-sm grid grid-cols-4 gap-2 text-center divide-x divide-slate-100 font-sans select-none">
        <div className="flex flex-col justify-center px-1">
          <span className="text-xs font-black text-[#0F172A]">{formatINR(stats.total)}</span>
          <span className="text-[7.5px] font-black text-[#718096] uppercase tracking-widest mt-1">TOTAL</span>
        </div>
        <div className="flex flex-col justify-center px-1">
          <span className="text-xs font-black text-[#23C16B]">{formatINR(stats.collected)}</span>
          <span className="text-[7.5px] font-black text-[#23C16B] uppercase tracking-widest mt-1">COLLECTED</span>
        </div>
        <div className="flex flex-col justify-center px-1">
          <span className="text-xs font-black text-[#FF3B30]">{formatINR(stats.pending)}</span>
          <span className="text-[7.5px] font-black text-[#FF3B30] uppercase tracking-widest mt-1">PENDING</span>
        </div>
        <div className="flex flex-col justify-center px-1">
          <span className="text-xs font-black text-[#FF9F0A]">{formatINR(stats.concession)}</span>
          <span className="text-[7.5px] font-black text-[#FF9F0A] uppercase tracking-widest mt-1">CONCESSION</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter by student, class"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] shadow-sm focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#EEF5FB] flex items-center justify-center">
          <FiSearch className="w-3 h-3 text-[#1597E5]" />
        </div>
      </div>

      {/* Filter Pills row */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'bg-[#1597E5] border-transparent text-white shadow-sm'
                  : 'bg-white border-[#e2e8f0] text-[#718096] hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Class-wise report list */}
      <div className="space-y-4">
        <div className="px-1 text-[10px] font-extrabold text-[#718096] tracking-widest uppercase select-none">
          CLASS-WISE REPORT
        </div>
        {loading ? (
          <div className="text-center py-6 text-xs font-bold text-secondaryText">
            Loading class breakdowns...
          </div>
        ) : classBreakdown.length > 0 ? (
          <div className="space-y-3">
            {classBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[20px] border border-[#e2e8f0]/45 p-4 flex items-center justify-between shadow-sm hover:border-[#1597E5]/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0F172A]">{item.name}</h4>
                    <p className="text-[10px] text-secondaryText font-bold mt-0.5">
                      {item.studentsCount} students · Collected {formatINR(item.collected)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${item.pending > 0 ? 'text-[#FF3B30]' : 'text-[#23C16B]'}`}>
                    {formatINR(item.pending)}
                  </p>
                  <span className="text-[9px] text-[#A0AEC0] font-bold mt-0.5 block">pending</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs font-bold text-secondaryText">
            No class data available.
          </div>
        )}
      </div>

      {/* Student-wise report list */}
      <div className="space-y-4">
        <div className="px-1 text-[10px] font-extrabold text-[#718096] tracking-widest uppercase select-none">
          STUDENT-WISE REPORT
        </div>
        {loading ? (
          <div className="text-center py-6 text-xs font-bold text-secondaryText">
            Loading student breakdowns...
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="space-y-3">
            {filteredStudents.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[20px] border border-[#e2e8f0]/45 p-4 flex items-center justify-between shadow-sm hover:border-[#1597E5]/10 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wide">
                    {item.fullName}
                  </h4>
                  <p className="text-[9.5px] text-[#718096] font-bold mt-0.5">
                    {item.classSection} · #{item.admissionNo}
                  </p>
                  <p className="text-[9px] text-[#A0AEC0] font-semibold mt-1">
                    Paid {formatINR(item.paidAmount)} · Concession {formatINR(item.concessionAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${item.dueAmount > 0 ? 'text-[#FF3B30]' : 'text-[#23C16B]'}`}>
                    {formatINR(item.dueAmount)}
                  </p>
                  <span className="text-[9px] text-[#A0AEC0] font-bold mt-0.5 block">
                    {item.dueAmount > 0 ? 'due' : 'paid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state card matching screenshot */
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[250px]">
            <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative">
              <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
              <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-dark">No records found</h4>
              <p className="text-[10px] text-[#A0AEC0] font-bold">
                No student fees match the selected filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FeeReports;
