"use client";

import React from 'react';
import { Document } from '@react-pdf/renderer';
import { ReportPageContent } from './IndividualStudentReport';

interface BulkIndividualReportsProps {
  results: any[];
  school: any;
}

const BulkIndividualReports: React.FC<BulkIndividualReportsProps> = ({
  results,
  school,
}) => {
  return (
    <Document>
      {results.map((result, index) => {
        // Ensure subjectAttempts are mapped to subjects if needed
        const preparedResult = {
          ...result,
          subjects: result.subjects || result.subjectAttempts?.map((sa: any) => ({
            ...sa,
            subjectName: sa.subjectPaper?.subject?.name || 'Subject'
          }))
        };
        return <ReportPageContent key={result.id || index} result={preparedResult} school={school} />;
      })}
    </Document>
  );
};

export default BulkIndividualReports;

