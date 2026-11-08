"use client";

import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import React from 'react';
import { ReportPageContent, default as IndividualStudentReport } from '../components/IndividualStudentReport';
import ExamGradeReport from '../components/ExamGradeReport';
import { Document } from '@react-pdf/renderer';
import { generatePDF } from '@/utils/pdfGenerator';
import { getGradeEvaluation } from '@/utils/gradingSystem';
import { resolveDigitalSignatures } from './signatureResolver';
import { formatAcademicTerm } from './termFormatter';

interface BatchDownloadParams {
  results: any[];
  school: any;
  examTitle: string;
  className?: string;
  sessionName?: string;
  hasPerformanceAccess?: boolean;
  isPaying?: boolean;
}

export const downloadBatchExamPdfs = async (params: BatchDownloadParams) => {
  return downloadIndividualResultsAsZip(params);
};

export const downloadIndividualResultsAsZip = async ({
  results,
  school,
  examTitle,
  className,
  sessionName,
  hasPerformanceAccess = false,
  isPaying = true,
}: BatchDownloadParams) => {
  const zip = new JSZip();
  const folder = zip.folder(`${examTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '')}_Results`);

  const { principalSigUrl, adminName, adminTitle } = await resolveDigitalSignatures(school, isPaying);

  const enrichedSchool = {
    ...school,
    primarySignature: principalSigUrl || school?.primarySignature,
    signatureUrl: principalSigUrl || school?.signatureUrl,
    principalName: adminName || school?.principalName,
  };

  const currentYear = new Date().getFullYear();
  const fallbackSession = sessionName || `${currentYear}/${currentYear + 1}`;

  const pagesPerDocument = 10;
  const chunks: any[][] = [];
  for (let i = 0; i < results.length; i += pagesPerDocument) {
    chunks.push(results.slice(i, i + pagesPerDocument));
  }

  for (let cIndex = 0; cIndex < chunks.length; cIndex++) {
    const chunk = chunks[cIndex];
    for (let rIndex = 0; rIndex < chunk.length; rIndex++) {
      const result = chunk[rIndex];
      const studentName = result.student?.name || `Student_${cIndex * pagesPerDocument + rIndex + 1}`;

      const enrichedResult = {
        ...result,
        examTitle: result.examTitle || examTitle || result.exam?.title,
        assessmentTitle: result.assessmentTitle || examTitle || result.exam?.title,
        term: result.term || result.exam?.term,
        session: result.session?.name ? result.session : { name: fallbackSession },
      };

      const singleDoc = (
        <Document>
          <ReportPageContent
            result={enrichedResult}
            school={enrichedSchool}
            hasPerformanceAccess={hasPerformanceAccess}
          />
        </Document>
      );

      const blob = await pdf(singleDoc).toBlob();
      const safeName = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
      folder?.file(`${safeName} - ${examTitle}.pdf`, blob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const safeSchool = (school?.name || school?.schoolName || 'School').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const safeExamTitle = examTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const safeClass = (className || 'Class_Results').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  saveAs(content, `${safeSchool} - ${safeExamTitle} - ${safeClass}.zip`);
};

export const downloadSingleStudentPdf = async ({
  result,
  school,
  examTitle,
  className,
  sessionName,
  hasPerformanceAccess = false,
  isPaying = true,
}: {
  result: any;
  school: any;
  examTitle: string;
  className?: string;
  sessionName?: string;
  hasPerformanceAccess?: boolean;
  isPaying?: boolean;
}) => {
  const { principalSigUrl, adminName, adminTitle } = await resolveDigitalSignatures(school, isPaying);

  const enrichedSchool = {
    ...school,
    primarySignature: principalSigUrl || school?.primarySignature,
    signatureUrl: principalSigUrl || school?.signatureUrl,
    principalName: adminName || school?.principalName,
  };

  const currentYear = new Date().getFullYear();
  const fallbackSession = sessionName || `${currentYear}/${currentYear + 1}`;

  const enrichedResult = {
    ...result,
    examTitle: result.examTitle || examTitle || result.exam?.title,
    assessmentTitle: result.assessmentTitle || examTitle || result.exam?.title,
    term: result.term || result.exam?.term,
    session: result.session?.name ? result.session : { name: fallbackSession },
  };

  const studentName = result.student?.name || 'Student';

  const doc = (
    <IndividualStudentReport
      result={enrichedResult}
      school={enrichedSchool}
      hasPerformanceAccess={hasPerformanceAccess}
    />
  );

  const blob = await pdf(doc).toBlob();
  const safeSchool = (school?.name || school?.schoolName || 'School').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const safeExam = examTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const safeName = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  saveAs(blob, `${safeSchool} - ${safeExam} - ${safeName}.pdf`);
};

export const downloadCombinedAssessmentPdf = async ({
  exam,
  attempts,
  school,
  sessionName,
  filename = "Master_Assessment_Results_Sheet.pdf",
  isPaying = true,
}: {
  exam: any;
  attempts: any[];
  school: any;
  sessionName?: string;
  filename?: string;
  isPaying?: boolean;
}) => {
  const { principalSigUrl, adminName, adminTitle } = await resolveDigitalSignatures(school, isPaying);

  const currentYear = new Date().getFullYear();
  const resolvedSessionName =
    exam?.session?.name ||
    exam?.academicSession?.name ||
    exam?.sessionName ||
    school?.currentSession?.name ||
    school?.session?.name ||
    sessionName ||
    `${currentYear}/${currentYear + 1}`;

  const total = attempts?.length || 0;
  const avg = total > 0
    ? Math.round(attempts.reduce((acc: number, a: any) => acc + (a.percentage || (a.totalMarks ? (a.totalScore / a.totalMarks) * 100 : 0)), 0) / total)
    : 0;
  const passCount = attempts.filter((a: any) => {
    const pct = a.percentage || (a.totalMarks ? (a.totalScore / a.totalMarks) * 100 : 0);
    return pct >= 40;
  }).length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  const tableHeaders = [["#", "Candidate Name", "Class", "Reg No.", "Score", "Percentage", "Grade", "Status"]];
  const tableData = (attempts || []).map((attempt: any, idx: number) => {
    const pct = Math.round(attempt.percentage !== undefined ? attempt.percentage : (attempt.totalMarks ? (attempt.totalScore / attempt.totalMarks) * 100 : 0));
    const evalResult = getGradeEvaluation(pct, school?.gradingSystem);
    const isPass = pct >= 40;
    const studentClass =
      attempt.className ||
      (attempt.class?.name ? `${attempt.class.name}${attempt.class.section ? ` (${attempt.class.section})` : ''}` : '') ||
      exam?.class?.name ||
      attempt.student?.class?.name ||
      (attempt.student?.classes?.[0]?.class?.name ? `${attempt.student.classes[0].class.name}${attempt.student.classes[0].class.section ? ` (${attempt.student.classes[0].class.section})` : ''}` : '') ||
      (attempt.student?.gradeLevel ? `Class ${attempt.student.gradeLevel}` : '—');

    return [
      String(idx + 1),
      attempt.student?.name || "Student",
      studentClass,
      attempt.student?.studentCode || "—",
      `${attempt.totalScore ?? "—"} / ${attempt.totalMarks ?? "—"}`,
      `${pct}%`,
      evalResult.grade,
      isPass ? "PASS" : "FAIL",
    ];
  });

  const examClassName = exam?.class?.name
    ? `${exam.class.name}${exam.class.section ? ` (${exam.class.section})` : ""}`
    : "All Classes";

  const safeSchool = (school?.name || school?.schoolName || 'School').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const safeExam = (exam?.title || 'Assessment').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const safeClass = examClassName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const defaultFilename = `${safeSchool} - ${safeExam} - ${safeClass}.pdf`;
  const exportFilename = filename && filename !== "Master_Assessment_Results_Sheet.pdf" ? filename : defaultFilename;

  await generatePDF({
    title: exam?.title ? `${exam.title} - Official Results Sheet` : "Master Assessment Grade Report",
    filename: exportFilename,
    schoolProfile: {
      ...school,
      name: school?.name || school?.schoolName || "QEFAS ACADEMIC HUB",
      address: school?.address || "Examination & Assessment Division",
      phone: school?.phone || school?.contactPhone,
      email: school?.email || school?.contactEmail,
      logo: school?.logo || school?.schoolLogo,
      motto: school?.motto,
    },
    metaData: [
      { label: "Assessment Title", value: exam?.title || "Assessment" },
      { label: "Class", value: examClassName },
      { label: "Academic Session", value: resolvedSessionName },
      { label: "Academic Term", value: formatAcademicTerm(exam?.term || attempts?.[0]?.exam?.term || attempts?.[0]?.term) },
      { label: "Total Candidates", value: String(total) },
      { label: "Class Average", value: `${avg}%` },
      { label: "Pass Rate", value: `${passRate}% (${passCount}/${total})` },
    ],
    tableHeaders,
    tableData,
    signatures: isPaying
      ? {
        left: {
          label: "Examination Officer",
          name: "Official Examination Board",
          subLabel: "Verification & Audit",
        },
        right: {
          label: adminTitle || "Principal / Director",
          name: adminName || school?.principalName || "Head of Institution",
          signatureUrl: principalSigUrl,
          subLabel: "Authorized Endorsement",
        },
      }
      : {
        left: {
          label: "Examination Officer",
          name: "—",
          subLabel: "Unendorsed Record",
        },
        right: {
          label: "Principal / Director",
          name: "—",
          subLabel: "Unendorsed Record",
        },
      },
  });
};
