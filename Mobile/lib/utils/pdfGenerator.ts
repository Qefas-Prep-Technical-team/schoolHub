import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type ReportFilterParams = {
  className: string;
  term: string;
  assessmentName: string;
  reportType: string;
  schoolName?: string;
  schoolAddress?: string;
  schoolLogo?: string;
};

export const generateReportCardPDF = async (filters: ReportFilterParams) => {
  // Example dummy data for a class of students
  const students = [
    { sn: 1, name: 'ADEBAYO OLUWASEUN', adminNo: '15VM091', score: 85, grade: 'A', remarks: 'Excellent' },
    { sn: 2, name: 'CHUKWUEMEKA CHIDERA', adminNo: '15VM092', score: 78, grade: 'B', remarks: 'Very Good' },
    { sn: 3, name: 'INIABASI VICTOR EKAENANG', adminNo: '15VM093', score: 92, grade: 'A+', remarks: 'Outstanding' },
    { sn: 4, name: 'MUSTAPHA AMINA', adminNo: '15VM094', score: 65, grade: 'C', remarks: 'Good' },
    { sn: 5, name: 'OBINNA DAVID', adminNo: '15VM095', score: 70, grade: 'B', remarks: 'Good' },
    { sn: 6, name: 'OJO GRACE', adminNo: '15VM096', score: 88, grade: 'A', remarks: 'Excellent' },
    { sn: 7, name: 'SALISU IBRAHIM', adminNo: '15VM097', score: 55, grade: 'C', remarks: 'Average' },
  ];
  const admissionNo = '15VM091';
  const arm = 'BASIC 1 - DOMINANT';
  
  const logoHtml = filters.schoolLogo 
    ? `<img src="${filters.schoolLogo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" />`
    : `<div class="logo-placeholder">LOGO</div>`;

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700;900&display=swap');
          
          body {
            font-family: 'Lexend', Arial, sans-serif;
            margin: 0;
            padding: 30px;
            color: #1e293b;
            position: relative;
          }

          /* Watermark */
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 50px;
            font-weight: 900;
            color: rgba(239, 68, 68, 0.15); /* Faded red */
            white-space: nowrap;
            z-index: -1;
            pointer-events: none;
            letter-spacing: 5px;
          }

          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .logo-placeholder {
            width: 80px;
            height: 80px;
            background-color: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: #94a3b8;
            border: 2px dashed #cbd5e1;
          }

          .school-info {
            text-align: center;
            flex: 1;
          }
          .school-name {
            font-size: 24px;
            font-weight: 900;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
          }
          .school-address {
            font-size: 12px;
            color: #475569;
            margin-top: 5px;
          }
          .report-title {
            background-color: #f1f5f9;
            text-align: center;
            padding: 10px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 20px;
          }

          /* Student Details */
          .student-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .detail-col strong {
            display: block;
            font-size: 14px;
            margin-top: 4px;
          }

          /* Main Grid Table */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #475569;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f8fafc;
            font-weight: 700;
          }
          .text-left {
            text-align: left;
            font-weight: 700;
          }
          
          /* Footer */
          .footer-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            height: 40px;
          }
          .signature-label {
            font-size: 12px;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="watermark">THIS IS NOT AN OFFICIAL REPORT</div>
        
        <div class="header">
          ${logoHtml}
          <div class="school-info">
            <h1 class="school-name">${filters.schoolName || 'Qefas International Academy'}</h1>
            <div class="school-address">${filters.schoolAddress || '123 Education Way, Lagos State, Nigeria'}</div>
          </div>
          ${logoHtml}
        </div>

        <div class="report-title">
          ${filters.className.toUpperCase()} - ${filters.term.toUpperCase()} - ${filters.assessmentName.toUpperCase()} REPORT
        </div>

        <table>
          <thead>
            <tr>
              <th>S/N</th>
              <th class="text-left">Student Name</th>
              <th>Admission No.</th>
              <th>Score (100)</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(student => `
              <tr>
                <td>${student.sn}</td>
                <td class="text-left">${student.name}</td>
                <td>${student.adminNo}</td>
                <td><strong>${student.score}</strong></td>
                <td><strong>${student.grade}</strong></td>
                <td>${student.remarks}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Signature of Class Teacher</div>
          </div>
          
          <div style="width: 80px; height: 80px; background: red; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; text-align: center;">
            Institution<br/>Seal
          </div>

          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Signature of Head Teacher</div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    
    // On iOS/Android, we can share it so the user can save to files, email, etc.
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Download Report Card'
      });
    }
  } catch (error) {
    console.error('Error generating PDF', error);
  }
};
