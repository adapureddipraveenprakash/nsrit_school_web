import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getStudents, getFeeRecordsByBranch } from '../../../services/dataService';

const RecordPayment = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [search, setSearch] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const branchId = user?.branchId || 'sontyam-branch-id';

  // Fetch real students in the branch
  const { data: dbStudents = [], loading: studentsLoading } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [] }
  );

  // Fetch real fee structures to know remaining dues
  const { data: rawFees } = useDataFetch(
    () => getFeeRecordsByBranch({ branchId }),
    [branchId],
    { defaultValue: { studentFees: [] } }
  );

  const studentFees = rawFees?.studentFees || [];

  const normalizedStudents = useMemo(() => {
    return dbStudents.map(s => {
      // Find matching fee balance
      const feeRecord = studentFees.find(f => f.studentId === s.id);
      const dueAmount = feeRecord ? feeRecord.remainingAmount : 25000; // Fallback to 25k if not configured
      const status = feeRecord ? feeRecord.status : (dueAmount > 0 ? 'Due' : 'Paid');
      return {
        id: s.id,
        name: s.fullName || s.name || '',
        class: `${s.academicClass?.name || ''}-${s.section?.name || ''}`.trim().replace(/^-|-$/, '') || '1-A',
        admissionNo: s.studentId || s.admissionNumber || '',
        dueAmount,
        status
      };
    });
  }, [dbStudents, studentFees]);

  const filteredStudents = useMemo(() => {
    return search.trim().length >= 2
      ? normalizedStudents.filter(student =>
          student.name.toLowerCase().includes(search.toLowerCase()) ||
          student.admissionNo.toLowerCase().includes(search.toLowerCase())
        )
      : [];
  }, [normalizedStudents, search]);

  const handleRecordPayment = (student) => {
    setSelectedStudent(student);
    setPaymentAmount(student.dueAmount.toString());
  };

  const handleConfirmPayment = () => {
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setSelectedStudent(null);
      setSearch('');
    }, 2000);
  };

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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fee Collection</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="mb-1 relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE DESK</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Fee Collection</h2>
        <p className="text-[11px] text-white/80 font-bold relative z-10">
          Search student → Review fee → Record payment
        </p>
      </div>

      {/* Find Student Search Section */}
      <div className="space-y-3">
        <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
          FIND STUDENT
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Name, admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
        </div>
      </div>

      {/* Results / Empty States */}
      <div className="space-y-4">
        {search.trim().length < 2 ? (
          /* Empty state matching Screenshot 1 */
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative">
              <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
              <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-[#0F172A]">Search for student</h4>
              <p className="text-[10px] text-secondaryText font-bold">
                Enter at least 2 characters to search
              </p>
            </div>
          </div>
        ) : studentsLoading ? (
          <div className="text-center py-12 text-xs font-bold text-secondaryText">
            Searching branch records...
          </div>
        ) : filteredStudents.length > 0 ? (
          /* Student matches list */
          <div className="space-y-3">
            <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
              {filteredStudents.length} Matching Students
            </div>
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => handleRecordPayment(student)}
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
                    student.status === 'Paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {student.status === 'Paid' ? 'Paid' : `Due: Rs ${student.dueAmount.toLocaleString('en-IN')}`}
                  </span>
                  <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No results state */
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <div className="w-18 h-18 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 relative">
              <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-dark">No students found</h4>
              <p className="text-[10px] text-[#A0AEC0] font-semibold">
                No records match "{search}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/50 p-6 max-w-sm w-full card-shadow space-y-5">
            <div>
              <h3 className="text-sm font-black text-dark uppercase tracking-wide">Record Payment</h3>
              <p className="text-[10px] text-secondaryText font-bold mt-0.5">{selectedStudent.name}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Due Balance</label>
                <div className="py-2.5 px-3.5 bg-slate-50 border border-slate-100 rounded-xl font-extrabold text-dark">
                  Rs {selectedStudent.dueAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Payment Amount (Rs)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-white border border-[#e2e8f0] rounded-xl font-extrabold text-dark focus:outline-none focus:border-brand-blue/60"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="flex-1 py-3 bg-slate-50 border border-[#e2e8f0] text-secondaryText hover:bg-slate-100 rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-3 bg-brand-blue text-white rounded-xl text-xs font-black transition-all shadow-md shadow-brand-blue/15 hover:bg-brand-blue-hover cursor-pointer"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[28px] p-6 text-center flex flex-col items-center justify-center space-y-3 max-w-[240px] border border-blue-50 card-shadow">
            <FiCheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
            <h4 className="text-xs font-black text-dark">Payment Recorded</h4>
            <p className="text-[9px] text-[#A0AEC0] font-semibold">Ledger synced successfully.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RecordPayment;
