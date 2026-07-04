import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiInbox, FiShare2 } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getPaymentHistory, getStudents } from '../../../services/dataService';
import { db } from '../../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const FeeHistory = () => {
  const navigate = useNavigate();
  const { user, feeRefreshTrigger } = useApp();
  const [selectedYearTab, setSelectedYearTab] = useState('All'); // 'All' | '2026'

  const [firestorePayments, setFirestorePayments] = useState([]);

  const branchId = user?.branchId || 'sontyam-branch-id';

  // Fetch PostgreSQL payments list
  const { data: dbPayments = [], loading: paymentsLoading } = useDataFetch(
    () => getPaymentHistory({ branchId }),
    [branchId, feeRefreshTrigger],
    { defaultValue: [], pollInterval: 10000 }
  );

  // Fetch students list to map student names
  const { data: dbStudents = [] } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [] }
  );

  // Fetch Firestore payments
  useEffect(() => {
    const fetchFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'fee_payments'));
        const list = [];
        querySnapshot.forEach(docSnap => {
          const studentId = docSnap.id;
          const data = docSnap.data();
          const items = data.list || [];
          items.forEach(item => {
            list.push({
              ...item,
              studentId
            });
          });
        });
        setFirestorePayments(list);
      } catch (err) {
        console.error('Error fetching firestore payments:', err);
      }
    };
    fetchFirestore();
  }, [feeRefreshTrigger]);

  const formatDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    // Format YYYY-MM-DD to DD-MM-YYYY
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const normalizedPayments = useMemo(() => {
    // 1. Map Postgres payments
    const dbItems = dbPayments.map(p => {
      const student = dbStudents.find(s => s.id === p.studentId);
      const dateObj = p.paymentDate ? new Date(p.paymentDate) : new Date();
      return {
        id: p.id,
        studentName: student?.fullName || 'Unknown Student',
        class: student ? `${student.academicClass?.name || ''}-${student.section?.name || ''}`.trim().replace(/^-|-$/, '') : 'N/A',
        admissionNo: student?.studentId || 'N/A',
        amount: p.amount || 0,
        date: formatDDMMYYYY(p.paymentDate),
        year: dateObj.getFullYear(),
        mode: p.paymentMode || 'CASH',
        receiptNo: p.receiptNumber || p.id.slice(0, 8).toUpperCase(),
        timestamp: dateObj.getTime()
      };
    });

    // 2. Map Firestore payments
    const fsItems = firestorePayments.map(p => {
      const student = dbStudents.find(s => s.id === p.studentId);
      const dateObj = p.paymentDate ? new Date(p.paymentDate) : new Date();
      return {
        id: p.id,
        studentName: student?.fullName || 'Unknown Student',
        class: student ? `${student.academicClass?.name || ''}-${student.section?.name || ''}`.trim().replace(/^-|-$/, '') : 'N/A',
        admissionNo: student?.studentId || 'N/A',
        amount: p.amount || 0,
        date: formatDDMMYYYY(p.paymentDate),
        year: dateObj.getFullYear(),
        mode: p.paymentMode || 'CASH',
        receiptNo: p.referenceNumber || `REC-FS-${p.id.slice(0, 6)}`.toUpperCase(),
        timestamp: dateObj.getTime()
      };
    });

    // Combine and sort by date descending
    const combined = [...dbItems, ...fsItems].sort((a, b) => b.timestamp - a.timestamp);

    // Apply year filter
    if (selectedYearTab === '2026') {
      return combined.filter(p => p.year === 2026);
    }
    return combined;
  }, [dbPayments, dbStudents, firestorePayments, selectedYearTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-4xl mx-auto select-none animate-fade-in relative font-sans"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Payments</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="mb-1 relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEES</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Payment History</h2>
        <p className="text-[11px] text-white/80 font-bold relative z-10">
          Cash, UPI, and ledger transactions
        </p>
      </div>

      {/* Year Selector Tabs */}
      <div className="flex items-center gap-3 font-sans select-none">
        <button
          onClick={() => setSelectedYearTab('All')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
            selectedYearTab === 'All'
              ? 'bg-[#1597E5] text-white border-transparent shadow-sm'
              : 'bg-white text-[#1597E5] border-[#1597E5]/30 hover:border-[#1597E5]/60'
          }`}
        >
          All Years
        </button>
        <button
          onClick={() => setSelectedYearTab('2026')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
            selectedYearTab === '2026'
              ? 'bg-[#1597E5] text-white border-transparent shadow-sm'
              : 'bg-white text-[#1597E5] border-[#1597E5]/30 hover:border-[#1597E5]/60'
          }`}
        >
          AY 2026
        </button>
      </div>

      {paymentsLoading ? (
        <div className="text-center py-12 text-xs font-bold text-secondaryText">
          Loading payment ledger...
        </div>
      ) : normalizedPayments.length > 0 ? (
        <div className="space-y-3">
          <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
            RECENT PAYMENTS ({normalizedPayments.length})
          </div>
          {normalizedPayments.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 shadow-sm flex items-center justify-between hover:border-[#1597E5]/15 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#EBFDFA] text-[#14B8A6] flex items-center justify-center text-sm font-extrabold shadow-inner">
                  ?
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                    Rs {p.amount.toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[10px] text-[#4A5568] font-bold mt-0.5 uppercase tracking-wide">
                    {p.studentName} · {p.mode}
                  </p>
                  <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5">
                    {p.date} | {p.receiptNo}
                  </p>
                </div>
              </div>
              <button className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center hover:bg-[#1597E5]/10 transition-colors cursor-pointer">
                <FiShare2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State Card */
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative">
            <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-[#0F172A]">No payments</h4>
            <p className="text-[10px] text-secondaryText font-bold">
              Payment history will appear here.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FeeHistory;
