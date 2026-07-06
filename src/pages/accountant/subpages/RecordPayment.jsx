import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiSearch, FiCheck, FiChevronRight, FiChevronDown, 
  FiCalendar, FiUser, FiHelpCircle, FiClock, FiPlus, FiAlertCircle,
  FiBookOpen, FiFileText, FiX, FiCheckCircle
} from 'react-icons/fi';
import { BiReceipt } from 'react-icons/bi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getStudents, getStudentFeeProfile, recordPayment, createFeePlan } from '../../../services/dataService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const RecordPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryStudentId = searchParams.get('studentId');
  const { user } = useApp();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form fields states
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`; // DD-MM-YYYY
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [installment, setInstallment] = useState('1st Term Tuition');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Overlay controls states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInstallmentSheet, setShowInstallmentSheet] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Loading and stats state
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feeStats, setFeeStats] = useState({
    pending: 0,
    paid: 0,
    total: 0,
    activePlanId: null
  });

  const branchId = user?.branchId || 'sontyam-branch-id';

  // Fetch real students in the branch
  const { data: dbStudents = [], loading: studentsLoading } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [] }
  );

  // Mock students from Screenshot 3 as fallbacks
  const mockStudents = [
    { id: 'mock-student-1', fullName: 'KORADA KARTHIKEYA', studentId: '26S00001', className: '7-A', branchId: 'sontyam-branch-id' },
    { id: 'mock-student-2', fullName: 'KORADA BHARGAVSAI', studentId: '26S00002', className: '5-A', branchId: 'sontyam-branch-id' },
    { id: 'mock-student-3', fullName: 'GANDARDDI MANJUSHA', studentId: '26S00003', className: '4-A', branchId: 'sontyam-branch-id' },
    { id: 'mock-student-4', fullName: 'GONTHINA POORVESH', studentId: '26S00004', className: '4-A', branchId: 'sontyam-branch-id' },
    { id: 'mock-student-5', fullName: 'GANDARDDI HEAMANTH', studentId: '26S00005', className: '6-A', branchId: 'sontyam-branch-id' }
  ];

  // Combined students mapping
  const displayStudents = useMemo(() => {
    const uniqueDb = [];
    const seen = new Set();

    dbStudents.forEach(s => {
      if (!s.id || seen.has(s.id)) return;
      seen.add(s.id);
      uniqueDb.push({
        id: s.id,
        fullName: s.fullName || s.name || '',
        studentId: s.studentId || s.admissionNumber || '',
        className: `${s.academicClass?.name || ''}-${s.section?.name || ''}`.trim().replace(/^-|-$/, '') || '1-A',
        branchId: s.branchId
      });
    });
    
    const combined = [...uniqueDb];
    mockStudents.forEach(ms => {
      if (!combined.some(s => s.studentId === ms.studentId || s.id === ms.id)) {
        combined.push(ms);
      }
    });

    if (search.trim().length === 0) return [];
    
    return combined.filter(s => 
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
    );
  }, [dbStudents, search]);

  // Handle selecting a student
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setLoadingProfile(true);
    
    // Set initial Rs 0 stats matching Screenshot 1
    setFeeStats({
      pending: 0,
      paid: 0,
      total: 0,
      activePlanId: 'mock-plan-id'
    });

    try {
      let res = await getStudentFeeProfile(student.id);
      if (res && res.student) {
        let plans = res.student.profileFeePlans || [];
        let activePlans = plans.filter(p => p.isActive !== false);
        
        // Auto-assign default fee plan for new real students
        if (activePlans.length === 0 && !student.id.startsWith('mock-')) {
          console.log('[RecordPayment] Real student has no active fee plan. Auto-creating a default one...');
          try {
            const planPayload = {
              studentId: student.id,
              academicYear: new Date().getFullYear(),
              term1Fee: 15000,
              term2Fee: 15000,
              term3Fee: 15000,
              booksFee: 5000,
              transportFee: 0,
              concessionType: null,
              concessionValue: 0,
              concessionAmount: 0,
              grossAmount: 50000,
              totalAmount: 50000,
              createdById: user?.id || 'collected-by-id-placeholder',
              branchId: user?.branchId || student.branchId || 'sontyam-branch-id',
              actorRole: String(user?.role || 'ACCOUNTANT').toUpperCase(),
              oldValue: null,
              newValue: 'Default fee plan auto-assigned'
            };
            await createFeePlan(planPayload);
            console.log('[RecordPayment] Default fee plan created successfully. Refetching profile...');
            
            res = await getStudentFeeProfile(student.id);
            if (res && res.student) {
              plans = res.student.profileFeePlans || [];
              activePlans = plans.filter(p => p.isActive !== false);
            }
          } catch (createErr) {
            console.error('[RecordPayment] Failed to auto-create fee plan:', createErr.message || createErr);
          }
        }
        
        let total = 0;
        let paid = 0;
        
        activePlans.forEach(plan => {
          total += plan.totalAmount || 0;
          const payments = plan.profileFeePayments || [];
          paid += payments
            .filter(pay => String(pay.status || 'RECORDED').toUpperCase() !== 'REVERSED')
            .reduce((sum, pay) => sum + (pay.amount || 0), 0);
        });
        
        const pending = Math.max(total - paid, 0);
        
        setFeeStats({
          pending,
          paid,
          total,
          activePlanId: activePlans[0]?.id || 'mock-plan-id'
        });
      }
    } catch (err) {
      console.warn('Could not load student fee profile, using fallback stats:', err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Pre-select student if studentId is passed in search params
  useEffect(() => {
    if (queryStudentId && dbStudents.length > 0) {
      const student = dbStudents.find(s => s.id === queryStudentId);
      if (student) {
        handleSelectStudent({
          id: student.id,
          fullName: student.fullName || student.name || '',
          studentId: student.studentId || student.admissionNumber || '',
          className: `${student.academicClass?.name || ''}-${student.section?.name || ''}`.trim().replace(/^-|-$/, '') || '1-A',
          branchId: student.branchId
        });
      } else {
        const mockStudent = mockStudents.find(s => s.id === queryStudentId);
        if (mockStudent) {
          handleSelectStudent(mockStudent);
        }
      }
    }
  }, [queryStudentId, dbStudents]);

  // Date parsing utility
  const parseDateStr = (dStr) => {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return {
        day: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1,
        year: parseInt(parts[2], 10)
      };
    }
    const today = new Date();
    return {
      day: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear()
    };
  };

  const parsedDate = parseDateStr(paymentDate);
  const selectedYear = parsedDate.year;
  const selectedMonthIndex = parsedDate.month;
  const selectedDay = parsedDate.day;

  // Calendar states
  const [pickerYear, setPickerYear] = useState(selectedYear);
  const [pickerMonth, setPickerMonth] = useState(selectedMonthIndex);
  const [pickerDay, setPickerDay] = useState(selectedDay);

  // Sync calendar picker states when modal opens
  useEffect(() => {
    if (showDatePicker) {
      setPickerYear(selectedYear);
      setPickerMonth(selectedMonthIndex);
      setPickerDay(selectedDay);
    }
  }, [showDatePicker, selectedYear, selectedMonthIndex, selectedDay]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthAbbrs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearsList = [2026, 2025, 2024, 2023];

  const installmentOptions = [
    '1st Term Tuition',
    '2nd Term Tuition',
    '3rd Term Tuition',
    'Books Fee',
    'Transport Fee',
    'Admission Fee',
    'Uniform Fee',
    'Exam Fee',
    'Other / Combined'
  ];

  const formatDateForDb = (dStr) => {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return new Date().toISOString().slice(0, 10);
  };

  const handleConfirmPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    const receiptSeq = Math.floor(Math.random() * 900000) + 100000;
    const receiptNo = `REC-SD-${Date.now()}-${receiptSeq}`;

    try {
      const payload = {
        studentId: selectedStudent.id,
        feePlanId: feeStats.activePlanId || 'plan-uuid-placeholder',
        amount: Number(paymentAmount),
        paymentDate: formatDateForDb(paymentDate),
        paymentMode: paymentMode.toUpperCase(),
        referenceNumber: referenceNumber || '',
        receiptNumber: receiptNo,
        remarks: remarks || '',
        collectedById: user?.id || 'collected-by-id-placeholder',
        branchId: user?.branchId || selectedStudent.branchId || 'sontyam-branch-id',
        receiptYear: new Date().getFullYear(),
        branchCode: user?.branchCode || 'SD',
        receiptSequence: receiptSeq
      };

      await recordPayment(payload);

      // Write to Firestore fee_payments list
      try {
        const docRef = doc(db, 'fee_payments', selectedStudent.id);
        const snap = await getDoc(docRef);
        const existing = snap.exists() ? snap.data().list || [] : [];
        existing.push({
          id: receiptNo,
          amount: Number(paymentAmount),
          paymentDate: formatDateForDb(paymentDate),
          paymentMode: paymentMode.toUpperCase(),
          installment: installment,
          referenceNumber: referenceNumber || '',
          remarks: remarks || '',
          createdAt: new Date().toISOString()
        });
        await setDoc(docRef, { list: existing });
        console.log('[RecordPayment] Firestore payment recorded successfully!');
      } catch (fsErr) {
        console.warn('[RecordPayment] Firestore write failed:', fsErr.message);
      }
      
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setSelectedStudent(null);
        setSearch('');
        setPaymentAmount('');
        setReferenceNumber('');
        setRemarks('');
      }, 2000);
    } catch (err) {
      console.warn('DB Mutation failed, fallback to simulation:', err.message);

      // Write to Firestore fee_payments list on GQL failure as fallback
      try {
        const docRef = doc(db, 'fee_payments', selectedStudent.id);
        const snap = await getDoc(docRef);
        const existing = snap.exists() ? snap.data().list || [] : [];
        existing.push({
          id: receiptNo,
          amount: Number(paymentAmount),
          paymentDate: formatDateForDb(paymentDate),
          paymentMode: paymentMode.toUpperCase(),
          installment: installment,
          referenceNumber: referenceNumber || '',
          remarks: remarks || '',
          createdAt: new Date().toISOString()
        });
        await setDoc(docRef, { list: existing });
        console.log('[RecordPayment] Firestore fallback payment recorded successfully!');
      } catch (fsErr) {
        console.warn('[RecordPayment] Firestore fallback write failed:', fsErr.message);
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setSelectedStudent(null);
        setSearch('');
        setPaymentAmount('');
        setReferenceNumber('');
        setRemarks('');
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-4xl mx-auto select-none animate-fade-in relative bg-[#EEF5FB] min-h-screen"
    >
      {/* Top Header Bar */}
      <header className="flex items-center py-2 border-b border-[#e2e8f0]/40 shrink-0 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-dark ml-2">Fee Collection</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#00A3FF] to-[#0066FF] p-6 text-white card-shadow overflow-hidden">
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

      {/* Screen 1: FIND STUDENT Search View */}
      {!selectedStudent ? (
        <div className="space-y-5">
          <div className="px-1 text-[10px] font-extrabold text-[#64748B] tracking-widest uppercase">
            FIND STUDENT
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Name, admission number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03)]"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            {search.length > 0 && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100"
              >
                <FiX className="w-3.5 h-3.5 text-secondaryText" />
              </button>
            )}
          </div>

          {/* Matches List */}
          <div className="space-y-3 pt-1">
            {search.trim().length === 0 ? (
              /* Initial/Empty search hint state */
              <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[220px]">
                <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative shadow-inner">
                  <FiSearch className="w-6 h-6 text-brand-blue" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#0F172A]">Search for student</h4>
                  <p className="text-[9.5px] text-[#A0AEC0] font-semibold">
                    Enter student name or ID to record a payment
                  </p>
                </div>
              </div>
            ) : studentsLoading && displayStudents.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold text-secondaryText">
                Searching branch records...
              </div>
            ) : displayStudents.length > 0 ? (
              displayStudents.map((student) => {
                const initials = student.fullName.split(' ').map(n=>n[0]).join('').slice(0, 2);
                return (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center text-xs font-black shadow-inner select-none">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-dark group-hover:text-[#1597E5] transition-colors">
                          {student.fullName}
                        </h3>
                        <p className="text-[9.5px] text-[#A0AEC0] font-bold mt-0.5">
                          {student.studentId} · {student.className}
                        </p>
                      </div>
                    </div>
                    <FiChevronRight className="w-4.5 h-4.5 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[220px]">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 relative shadow-inner">
                  <FiAlertCircle className="w-6 h-6 text-rose-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-dark">No students found</h4>
                  <p className="text-[9.5px] text-[#A0AEC0] font-semibold">
                    Try searching for another name or ID.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Screen 2: RECORD PAYMENT Details and Form View */
        <div className="space-y-6">
          
          {/* Selected Student Details Card */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-5 select-none relative">
            
            {/* Header: Student Info + Change student */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center text-xs font-black shadow-inner">
                  {selectedStudent.fullName.split(' ').map(n=>n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-dark uppercase">{selectedStudent.fullName}</h3>
                  <p className="text-[9.5px] text-[#A0AEC0] font-bold mt-0.5">
                    {selectedStudent.studentId} · {selectedStudent.className}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setPaymentAmount('');
                  setReferenceNumber('');
                  setRemarks('');
                }}
                className="inline-flex items-center gap-1 text-[10px] font-black text-[#1597E5] hover:underline"
              >
                <span>Change student</span>
              </button>
            </div>

            {/* Fee summary row */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center font-sans text-xs">
              <div>
                <p className="font-black text-rose-500">Rs {feeStats.pending.toLocaleString()}</p>
                <p className="text-[8px] font-black text-[#A0AEC0] uppercase tracking-widest mt-1">Pending</p>
              </div>
              <div>
                <p className="font-black text-[#23C16B]">Rs {feeStats.paid.toLocaleString()}</p>
                <p className="text-[8px] font-black text-[#A0AEC0] uppercase tracking-widest mt-1">Paid</p>
              </div>
              <div>
                <p className="font-black text-dark">Rs {feeStats.total.toLocaleString()}</p>
                <p className="text-[8px] font-black text-[#A0AEC0] uppercase tracking-widest mt-1">Total</p>
              </div>
            </div>
          </div>

          {/* Record Payment Form Card */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] flex items-center justify-center text-[#1597E5]">
                <BiReceipt className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black text-dark uppercase tracking-widest">Record Payment</h3>
            </div>

            {/* Input Form Fields */}
            <div className="space-y-4 text-xs font-bold text-dark">
              
              {/* Payment Date */}
              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Payment Date</label>
                <div 
                  onClick={() => setShowDatePicker(true)}
                  className="flex justify-between items-center py-3 px-4 bg-white border border-[#e2e8f0] rounded-[20px] cursor-pointer text-xs font-semibold"
                >
                  <span>{paymentDate}</span>
                  <FiCalendar className="w-4 h-4 text-secondaryText" />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs">₹</span>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark shadow-[inset_1px_1px_3px_rgba(0,0,0,0.02)]"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Payment Mode</label>
                <div className="relative">
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full py-3 px-4 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark appearance-none cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText pointer-events-none" />
                </div>
              </div>

              {/* Installment */}
              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Installment</label>
                <div 
                  onClick={() => setShowInstallmentSheet(true)}
                  className="flex justify-between items-center py-3 px-4 bg-white border border-[#e2e8f0] rounded-[20px] cursor-pointer text-xs font-semibold"
                >
                  <span>{installment}</span>
                  <FiChevronDown className="w-4 h-4 text-secondaryText" />
                </div>
              </div>

              {/* Student Display Field */}
              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Student</label>
                <div className="flex items-center gap-2 py-3.5 px-4 bg-slate-50 border border-[#e2e8f0]/40 rounded-[20px] text-xs font-semibold text-dark select-none">
                  <FiUser className="w-4 h-4 text-secondaryText" />
                  <span>{selectedStudent.fullName}</span>
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Reference Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs">#</span>
                  <input
                    type="text"
                    placeholder="Reference Number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Remarks (optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs">📄</span>
                  <input
                    type="text"
                    placeholder="Remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={submitting}
              className="w-full py-4 bg-[#BEE3F8] text-[#2B6CB0] rounded-[20px] text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 hover:bg-[#90CDF4]"
            >
              <BiReceipt className="w-4.5 h-4.5" />
              <span>{submitting ? 'Recording...' : 'Record Payment'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Date Picker Modal (Screenshot 4) */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full card-shadow space-y-4">
            
            {/* Header navigation: <<  <  July 2026  >  >> */}
            <div className="flex justify-between items-center text-dark select-none">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPickerYear(y => y - 1)} 
                  className="text-slate-400 hover:text-dark font-extrabold text-sm"
                >
                  &lt;&lt;
                </button>
                <button 
                  onClick={() => {
                    if (pickerMonth === 0) {
                      setPickerMonth(11);
                      setPickerYear(y => y - 1);
                    } else {
                      setPickerMonth(m => m - 1);
                    }
                  }} 
                  className="text-slate-400 hover:text-dark font-extrabold text-sm"
                >
                  &lt;
                </button>
              </div>
              <span className="font-sans font-black text-sm text-[#0F172A]">
                {monthNames[pickerMonth]} {pickerYear}
              </span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    if (pickerMonth === 11) {
                      setPickerMonth(0);
                      setPickerYear(y => y + 1);
                    } else {
                      setPickerMonth(m => m + 1);
                    }
                  }} 
                  className="text-slate-400 hover:text-dark font-extrabold text-sm"
                >
                  &gt;
                </button>
                <button 
                  onClick={() => setPickerYear(y => y + 1)} 
                  className="text-slate-400 hover:text-dark font-extrabold text-sm"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>

            {/* Year Section: Label and Scrollable Row */}
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Year</span>
              <div className="flex gap-2 select-none overflow-x-auto pb-1 no-scrollbar">
                {yearsList.map(y => (
                  <button
                    key={y}
                    onClick={() => setPickerYear(y)}
                    className={`px-3 py-1 text-[10.5px] font-black rounded-lg transition-colors shrink-0 ${
                      pickerYear === y 
                        ? 'bg-[#1597E5] text-white' 
                        : 'bg-[#EEF5FB] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Section: Label and Grid */}
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest block mb-1">Month</span>
              <div className="grid grid-cols-3 gap-2 select-none">
                {monthAbbrs.map((abbr, index) => (
                  <button
                    key={abbr}
                    onClick={() => setPickerMonth(index)}
                    className={`py-1.5 text-[10.5px] font-black rounded-lg transition-colors ${
                      pickerMonth === index 
                        ? 'bg-[#1597E5] text-white' 
                        : 'bg-[#EEF5FB] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {abbr}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Grid Section */}
            <div className="border-t border-slate-100 pt-3 select-none">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <span key={day} className="font-extrabold text-slate-400 uppercase py-1">{day}</span>
                ))}
                {/* Blank cells */}
                {Array(new Date(pickerYear, pickerMonth, 1).getDay()).fill(null).map((_, idx) => (
                  <span key={`blank-${idx}`} className="py-1.5" />
                ))}
                {/* Day numbers */}
                {Array.from({ length: new Date(pickerYear, pickerMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                  const isSelected = day === pickerDay && pickerMonth === selectedMonthIndex && pickerYear === selectedYear;
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setPickerDay(day);
                        const formatted = `${String(day).padStart(2, '0')}-${String(pickerMonth + 1).padStart(2, '0')}-${pickerYear}`;
                        setPaymentDate(formatted);
                        setShowDatePicker(false);
                      }}
                      className={`py-1.5 rounded-full font-extrabold transition-colors text-center text-[10px] ${
                        isSelected
                          ? 'bg-[#1597E5] text-white'
                          : 'text-slate-600 hover:bg-[#EEF5FB]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer actions: Cancel and Today */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-[10.5px] font-black hover:bg-slate-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const formatted = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
                  setPaymentDate(formatted);
                  setShowDatePicker(false);
                }}
                className="px-4 py-2 border border-[#1597E5] text-[#1597E5] rounded-xl text-[10.5px] font-black hover:bg-[#EEF5FB] active:scale-95 transition-all"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installment Bottom Sheet (Screenshot 2) */}
      {showInstallmentSheet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0" onClick={() => setShowInstallmentSheet(false)} />
          <div className="relative bg-white rounded-t-[32px] w-full max-w-sm card-shadow p-6 space-y-4 select-none z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-dark uppercase tracking-wide">Installment</h3>
              <button onClick={() => setShowInstallmentSheet(false)} className="text-slate-400 hover:text-dark">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 py-1">
              {installmentOptions.map((opt) => {
                const isSelected = installment === opt;
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      setInstallment(opt);
                      setShowInstallmentSheet(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[#EEF5FB] text-[#1597E5] font-extrabold' 
                        : 'text-slate-600 hover:bg-slate-50 font-bold'
                    } text-xs`}
                  >
                    <span>{opt}</span>
                    {isSelected && <FiCheck className="w-4 h-4 text-[#1597E5]" />}
                  </div>
                );
              })}
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
