import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiInbox, FiBookOpen, FiShare2 } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { getStudentFeeProfile } from '../../../services/dataService';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const FeeLedger = () => {
  const { activeRole } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = location.state?.studentId;

  const [search, setSearch] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getStudentFeeProfile(studentId);
        if (active) {
          setStudentDetails(res.student);
        }
      } catch (err) {
        console.error('Error fetching student fee profile:', err);
        if (active) setError('Failed to load student fee profile.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProfile();
    return () => { active = false; };
  }, [studentId]);

  if (studentId) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen text-xs font-semibold text-secondaryText">
          Loading student fee profile...
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 max-w-[640px] mx-auto text-center py-12">
          <p className="text-xs font-semibold text-rose-500">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#EEF5FB] text-brand-blue rounded-full text-xs font-bold"
          >
            Go Back
          </button>
        </div>
      );
    }

    if (!studentDetails) {
      return (
        <div className="p-4 max-w-[640px] mx-auto text-center py-12">
          <p className="text-xs font-semibold text-secondaryText">Student profile not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#EEF5FB] text-brand-blue rounded-full text-xs font-bold"
          >
            Go Back
          </button>
        </div>
      );
    }

    const plan = (studentDetails.profileFeePlans || []).find(p => p.isActive !== false) || studentDetails.profileFeePlans?.[0];
    const totalFee = plan?.totalAmount || 0;
    const payments = plan?.profileFeePayments || [];
    const paidAmount = payments
      .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const dueAmount = Math.max(totalFee - paidAmount, 0);
    const progressPercent = totalFee > 0 ? Math.round((paidAmount / totalFee) * 100) : 0;

    let status = 'Due';
    if (progressPercent === 100) status = 'Paid';
    else if (progressPercent > 0) status = 'Partial';

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Student Fee</h1>
        </header>

        {/* Curved blue card matching Screenshot 1 */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

          {/* Header Info with Badge */}
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">
                {studentDetails.fullName}
              </h2>
              <p className="text-xs text-white/80 font-semibold mt-1">
                {studentDetails.academicClass?.name || ''} - Section {studentDetails.section?.name || 'A'}
              </p>
            </div>
            
            {/* Status Badge */}
            <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold flex items-center gap-1.5 ${
              status === 'Paid' ? 'bg-[#D1FAE5] text-[#065F46]' :
              status === 'Partial' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'Paid' ? 'bg-[#065F46]' :
                status === 'Partial' ? 'bg-[#D97706]' : 'bg-[#991B1B]'
              }`} />
              {status}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-4 z-10 relative">
            <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="flex justify-between items-center text-xs text-white/90 font-bold mt-3 z-10 relative">
            <span>Rs {paidAmount.toLocaleString('en-IN')} paid</span>
            <span>Rs {dueAmount.toLocaleString('en-IN')} due</span>
          </div>
        </div>

        {/* Ledger card matching Screenshot 1 */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <div className="flex items-center gap-2.5 px-1 text-[10px] font-bold text-secondaryText uppercase tracking-wider">
            <FiBookOpen className="w-4 h-4 text-brand-blue" />
            <span>Ledger</span>
          </div>
          
          <div className="divide-y divide-[#e2e8f0]/50 text-xs font-semibold font-sans">
            <div className="flex justify-between items-center py-3">
              <span className="text-[#4A5568]">Total Fee</span>
              <span className="text-[#0F172A] font-extrabold uppercase">Rs {totalFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-[#4A5568]">Paid Amount</span>
              <span className="text-[#23C16B] font-extrabold uppercase">Rs {paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-[#4A5568]">Remaining Balance</span>
              <span className="text-[#FF3B30] font-extrabold uppercase">Rs {dueAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Transactions Section matching Screenshot 1 */}
        <div className="space-y-3">
          <div className="px-1 text-[10px] font-black text-secondaryText tracking-widest uppercase">
            ? Transactions
          </div>

          {payments.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-8 text-center text-xs font-bold text-secondaryText">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {/* Circle icon with question mark */}
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center font-bold text-xs select-none">
                      ?
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-dark">
                        Rs {Number(p.amount || 0).toLocaleString('en-IN')}
                      </h3>
                      <p className="text-[10px] text-dark font-semibold mt-0.5">
                        {studentDetails.fullName} · {p.paymentMode || 'UPI'}
                      </p>
                      <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5">
                        {formatDate(p.paymentDate)} | {p.receiptNumber || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <button className="w-9 h-9 rounded-full bg-[#EBF8FF] text-brand-blue flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer active:scale-95">
                    <FiShare2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

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
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fee Ledger</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Curved blue card */}
            <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

              <p className="text-[10px] text-white/75 font-bold tracking-wider uppercase">Parent Portal</p>
              <h2 className="text-xl font-black mt-1 tracking-tight">Fee Ledger</h2>
              <p className="text-xs text-white/80 font-bold mt-1">Complete fee record for your children</p>
            </div>

            {/* Child Metadata block */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-[24px] border border-[#e2e8f0]/40 card-shadow">
              <div className="w-12 h-12 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] font-bold text-sm shrink-0">
                PP
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0F172A] leading-tight">
                  PATCHAMATLA PRANEETH VARMA
                </h3>
                <p className="text-xs text-secondaryText font-bold mt-0.5">
                  1-A · AY 2026
                </p>
              </div>
            </div>

            {/* Stat cards block with progress bar */}
            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-slate-100 font-sans">
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-black text-[#0F172A]">Rs 41,000</span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Total Fee</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-black text-[#23C16B]">Rs 0</span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Paid</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-black text-[#FF3B30]">Rs 41,000</span>
                  <span className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-1">Pending</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] font-black text-secondaryText">
                  <span>Payment Progress</span>
                  <span className="text-[#0088ff]">0%</span>
                </div>
                <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0088ff] h-full rounded-full transition-all duration-300" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            {/* Toggle breakdown */}
            <div className="flex justify-center select-none">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#EEF5FB] hover:bg-[#e2effa] text-[#0088ff] text-[10px] font-black rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {showBreakdown ? (
                  <>
                    <span>Hide Breakdown</span>
                    <span className="text-[8px] font-bold">▲</span>
                  </>
                ) : (
                  <>
                    <span>Show Breakdown</span>
                    <span className="text-[8px] font-bold">▼</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
              Term Breakdown
            </div>

            {showBreakdown && (
              <div className="space-y-3">
                {[
                  { term: 'Term I', amount: 16400, index: 1 },
                  { term: 'Term II', amount: 16400, index: 2 },
                  { term: 'Term III', amount: 8200, index: 3 }
                ].map((item) => (
                  <div
                    key={item.index}
                    className="bg-white rounded-[20px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] font-bold text-xs shrink-0 select-none">
                        {item.index}
                      </div>
                      <span className="text-xs font-black text-[#0F172A]">{item.term}</span>
                    </div>
                    <span className="text-xs font-black text-[#0088ff]">Rs {item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Ledger</h1>
      </header>

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
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
      </div>

      {/* Empty State Card */}
      <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px]">
        {/* Concentric Circle Icon Container */}
        <div className="w-20 h-20 rounded-full bg-[#EBF8FF] border border-[#BEE3F8] flex items-center justify-center text-[#3182CE] relative">
          <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
          <FiInbox className="w-9 h-9" />
        </div>

        <div className="space-y-2 max-w-[280px]">
          <h3 className="text-sm font-extrabold text-dark">No ledger records</h3>
          <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
            Fee records will appear here.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FeeLedger;
