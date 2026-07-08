import html2pdf from 'html2pdf.js';
import dataConnectClient from '../services/dataConnectClient';


// Helper to convert numbers to words in Indian numbering system
export function numberToWords(num) {
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

export const padBranchCode = branchCode =>
  String(branchCode || '').padStart(2, '0').slice(-2);

export const formatReceiptNumber = ({ year, branchCode, sequence }) =>
  `RCPT-${year}-${padBranchCode(branchCode)}-${String(sequence).padStart(5, '0')}`;

export async function generateReceipt({ branchCode, year }) {
  const currentYearVal = year || new Date().getFullYear();
  const response = await dataConnectClient.query(
    'GetReceiptSequence',
    {
      year: currentYearVal,
      branchCode: padBranchCode(branchCode),
    }
  );

  let lastSequence =
    response?.receiptSequences?.[0]?.lastSequence || 0;

  if (lastSequence >= 10000) {
    lastSequence = 0;
  }

  const sequence = lastSequence + 1;

  return {
    receiptYear: currentYearVal,
    branchCode: padBranchCode(branchCode),
    receiptSequence: sequence,
    receiptNumber: formatReceiptNumber({
      year: currentYearVal,
      branchCode,
      sequence,
    }),
  };
}

export function getPaymentReceiptNo(payment, student, index) {
  if (!payment) return 'N/A';

  // Extract sequence first
  let sequence = payment.receiptSequence;
  const rawNo = payment.receiptNumber || payment.receiptNo || payment.referenceNumber;
  if (!sequence && rawNo) {
    const parts = String(rawNo).split('-');
    const lastPart = parts[parts.length - 1];
    const parsed = Number(lastPart);
    if (!isNaN(parsed) && parsed > 0) {
      sequence = parsed;
    }
  }

  // If sequence is legacy random (>= 10000), ignore it and use index-based fallback
  if (sequence >= 10000) {
    sequence = null;
  }

  // If we have a clean valid sequence and it's already formatted, return early!
  if (sequence && rawNo && String(rawNo).startsWith('RCPT-') && !String(rawNo).includes('REC-')) {
    const parts = String(rawNo).split('-');
    const lastPart = Number(parts[parts.length - 1]);
    if (lastPart < 10000) {
      return rawNo;
    }
  }

  if (!sequence) {
    sequence = (index || 0) + 1;
  }

  // Extract year
  let year = payment.receiptYear;
  if (!year && payment.paymentDate) {
    const parts = String(payment.paymentDate).split('-');
    if (parts.length === 3) {
      if (parts[2].length === 4) year = Number(parts[2]);
      else if (parts[0].length === 4) year = Number(parts[0]);
    }
  }
  if (!year && payment.date) {
    const parts = String(payment.date).split('-');
    if (parts.length === 3) {
      if (parts[2].length === 4) year = Number(parts[2]);
      else if (parts[0].length === 4) year = Number(parts[0]);
    }
  }
  if (!year) {
    year = new Date().getFullYear();
  }

  // Extract branchCode
  let branchCode = payment.branchCode;
  if (!branchCode && student) {
    branchCode = student.branchCode || student.branch?.branchCode || student.branch?.code;
  }
  if (!branchCode) {
    branchCode = 'SD';
  }
  branchCode = padBranchCode(branchCode);

  return formatReceiptNumber({ year, branchCode, sequence });
}

export const getReceiptHtml = (payment) => {
  const receiptNo = getPaymentReceiptNo(payment, null, 0);
  let date = payment.date;
  if (!date && payment.paymentDate) {
    const d = new Date(payment.paymentDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    date = `${day}-${month}-${year}`;
  }
  if (!date) {
    date = 'N/A';
  }
  const studentName = payment.studentName || 'N/A';
  const className = payment.class || 'N/A';
  const admissionNo = payment.admissionNo || 'N/A';
  const amountCurrency = `Rs ${(payment.amount || 0).toLocaleString('en-IN')}`;
  const amountWords = numberToWords(payment.amount || 0);
  
  const installment = payment.remarks || 'School Fee';
  const receivedFrom = payment.studentName || 'Student';
  const receivedBy = payment.collectedByName || 'B. Geetha';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Fee Receipt</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 0;
        }

        html,
        body {
          width: 297mm;
          height: 210mm;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #ffffff;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .container {
          width: 277mm;
          height: 190mm;
          margin: 10mm auto;
          border: 3px solid #0f5132;
          border-radius: 16px;
          padding: 24px;
          box-sizing: border-box;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          page-break-inside: avoid;
          page-break-before: avoid;
          page-break-after: avoid;
        }

        /* Header styling */
        .header {
          display: flex;
          align-items: center;
          border-bottom: 2px solid #0f5132;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .header-center {
          flex: 1;
          text-align: center;
          box-sizing: border-box;
        }
        .school-name {
          font-size: 24px;
          font-weight: 800;
          color: #0c2340;
          margin: 0;
          letter-spacing: 2px;
          line-height: 1.1;
        }
        .school-sub {
          font-size: 13px;
          font-weight: 700;
          color: #0c2340;
          margin: 4px 0 2px 0;
          letter-spacing: 1px;
          line-height: 1.1;
        }
        .motto-bar {
          font-size: 9px;
          font-weight: 800;
          color: #198754;
          margin: 4px 0;
          letter-spacing: 1.5px;
          line-height: 1.1;
        }
        .motto-sanskrit {
          font-size: 11px;
          font-weight: 700;
          color: #333;
          margin: 4px 0;
          line-height: 1.1;
        }
        .motto-translation {
          font-size: 8.5px;
          font-style: italic;
          font-weight: 700;
          color: #198754;
          margin: 2px 0 0 0;
          line-height: 1.1;
        }

        /* Meta styling (Receipt No & Date) */
        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          font-size: 13px;
        }
        .meta-item-container {
          display: flex;
          align-items: baseline;
        }
        .meta-label {
          font-weight: bold;
          color: #000;
          padding-right: 6px;
        }
        .meta-value-dotted {
          border-bottom: 1.5px dotted #333;
          padding-bottom: 1px;
          padding-left: 8px;
          min-width: 220px;
          font-weight: bold;
          color: #000;
          display: inline-block;
        }

        /* Heading Pill */
        .title-container {
          text-align: center;
          margin-bottom: 24px;
        }
        .title-badge {
          background-color: #0c2340;
          color: white;
          padding: 6px 28px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 800;
          display: inline-block;
          letter-spacing: 1px;
        }

        /* Details Section */
        .details-section {
          margin-bottom: 24px;
          width: 100%;
        }
        .detail-row {
          display: flex;
          align-items: baseline;
          margin-bottom: 16px;
        }
        .detail-label {
          font-weight: bold;
          font-size: 13px;
          color: #000;
          white-space: nowrap;
          padding-right: 6px;
        }
        .detail-value {
          flex-grow: 1;
          border-bottom: 1.5px dotted #333;
          padding-left: 8px;
          font-size: 13px;
          font-weight: bold;
          color: #000;
        }

        /* Paragraph details */
        .receipt-paragraph {
          font-size: 13px;
          line-height: 2.2;
          text-align: justify;
          margin-bottom: 24px;
          color: #000;
        }
        .inline-underline-value {
          border-bottom: 1.5px dotted #333;
          padding: 0 8px;
          font-weight: bold;
          color: #000;
          display: inline-block;
          text-align: center;
        }

        /* Received By Section */
        .received-by-section {
          margin-bottom: 24px;
        }
        .received-by-row {
          display: flex;
          align-items: baseline;
        }
        .received-by-label {
          font-weight: bold;
          font-size: 13px;
          color: #000;
          white-space: nowrap;
          padding-right: 6px;
        }
        .received-by-value {
          width: 250px;
          border-bottom: 1.5px dotted #333;
          padding-left: 8px;
          font-size: 13px;
          font-weight: bold;
          color: #000;
        }

        /* Footer Address and Contact */
        .footer {
          margin-top: auto;
        }
        .address-row {
          font-size: 9.5px;
          font-weight: bold;
          color: #333;
          text-align: center;
          margin-bottom: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
        }
        .footer-bar {
          background: linear-gradient(90deg, #0c2340 0%, #0c2340 80%, #198754 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          display: flex;
          justify-content: space-around;
          font-size: 9.5px;
          font-weight: bold;
        }
        .footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div>
          <!-- Header with School Info -->
          <div class="header">
            <div class="header-center">
              <div class="school-name">NSRIT</div>
              <div class="school-sub">ENGLISH MEDIUM SCHOOL</div>
              <div class="motto-bar">UNITY • LEARNING • GROWTH</div>
              <div class="motto-sanskrit">ज्ञानं परमं बलम्</div>
              <div class="motto-translation">Knowledge is the supreme strength</div>
            </div>
          </div>
          
          <!-- Meta-Row for Receipt No & Date -->
          <div class="meta-row">
            <div class="meta-item-container">
              <span class="meta-label">Receipt No:</span>
              <span class="meta-value-dotted">${receiptNo}</span>
            </div>
            <div class="meta-item-container">
              <span class="meta-label">Date:</span>
              <span class="meta-value-dotted">${date}</span>
            </div>
          </div>
          
          <!-- Badge -->
          <div class="title-container">
            <div class="title-badge">FEE RECEIPT</div>
          </div>
          
          <!-- Student Details Section -->
          <div class="details-section">
            <div class="detail-row">
              <span class="detail-label">Name of the student:</span>
              <span class="detail-value">${studentName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Class:</span>
              <span class="detail-value">${className}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Admission no. :</span>
              <span class="detail-value">${admissionNo}</span>
            </div>
          </div>
          
          <!-- Receipt Paragraph -->
          <div class="receipt-paragraph">
            Received the sum of rupees 
            <span class="inline-underline-value" style="min-width: 280px;">${amountWords} (${amountCurrency})</span> 
            for the 
            <span class="inline-underline-value" style="min-width: 140px;">${installment}</span> 
            installment from 
            <span class="inline-underline-value" style="min-width: 200px;">${receivedFrom}</span> 
            on 
            <span class="inline-underline-value" style="min-width: 120px;">${date}</span>.
          </div>
        </div>
        
        <!-- Footer Area -->
        <div class="footer">
          <div class="received-by-section">
            <div class="received-by-row">
              <span class="received-by-label">Recorded by:</span>
              <span class="received-by-value">${receivedBy}</span>
            </div>
          </div>

          <div class="address-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#333" style="display:inline-block; vertical-align:middle; margin-right:4px;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            NSRIT English Medium School, Sontyam village, Visakhapatnam, Andhra Pradesh - 531173
          </div>
          
          <div class="footer-bar">
            <div class="footer-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" style="display:inline-block; vertical-align:middle; margin-right:6px;">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.79 6.35 8.59 5.16 8.59 3.93c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.58c0-.56-.45-1-1-1z"/>
              </svg>
              9100046515
            </div>
            <div class="footer-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" style="display:inline-block; vertical-align:middle; margin-right:6px;">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              nsritschoolprincipal@gmail.com
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const downloadReceiptPdf = (payment) => {
  const receiptNo = payment.receiptNo || payment.receiptNumber || 'N/A';
  const htmlContent = getReceiptHtml(payment);
  
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.innerHTML = htmlContent.trim();
  document.body.appendChild(tempContainer);
  
  const element = tempContainer.querySelector('.container');
  
  const opt = {
    margin:       0,
    filename:     `Receipt_${receiptNo}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  
  return html2pdf()
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
