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
import { getGradeEvaluation } from '@/utils/gradingSystem';

// Register fonts if needed, but standard ones are fine for now
// Standard professional PDF layout

const styles = StyleSheet.create({
  page: {
    padding: 24,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
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
  examMetadata: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    width: '33.33%',
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 8,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  table: {
    width: 'auto',
    borderRadius: 8,
    overflow: 'hidden',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableHeader: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    padding: 10,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    fontSize: 9,
    color: '#334155',
  },
  colNo: { width: '5%' },
  colName: { width: '25%' },
  colClass: { width: '15%' },
  colCode: { width: '15%' },
  colScore: { width: '14%', textAlign: 'center' },
  colMax: { width: '10%', textAlign: 'center' },
  colPercent: { width: '13%', textAlign: 'center' },
  colGrade: { width: '13%', textAlign: 'center' },
  statusBadge: {
    padding: '2 6',
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    width: '10%',
  },
  passBadge: { backgroundColor: '#10B981' },
  failBadge: { backgroundColor: '#EF4444' },
  summarySection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  footer: {
    position: 'relative',
    marginTop: 40,
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
  gradingKey: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  gradingTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gradingText: {
    fontSize: 7,
    color: '#64748B',
    lineHeight: 1.4,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingHorizontal: 10,
  },
  signatureBox: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 5,
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  stampBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -15,
  },
  stampLabel: {
    fontSize: 6,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

interface ExamGradeReportProps {
  exam: any;
  attempts: any[];
  school: any;
}

const ExamGradeReport: React.FC<ExamGradeReportProps> = ({ exam, attempts, school }) => {
  const avgScore = attempts.length > 0
    ? (attempts.reduce((sum, a) => sum + (a.totalScore / a.totalMarks) * 100, 0) / attempts.length).toFixed(1)
    : '0';

  const passRate = attempts.length > 0
    ? ((attempts.filter(a => (a.totalScore / a.totalMarks) >= 0.4).length / attempts.length) * 100).toFixed(0)
    : '0';

  const topScore = attempts.length > 0
    ? Math.max(...attempts.map(a => (a.totalScore / a.totalMarks) * 100)).toFixed(1)
    : '0';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school?.name || 'Academic Institution'}</Text>
            <Text style={styles.reportTitle}>Comprehensive Examination Report</Text>
          </View>
          {school?.logo && (
            <Image src={school.logo} style={styles.logo} />
          )}
        </View>

        {/* Exam Metadata */}
        <View style={styles.examMetadata}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Examination Title</Text>
            <Text style={styles.metaValue}>{exam?.title || 'External Assessment'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Academic Session</Text>
            <Text style={styles.metaValue}>{exam?.session?.name || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Academic Term</Text>
            <Text style={styles.metaValue}>{exam?.term || 'First'} Term</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Department / Class</Text>
            <Text style={styles.metaValue}>{exam?.class?.name || 'Institutional Level'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date of Issue</Text>
            <Text style={styles.metaValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Weighted Total</Text>
            <Text style={styles.metaValue}>{exam?.totalMarks || 0} pts</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Institutional Pass Mark</Text>
            <Text style={styles.metaValue}>40% ({((0.4 * (exam?.totalMarks || 0))).toFixed(1)} pts)</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Cohort Participation</Text>
            <Text style={styles.metaValue}>{attempts?.length} Examinees</Text>
          </View>
        </View>

        {/* Results Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colNo]}>#</Text>
            <Text style={[styles.headerText, styles.colName]}>Student Name</Text>
            <Text style={[styles.headerText, styles.colClass]}>Class</Text>
            <Text style={[styles.headerText, styles.colCode]}>Registration No.</Text>
            <Text style={[styles.headerText, styles.colScore]}>Score</Text>
            <Text style={[styles.headerText, styles.colPercent]}>%</Text>
            <Text style={[styles.headerText, styles.colGrade]}>Grade</Text>
          </View>

          {attempts.map((attempt, index) => {
            const percentage = Math.round((attempt.totalScore / attempt.totalMarks) * 100);
            const evalResult = getGradeEvaluation(percentage, school?.gradingSystem);
            const grade = evalResult.grade;
            const isPass = percentage >= 40 && !['FAIL', 'FAIL9', 'F9'].includes(evalResult.grade);

            const studentClass =
              attempt.className ||
              (attempt.class?.name ? `${attempt.class.name}${attempt.class.section ? ` (${attempt.class.section})` : ''}` : '') ||
              exam?.class?.name ||
              attempt.student?.class?.name ||
              (attempt.student?.classes?.[0]?.class?.name ? `${attempt.student.classes[0].class.name}${attempt.student.classes[0].class.section ? ` (${attempt.student.classes[0].class.section})` : ''}` : '') ||
              (attempt.student?.gradeLevel ? `Class ${attempt.student.gradeLevel}` : '—');

            return (
              <View
                key={attempt.id}
                style={[styles.tableRow, index % 2 === 1 ? styles.evenRow : {}]}
              >
                <Text style={[styles.rowText, styles.colNo]}>{index + 1}</Text>
                <Text style={[styles.rowText, styles.colName]}>{attempt.student?.name}</Text>
                <Text style={[styles.rowText, styles.colClass]}>{studentClass}</Text>
                <Text style={[styles.rowText, styles.colCode]}>{attempt.student?.studentCode}</Text>
                <Text style={[styles.rowText, styles.colScore, { fontWeight: 'bold' }]}>{attempt.totalScore}</Text>
                <Text style={[styles.rowText, styles.colPercent]}>{percentage}%</Text>
                <Text style={[styles.rowText, styles.colGrade, { fontWeight: 'bold', color: isPass ? '#10B981' : '#EF4444' }]}>
                  {grade}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary Statistics */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Institutional Aggregate Performance Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Class Average</Text>
              <Text style={styles.summaryValue}>{avgScore}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Success Rate</Text>
              <Text style={styles.summaryValue}>{passRate}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Highest Score</Text>
              <Text style={styles.summaryValue}>{topScore}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={styles.summaryValue}>Finalized</Text>
            </View>
          </View>
        </View>

        {/* Grading Key & Verification */}
        <View style={styles.gradingKey}>
          <Text style={styles.gradingTitle}>Official Institutional Grading Standards (WAEC / National Standard)</Text>
          <Text style={styles.gradingText}>
            A1 (Distinction): 75-100% | B2 (Very Good): 70-74% | B3 (Good): 65-69% {"\n"}
            C4-C6 (Credit): 50-64% | D7-E8 (Pass): 40-49% | F9 (Fail): 0-39% {"\n"}
            This report serves as an official academic record for the specified class examination.
          </Text>
        </View>

        {/* Signatures & Stamp */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Examination Officer</Text>
          </View>
          <View style={styles.stampBox}>
            {school?.logo ? (
              <Image src={school.logo} style={{ width: 45, height: 45, opacity: 0.7 }} />
            ) : (
              <Text style={styles.stampLabel}>OFFICIAL{"\n"}SCHOOL STAMP</Text>
            )}
          </View>
          <View style={styles.signatureBox}>
            {(school?.primarySignature || school?.signatureUrl) ? (
              <Image
                src={school.primarySignature || school.signatureUrl}
                style={{ width: 90, height: 28, objectFit: 'contain', marginBottom: 2 }}
              />
            ) : null}
            <Text style={styles.signatureLabel}>Principal/Director</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Certified Academic Record • Powered by Qefas Hub Nigeria</Text>
          <Text style={styles.footerText}>Report Generation Hub • {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExamGradeReport;

