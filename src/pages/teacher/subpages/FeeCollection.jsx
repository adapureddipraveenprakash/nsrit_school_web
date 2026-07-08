import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiSearch, FiChevronRight, FiInbox, FiCheckCircle,
  FiUser, FiCreditCard, FiX, FiCalendar, FiChevronDown
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getFeeReports, recordPayment, reversePayment } from '../../../services/dataService';
import { generateReceipt } from '../../../utils/receiptGenerator';



const MOCK_PLANS = [
  { id: 'mock1', name: 'KORADA KARTHIKEYA', class: '7-A', admissionNo: '#26SO0001', paid: 0, pending: 0, total: 0 },
  { id: 'mock2', name: 'KORADA BHARGAVSAI', class: '5-A', admissionNo: '#26SO0002', paid: 15000, pending: 37000, total: 52000 },
  { id: 'mock3', name: 'GANDARDDI MANJUSHA', class: '4-A', admissionNo: '#26SO0003', paid: 0, pending: 50000, total: 50000 },
  { id: 'mock4', name: 'GONTHINA POORVESH', class: '4-A', admissionNo: '#26SO0004', paid: 0, pending: 50000, total: 50000 }
];

const FeeCollection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentIdParam = searchParams.get('studentId');
  const { user, branches, triggerFeeRefresh, feeRefreshTrigger } = useApp();
  const [search, setSearch] = useState('');

  // Selected Student object from results list
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form states
  const [paymentDate, setPaymentDate] = useState('2026-07-03');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [installment, setInstallment] = useState('1st Term Tuition');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Local state to hold extra payments recorded in current session
  const [extraPayments, setExtraPayments] = useState({});

  // Firestore payments loaded for the selected student


  const branchId = user?.branchId || null;

  // Fetch real-time student fee plans and payment history
  const { data: rawFeePlans } = useDataFetch(
    () => getFeeReports({ branchId }),
    [branchId, feeRefreshTrigger],
    { defaultValue: { students: [] }, pollInterval: 15000, skip: !branchId }
  );

  const studentsList = rawFeePlans?.students || [];



  // Parse student records from DB (combines details for search)
  const normalizedStudents = useMemo(() => {
    if (studentsList.length === 0) {
      return MOCK_PLANS.map(item => ({
        id: item.id,
        fullName: item.name,
        className: item.class,
        studentId: item.admissionNo,
        paidAmount: item.paid,
        dueAmount: item.pending,
        totalAmount: item.total,
        feePlanId: 'mock-plan-id'
      }));
    }

    return studentsList.map(s => {
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
        pending = Math.max(total - paid, 0);
      }

      return {
        id: s.id,
        fullName: s.fullName || 'Unknown Student',
        className: `${s.academicClass?.name || ''} - ${s.section?.name || ''}`.trim().replace(/^-|-$/, ''),
        studentId: s.studentId || '26SO0000',
        paidAmount: paid,
        dueAmount: pending,
        totalAmount: total,
        feePlanId
      };
    });
  }, [studentsList]);

  // Auto-select student if studentId query param is provided
  useEffect(() => {
    if (studentIdParam && normalizedStudents.length > 0 && !selectedStudent) {
      const match = normalizedStudents.find(s => s.id === studentIdParam);
      if (match) {
        setSelectedStudent(match);
      }
    }
  }, [studentIdParam, normalizedStudents, selectedStudent]);

  // Search filter
  const filteredStudents = useMemo(() => {
    if (search.trim().length < 2) return [];
    
    const q = search.toLowerCase();
    return normalizedStudents.filter(s => 
      s.fullName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q)
    );
  }, [normalizedStudents, search]);

  // Selected student actual stats calculation
  const studentStats = useMemo(() => {
    if (!selectedStudent) return { total: 0, paid: 0, pending: 0 };

    const matched = normalizedStudents.find(s => s.id === selectedStudent.id) || selectedStudent;
    
    // Add extra session payments to paid
    const localExtra = extraPayments[matched.id] || 0;
    
    const paid = (matched.paidAmount || 0) + localExtra;
    const total = matched.totalAmount || 0;
    const pending = Math.max(total - paid, 0);

    return { total, paid, pending };
  }, [selectedStudent, normalizedStudents, extraPayments]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setAmount('');
    setReferenceNumber('');
    setRemarks('');
  };

  const isValidUUID = (str) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const parsedAmt = parseFloat(amount);
    let success = false;

    // 1. If student has a valid GQL fee plan, write ONLY to PostgreSQL GQL
    if (selectedStudent.feePlanId && isValidUUID(selectedStudent.feePlanId) && isValidUUID(selectedStudent.id)) {
      try {
        const targetYear = new Date(paymentDate).getFullYear() || 2026;
        const rawBranchCode = user?.branchCode || 'SO';
        const receiptData = await generateReceipt({
          branchCode: rawBranchCode,
          year: targetYear
        });

        const payload = {
          studentId: selectedStudent.id,
          feePlanId: selectedStudent.feePlanId,
          amount: parsedAmt,
          paymentDate,
          paymentMode: paymentMode.toUpperCase(),
          referenceNumber: referenceNumber || null,
          receiptNumber: receiptData.receiptNumber,
          remarks: remarks || null,
          collectedById: user?.id || selectedStudent.id,
          branchId,
          receiptYear: receiptData.receiptYear,
          branchCode: receiptData.branchCode,
          receiptSequence: receiptData.receiptSequence,
          actorRole: user?.role || 'PRINCIPAL',
          oldValue: '',
          newValue: ''
        };
        const res = await recordPayment(payload);
        if (res && res.errors && res.errors.length > 0) {
          const gqlErrMsg = res.errors.map(e => e.message).join(', ');
          throw new Error(gqlErrMsg);
        }
        success = true;
        console.log('[FeeCollection] GQL PostgreSQL payment recorded successfully!');
      } catch (err) {
        console.error('[FeeCollection] GQL PostgreSQL mutation failed:', err);
        setErrorMessage(`PostgreSQL Error: ${err.message || err.toString()}`);
      }
    } else {
      setErrorMessage("This student does not have a fee plan assigned. Please assign a fee plan before collecting payment.");
    }

    // 3. Handle success or failure feedback
    if (success) {
      // Save payment locally to reflect in student stats instantly in current screen
      setExtraPayments(prev => ({
        ...prev,
        [selectedStudent.id]: (prev[selectedStudent.id] || 0) + parsedAmt
      }));

      // Trigger global cache refresh for PostgreSQL hooks across the app
      triggerFeeRefresh();

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setSelectedStudent(null);
        setSearch('');
      }, 2000);
    } else {
      setErrorToast(true);
      setTimeout(() => {
        setErrorToast(false);
      }, 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-[640px] mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fee Collection</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-sans">FEE DESK</span>
        </div>

        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Fee Collection</h2>
        <p className="text-xs text-white/85 font-medium relative z-10 font-sans">
          Search student ➔ Review fee ➔ Record payment
        </p>
      </div>

      {selectedStudent ? (
        /* STEP 2: SELECTED STUDENT PAYMENT CONFIGURATION */
        <div className="space-y-6">
          {/* Selected Student Card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-6 card-shadow space-y-5 relative">
            {/* Change Student link */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-6 right-6 text-[10.5px] font-black text-[#1597E5] hover:text-[#00A1FF] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>🔄</span> Change student
            </button>

            {/* Student Info */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center font-bold text-xs border border-brand-blue/5">
                {(selectedStudent.fullName || 'S').charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-black text-dark font-sans leading-tight">
                  {selectedStudent.fullName}
                </h4>
                <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 font-sans">
                  {selectedStudent.studentId} · {selectedStudent.className}
                </p>
              </div>
            </div>

            {/* Triple stats display */}
            <div className="grid grid-cols-3 gap-1 pt-4 border-t border-slate-100 text-center font-sans text-xs">
              <div className="border-r border-slate-100">
                <p className="font-black text-[#E53E3E]">Rs {studentStats.pending.toLocaleString('en-IN')}</p>
                <p className="text-[8.5px] font-black text-[#A0AEC0] uppercase tracking-wider mt-1">Pending</p>
              </div>
              <div className="border-r border-slate-100">
                <p className="font-black text-[#23C16B]">Rs {studentStats.paid.toLocaleString('en-IN')}</p>
                <p className="text-[8.5px] font-black text-[#A0AEC0] uppercase tracking-wider mt-1">Paid</p>
              </div>
              <div>
                <p className="font-black text-dark">Rs {studentStats.total.toLocaleString('en-IN')}</p>
                <p className="text-[8.5px] font-black text-[#A0AEC0] uppercase tracking-wider mt-1">Total</p>
              </div>
            </div>
          </div>

          {/* Record Payment Form Card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-6 card-shadow space-y-5">
            <h3 className="text-xs font-black text-dark font-sans flex items-center gap-2">
              <FiCreditCard className="w-4 h-4 text-[#1597E5]" />
              <span>Record Payment</span>
            </h3>

            <form onSubmit={handleConfirmPayment} className="space-y-4 font-sans text-xs select-none">
              {/* Payment Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Payment Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 cursor-pointer"
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondaryText">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="Amount (₹)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#F2F7FB] focus:bg-white border border-[#e2e8f0]/40 focus:border-[#1597E5]/50 rounded-[20px] pl-8 pr-4 py-3.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Payment Mode</label>
                <div className="relative">
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
                </div>
              </div>

              {/* Installment */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Installment</label>
                <div className="relative">
                  <select
                    value={installment}
                    onChange={(e) => setInstallment(e.target.value)}
                    className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer"
                  >
                    <option value="1st Term Tuition">1st Term Tuition</option>
                    <option value="2nd Term Tuition">2nd Term Tuition</option>
                    <option value="3rd Term Tuition">3rd Term Tuition</option>
                    <option value="Books">Books</option>
                    <option value="Transport">Transport</option>
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Uniform Fee">Uniform Fee</option>
                    <option value="Exam Fee">Exam Fee</option>
                    <option value="Other/Combined">Other/Combined</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
                </div>
              </div>

              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Student</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                  <input
                    type="text"
                    disabled
                    value={selectedStudent.fullName}
                    className="w-full bg-slate-50 border border-[#e2e8f0]/60 rounded-[20px] pl-10 pr-4 py-3.5 text-xs font-semibold text-secondaryText cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Reference Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Reference Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondaryText">#</span>
                  <input
                    type="text"
                    placeholder="Reference Number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-[#F2F7FB] focus:bg-white border border-[#e2e8f0]/40 focus:border-[#1597E5]/50 rounded-[20px] pl-8 pr-4 py-3.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Remarks (optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondaryText">📝</span>
                  <input
                    type="text"
                    placeholder="Remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-[#F2F7FB] focus:bg-white border border-[#e2e8f0]/40 focus:border-[#1597E5]/50 rounded-[20px] pl-8 pr-4 py-3.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className={`w-full py-4 rounded-[20px] text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  amount && parseFloat(amount) > 0
                    ? 'bg-[#1597E5] text-white hover:bg-[#00A1FF] active:scale-95 shadow-brand-blue/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-100'
                }`}
              >
                <FiCreditCard className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* STEP 1: SEARCH STUDENT (default view) */
        <>
          {/* Find Student Search Box Container */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3 font-sans">
            <span className="text-[9.5px] font-black text-slate-500 tracking-wider uppercase">
              FIND STUDENT
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Name, admission number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-[#F2F7FB] border border-[#e2e8f0]/40 rounded-[20px] focus:outline-none focus:border-[#1597E5]/50 focus:bg-white text-xs font-semibold text-dark placeholder:text-secondaryText transition-all"
              />
              <FiSearch className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondaryText" />
            </div>
          </div>

          {/* Results / Empty State Card */}
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-6 card-shadow min-h-[300px] flex flex-col justify-center font-sans">
            {search.trim().length < 2 ? (
              <div className="text-center flex flex-col items-center justify-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] border border-[#1597E5]/10 shadow-inner">
                  <svg className="w-7 h-7 text-[#1597E5]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="13" x2="15" y2="13"></line>
                  </svg>
                </div>
                <div className="space-y-1.5 max-w-[280px]">
                  <h3 className="text-sm font-extrabold text-dark">Search for student</h3>
                  <p className="text-[10.5px] text-[#A0AEC0] font-semibold leading-relaxed">
                    Enter at least 2 characters to search
                  </p>
                </div>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="space-y-3 py-2">
                <div className="text-[9px] font-black text-[#A0AEC0] tracking-widest uppercase mb-1">
                  Search Results ({filteredStudents.length})
                </div>
                {filteredStudents.map((student) => {
                  const initials = (student.fullName || 'S').charAt(0);
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="bg-white rounded-[24px] border border-slate-100 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center font-bold text-xs select-none border border-brand-blue/5">
                          {initials}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-dark leading-tight group-hover:text-brand-blue transition-colors">
                            {student.fullName}
                          </h4>
                          <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                            {student.studentId} · {student.className}
                          </p>
                        </div>
                      </div>
                      <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center flex flex-col items-center justify-center space-y-4 py-8">
                <FiInbox className="w-8 h-8 text-secondaryText" />
                <div className="space-y-1.5 max-w-[280px]">
                  <h3 className="text-sm font-extrabold text-dark">No student found</h3>
                  <p className="text-[10.5px] text-[#A0AEC0] font-semibold leading-relaxed">
                    Could not find any student matching "{search}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Success and Error Toasts */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-dark text-white px-6 py-3.5 rounded-full card-shadow flex items-center gap-3 z-50 select-none font-sans text-xs font-bold"
          >
            <FiCheckCircle className="text-emerald-500 w-5 h-5" />
            <span>Payment recorded successfully!</span>
          </motion.div>
        )}

        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-3.5 rounded-full card-shadow flex items-center gap-3 z-50 select-none font-sans text-xs font-bold"
          >
            <FiX className="text-white w-5 h-5 bg-white/20 rounded-full p-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeeCollection;
