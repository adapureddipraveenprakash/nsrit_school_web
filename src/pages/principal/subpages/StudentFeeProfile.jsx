import { getReceiptHtml, downloadReceiptPdf, numberToWords } from '../../../utils/recieptGenerator';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiEdit2, FiAlertCircle, FiSettings, FiGrid, FiUser,
  FiPhone, FiTrendingUp, FiCreditCard, FiClock, FiCheckCircle, FiShare2,
  FiX, FiPrinter, FiDownload, FiCopy, FiChevronRight
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { getStudentFeeProfile } from '../../../services/dataService';


// Helper to convert numbers to words in Indian numbering system


const StudentFeeProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const branchId = user?.branchId || 'sontyam-branch-id';

  const [studentDetails, setStudentDetails] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeSharePayment, setActiveSharePayment] = useState(null);



  const triggerPrintReceipt = (payment) => {
    const htmlContent = getReceiptHtml(payment);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1500);
    }, 500);
  };

  const handleNativeShare = async (payment) => {
    const receiptNo = payment.receiptNo || payment.receiptNumber || 'N/A';
    const studentName = studentDetails?.fullName || 'N/A';
    const amountCurrency = `Rs ${payment.amount.toLocaleString('en-IN')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fee Receipt - ${receiptNo}`,
          text: `Fee receipt generated for ${studentName} of amount ${amountCurrency}. Receipt No: ${receiptNo}.`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

const handleDownloadPdf = (payment) => {
    downloadReceiptPdf(payment);
  };;

  const handleCopyDetails = (payment) => {
    const receiptNo = payment.receiptNo || payment.receiptNumber || 'N/A';
    const paymentDateStr = new Date(payment.paymentDate).toLocaleDateString('en-GB').replace(/\//g, '-');
    const studentName = studentDetails?.fullName || 'N/A';
    const amountCurrency = `Rs ${payment.amount.toLocaleString('en-IN')}`;
    const amountWords = numberToWords(payment.amount);
    
    const details = `NSRIT AI ALGO\nFee Receipt\nReceipt No: ${receiptNo}\nDate: ${paymentDateStr}\nStudent: ${studentName}\nAmount: ${amountCurrency} (${amountWords})\nCollected By: ${payment.collectedBy?.fullName || payment.collectedByName || 'B. Geetha'}`;
    
    navigator.clipboard.writeText(details)
      .then(() => {
        alert('Receipt details copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleShareReceipt = (payment) => {
    setActiveSharePayment(payment);
  };

  const fetchProfile = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentFeeProfile(studentId);
      if (res && res.student) {
        setStudentDetails(res.student);
        const plans = res.student.profileFeePlans || [];
        const active = plans.find(p => p.isActive !== false) || plans[0] || null;
        setActivePlan(active);
        
        if (active) {
          setPayments(active.profileFeePayments || []);
        } else {
          setPayments([]);
        }
      }
      

    } catch (err) {
      console.error('Error fetching student fee profile:', err);
      setError(err.message || 'Error loading fee profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  // Combine Postgres and Firestore payments
  const allPayments = useMemo(() => {
    const dbItems = payments.map(p => {
      const receiptNoVal = p.receiptNumber || p.id.slice(0, 8).toUpperCase();
      const dateVal = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A';
      return {
        id: p.id,
        amount: p.amount || 0,
        paymentMode: p.paymentMode || 'CASH',
        paymentDate: p.paymentDate,
        date: dateVal,
        receiptNumber: receiptNoVal,
        receiptNo: receiptNoVal,
        remarks: p.remarks || p.installment || 'School Fee',
        status: p.status || 'RECORDED',
        studentName: studentDetails?.fullName || 'Unknown Student',
        class: studentDetails?.academicClass ? `${studentDetails.academicClass.name}-${studentDetails.section?.name || 'A'}` : 'N/A',
        admissionNo: studentDetails?.studentId || 'N/A',
        collectedByName: p.collectedBy?.fullName || 'B. Geetha'
      };
    });

    return dbItems.sort((a, b) => {
      const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [payments, studentDetails]);

  // Compute calculated metrics
  const metrics = useMemo(() => {
    if (!activePlan) {
      return { total: 0, paid: 0, due: 0, rate: 0 };
    }

    const total = activePlan.totalAmount || 0;
    const paid = allPayments
      .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const due = Math.max(total - paid, 0);
    const rate = total > 0 ? (paid / total) * 100 : 0;

    return { total, paid, due, rate };
  }, [activePlan, allPayments]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
      </div>
    );
  }

  const studentName = studentDetails?.fullName || 'Unknown Student';
  const admissionNo = studentDetails?.studentId || '26SO0000';
  const classSection = studentDetails?.academicClass 
    ? `${studentDetails.academicClass.name}-${studentDetails.section?.name || 'A'}` 
    : 'Not Assigned';
  const parentMobile = studentDetails?.parent?.phoneNumber || 'Not Available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-[640px] mx-auto animate-fade-in font-sans"
    >
      {/* Top Header Bar */}
      <header className="relative flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          Student Fee Profile
        </h1>
        <div className="w-9 h-9" />
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="mb-2 relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-bold tracking-wider uppercase">FEE PROFILE</span>
        </div>

        {/* Student Name */}
        <h2 className="text-lg font-black relative z-10 leading-tight">
          {studentName.toUpperCase()}
        </h2>
        <p className="text-[10px] text-white/80 font-bold mt-1 relative z-10 uppercase">
          #{admissionNo} · {classSection}
        </p>

        {/* Triple metrics widget inside card */}
        <div className="relative z-10 grid grid-cols-3 gap-1 pt-4 border-t border-white/15 text-center mt-5">
          <div className="border-r border-white/15 last:border-none">
            <p className="text-xs font-black">Rs {metrics.total.toLocaleString('en-IN')}</p>
            <p className="text-[7.5px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Total</p>
          </div>
          <div className="border-r border-white/15 last:border-none">
            <p className="text-xs font-black text-emerald-300">Rs {metrics.paid.toLocaleString('en-IN')}</p>
            <p className="text-[7.5px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Paid</p>
          </div>
          <div>
            <p className="text-xs font-black text-pink-200">Rs {metrics.due.toLocaleString('en-IN')}</p>
            <p className="text-[7.5px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Due</p>
          </div>
        </div>

        {/* Progress bar and text */}
        <div className="mt-5 space-y-2 relative z-10">
          <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
            <div className="bg-[#23C16B] h-full rounded-full" style={{ width: `${Math.min(metrics.rate, 100)}%` }} />
          </div>
          <div className="flex justify-between items-center text-[9px] text-white/85 font-extrabold leading-none">
            <span>{metrics.rate.toFixed(1)}% paid</span>
            <button
              onClick={() => navigate(`/settings/create-fee-plan/${studentId}`)}
              className="px-4 py-1.5 bg-white text-brand-blue rounded-full text-[9px] font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-md shadow-brand-blue/10 hover:bg-slate-50"
            >
              <FiEdit2 className="w-2.5 h-2.5" />
              <span>Edit Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Details section */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4">
        <p className="text-[9px] font-extrabold text-[#A0AEC0] uppercase tracking-wider px-1">
          Student Details
        </p>

        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0">
              <FiGrid className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[8px] text-[#A0AEC0] uppercase font-bold">Class & Section</p>
              <p className="text-xs font-extrabold text-dark mt-0.5">{classSection}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0">
              <FiPhone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[8px] text-[#A0AEC0] uppercase font-bold">Parent Mobile</p>
              <p className="text-xs font-extrabold text-dark mt-0.5">{parentMobile}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Summary Section */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
        <p className="text-[9px] font-extrabold text-[#A0AEC0] uppercase tracking-wider px-1">
          Fee Summary
        </p>

        <div className="divide-y divide-[#e2e8f0]/30">
          <div className="flex justify-between items-center py-2.5">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-[#A0AEC0]" />
              <span className="text-xs font-bold text-dark">Total Fee</span>
            </div>
            <span className="text-xs font-black text-dark">Rs {metrics.total.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-accent-green" />
              <span className="text-xs font-bold text-dark">Paid Fee</span>
            </div>
            <span className="text-xs font-black text-accent-green">Rs {metrics.paid.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-secondaryText" />
              <span className="text-xs font-bold text-dark">Due Fee</span>
            </div>
            <span className="text-xs font-black text-dark">Rs {metrics.due.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Fee Breakup Card */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
        <p className="text-[9px] font-extrabold text-[#A0AEC0] uppercase tracking-wider px-1">
          Fee Breakup
        </p>

        <div className="divide-y divide-[#e2e8f0]/30">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-bold text-dark">1st Term</span>
            <span className="text-xs font-black text-dark">Rs {(activePlan?.term1Fee || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-bold text-dark">2nd Term</span>
            <span className="text-xs font-black text-dark">Rs {(activePlan?.term2Fee || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-bold text-dark">3rd Term</span>
            <span className="text-xs font-black text-dark">Rs {(activePlan?.term3Fee || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-bold text-dark">Books Fee</span>
            <span className="text-xs font-black text-dark">Rs {(activePlan?.booksFee || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-bold text-dark">Transport Fee</span>
            <span className="text-xs font-black text-dark">Rs {(activePlan?.transportFee || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* Render extra custom fee items if any */}
          {(activePlan?.profileFeeItems || []).map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2.5">
              <span className="text-xs font-bold text-dark">{item.category?.name || 'Additional Item'}</span>
              <span className="text-xs font-black text-dark">Rs {(item.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          ))}

          {activePlan?.concessionAmount > 0 && (
            <div className="flex justify-between items-center py-2.5 text-pink-500">
              <span className="text-xs font-bold">Concession ({activePlan.concessionType})</span>
              <span className="text-xs font-black">- Rs {activePlan.concessionAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 bg-[#EEF5FB]/40 px-3 rounded-xl mt-2">
            <span className="text-xs font-black text-brand-blue">Gross Fee</span>
            <span className="text-xs font-black text-brand-blue">Rs {metrics.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Record Payment Action Button */}
      <button
        onClick={() => {
          if (user?.role === 'ACCOUNTANT') {
            navigate(`/settings/record-payment?studentId=${studentId}`);
          } else {
            navigate(`/settings/collection?studentId=${studentId}`);
          }
        }}
        className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/15 transition-all cursor-pointer active:scale-95"
      >
        <FiCreditCard className="w-5 h-5" />
        <span>Record Payment</span>
      </button>

      {/* No fee plan block */}
      {!activePlan && (
        <div className="text-center py-10 bg-white rounded-[32px] border border-[#e2e8f0]/40 p-8 card-shadow space-y-4 select-none">
          <div className="w-16 h-16 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center mx-auto">
            <FiGrid className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xs font-black text-dark">No fee plan</h3>
            <p className="text-[10px] text-secondaryText mt-1">Create a fee plan before collecting payments.</p>
          </div>
        </div>
      )}

      {/* Payment Timeline */}
      <div className="space-y-3.5 pt-1">
        <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block px-1">
          Payment Timeline
        </span>

        {allPayments.length > 0 ? (
          <div className="space-y-3">
            {allPayments.map((p) => {
              const isReversed = String(p.status || 'RECORDED').toUpperCase() === 'REVERSED';
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-[22px] p-5 card-shadow border border-[#e2e8f0]/45 flex justify-between items-center group transition-all ${isReversed ? 'opacity-60 bg-slate-50/50' : 'hover:border-brand-blue/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isReversed ? 'bg-rose-100 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isReversed ? '!' : '?'}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-dark leading-none">
                        Rs {p.amount.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                        {p.remarks || 'School Fee'} · {p.paymentMode} {isReversed ? '(Reversed)' : ''}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold">
                        {new Date(p.paymentDate).toLocaleDateString('en-GB').replace(/\//g, '-')} | {p.receiptNumber || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {!isReversed && (
                    <button
                      onClick={() => handleShareReceipt(p)}
                      className="w-10 h-10 rounded-full bg-[#EBF8FF] hover:bg-[#BEE3F8] text-[#1597E5] flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-90"
                    >
                      <FiShare2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-[32px] border border-[#e2e8f0]/40 p-8 card-shadow space-y-4 select-none">
            <div className="w-16 h-16 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center mx-auto">
              <FiGrid className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xs font-black text-dark">No payments</h3>
              <p className="text-[10px] text-secondaryText mt-1">Recorded payments will appear here.</p>
            </div>
          </div>
        )}
      </div>

      {/* Share Options Modal */}
      {activeSharePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 card-shadow border border-[#e2e8f0]/60 space-y-6 relative">
            <button
              onClick={() => setActiveSharePayment(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-dark">Share Receipt</h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Select an option to save or share this receipt.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Save / Print PDF */}
              <button
                onClick={() => {
                  triggerPrintReceipt(activeSharePayment);
                  setActiveSharePayment(null);
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#EEF5FB] border border-[#e2e8f0]/40 rounded-[20px] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center">
                    <FiPrinter className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">Print or Save PDF</p>
                    <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Use browser print to save on your PC</p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1597E5] transition-colors" />
              </button>

              {/* Option 3: Download Offline PDF */}
              <button
                onClick={() => {
                  handleDownloadPdf(activeSharePayment);
                  setActiveSharePayment(null);
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-[#e2e8f0]/40 rounded-[20px] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiDownload className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-dark group-hover:text-emerald-600 transition-colors">Download PDF Receipt</p>
                    <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Save offline PDF document directly</p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              {/* Option 4: Copy Details */}
              <button
                onClick={() => {
                  handleCopyDetails(activeSharePayment);
                  setActiveSharePayment(null);
                }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-purple-50 border border-[#e2e8f0]/40 rounded-[20px] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FiCopy className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-dark group-hover:text-purple-600 transition-colors">Copy Receipt Text</p>
                    <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Copy raw info to clipboard</p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentFeeProfile;
