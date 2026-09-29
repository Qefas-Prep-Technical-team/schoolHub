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
  schoolMotto: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  schoolContact: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 12,
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
  colSN: { width: '5%', textAlign: 'center' },
  colExam: { width: '40%' },
  colDate: { width: '15%', textAlign: 'center' },
  colStudents: { width: '10%', textAlign: 'center' },
  colAvg: { width: '10%', textAlign: 'center' },
  colGrade: { width: '10%', textAlign: 'center' },
  colPass: { width: '10%', textAlign: 'center' },
  
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
  topPerformersList: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 30,
  },
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  performerRank: {
    width: 25,
    fontSize: 12,
    fontWeight: 'black',
    color: '#334155',
  },
  performerName: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'black',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  performerScore: {
    width: 80,
    fontSize: 11,
    fontWeight: 'black',
    color: '#10B981',
    textAlign: 'right',
  },
  performerClass: {
    width: 150,
    fontSize: 10,
    color: '#64748B',
    textAlign: 'right',
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  signatureBlock: {
    alignItems: 'center',
    width: 200,
  },
  signatureLine: {
    width: 180,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
    marginBottom: 8,
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 'black',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
});

const getGrade = (score: number) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
};

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

  const contactStr = [school?.phone, school?.schoolEmail].filter(Boolean).join(' | ');

  const examsByCategory: Record<string, typeof exams> = {};
  exams.forEach(exam => {
      let cat = (exam.assessmentType || exam.category || 'OTHER').toUpperCase().trim();
      if (cat === 'MIDTERM' || cat.includes('CONTINUOUS')) cat = 'CA';
      else if (cat.includes('PROJECT') || cat.includes('HOMEWORK') || cat.includes('CLASSWORK')) cat = 'ASSIGNMENT';
      else if (cat.includes('TEST')) cat = 'QUIZ';
      
      if (!examsByCategory[cat]) examsByCategory[cat] = [];
      examsByCategory[cat].push(exam);
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school?.name || 'Academic Institution'}</Text>
            {school?.motto && <Text style={styles.schoolMotto}>{school.motto}</Text>}
            {school?.address && <Text style={styles.schoolContact}>{school.address}</Text>}
            {contactStr && <Text style={styles.schoolContact}>{contactStr}</Text>}
            
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
            <Text style={styles.summaryValue}>{avgScore}% ({getGrade(parseFloat(avgScore))})</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gross Pass Rate</Text>
            <Text style={styles.summaryValue}>{passRate}%</Text>
          </View>
        </View>

        {/* Exam-wise Performance Breakdown Sectioned by Type */}
        <Text style={[styles.sectionTitle, { borderBottomWidth: 0, marginBottom: 0 }]}>Cohort Performance by Assessment Type</Text>
        
        {Object.entries(examsByCategory).map(([catName, catExams]) => (
            <View key={catName} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 8 }}>{catName} SECTION</Text>
                <View style={[styles.table, { marginBottom: 10 }]}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerText, styles.colSN]}>S/N</Text>
                    <Text style={[styles.headerText, styles.colExam]}>Examination Title</Text>
                    <Text style={[styles.headerText, styles.colDate]}>Date</Text>
                    <Text style={[styles.headerText, styles.colStudents]}>Students</Text>
                    <Text style={[styles.headerText, styles.colAvg]}>Mean %</Text>
                    <Text style={[styles.headerText, styles.colGrade]}>Grade</Text>
                    <Text style={[styles.headerText, styles.colPass]}>Pass %</Text>
                  </View>

                  {catExams.map((exam, index) => {
                    const eAttempts = exam.attempts || [];
                    const eAvgScore = eAttempts.length > 0 
                        ? (eAttempts.reduce((sum: number, a: any) => sum + (a.totalScore / a.totalMarks) * 100, 0) / eAttempts.length)
                        : 0;
                    const eAvg = eAvgScore.toFixed(1);
                    const ePass = eAttempts.length > 0
                        ? ((eAttempts.filter((a: any) => (a.totalScore / a.totalMarks) >= 0.4).length / eAttempts.length) * 100).toFixed(0)
                        : '0';

                    return (
                      <View 
                        key={exam.id} 
                        style={[styles.tableRow, index % 2 === 1 ? styles.evenRow : {}]}
                      >
                        <Text style={[styles.rowText, styles.colSN]}>{index + 1}.</Text>
                        <Text style={[styles.rowText, styles.colExam]}>{exam.title}</Text>
                        <Text style={[styles.rowText, styles.colDate]}>{new Date(exam.startDate || exam.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                        <Text style={[styles.rowText, styles.colStudents]}>{eAttempts.length}</Text>
                        <Text style={[styles.rowText, styles.colAvg]}>{eAvg}%</Text>
                        <Text style={[styles.rowText, styles.colGrade, { fontWeight: 'bold', color: '#10B981' }]}>{getGrade(eAvgScore)}</Text>
                        <Text style={[styles.rowText, styles.colPass]}>{ePass}%</Text>
                      </View>
                    );
                  })}
                </View>
            </View>
        ))}

        {topStudents.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>High Performing Candidates (Across Filtered Range)</Text>
            <View style={styles.topPerformersList}>
              {topStudents.map((student: any, i: number) => (
                <View key={i} style={[styles.performerRow, i % 2 === 1 ? styles.evenRow : {}]}>
                  <Text style={styles.performerRank}>{i + 1}.</Text>
                  <Text style={styles.performerName}>{student.name}</Text>
                  <Text style={styles.performerClass}>{student.class || 'Unknown Class'}</Text>
                  <Text style={styles.performerScore}>{student.score.toFixed(1)}% ({getGrade(student.score)})</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Signature Block */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureTitle}>Principal's Signature</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureTitle}>Proprietor's Signature</Text>
          </View>
        </View>

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
