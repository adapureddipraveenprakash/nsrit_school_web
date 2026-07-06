import { getReceiptHtml, downloadReceiptPdf, numberToWords } from '../../../utils/recieptGenerator';
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiInbox, FiShare2,
  FiX, FiPrinter, FiDownload, FiCopy, FiChevronRight
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getPaymentHistory, getStudents } from '../../../services/dataService';
import { db } from '../../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Helper to convert numbers to words in Indian numbering system


const FeeHistory = () => {
  const navigate = useNavigate();
  const { user, feeRefreshTrigger } = useApp();
  const [selectedYearTab, setSelectedYearTab] = useState('All'); // 'All' | '2026'
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
    const receiptNo = payment.receiptNo || 'N/A';
    const studentName = payment.studentName || 'N/A';
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
    const receiptNo = payment.receiptNo || 'N/A';
    const paymentDateStr = payment.date || 'N/A';
    const studentName = payment.studentName || 'N/A';
    const amountCurrency = `Rs ${payment.amount.toLocaleString('en-IN')}`;
    const amountWords = numberToWords(payment.amount);
    
    const details = `NSRIT ENGLISH MEDIUM SCHOOL\nFee Receipt\nReceipt No: ${receiptNo}\nDate: ${paymentDateStr}\nStudent: ${studentName}\nAmount: ${amountCurrency} (${amountWords})\nCollected By: ${payment.collectedByName || 'B. Geetha'}`;
    
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
        timestamp: dateObj.getTime(),
        remarks: p.remarks || '',
        collectedByName: p.collectedBy?.fullName || 'B. Geetha'
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
        timestamp: dateObj.getTime(),
        remarks: p.remarks || '',
        collectedByName: 'B. Geetha'
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
              <button
                onClick={() => handleShareReceipt(p)}
                className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center hover:bg-[#1597E5]/10 transition-colors cursor-pointer"
              >
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

              {/* Option 2: Native Share */}
              {navigator.share && (
                <button
                  onClick={() => {
                    handleNativeShare(activeSharePayment);
                    setActiveSharePayment(null);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#EBFDFA] border border-[#e2e8f0]/40 rounded-[20px] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EBFDFA] text-[#14B8A6] flex items-center justify-center">
                      <FiShare2 className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-dark group-hover:text-[#14B8A6] transition-colors">Send to WhatsApp / Email</p>
                      <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Share using system apps</p>
                    </div>
                  </div>
                  <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#14B8A6] transition-colors" />
                </button>
              )}

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

export default FeeHistory;
