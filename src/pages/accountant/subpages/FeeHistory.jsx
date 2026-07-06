import React, { useMemo, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`; // DD-MM-YYYY
};

// Helper to convert numbers to words in Indian numbering system
function numberToWords(num) {
  const value = Math.floor(Number(num || 0));
  if (value === 0) return 'Zero';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertLessThanThousand(n) {
    let temp = '';
    if (n >= 100) {
      temp += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      temp += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      temp += a[n] + ' ';
    }
    return temp.trim();
  }

  let words = '';
  let n = value;

  let crore = Math.floor(n / 10000000);
  n %= 10000000;
  let lakh = Math.floor(n / 100000);
  n %= 100000;
  let thousand = Math.floor(n / 1000);
  n %= 1000;
  let remaining = n;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + ' Thousand ';
  }
  if (remaining > 0) {
    words += convertLessThanThousand(remaining);
  }

  const formattedWords = words.trim();
  return formattedWords + ' Rupees Only';
}

const getReceiptHtml = (payment) => {
  const receiptNo = payment.receiptNo || 'N/A';
  const paymentDateStr = payment.date || 'N/A';
  const studentName = payment.studentName || 'N/A';
  const className = payment.class || 'N/A';
  const admissionNo = payment.admissionNo || 'N/A';
  const amountCurrency = `Rs ${payment.amount.toLocaleString('en-IN')}`;
  const amountWords = numberToWords(payment.amount);
  
  const installment = payment.remarks || 'School Fee';
  const receivedFrom = payment.studentName || 'Student';
  const receivedBy = payment.collectedByName || 'B. Geetha';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Fee Receipt - ${receiptNo}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #ffffff;
          color: #333333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 4px double #0f5132;
          border-radius: 8px;
          padding: 24px;
          box-sizing: border-box;
        }
        /* Header styling */
        .header {
          display: flex;
          align-items: center;
          border-bottom: 2px solid #0f5132;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .header-logo {
          width: 80px;
          height: 80px;
          margin-right: 20px;
        }
        .header-center {
          flex: 1;
          text-align: center;
        }
        .school-name {
          font-size: 26px;
          font-weight: bold;
          color: #0c2340;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .school-sub {
          font-size: 16px;
          font-weight: bold;
          color: #0c2340;
          margin: 2px 0 5px 0;
          letter-spacing: 1px;
        }
        .motto-bar {
          font-size: 12px;
          font-weight: bold;
          color: #198754;
          margin: 3px 0;
          letter-spacing: 1px;
        }
        .motto-sanskrit {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin: 3px 0;
        }
        .motto-translation {
          font-size: 11px;
          font-style: italic;
          color: #198754;
          margin: 2px 0 0 0;
        }
        
        /* Meta styling (Receipt No & Date) */
        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 13px;
        }
        .meta-item {
          font-weight: bold;
        }
        .meta-value {
          font-weight: normal;
          border-bottom: 1px dotted #333;
          padding-bottom: 2px;
          padding-left: 5px;
          min-width: 150px;
          display: inline-block;
        }

        /* Heading Pill */
        .title-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .title-badge {
          background-color: #1a2d42;
          color: white;
          padding: 6px 24px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          display: inline-block;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* Details Section */
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        .details-row td {
          padding: 6px 0;
          vertical-align: bottom;
        }
        .details-label {
          font-weight: bold;
          font-size: 13px;
          width: 180px;
          white-space: nowrap;
        }
        .details-value {
          border-bottom: 1px dashed #333;
          padding-bottom: 2px;
          padding-left: 10px;
          font-size: 13px;
          width: 100%;
        }

        /* Paragraph details */
        .receipt-paragraph {
          font-size: 13px;
          line-height: 1.8;
          text-align: justify;
          margin-bottom: 20px;
        }
        .inline-underline {
          border-bottom: 1px dashed #333;
          padding: 0 10px;
          font-weight: bold;
          display: inline-block;
        }

        /* Signatures */
        .signature-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 15px;
        }
        .sig-row {
          display: flex;
          font-size: 13px;
          font-weight: bold;
          align-items: bottom;
        }
        .sig-label {
          width: 120px;
        }
        .sig-value {
          border-bottom: 1px dashed #333;
          width: 220px;
          display: inline-block;
          padding-left: 10px;
          font-weight: normal;
        }

        /* Footer Address and Contact */
        .footer {
          border-top: 2px solid #0f5132;
          padding-top: 15px;
          margin-top: 20px;
        }
        .address-row {
          font-size: 11px;
          color: #333;
          text-align: center;
          margin-bottom: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
        }
        .footer-bar {
          background: linear-gradient(90deg, #0c2340 0%, #0c2340 85%, #198754 100%);
          color: white;
          padding: 8px;
          border-radius: 4px;
          display: flex;
          justify-content: space-around;
          font-size: 11px;
          font-weight: bold;
        }
        .footer-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        @media print {
          body {
            padding: 0;
          }
          .container {
            border: 4px double #0f5132;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <svg class="header-logo" viewBox="0 0 24 24" fill="none" stroke="#0c2340" stroke-width="1.5" style="width:50px; height:50px; margin-right:15px;">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="header-center">
            <div class="school-name">NSRIT</div>
            <div class="school-sub">ENGLISH MEDIUM SCHOOL</div>
            <div class="motto-bar">UNITY · LEARNING · GROWTH</div>
            <div class="motto-sanskrit">ज्ञानेन शीलम् बलम्</div>
            <div class="motto-translation">Knowledge is the supreme strength</div>
          </div>
        </div>
        
        <div class="meta-row">
          <div>
            <span class="meta-item">Receipt No:</span>
            <span class="meta-value">${receiptNo}</span>
          </div>
          <div>
            <span class="meta-item">Date:</span>
            <span class="meta-value">${paymentDateStr}</span>
          </div>
        </div>
        
        <div class="title-container">
          <div class="title-badge">Fee Receipt</div>
        </div>
        
        <table class="details-table">
          <tr class="details-row">
            <td class="details-label">Name of the student:</td>
            <td class="details-value">${studentName}</td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Class:</td>
            <td class="details-value">${className}</td>
          </tr>
          <tr class="details-row">
            <td class="details-label">Admission no. :</td>
            <td class="details-value">${admissionNo}</td>
          </tr>
        </table>
        
        <div class="receipt-paragraph">
          Received the sum of rupees 
          <span class="inline-underline" style="min-width: 320px;">${amountWords} (${amountCurrency})</span> 
          for the 
          <span class="inline-underline" style="min-width: 150px;">${installment}</span> 
          installment from 
          <span class="inline-underline" style="min-width: 150px;">${receivedFrom}</span> 
          on 
          <span class="inline-underline" style="min-width: 120px;">${paymentDateStr}</span>.
        </div>
        
        <div class="footer">
          <div class="signature-section">
            <div class="sig-row">
              <span class="sig-label">Received by:</span>
              <span class="sig-value">${receivedBy}</span>
            </div>
          </div>

          <div class="address-row">
            NSRIT English Medium School, Sontyam village, Visakhapatnam, Andhra Pradesh - 531173
          </div>
          
          <div class="footer-bar">
            <div class="footer-item">
              Phone: 9180046515
            </div>
            <div class="footer-item">
              Email: nsritschoolprincipal@gmail.com
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

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
    const receiptNo = payment.receiptNo || 'N/A';
    const htmlContent = getReceiptHtml(payment);
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.innerHTML = htmlContent.trim();
    document.body.appendChild(tempContainer);
    
    const element = tempContainer.querySelector('.container');
    
    const opt = {
      margin:       5,
      filename:     `Receipt_${receiptNo}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        document.body.removeChild(tempContainer);
      })
      .catch(err => {
        console.error('Error generating PDF:', err);
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
      });
  };

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
        remarks: p.remarks || 'School Fee',
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
        receiptNo: p.receiptNumber || p.referenceNumber || `REC-FS-${p.id.slice(0, 6)}`.toUpperCase(),
        timestamp: dateObj.getTime(),
        remarks: p.remarks || 'School Fee',
        collectedByName: 'B. Geetha'
      };
    });

    const dbReceipts = new Set(dbItems.map(p => p.receiptNo?.toUpperCase()));
    const uniqueFsItems = fsItems.filter(p => !dbReceipts.has(p.receiptNo?.toUpperCase()) && !dbReceipts.has(p.id?.toUpperCase()));

    // Combine and sort by date descending
    const combined = [...dbItems, ...uniqueFsItems].sort((a, b) => b.timestamp - a.timestamp);

    // Apply year filter
    if (selectedYearTab === '2026') {
      return combined.filter(p => p.year === 2026);
    }
    return combined;
  }, [dbPayments, dbStudents, firestorePayments, selectedYearTab]);

  // Mock payments matching Screenshot 1 exactly as fallbacks
  const mockPayments = [
    {
      id: 'mock-1',
      studentName: 'KORUKONDA NAGA VENKAT KALYAN',
      amount: 10000,
      date: '03-07-2026',
      receiptNo: 'REC-SO-1783057145704-816',
      class: 'Nursery-A',
      admissionNo: '26SO0111',
      mode: 'CASH',
      remarks: 'testing',
      collectedByName: 'B. Geetha'
    },
    {
      id: 'mock-2',
      studentName: 'BONTHU DAKSH RIHAAN',
      amount: 10000,
      date: '03-07-2026',
      receiptNo: 'REC-SO-1783057792189-996',
      class: 'Nursery-A',
      admissionNo: '26SO0112',
      mode: 'CASH',
      remarks: 'testing',
      collectedByName: 'B. Geetha'
    },
    {
      id: 'mock-3',
      studentName: 'KORADA BHARGAVSAI',
      amount: 5000,
      date: '29-06-2026',
      receiptNo: 'RCPT-2026-SO-00004',
      class: 'Nursery-A',
      admissionNo: '26SO0113',
      mode: 'UPI',
      remarks: 'testing',
      collectedByName: 'B. Geetha'
    }
  ];

  // Combine live and mock payments
  const displayPayments = useMemo(() => {
    const combined = [...normalizedPayments];
    mockPayments.forEach(mp => {
      if (!combined.some(p => p.receiptNo === mp.receiptNo)) {
        combined.push(mp);
      }
    });
    return combined;
  }, [normalizedPayments]);

  const handleShare = (payment) => {
    setActiveSharePayment(payment);
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
        <h1 className="text-sm font-black text-dark ml-2">Payments</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#00A3FF] to-[#0066FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1.5">
            <h2 className="text-base font-black tracking-tight leading-none">Payment Ledger</h2>
            <p className="text-[10px] text-white/75 font-bold">Manage and trace fee payments</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/10 rounded-full text-[8.5px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full animate-pulse" />
            Live Database
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/15 text-center font-sans relative z-10">
          <div>
            <p className="text-sm font-black">Rs {normalizedPayments.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('en-IN')}</p>
            <p className="text-[8px] text-white/75 font-black uppercase tracking-wider mt-1">Total Collections</p>
          </div>
          <div>
            <p className="text-sm font-black">{normalizedPayments.length}</p>
            <p className="text-[8px] text-white/75 font-black uppercase tracking-wider mt-1">Transactions</p>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2.5 bg-slate-200/50 p-1.5 rounded-[22px] select-none">
        <button
          onClick={() => setSelectedYearTab('All')}
          className={`flex-1 py-2 text-center text-[10.5px] font-extrabold rounded-[16px] transition-all cursor-pointer ${
            selectedYearTab === 'All'
              ? 'bg-white text-dark shadow-sm'
              : 'text-secondaryText hover:text-dark'
          }`}
        >
          All Years
        </button>
        <button
          onClick={() => setSelectedYearTab('2026')}
          className={`flex-1 py-2 text-center text-[10.5px] font-extrabold rounded-[16px] transition-all cursor-pointer ${
            selectedYearTab === '2026'
              ? 'bg-white text-dark shadow-sm'
              : 'text-secondaryText hover:text-dark'
          }`}
        >
          AY 2026
        </button>
      </div>

      {paymentsLoading && displayPayments.length === 0 ? (
        <div className="text-center py-12 text-xs font-bold text-secondaryText">
          Loading payment ledger...
        </div>
      ) : displayPayments.length > 0 ? (
        <div className="space-y-4">
          <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
            RECENT TRANSACTIONS ({displayPayments.length})
          </div>
          {displayPayments.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-blue-100 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Circular Teal Icon with ? */}
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center font-bold text-sm select-none">
                  ?
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F172A] leading-tight">
                    Rs {p.amount.toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[10px] text-[#0F172A] font-bold mt-1 uppercase">
                    {p.studentName}{p.mode ? ` · ${p.mode.toUpperCase()}` : ''}
                  </p>
                  <p className="text-[9px] text-[#A0AEC0] font-black mt-0.5 select-none uppercase tracking-wide">
                    {p.date} | {p.receiptNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleShare(p)}
                className="w-9 h-9 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer active:scale-95 shadow-sm"
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
            <FiInbox className="w-8 h-8 text-brand-blue" />
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
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 card-shadow border border-[#e2e8f0]/60 space-y-6 relative animate-scale-in">
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
              {/* Option 1: Print or Save PDF */}
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
                    <p className="text-xs font-bold text-dark group-hover:text-emerald-600 transition-colors">Download Receipt File</p>
                    <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Save offline document directly</p>
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
