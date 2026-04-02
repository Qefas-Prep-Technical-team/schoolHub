"use client";

import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import React from 'react';
import { ReportPageContent } from '../components/IndividualStudentReport';
import { Document } from '@react-pdf/renderer';

interface BatchDownloadParams {
  results: any[];
  school: any;
  examTitle: string;
}

export const downloadIndividualResultsAsZip = async ({
  results,
  school,
  examTitle,
}: BatchDownloadParams) => {
  const sanitizedExamTitle = examTitle.replace(/[/\\?%*:|"<>]/g, '-');
  const zip = new JSZip();
  const folder = zip.folder(`${sanitizedExamTitle}_Results`);

  if (!folder) return;

  const total = results.length;
  
  // To avoid memory issues and browser freezing, we'll process them in batches or sequentially
  for (let i = 0; i < total; i++) {
    const result = results[i];
    
    // Prepare result data (same mapping as in BulkIndividualReports)
    const preparedResult = {
      ...result,
      subjects: result.subjects || result.subjectAttempts?.map((sa: any) => ({
        ...sa,
        subjectName: sa.subjectPaper?.subject?.name || 'Subject'
      }))
    };

    const doc = (
      <Document>
        <ReportPageContent result={preparedResult} school={school} />
      </Document>
    );

    try {
      // Generate individual PDF blob
      const blob = await pdf(doc).toBlob();
      
      // Add to ZIP folder
      const fileName = `${preparedResult.student?.name || 'Student'}_${preparedResult.student?.studentCode || i}_Result.pdf`.replace(/[/\\?%*:|"<>]/g, '-');
      folder.file(fileName, blob);
    } catch (err) {
      console.error(`Failed to generate PDF for ${preparedResult.student?.name}:`, err);
    }
  }

  // Generate and save ZIP
  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, `${sanitizedExamTitle}.zip`);
};
