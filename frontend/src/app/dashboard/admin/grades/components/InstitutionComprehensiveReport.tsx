"use client";

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#1E293B',
    paddingBottom: 20,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 28,
    fontWeight: 'black',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  reportTitle: {
    fontSize: 16,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryItem: {
    alignItems: 'center',
    width: '25%',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'black',
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'black',
    color: '#0F172A',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  table: {
    width: 'auto',
    borderRadius: 8,
    overflow: 'hidden',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 30,
  },
  tableHeader: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    padding: 10,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'black',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#F8FAFC',
  },
  rowText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: 'medium',
  },
  colExam: { width: '30%' },
  colCategory: { width: '15%', textAlign: 'left' },
  colDate: { width: '15%', textAlign: 'center' },
  colStudents: { width: '12%', textAlign: 'center' },
  colAvg: { width: '14%', textAlign: 'center' },
  colPass: { width: '14%', textAlign: 'center' },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
  },
  topPerformers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  performerCard: {
    width: '31%',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderLeft: 4,
    borderLeftColor: '#3B82F6',
  },
  performerName: {
    fontSize: 12,
    fontWeight: 'black',
    color: '#0F172A',
    marginBottom: 4,
  },
  performerDetail: {
    fontSize: 8,
    color: '#64748B',
  },
});

interface InstitutionComprehensiveReportProps {
  school: any;
  exams: any[];
  filters: any;
  sessions: any[];
  classes: any[];
}

const InstitutionComprehensiveReport: React.FC<InstitutionComprehensiveReportProps> = ({ 
  school, 
  exams, 
  filters,
  sessions,
  classes
}) => {
  // Aggregate statistics
  const totalExams = exams.length;
  const allAttempts = exams.flatMap(e => (e.attempts || []).map((a: any) => ({ ...a, examClassId: e.classId })));
  const totalAttempts = allAttempts.length;
  
  const avgScore = totalAttempts > 0
    ? (allAttempts.reduce((sum, a) => sum + (a.totalScore / a.totalMarks) * 100, 0) / totalAttempts).toFixed(1)
    : '0';

  const passRate = totalAttempts > 0
    ? ((allAttempts.filter(a => (a.totalScore / a.totalMarks) >= 0.4).length / totalAttempts) * 100).toFixed(0)
    : '0';

  const topStudents = Array.from(
    allAttempts.reduce((acc, attempt) => {
        const studentId = attempt.studentId;
        const score = (attempt.totalScore / attempt.totalMarks) * 100;
        if (!acc.has(studentId) || acc.get(studentId).score < score) {
            const studentClass = classes?.find((c: any) => c.id === attempt.examClassId);
            const classNameStr = studentClass 
              ? `${studentClass.name} ${studentClass.section || ''}`.trim() 
              : attempt.student?.gradeLevel 
                ? `Level ${attempt.student.gradeLevel}` 
                : 'Unknown Class';
            
            acc.set(studentId, { name: attempt.student?.name, score, class: classNameStr });
        }
        return acc;
    }, new Map()).values()
  ).sort((a: any, b: any) => b.score - a.score).slice(0, 6);

  const selectedSessionName = filters.sessionId === 'all' 
    ? 'All Sessions' 
    : sessions.find(s => s.id === filters.sessionId)?.name || 'Specified Session';
  
  const selectedClassName = filters.classId === 'all'
    ? 'All Classes'
    : classes?.find(c => c.id === filters.classId)?.name || 'Specified Class';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school?.name || 'Academic Institution'}</Text>
            <Text style={styles.reportTitle}>Institution-Wide Academic Report</Text>
            <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 4 }}>
              {selectedSessionName} • {filters.term === 'all' ? 'Full Session' : `${filters.term} Term`} • {selectedClassName}
            </Text>
          </View>
          {school?.logo && (
            <Image src={school.logo} style={styles.logo} />
          )}
        </View>

        {/* Global Summary */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Assessments</Text>
            <Text style={styles.summaryValue}>{totalExams}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Examinees</Text>
            <Text style={styles.summaryValue}>{totalAttempts}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Mean Aggregate</Text>
            <Text style={styles.summaryValue}>{avgScore}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gross Pass Rate</Text>
            <Text style={styles.summaryValue}>{passRate}%</Text>
          </View>
        </View>

        {/* Exam-wise Performance Breakdown */}
        <Text style={styles.sectionTitle}>Examination Cohort Performance</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colExam]}>Examination Title</Text>
            <Text style={[styles.headerText, styles.colCategory]}>Type</Text>
            <Text style={[styles.headerText, styles.colDate]}>Date</Text>
            <Text style={[styles.headerText, styles.colStudents]}>Students</Text>
            <Text style={[styles.headerText, styles.colAvg]}>Mean %</Text>
            <Text style={[styles.headerText, styles.colPass]}>Pass %</Text>
          </View>

          {exams.length === 0 ? (
            <View style={styles.tableRow}>
                <Text style={[styles.rowText, { width: '100%', textAlign: 'center' }]}>No data matching selected filters.</Text>
            </View>
          ) : exams.map((exam, index) => {
            const eAttempts = exam.attempts || [];
            const eAvg = eAttempts.length > 0 
                ? (eAttempts.reduce((sum: number, a: any) => sum + (a.totalScore / a.totalMarks) * 100, 0) / eAttempts.length).toFixed(1)
                : '0';
            const ePass = eAttempts.length > 0
                ? ((eAttempts.filter((a: any) => (a.totalScore / a.totalMarks) >= 0.4).length / eAttempts.length) * 100).toFixed(0)
                : '0';

            return (
              <View 
                key={exam.id} 
                style={[styles.tableRow, index % 2 === 1 ? styles.evenRow : {}]}
              >
                <Text style={[styles.rowText, styles.colExam]}>{exam.title}</Text>
                <Text style={[styles.rowText, styles.colCategory]}>{exam.category}</Text>
                <Text style={[styles.rowText, styles.colDate]}>{new Date(exam.startDate || exam.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                <Text style={[styles.rowText, styles.colStudents]}>{eAttempts.length}</Text>
                <Text style={[styles.rowText, styles.colAvg]}>{eAvg}%</Text>
                <Text style={[styles.rowText, styles.colPass]}>{ePass}%</Text>
              </View>
            );
          })}
        </View>

        {topStudents.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>High Performing Candidates (Across Filtered Range)</Text>
            <View style={styles.topPerformers}>
              {topStudents.map((student: any, i: number) => (
                <View key={i} style={styles.performerCard}>
                  <Text style={styles.performerName}>{student.name}</Text>
                  <Text style={[styles.performerDetail, { fontWeight: 'black', color: '#0F172A' }]}>{student.score.toFixed(1)}% Score</Text>
                  <Text style={styles.performerDetail}>{student.class || 'Unknown Class'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Disclaimer / Key */}
        <View style={{ marginTop: 'auto', padding: 15, backgroundColor: '#F8FAFC', borderRadius: 8 }}>
            <Text style={{ fontSize: 8, color: '#475569', fontWeight: 'bold', marginBottom: 4 }}>DATA CLASSIFICATION & VALIDATION</Text>
            <Text style={{ fontSize: 7, color: '#64748B', lineHeight: 1.4 }}>
                This document is a comprehensive aggregate of institutional academic performance based on the selected criteria. 
                Mean Aggregate is calculated as the simple average of all student percentages. 
                Gross Pass Rate reflects the percentage of candidates achieving 40% or higher.
            </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Institutional Analytics • Qefas Hub Nigeria</Text>
          <Text style={styles.footerText}>Generated: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InstitutionComprehensiveReport;

