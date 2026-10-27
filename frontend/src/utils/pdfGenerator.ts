import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

export interface PDFSignatureSlot {
  label: string;
  name?: string;
  subLabel?: string;
  signatureUrl?: string;
}

export interface PDFExportOptions {
  title: string;
  filename: string;
  schoolProfile?: any;
  metaData?: { label: string; value: string }[];
  tableHeaders: string[][];
  tableData: any[][];
  additionalTables?: {
    title: string;
    headers: string[][];
    data: any[][];
  }[];
  orientation?: 'portrait' | 'landscape';
  signatures?: {
    left?: PDFSignatureSlot;
    right?: PDFSignatureSlot;
  };
  studentPhotoUrl?: string;
  behavioralEvaluation?: {
    sessionName?: string;
    termLabel?: string;
    className?: string;
    affective: { trait: string; score: number | null }[];
    psychomotor: { trait: string; score: number | null }[];
    teacherRemark?: string;
    principalRemark?: string;
    cgpa?: string;
    cgpaGrade?: string;
  };
}

export const generatePDF = async (options: PDFExportOptions) => {
  const doc = new jsPDF({ orientation: options.orientation || 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // ── Helper to draw page borders ──────────────────────────────────────────
  const drawPageBorders = () => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16); // Outer border
    doc.setLineWidth(0.2);
    doc.rect(9, 9, pageWidth - 18, pageHeight - 18); // Inner border
  };

  // Helper to safely load images
  const loadImage = async (url?: string): Promise<HTMLImageElement | null> => {
    if (!url) return null;
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });
      return img;
    } catch {
      return null;
    }
  };

  // Helper to load and render header
  const renderHeader = async (title: string, subtitle?: string) => {
    let leftTextOffset = 15;
    const logoSrc = options.schoolProfile?.logo || options.schoolProfile?.schoolLogo || '/schoolhub.png';
    const logoImg = await loadImage(logoSrc);

    if (logoImg) {
      try {
        const maxH = 20;
        const ratio = (logoImg.width && logoImg.height) ? logoImg.width / logoImg.height : 1;
        const w = Math.min(28, maxH * ratio);
        const isJpeg = logoSrc.toLowerCase().includes('.jpg') || logoSrc.toLowerCase().includes('.jpeg');
        const format = isJpeg ? 'JPEG' : 'PNG';
        doc.addImage(logoImg, format, 15, 12, w, maxH);
        leftTextOffset = 17 + w;
      } catch (e) {
        console.warn("Could not render logo in PDF:", e);
      }
    }

    // School Name
    doc.setFontSize(15);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text((options.schoolProfile?.name || options.schoolProfile?.schoolName || 'SCHOOL NAME').toUpperCase(), leftTextOffset, 17);

    let headerY = 21.5;

    // School Motto
    if (options.schoolProfile?.motto) {
      doc.setFontSize(8.5);
      doc.setFont('times', 'italic');
      doc.setTextColor(70, 70, 70);
      doc.text(`"${options.schoolProfile.motto}"`, leftTextOffset, headerY);
      headerY += 4;
    }

    // Location & Contact
    doc.setFontSize(8.5);
    doc.setFont('times', 'normal');
    doc.setTextColor(0, 0, 0);
    if (options.schoolProfile?.address) {
      doc.text(options.schoolProfile.address, leftTextOffset, headerY);
      headerY += 3.8;
    }

    const contactParts = [];
    if (options.schoolProfile?.contactPhone || options.schoolProfile?.phone) {
      contactParts.push(`Tel: ${options.schoolProfile.contactPhone || options.schoolProfile.phone}`);
    }
    if (options.schoolProfile?.contactEmail || options.schoolProfile?.email) {
      contactParts.push(`Email: ${options.schoolProfile.contactEmail || options.schoolProfile.email}`);
    }
    if (contactParts.length > 0) {
      doc.text(contactParts.join(' | '), leftTextOffset, headerY);
    }

    // Optional Student Portrait on top right of header
    if (options.studentPhotoUrl) {
      const studentImg = await loadImage(options.studentPhotoUrl);
      if (studentImg) {
        try {
          const pW = 20;
          const pH = 24;
          const pX = pageWidth - pW - 14;
          const pY = 12;
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.3);
          doc.rect(pX - 0.5, pY - 0.5, pW + 1, pH + 1);
          doc.addImage(studentImg, 'JPEG', pX, pY, pW, pH);
        } catch (e) {
          console.warn("Could not render student portrait in PDF:", e);
        }
      }
    }

    // Report Title
    const titleFontSize = title.length > 35 ? 11.5 : 13;
    doc.setFontSize(titleFontSize);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title.toUpperCase(), pageWidth / 2, 42, { align: 'center' });

    if (subtitle) {
      doc.setFontSize(8.5);
      doc.setFont('times', 'italic');
      doc.setTextColor(60, 60, 60);
      doc.text(subtitle, pageWidth / 2, 46, { align: 'center' });
      return 50;
    }

    return 48;
  };

  // Helper to render signature block
  const renderSignatures = async (sigY: number) => {
    const leftSigImg = await loadImage(options.signatures?.left?.signatureUrl);
    const rightSigImg = await loadImage(options.signatures?.right?.signatureUrl);

    // Left Signature
    if (leftSigImg) {
      try {
        doc.addImage(leftSigImg, 'PNG', 25, sigY - 14, 40, 13);
      } catch (e) {
        console.warn("Could not render left signature image in PDF:", e);
      }
    } else if (options.signatures?.left?.signatureUrl && !options.signatures.left.signatureUrl.startsWith('http')) {
      doc.setFontSize(13);
      doc.setFont('times', 'italic');
      doc.text(options.signatures.left.signatureUrl, 45, sigY - 4, { align: 'center' });
    }
    doc.setDrawColor(0, 0, 0);
    doc.line(20, sigY, 70, sigY);
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.text(options.signatures?.left?.label || 'Prepared By', 45, sigY + 5, { align: 'center' });
    if (options.signatures?.left?.name) {
      doc.setFontSize(8);
      doc.setFont('times', 'normal');
      doc.text(options.signatures.left.name, 45, sigY + 9, { align: 'center' });
    }

    // Right Signature
    if (rightSigImg) {
      try {
        doc.addImage(rightSigImg, 'PNG', pageWidth - 65, sigY - 14, 40, 13);
      } catch (e) {
        console.warn("Could not render right signature image in PDF:", e);
      }
    } else if (options.signatures?.right?.signatureUrl && !options.signatures.right.signatureUrl.startsWith('http')) {
      doc.setFontSize(13);
      doc.setFont('times', 'italic');
      doc.text(options.signatures.right.signatureUrl, pageWidth - 45, sigY - 4, { align: 'center' });
    } else if (options.signatures?.right?.name) {
      doc.setFontSize(13);
      doc.setFont('times', 'italic');
      doc.text(options.signatures.right.name, pageWidth - 45, sigY - 4, { align: 'center' });
    }
    doc.line(pageWidth - 70, sigY, pageWidth - 20, sigY);
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.text(options.signatures?.right?.label || 'Authorized Signature', pageWidth - 45, sigY + 5, { align: 'center' });
    if (options.signatures?.right?.name) {
      doc.setFontSize(8);
      doc.setFont('times', 'normal');
      doc.text(options.signatures.right.name, pageWidth - 45, sigY + 9, { align: 'center' });
    }
  };

  // =========================================================================
  // PAGE 1: ACADEMIC TRANSCRIPT
  // =========================================================================
  drawPageBorders();
  let yPos = await renderHeader(options.title);

  // Meta Data Table
  if (options.metaData && options.metaData.length > 0) {
    const metaBody = [];
    for (let i = 0; i < options.metaData.length; i += 2) {
      const row = [
        options.metaData[i].label + ':', 
        options.metaData[i].value,
        options.metaData[i+1] ? options.metaData[i+1].label + ':' : '',
        options.metaData[i+1] ? options.metaData[i+1].value : ''
      ];
      metaBody.push(row);
    }

    autoTable(doc, {
      startY: yPos,
      body: metaBody,
      theme: 'grid',
      styles: { 
        font: 'times', 
        fontSize: 9.5, 
        lineColor: [0, 0, 0], 
        lineWidth: 0.2,
        textColor: [0, 0, 0],
        cellPadding: 2
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 32 },
        2: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 32 }
      }
    });
    yPos = (doc as any).lastAutoTable.finalY + 5;
  }

  const commonTableStyles: UserOptions = {
    theme: 'grid',
    headStyles: { 
      fillColor: [20, 40, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold', 
      halign: 'center', 
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    bodyStyles: { 
      textColor: [0, 0, 0],
      halign: 'center'
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] 
    },
    styles: { 
      fontSize: 8.5, 
      cellPadding: 2.5, 
      lineColor: [0, 0, 0],
      lineWidth: 0.2, 
      font: 'times' 
    }
  };

  // Main Academic Table
  autoTable(doc, {
    ...commonTableStyles,
    startY: yPos,
    head: options.tableHeaders,
    body: options.tableData
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 6;

  // Additional Term Tables
  if (options.additionalTables) {
    for (const table of options.additionalTables) {
      if (yPos > pageHeight - 55) {
        doc.addPage();
        drawPageBorders();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(12, yPos, pageWidth - 24, 6, 'F');
      doc.text(table.title.toUpperCase(), pageWidth / 2, yPos + 4.2, { align: 'center' });
      yPos += 6;
      
      autoTable(doc, {
        ...commonTableStyles,
        startY: yPos,
        head: table.headers,
        body: table.data
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 6;
    }
  }

  // Page 1 Endorsements
  const page1TableEnd = (doc as any).lastAutoTable?.finalY || yPos;
  let sigY = pageHeight - 32;
  if (page1TableEnd > sigY - 18) {
    doc.addPage();
    drawPageBorders();
    sigY = 50;
  }
  await renderSignatures(sigY);

  // =========================================================================
  // PAGE 2: BEHAVIORAL EVALUATIONS & EXECUTIVE REMARKS (if provided)
  // =========================================================================
  if (options.behavioralEvaluation) {
    doc.addPage();
    drawPageBorders();

    const evalData = options.behavioralEvaluation;
    let p2Y = await renderHeader(
      "STUDENT CONDUCT APPRAISAL & BEHAVIORAL EVALUATION",
      `${evalData.sessionName || "Academic Session"} • ${evalData.termLabel || "Term"} • Cohort: ${evalData.className || "Class"}`
    );

    // Rating Descriptor helper
    const getRatingLabel = (score: number | null) => {
      if (!score) return "Not Evaluated";
      if (score >= 5) return "5 - Excellent";
      if (score === 4) return "4 - High / Good";
      if (score === 3) return "3 - Acceptable";
      if (score === 2) return "2 - Minimal";
      return "1 - Needs Attention";
    };

    // Evaluation Table Styles for Page 2 (Spacious & Legible)
    const evalTableStyles: UserOptions = {
      theme: 'grid',
      headStyles: {
        fillColor: [20, 40, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2.2,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        fontSize: 8.5,
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2.0,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        font: 'times',
      },
    };

    // Affective Domain Table
    const affectiveRows = evalData.affective.map((item) => [
      item.trait,
      item.score != null ? String(item.score) : "—",
      getRatingLabel(item.score),
    ]);

    // Psychomotor Domain Table
    const psychomotorRows = evalData.psychomotor.map((item) => [
      item.trait,
      item.score != null ? String(item.score) : "—",
      getRatingLabel(item.score),
    ]);

    p2Y += 3;

    // Title 1: Affective Domain
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(12, p2Y, pageWidth - 24, 5.5, 'F');
    doc.text("AFFECTIVE DOMAIN EVALUATION (BEHAVIOR & SOCIAL ATTRIBUTES)", pageWidth / 2, p2Y + 3.8, { align: 'center' });
    p2Y += 5.5;

    autoTable(doc, {
      ...evalTableStyles,
      startY: p2Y,
      head: [["TRAIT / BEHAVIORAL ATTRIBUTE", "SCORE (1-5)", "RATING ASSESSMENT"]],
      body: affectiveRows,
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 95 },
        1: { halign: 'center', cellWidth: 28 },
        2: { halign: 'center' },
      },
    });

    p2Y = (doc as any).lastAutoTable.finalY + 4;

    // Title 2: Psychomotor Domain
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(12, p2Y, pageWidth - 24, 5.5, 'F');
    doc.text("PSYCHOMOTOR DOMAIN EVALUATION (PRACTICAL & PHYSICAL SKILLS)", pageWidth / 2, p2Y + 3.8, { align: 'center' });
    p2Y += 5.5;

    autoTable(doc, {
      ...evalTableStyles,
      startY: p2Y,
      head: [["SKILL / PRACTICAL DOMAIN", "SCORE (1-5)", "RATING ASSESSMENT"]],
      body: psychomotorRows,
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 95 },
        1: { halign: 'center', cellWidth: 28 },
        2: { halign: 'center' },
      },
    });

    p2Y = (doc as any).lastAutoTable.finalY + 4;

    // CGPA Banner matching progress report design
    if (evalData.cgpa) {
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.setTextColor(0, 0, 0);
      const gradeText = evalData.cgpaGrade ? ` (${evalData.cgpaGrade})` : '';
      doc.text(`CGPA: ${evalData.cgpa}${gradeText}`, 14, p2Y);
      p2Y += 4.5;
    }

    // Executive Remarks Boxes
    const teacherRemarkText = evalData.teacherRemark?.trim() || "Consistently demonstrates commendable discipline, high aptitude, and exemplary scholastic dedication.";
    const principalRemarkText = evalData.principalRemark?.trim() || "An outstanding scholar with great promise. Maintains high academic standing and positive institutional citizenship.";

    autoTable(doc, {
      startY: p2Y,
      theme: 'grid',
      head: [["EXECUTIVE INSTITUTIONAL REMARKS & CONDUCT APPRAISAL"]],
      body: [
        [`CLASS TEACHER'S REMARK:\n"${teacherRemarkText}"`],
        [`PRINCIPAL / HEAD OF INSTITUTION REMARK:\n"${principalRemarkText}"`],
      ],
      headStyles: {
        fillColor: [20, 40, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 2.2,
        fontSize: 8.5,
      },
      styles: {
        font: 'times',
        fontSize: 8.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        textColor: [0, 0, 0],
        cellPadding: 2.5,
      },
    });

    // Page 2 Endorsements: safely anchored near bottom, guaranteed zero overlap
    const remarksEnd = (doc as any).lastAutoTable.finalY;
    let p2SigY = pageHeight - 32;

    if (remarksEnd > p2SigY - 18) {
      doc.addPage();
      drawPageBorders();
      p2SigY = 50;
    }
    await renderSignatures(p2SigY);
  }

  // ── Footer Pagination across all pages ───────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.text(`Qefas Prep Hub © ${new Date().getFullYear()} • Official Academic Document`, 15, pageHeight - 12);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 12, { align: 'right' });
  }
  
  doc.save(options.filename);
};
