"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoContainer: { width: 80, height: 80, marginRight: 20 },
  logo: { width: '100%', height: '100%', borderRadius: 12 },
  schoolInfoContainer: { flex: 1, justifyContent: 'center' },
  schoolName: { fontSize: 26, fontWeight: 'bold', color: '#1E293B', marginBottom: 8, textTransform: 'uppercase' },
  schoolContactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 4 },
  schoolContactText: { fontSize: 10, color: '#475569' },
  reportType: { fontSize: 14, color: '#4338CA', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', marginTop: 12 },
  divider: { height: 2, backgroundColor: '#E2E8F0', marginBottom: 25 },
  
  studentProfile: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 20, borderRadius: 12, marginBottom: 30, borderLeftWidth: 4, borderLeftColor: '#4338CA' },
  studentAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E2E8F0', marginRight: 20 },
  studentInfo: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  infoCol: { minWidth: 130, marginBottom: 10 },
  infoLabel: { fontSize: 9, color: '#64748B', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 },
  infoValue: { fontSize: 12, color: '#0F172A', fontWeight: 'bold' },
  
  termSection: { marginBottom: 35, breakInside: 'avoid' },
  termHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  termTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', textTransform: 'uppercase' },
  termSubtitle: { fontSize: 10, color: '#64748B', marginTop: 4 },
  termAverageContainer: { alignItems: 'flex-end', backgroundColor: '#FFFFFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  termAverageLabel: { fontSize: 8, color: '#64748B', textTransform: 'uppercase', marginBottom: 2 },
  termAverageValue: { fontSize: 16, fontWeight: 'bold', color: '#4338CA' },
  
  table: { width: '100%', marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 2, borderBottomColor: '#CBD5E1', paddingVertical: 10, paddingHorizontal: 10 },
  tableHeaderCell: { fontSize: 9, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center' },
  tableRowStriped: { backgroundColor: '#F8FAFC' },
  tableCell: { fontSize: 10, color: '#334155' },
  
  colSubject: { flex: 3 },
  colCA: { width: 60, textAlign: 'center' },
  colExam: { width: 60, textAlign: 'center' },
  colTotal: { width: 70, textAlign: 'center', fontWeight: 'bold' },
  colGrade: { width: 60, textAlign: 'center', fontWeight: 'bold' },
  colRemark: { flex: 1.5, textAlign: 'right', fontSize: 9, color: '#64748B' },
  
  cumulativeSection: { marginTop: 20, padding: 20, backgroundColor: '#EEF2FF', borderRadius: 12, borderTopWidth: 4, borderTopColor: '#4338CA', breakInside: 'avoid' },
  cumulativeTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 15, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 1 },
  cumulativeRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  cumulativeStat: { alignItems: 'center' },
  cumulativeLabel: { fontSize: 10, color: '#64748B', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1 },
  cumulativeValue: { fontSize: 22, fontWeight: 'bold', color: '#4338CA' },
  
  signaturesSection: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 60, paddingHorizontal: 10, breakInside: 'avoid' },
  signatureBlock: { alignItems: 'center', width: 180 },
  signatureLine: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#1E293B', marginBottom: 8 },
  signatureTitle: { fontSize: 11, fontWeight: 'bold', color: '#1E293B', textTransform: 'uppercase' },
  signatureSubtitle: { fontSize: 9, color: '#64748B', marginTop: 4 },
  
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 9, color: '#94A3B8' },
});

function getWAECGradeAndRemark(score: number): { grade: string, remark: string } {
  if (score >= 75) return { grade: 'A1', remark: 'EXCELLENT' };
  if (score >= 70) return { grade: 'B2', remark: 'VERY GOOD' };
  if (score >= 65) return { grade: 'B3', remark: 'GOOD' };
  if (score >= 60) return { grade: 'C4', remark: 'CREDIT' };
  if (score >= 55) return { grade: 'C5', remark: 'CREDIT' };
  if (score >= 50) return { grade: 'C6', remark: 'CREDIT' };
  if (score >= 45) return { grade: 'D7', remark: 'PASS' };
  if (score >= 40) return { grade: 'E8', remark: 'PASS' };
  return { grade: 'F9', remark: 'FAIL' };
}

interface FinalResultPDFProps {
  student: any;
  school: any;
  results: any[];
}

