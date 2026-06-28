import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiInbox } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getPaymentHistory, getStudents } from '../../../services/dataService';

const FeeHistory = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  const branchId = user?.branchId || 'sontyam-branch-id';

  // Fetch payments list
  const { data: dbPayments = [], loading: paymentsLoading } = useDataFetch(
    () => getPaymentHistory({ branchId }),
    [branchId],
    { defaultValue: [], pollInterval: 10000 }
  );

  // Fetch students list to map student names
  const { data: dbStudents = [] } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [] }
  );

  const normalizedPayments = useMemo(() => {
    return dbPayments.map(p => {
      const student = dbStudents.find(s => s.id === p.studentId);
      const dateObj = p.paymentDate ? new Date(p.paymentDate) : new Date();
      return {
        id: p.id,
        studentName: student?.fullName || 'Unknown Student',
        class: student ? `${student.academicClass?.name || ''}-${student.section?.name || ''}`.trim().replace(/^-|-$/, '') : 'N/A',
        admissionNo: student?.studentId || 'N/A',
        amount: p.amount || 0,
        date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        mode: p.paymentMode || 'CASH',
        receiptNo: p.receiptNumber || p.id.slice(0, 8).toUpperCase()
      };
    });
  }, [dbPayments, dbStudents]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-4xl mx-auto select-none animate-fade-in relative"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Payment History</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="mb-1 relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEES</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Payment History</h2>
        <p className="text-[11px] text-white/80 font-bold relative z-10">
          Cash, UPI, and ledger transactions
        </p>
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
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 shadow-sm flex items-center justify-between hover:border-brand-blue/15 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#EBFDFA] text-[#14B8A6] flex items-center justify-center text-xs font-black shadow-inner">
                  ₹
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-dark">{p.studentName}</h3>
                  <p className="text-[9.5px] text-secondaryText font-bold mt-0.5">
                    Class: {p.class} · Receipt: {p.receiptNo}
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-[#EEF5FB] text-secondaryText text-[8px] font-bold rounded-full mt-1">
                    {p.date} · {p.mode}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#14B8A6]">
                  + ₹{p.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State Card matching Screenshot 3 */
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
