import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiInbox, FiBookOpen } from 'react-icons/fi';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getFeeReports } from '../../../services/dataService';

const FeeLedger = () => {
  const { user, feeRefreshTrigger } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
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
      console.error('[FeeLedger] Firestore onSnapshot failed:', err);
    });
    return () => unsub();
  }, [branchId]);

  // Normalize student records
  const normalizedLedgers = useMemo(() => {
    return studentsList.map(s => {
      const fsList = firestorePayments[s.id] || [];
      const fsPaid = fsList.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const activePlan = (s.reportFeePlans || []).find(p => p.isActive !== false);
      let paid = 0;
      let total = 0;
      let pending = 0;
      let feePlanId = '';

      if (activePlan) {
        feePlanId = activePlan.id;
        (activePlan.reportFeePayments || []).forEach(pay => {
          if (String(pay.status || 'RECORDED').toUpperCase() !== 'REVERSED') {
            paid += pay.amount || 0;
          }
        });
        total = activePlan.totalAmount || 0;
        pending = Math.max(total - (paid + fsPaid), 0);
      } else {
        total = fsPaid;
        pending = 0;
      }

      const paidTotal = paid + fsPaid;
      const pct = total > 0 ? Math.round((paidTotal / total) * 100) : 0;

      let status = 'DUE';
      if (pending === 0) {
        status = 'PAID';
      } else if (paidTotal > 0 && pending > 0) {
        status = 'PARTIAL';
      }

      return {
        id: s.id,
        fullName: s.fullName || 'Unknown Student',
        className: `${s.academicClass?.name || ''} · ${s.section?.name || ''}`.trim().replace(/ · $|^ · /, ''),
        paidAmount: paidTotal,
        dueAmount: pending,
        totalAmount: total,
        percent: pct,
        status
      };
    });
  }, [studentsList, firestorePayments]);

  // Filter based on search query
  const filteredLedgers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return normalizedLedgers;
    return normalizedLedgers.filter(item => 
      item.fullName.toLowerCase().includes(q) || 
      item.className.toLowerCase().includes(q)
    );
  }, [normalizedLedgers, search]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return normalizedLedgers.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, normalizedLedgers]);

  const selectedStudentPayments = useMemo(() => {
    if (!selectedStudentId) return [];
    
    const student = studentsList.find(s => s.id === selectedStudentId);
    let dbPaymentsList = [];
    if (student) {
      const activePlan = (student.reportFeePlans || []).find(p => p.isActive !== false);
      if (activePlan) {
        dbPaymentsList = (activePlan.reportFeePayments || []).map(p => {
          const dateObj = p.paymentDate ? new Date(p.paymentDate) : new Date();
          return {
            id: p.id,
            amount: p.amount || 0,
            date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            mode: p.paymentMode || 'CASH',
            receiptNo: p.receiptNumber || p.id.slice(0, 8).toUpperCase(),
            timestamp: dateObj.getTime(),
            status: p.status
          };
        });
      }
    }

    const fsList = (firestorePayments[selectedStudentId] || []).map((p, idx) => {
      const dateObj = p.paymentDate ? new Date(p.paymentDate) : new Date();
      return {
        id: p.id || `fs-${idx}`,
        amount: p.amount || 0,
        date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        mode: p.paymentMode || 'CASH',
        receiptNo: p.referenceNumber || `REC-FS-${String(p.id || '').slice(0, 6)}`.toUpperCase(),
        timestamp: dateObj.getTime(),
        status: 'RECORDED'
      };
    });

    return [...dbPaymentsList, ...fsList]
      .filter(p => String(p.status).toUpperCase() !== 'REVERSED')
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [selectedStudentId, studentsList, firestorePayments]);

  const handleBack = () => {
    if (selectedStudentId) {
      setSelectedStudentId(null);
    } else {
      navigate(-1);
    }
  };

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
          onClick={handleBack}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">
          {selectedStudent ? 'Student Fee' : 'Ledger'}
        </h1>
      </header>

      {selectedStudent ? (
        /* Detailed Student Fee View matching mockup */
        <div className="space-y-6">
          {/* Top curved blue card with student info */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <h2 className="text-xl font-bold font-sans uppercase tracking-wide">
                  {selectedStudent.fullName}
                </h2>
                <p className="text-xs text-white/80 font-medium mt-1">
                  {selectedStudent.className.replace(' · ', ' - Section ')}
                </p>
              </div>
              {/* Badge */}
              <div>
                {selectedStudent.dueAmount === 0 ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBFDFA] text-[#23C16B] text-[10px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#23C16B]" />
                    Paid
                  </span>
                ) : selectedStudent.paidAmount > 0 ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E5] text-[#FF9F0A] text-[10px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" />
                    Partial
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEAE9] text-[#FF3B30] text-[10px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
                    Due
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-6 relative z-10">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${selectedStudent.percent > 100 ? 100 : selectedStudent.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold mt-4 relative z-10">
              <span>Rs {selectedStudent.paidAmount.toLocaleString('en-IN')} paid</span>
              <span>Rs {selectedStudent.dueAmount.toLocaleString('en-IN')} due</span>
            </div>
          </div>

          {/* Ledger Details Row Card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] border-b border-[#e2e8f0]/40 pb-3">
              <FiBookOpen className="w-4 h-4 text-[#1597E5]" />
              <span>Ledger</span>
            </div>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondaryText font-semibold">Total Fee</span>
                <span className="font-extrabold text-[#0F172A]">RS {selectedStudent.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondaryText font-semibold">Paid Amount</span>
                <span className="font-extrabold text-[#23C16B]">RS {selectedStudent.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondaryText font-semibold">Remaining Balance</span>
                <span className="font-extrabold text-[#FF3B30]">RS {selectedStudent.dueAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Transactions Header */}
          <div className="px-1 text-[9.5px] font-black text-secondaryText tracking-wider uppercase select-none mt-2">
            Transactions
          </div>

          {/* Transactions List */}
          {selectedStudentPayments.length > 0 ? (
            <div className="space-y-3">
              {selectedStudentPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="bg-white rounded-[20px] border border-[#e2e8f0]/45 p-4 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F172A]">Rs {pay.amount.toLocaleString('en-IN')}</h4>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 uppercase">
                      {pay.receiptNo} · {pay.mode}
                    </p>
                  </div>
                  <span className="text-[8.5px] font-black text-secondaryText bg-[#EEF5FB] px-3 py-1 rounded-full">
                    {pay.date}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State Card matching mockup */
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EBF8FF] border border-[#BEE3F8] flex items-center justify-center text-[#1597E5] relative shadow-inner">
                <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
                <svg className="w-6 h-6 text-[#1597E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-[#0F172A]">No payments yet</h4>
                <p className="text-[9.5px] text-[#A0AEC0] font-bold">
                  Payments will appear after upload or online capture.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {/* Top curved blue header card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            {/* Subtitle */}
            <div className="mb-2 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEES</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-1 relative z-10">Fee Ledger</h2>
            <p className="text-xs text-white/80 font-medium relative z-10">
              Student-wise fee balances and ledger status
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search ledger"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] shadow-sm focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#EEF5FB] flex items-center justify-center">
              <FiSearch className="w-3 h-3 text-[#1597E5]" />
            </div>
          </div>

          {/* Ledger Cards list */}
          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-secondaryText">
              Loading student ledgers...
            </div>
          ) : filteredLedgers.length > 0 ? (
            <div className="space-y-4">
              {filteredLedgers.map((item) => {
                let borderBg = 'bg-[#FF9F0A]'; // Partial top line
                if (item.totalAmount === 0 || item.dueAmount === 0) {
                  borderBg = 'bg-[#23C16B]'; // Green top line
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedStudentId(item.id)}
                    className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all hover:border-[#1597E5]/15 cursor-pointer active:scale-[0.99]"
                  >
                    {/* Top curved colored border */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${borderBg}`} />

                    {/* Card Header row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wide">
                          {item.fullName}
                        </h3>
                        <p className="text-[10px] text-secondaryText font-bold mt-0.5">
                          {item.className}
                        </p>
                      </div>
                      {/* Status Badge */}
                      <div>
                        {item.dueAmount === 0 ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E5F9EE] text-[#23C16B] text-[9px] font-black">
                            <span className="w-1 h-1 rounded-full bg-[#23C16B]" />
                            Paid
                          </span>
                        ) : item.paidAmount > 0 ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF9E5] text-[#FF9F0A] text-[9px] font-black">
                            <span className="w-1 h-1 rounded-full bg-[#FF9F0A]" />
                            Partial
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFEAE9] text-[#FF3B30] text-[9px] font-black">
                            <span className="w-1 h-1 rounded-full bg-[#FF3B30]" />
                            Due
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#EEF5FB] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.dueAmount === 0 ? 'bg-[#23C16B]' : 'bg-[#FF9F0A]'
                        }`}
                        style={{ width: `${item.percent > 100 ? 100 : item.percent}%` }}
                      />
                    </div>

                    {/* Metrics Row */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-secondaryText">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#A0AEC0]">PAID</span>
                          <p className="text-xs font-black text-[#23C16B] mt-0.5">
                            Rs {item.paidAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#A0AEC0]">DUE</span>
                          <p className={`text-xs font-black mt-0.5 ${item.dueAmount > 0 ? 'text-[#FF3B30]' : 'text-[#0F172A]'}`}>
                            Rs {item.dueAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      {/* Circular Percentage Pill */}
                      <div className={`px-2.5 py-0.5 text-[8.5px] font-black rounded-full border ${
                        item.dueAmount === 0
                          ? 'border-[#23C16B]/20 text-[#23C16B] bg-[#E5F9EE]/30'
                          : 'border-[#FF9F0A]/20 text-[#FF9F0A] bg-[#FFF9E5]/30'
                      }`}>
                        {item.percent}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State Card */
            <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px]">
              <div className="w-20 h-20 rounded-full bg-[#EBF8FF] border border-[#BEE3F8] flex items-center justify-center text-[#3182CE] relative">
                <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
                <FiInbox className="w-9 h-9" />
              </div>

              <div className="space-y-2 max-w-[280px]">
                <h3 className="text-sm font-extrabold text-dark">No ledger records</h3>
                <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
                  Could not find any matching fee records.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FeeLedger;
