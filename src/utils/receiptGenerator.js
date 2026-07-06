import html2pdf from 'html2pdf.js';

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

export const getReceiptHtml = (payment) => {
  const receiptNo = payment.receiptNo || 'N/A';
  const date = payment.date || 'N/A';
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
          size: 210mm 148.5mm;
          margin: 2mm;
        }

        html,
        body {
          width: 210mm;
          min-width: 210mm;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .container {
          width: 204mm;
          margin: 0 auto;
          border: 2px solid #0f5132;
          border-radius: 8px;
          padding: 12px;
          box-sizing: border-box;

          page-break-inside: avoid;
          page-break-before: avoid;
          page-break-after: avoid;
        }


        /* Header styling */
        .header {
          display: flex;
          align-items: center;
          
          border-bottom: 2px solid #0f5132;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }

        .header-left-group {
          width: 120px;              /* Adjust this value */
          display: flex;
          justify-content: flex-end; /* Push logo toward center */
          align-items: center;
          flex-shrink: 0;
        }

        .header-logo {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-center {
          flex: 1;
          text-align: center;
          padding-right: 130px;      /* Same as header-left-group width */
          box-sizing: border-box;
        }
        .school-name {
          font-size: 13px;
          font-weight: bold;
          color: #0c2340;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .school-sub {
          font-size: 10px;
          font-weight: bold;
          color: #0c2340;
          margin: 2px 0 5px 0;
          letter-spacing: 1px;
        }
        .motto-bar {
          font-size: 7px;
          font-weight: bold;
          color: #198754;
          margin: 3px 0;
        }
        .motto-sanskrit {
          font-size: 9px;
          font-weight: bold;
          color: #333;
          margin: 3px 0;
        }
        .motto-translation {
          font-size: 7px;
          font-style: italic;
          color: #198754;
          margin: 2px 0 0 0;
        }
        

        /* Meta styling (Receipt No & Date) */
        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 11px;
        }
        .meta-item {
          font-weight: bold;
        }
        .meta-value {
          font-weight: normal;
          border-bottom: 1px dotted #333;
          padding-bottom: 2px;
          padding-left: 5px;
          min-width: 120px;
          display: inline-block;
        }

        /* Heading Pill */
        .title-container {
          text-align: center;
          margin-bottom: 15px;
        }
        .title-badge {
          background-color: #1a2d42;
          color: white;
          padding: 5px 20px;
          border-radius: 18px;
          font-size: 12px;
          font-weight: bold;
          display: inline-block;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* Details Section */
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        .details-row td {
          padding: 4px 0;
          vertical-align: bottom;
        }
        .details-label {
          font-weight: bold;
          font-size: 11px;
          width: 160px;
          white-space: nowrap;
        }
        .details-value {
          border-bottom: 1px dashed #333;
          padding-bottom: 2px;
          padding-left: 10px;
          font-size: 11px;
          width: 100%;
        }

        /* Paragraph details */
        .receipt-paragraph {
          font-size: 11px;
          line-height: 1.5;
          text-align: justify;
          margin-bottom: 12px;
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
          margin-bottom: 10px;
        }
        .sig-row {
          display: flex;
          font-size: 11px;
          font-weight: bold;
          align-items: bottom;
        }
        .sig-label {
          width: 120px;
        }
        .sig-value {
          border-bottom: 1px dashed #333;
          width: 180px;
          display: inline-block;
          padding-left: 10px;
          font-weight: normal;
        }

        /* Footer Address and Contact */
        .footer {
          border-top: 2px solid #0f5132;
          padding-top: 10px;
        }
        .address-row {
          font-size: 7px;
          color: #333;
          text-align: center;
          margin-bottom: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
        }
        .footer-bar {
          background: linear-gradient(90deg, #0c2340 0%, #0c2340 85%, #198754 100%);
          color: white;
          padding: 5px;
          border-radius: 4px;
          display: flex;
          justify-content: space-around;
          font-size: 7px;
          font-weight: bold;
        }
        .footer-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div>
          <div class="header">
          
            
        <div class="header-center">
              <div class="school-name">NSRIT AI Algo Connect</div>
            </div>
          </div>
          
          <div class="meta-row">
            <div>
              <span class="meta-item">Receipt No:</span>
              <span class="meta-value">${receiptNo}</span>
            </div>
            <div>
              <span class="meta-item">Date:</span>
              <span class="meta-value">${date}</span>
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
            <span class="inline-underline" style="min-width: 250px;">${amountWords} (${amountCurrency})</span> 
            for the 
            <span class="inline-underline" style="min-width: 150px;">${installment}</span> 
            installment from 
            <span class="inline-underline" style="min-width: 150px;">${receivedFrom}</span> 
            on 
            <span class="inline-underline" style="min-width: 120px;">${date}</span>.
          </div>
        </div>
        
        <div class="footer">
          <div class="signature-section">
            <div class="sig-row">
              <span class="sig-label">Rec by:</span>
              <span class="sig-value">${receivedBy}</span>
            </div>
          
          </div>

          <div class="address-row">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#333" style="display:inline-block; vertical-align:middle; margin-right:3px;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            NSRIT AI Algo Connect, Sontyam village, Visakhapatnam, Andhra Pradesh - 531173
          </div>
          
          <div class="footer-bar">
            <div class="footer-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" style="display:inline-block; vertical-align:middle; margin-right:3px;">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.79 6.35 8.59 5.16 8.59 3.93c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.58c0-.56-.45-1-1-1z"/>
              </svg>
              9100046515
            </div>
            <div class="footer-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" style="display:inline-block; vertical-align:middle; margin-right:3px;">
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
