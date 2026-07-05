import React, { useState, useMemo, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiSearch, FiInbox, FiBookOpen, FiShare2,
  FiX, FiPrinter, FiDownload, FiCopy, FiChevronRight
} from 'react-icons/fi';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getFeeReports } from '../../../services/dataService';

const MOCK_PROFILES = {
  'mock-student-2': {
    fullName: 'KORADA BHARGAVSAI',
    academicClass: { name: '5' },
    section: { name: 'A' },
    profileFeePlans: [
      {
        isActive: true,
        totalAmount: 52000,
        profileFeePayments: [
          {
            id: 'mock-pay-3',
            amount: 5000,
            paymentMode: 'UPI',
            paymentDate: '2026-06-29',
            receiptNumber: 'RCPT-2026-SD-00004',
            status: 'RECORDED'
          }
        ]
      }
    ]
  },
  'mock-student-3': {
    fullName: 'GANDARDDI MANJUSHA',
    academicClass: { name: '4' },
    section: { name: 'A' },
    profileFeePlans: [
      {
        isActive: true,
        totalAmount: 50000,
        profileFeePayments: []
      }
    ]
  },
  'mock-student-4': {
    fullName: 'GONTHINA POORVESH',
    academicClass: { name: '4' },
    section: { name: 'A' },
    profileFeePlans: [
      {
        isActive: true,
        totalAmount: 50000,
        profileFeePayments: []
      }
    ]
  },
  'mock-student-5': {
    fullName: 'GANDARDDI HEAMANTH',
    academicClass: { name: '6' },
    section: { name: 'A' },
    profileFeePlans: [
      {
        isActive: true,
        totalAmount: 56000,
        profileFeePayments: []
      }
    ]
  },
  'mock-student-1': {
    fullName: 'KORADA KARTHIKEYA',
    academicClass: { name: '7' },
    section: { name: 'A' },
    profileFeePlans: [
      {
        isActive: true,
        totalAmount: 50000,
        profileFeePayments: [
          {
            id: 'mock-pay-1',
            amount: 50000,
            paymentMode: 'CASH',
            paymentDate: '2026-07-03',
            receiptNumber: 'REC-SD-1783057145704-816',
            status: 'RECORDED'
          }
        ]
      }
    ]
  }
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

const FeeLedger = () => {
  const { user, feeRefreshTrigger } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeSharePayment, setActiveSharePayment] = useState(null);

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

  const handleShareReceipt = (payment) => {
    setActiveSharePayment(payment);
  };
  const [firestorePayments, setFirestorePayments] = useState({});

  const branchId = user?.branchId || null;

  // Initialize selectedStudentId from location state if navigation passed it
  useEffect(() => {
    const routeStudentId = location.state?.studentId;
    if (routeStudentId) {
      setSelectedStudentId(routeStudentId);
    }
  }, [location.state?.studentId]);

  // Fetch PostgreSQL fee data
  const { data: rawFeePlans, loading } = useDataFetch(
    () => getFeeReports({ branchId }),
    [branchId, feeRefreshTrigger],
    { defaultValue: { students: [] }, pollInterval: 15000, skip: !branchId }
  );

  const studentsList = rawFeePlans?.students || [];

  const [selectedStudentFsPayments, setSelectedStudentFsPayments] = useState([]);

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
      console.warn('[FeeLedger] Firestore collection query failed (normal if rules restrict it):', err.message);
    });
    return () => unsub();
  }, [branchId]);

  // Fetch individual student Firestore payments to bypass collection permission limits
  useEffect(() => {
    if (!selectedStudentId || String(selectedStudentId).startsWith('mock-')) {
      setSelectedStudentFsPayments([]);
      return;
    }
    const unsub = onSnapshot(doc(db, 'fee_payments', selectedStudentId), (docSnap) => {
      if (docSnap.exists()) {
        setSelectedStudentFsPayments(docSnap.data().list || []);
      } else {
        setSelectedStudentFsPayments([]);
      }
    }, (err) => {
      console.warn('[FeeLedger] Selected student Firestore query failed:', err.message);
    });
    return () => unsub();
  }, [selectedStudentId]);

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
        studentId: s.studentId || '26SO0000',
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
    if (String(selectedStudentId).startsWith('mock-')) {
      const mock = MOCK_PROFILES[selectedStudentId] || MOCK_PROFILES['mock-student-2'];
      const plan = mock.profileFeePlans?.[0] || {};
      const paid = plan.profileFeePayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const total = plan.totalAmount || 50000;
      const due = Math.max(total - paid, 0);
      const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
      
      let status = 'DUE';
      if (due === 0) {
        status = 'PAID';
      } else if (paid > 0) {
        status = 'PARTIAL';
      }
      
      return {
        id: selectedStudentId,
        fullName: mock.fullName,
        className: `${mock.academicClass?.name || '5'} · ${mock.section?.name || 'A'}`,
        paidAmount: paid,
        dueAmount: due,
        totalAmount: total,
        percent: pct,
        status,
        isMock: true
      };
    }
    return normalizedLedgers.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, normalizedLedgers]);

  const selectedStudentPayments = useMemo(() => {
    if (!selectedStudentId) return [];
    
    if (String(selectedStudentId).startsWith('mock-')) {
      const mock = MOCK_PROFILES[selectedStudentId] || MOCK_PROFILES['mock-student-2'];
      const plan = mock.profileFeePlans?.[0] || {};
      return (plan.profileFeePayments || []).map(p => {
        const dateObj = p.paymentDate ? new Date(p.paymentDate) : new Date();
        return {
          id: p.id,
          amount: p.amount || 0,
          date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          mode: p.paymentMode || 'CASH',
          receiptNo: p.receiptNumber || p.id.slice(0, 8).toUpperCase(),
          status: p.status
        };
      });
    }
    
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

    const fsList = selectedStudentFsPayments.map((p, idx) => {
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
  }, [selectedStudentId, studentsList, selectedStudentFsPayments]);

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
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 shadow-sm flex items-center justify-between hover:border-[#1597E5]/15 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#EBFDFA] text-[#14B8A6] flex items-center justify-center text-lg font-extrabold shadow-inner shrink-0">
                      ?
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                        Rs {pay.amount.toLocaleString('en-IN')}
                      </h3>
                      <p className="text-[10px] text-[#4A5568] font-bold mt-0.5 uppercase tracking-wide">
                        {selectedStudent.fullName} · {pay.mode}
                      </p>
                      <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5">
                        {pay.date} | {pay.receiptNo}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleShareReceipt({
                      ...pay,
                      studentName: selectedStudent.fullName,
                      class: selectedStudent.className,
                      admissionNo: selectedStudent.studentId
                    })}
                    className="w-10 h-10 rounded-full bg-[#EBF8FF] hover:bg-[#BEE3F8] text-[#1597E5] flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-90"
                  >
                    <FiShare2 className="w-4.5 h-4.5" />
                  </button>
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

export default FeeLedger;
