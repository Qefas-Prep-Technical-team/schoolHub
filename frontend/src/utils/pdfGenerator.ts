import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

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
}

export const generatePDF = async (options: PDFExportOptions) => {
  const doc = new jsPDF({ orientation: options.orientation || 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  let yPos = 15;

  // 1. Draw Page Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16); // Outer border
  doc.setLineWidth(0.2);
  doc.rect(9, 9, pageWidth - 18, pageHeight - 18); // Inner border

  let leftTextOffset = 15;

  // 2. Add Header Logo
  if (options.schoolProfile?.logo) {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = options.schoolProfile.logo;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const maxH = 22;
      const ratio = img.width / img.height;
      const w = maxH * ratio;
      
      doc.addImage(img, 'PNG', 15, 12, w, maxH);
      leftTextOffset = 18 + w;
    } catch (e) {
      console.error("Failed to load school logo for PDF", e);
    }
  }

  // 3. School Name & Details
  doc.setFontSize(16);
  doc.setFont('times', 'bold'); // More formal font
  doc.setTextColor(0, 0, 0);
  doc.text((options.schoolProfile?.name || options.schoolProfile?.schoolName || 'SCHOOL NAME').toUpperCase(), leftTextOffset, 18);
  
  let headerY = 23;
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  
  if (options.schoolProfile?.address) {
    doc.text(options.schoolProfile.address, leftTextOffset, headerY);
    headerY += 4;
  }
  
  const contactParts = [];
  if (options.schoolProfile?.contactPhone) contactParts.push(`Tel: ${options.schoolProfile.contactPhone}`);
  if (options.schoolProfile?.contactEmail) contactParts.push(`Email: ${options.schoolProfile.contactEmail}`);
  if (contactParts.length > 0) {
    doc.text(contactParts.join(' | '), leftTextOffset, headerY);
    headerY += 4;
  }

  // 4. Report Title
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text(options.title.toUpperCase(), pageWidth / 2, 42, { align: 'center' });
  
  yPos = 48;

  // 5. Meta Data Table (Grid layout at the top)
  if (options.metaData && options.metaData.length > 0) {
    // Format into 2 columns (4 table columns: Label1, Value1, Label2, Value2)
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
        fontSize: 10, 
        lineColor: [0, 0, 0], 
        lineWidth: 0.2,
        textColor: [0, 0, 0],
        cellPadding: 2
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 35 },
        2: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 35 }
      }
    });
    yPos = (doc as any).lastAutoTable.finalY + 5;
  }

  const commonTableStyles: UserOptions = {
    theme: 'grid',
    headStyles: { 
      fillColor: [20, 40, 80], // Navy Blue
      textColor: [255, 255, 255], // White
      fontStyle: 'bold', 
      halign: 'center', 
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    bodyStyles: { 
      textColor: [0, 0, 0],
      halign: 'center' // Centered text like the report cards
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] 
    },
    styles: { 
      fontSize: 9, 
      cellPadding: 3, 
      lineColor: [0, 0, 0], // Solid black borders
      lineWidth: 0.2, 
      font: 'times' 
    }
  };

  // 6. Main Table
  autoTable(doc, {
    ...commonTableStyles,
    startY: yPos,
    head: options.tableHeaders,
    body: options.tableData
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // 7. Additional Tables
  if (options.additionalTables) {
    for (const table of options.additionalTables) {
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(12, yPos, pageWidth - 24, 6, 'F');
      doc.text(table.title.toUpperCase(), pageWidth / 2, yPos + 4, { align: 'center' });
      yPos += 6;
      
      autoTable(doc, {
        ...commonTableStyles,
        startY: yPos,
        head: table.headers,
        body: table.data
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // 8. Signature Block
  let sigY = yPos + 30;
  if (sigY > pageHeight - 30) {
    doc.addPage();
    sigY = 40;
  } else {
    sigY = Math.max(sigY, pageHeight - 40);
  }
  
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  
  doc.line(20, sigY, 70, sigY);
  doc.text('Prepared By', 45, sigY + 5, { align: 'center' });

  doc.line(pageWidth - 70, sigY, pageWidth - 20, sigY);
  doc.text('Authorized Signature', pageWidth - 45, sigY + 5, { align: 'center' });

  // 9. Footer Pagination
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.text(`Qefas Prep Hub © ${new Date().getFullYear()}`, 15, pageHeight - 12);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 12, { align: 'right' });
  }
  
  doc.save(options.filename);
};