export const FinalResultPDF = ({ student, school, results }: FinalResultPDFProps) => {
  let totalCumulativeScore = 0;
  let totalCumulativeSubjects = 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {school?.logo && (
            <View style={styles.logoContainer}>
              <Image src={school.logo} style={styles.logo} />
            </View>
          )}
          <View style={styles.schoolInfoContainer}>
            <Text style={styles.schoolName}>{school?.name || 'School Name'}</Text>
            <View style={styles.schoolContactRow}>
              {school?.address && <Text style={styles.schoolContactText}>Address: {school.address}</Text>}
              {school?.email && <Text style={styles.schoolContactText}>Email: {school.email}</Text>}
              {school?.phone && <Text style={styles.schoolContactText}>Phone: {school.phone}</Text>}
            </View>
            <Text style={styles.reportType}>Comprehensive Academic Report</Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Student Profile */}
        <View style={styles.studentProfile}>
          {student?.photoUrl && <Image src={student.photoUrl} style={styles.studentAvatar} />}
          {!student?.photoUrl && <View style={styles.studentAvatar} />}
          <View style={styles.studentInfo}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Student Name</Text>
              <Text style={styles.infoValue}>{student?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Admission Number</Text>
              <Text style={styles.infoValue}>{student?.studentCode || student?.admissionNumber || 'N/A'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{student?.gender || 'N/A'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Total Terms Recorded</Text>
              <Text style={styles.infoValue}>{results.length}</Text>
            </View>
          </View>
        </View>

        {/* Term Results */}
        {results.map((group, idx) => {
          const revealed = group.subjectResults?.filter((r: any) => r.scoresRevealed) || [];
          if (revealed.length === 0) return null;

          let termSum = 0;
          const rows = revealed.map((sub: any) => {
            const totalScore = (sub.assignmentScore || 0) + (sub.quizScore || 0) + (sub.caScore || 0) + (sub.examScore || 0);
            const percent = sub.classSubjectResult?.examMax ? Math.round((Number(totalScore) / 100) * 100) : totalScore;
            termSum += Number(percent);
            
            const { grade, remark } = getWAECGradeAndRemark(Number(percent));
            return {
              subject: sub.resultName || sub.subject?.name || "-",
              ca: sub.caScore || 0,
              exam: sub.examScore || 0,
              total: totalScore,
              percent: percent,
              grade: grade,
              remark: remark
            };
          });

          const termAverage = Math.round(termSum / revealed.length);
          
          totalCumulativeScore += termSum;
          totalCumulativeSubjects += revealed.length;

          return (
            <View key={idx} style={styles.termSection}>
              <View style={styles.termHeader}>
                <View>
                  <Text style={styles.termTitle}>{group.class?.name || "Class"} • {group.term} TERM</Text>
                  <Text style={styles.termSubtitle}>Session: {group.session?.name || "—"} | Subjects: {revealed.length}</Text>
                </View>
                <View style={styles.termAverageContainer}>
                  <Text style={styles.termAverageLabel}>Term Average</Text>
                  <Text style={styles.termAverageValue}>{termAverage}%</Text>
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.colSubject]}>Course / Exam</Text>
                  <Text style={[styles.tableHeaderCell, styles.colCA]}>CA Score</Text>
                  <Text style={[styles.tableHeaderCell, styles.colExam]}>Exam Score</Text>
                  <Text style={[styles.tableHeaderCell, styles.colTotal]}>Overall</Text>
                  <Text style={[styles.tableHeaderCell, styles.colGrade]}>Grade</Text>
                  <Text style={[styles.tableHeaderCell, styles.colRemark]}>Remark</Text>
                </View>
                {rows.map((row: any, rIdx: number) => (
                  <View key={rIdx} style={[styles.tableRow, rIdx % 2 !== 0 ? styles.tableRowStriped : {}]}>
                    <Text style={[styles.tableCell, styles.colSubject, { fontWeight: 'bold' }]}>{row.subject}</Text>
                    <Text style={[styles.tableCell, styles.colCA]}>{row.ca}</Text>
                    <Text style={[styles.tableCell, styles.colExam]}>{row.exam}</Text>
                    <Text style={[styles.tableCell, styles.colTotal, { color: '#4338CA' }]}>{row.percent}%</Text>
                    <Text style={[styles.tableCell, styles.colGrade, { color: '#0F172A' }]}>{row.grade}</Text>
                    <Text style={[styles.tableCell, styles.colRemark]}>{row.remark}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Cumulative Summary */}
        {totalCumulativeSubjects > 0 && (
          <View style={styles.cumulativeSection}>
            <Text style={styles.cumulativeTitle}>Overall Cumulative Performance</Text>
            <View style={styles.cumulativeRow}>
              <View style={styles.cumulativeStat}>
                <Text style={styles.cumulativeLabel}>Total Subjects</Text>
                <Text style={[styles.cumulativeValue, { color: '#1E293B' }]}>{totalCumulativeSubjects}</Text>
              </View>
              <View style={styles.cumulativeStat}>
                <Text style={styles.cumulativeLabel}>Cumulative Average</Text>
                <Text style={styles.cumulativeValue}>{Math.round(totalCumulativeScore / totalCumulativeSubjects)}%</Text>
              </View>
              <View style={styles.cumulativeStat}>
                <Text style={styles.cumulativeLabel}>Overall Grade</Text>
                <Text style={styles.cumulativeValue}>{getWAECGradeAndRemark(Math.round(totalCumulativeScore / totalCumulativeSubjects)).grade}</Text>
              </View>
              <View style={styles.cumulativeStat}>
                <Text style={styles.cumulativeLabel}>Final Remark</Text>
                <Text style={[styles.cumulativeValue, { color: '#059669' }]}>{getWAECGradeAndRemark(Math.round(totalCumulativeScore / totalCumulativeSubjects)).remark}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signaturesSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureTitle}>Form Teacher</Text>
            <Text style={styles.signatureSubtitle}>Signature & Date</Text>
          </View>
          
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureTitle}>Principal</Text>
            <Text style={styles.signatureSubtitle}>Signature, Stamp & Date</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated on {new Date().toLocaleDateString()} • This is a computer-generated document</Text>
          <Text style={styles.footerText}>{school?.name || 'Official School Record'}</Text>
        </View>
      </Page>
    </Document>
  );
};
