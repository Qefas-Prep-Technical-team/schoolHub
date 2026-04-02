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

// Register fonts if needed, but standard ones are fine for now
// Standard professional PDF layout

const styles = StyleSheet.create({
  page: {
    padding: 40,
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
  colName: { width: '30%' },
  colCode: { width: '15%' },
  colScore: { width: '15%', textAlign: 'center' },
  colMax: { width: '10%', textAlign: 'center' },
  colPercent: { width: '15%', textAlign: 'center' },
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
  gradingKey: {
    marginTop: 20,
    fontSize: 8,
    color: '#64748B',
    lineHeight: 1.4,
  }
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
            <Text style={styles.metaValue}>{exam?.title}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Session / Term</Text>
            <Text style={styles.metaValue}>{exam?.session?.name || 'N/A'} - {exam?.term} Term</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Class</Text>
            <Text style={styles.metaValue}>{exam?.class?.name || 'All Classes'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date Generated</Text>
            <Text style={styles.metaValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Total Papers</Text>
            <Text style={styles.metaValue}>{exam?.subjectPapers?.length || 1}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Participation</Text>
            <Text style={styles.metaValue}>{attempts?.length} Students</Text>
          </View>
        </View>

        {/* Results Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colNo]}>#</Text>
            <Text style={[styles.headerText, styles.colName]}>Student Name</Text>
            <Text style={[styles.headerText, styles.colCode]}>Reg Code</Text>
            <Text style={[styles.headerText, styles.colScore]}>Score</Text>
            <Text style={[styles.headerText, styles.colMax]}>Max</Text>
            <Text style={[styles.headerText, styles.colPercent]}>Percentage</Text>
            <Text style={[styles.headerText, { width: '10%', textAlign: 'center' }]}>Status</Text>
          </View>

          {attempts.map((attempt, index) => {
            const percentage = ((attempt.totalScore / attempt.totalMarks) * 100).toFixed(1);
            const isPass = parseFloat(percentage) >= 40;

            return (
              <View 
                key={attempt.id} 
                style={[styles.tableRow, index % 2 === 1 ? styles.evenRow : {}]}
              >
                <Text style={[styles.rowText, styles.colNo]}>{index + 1}</Text>
                <Text style={[styles.rowText, styles.colName]}>{attempt.student?.name}</Text>
                <Text style={[styles.rowText, styles.colCode]}>{attempt.student?.studentCode}</Text>
                <Text style={[styles.rowText, styles.colScore, { fontWeight: 'bold' }]}>{attempt.totalScore}</Text>
                <Text style={[styles.rowText, styles.colMax]}>{attempt.totalMarks}</Text>
                <Text style={[styles.rowText, styles.colPercent]}>{percentage}%</Text>
                <View style={[styles.statusBadge, isPass ? styles.passBadge : styles.failBadge]}>
                  <Text>{isPass ? 'PASS' : 'FAIL'}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summary Statistics */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Institutional Performance Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average Score</Text>
              <Text style={styles.summaryValue}>{avgScore}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Overall Pass Rate</Text>
              <Text style={styles.summaryValue}>{passRate}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Highest Score</Text>
              <Text style={styles.summaryValue}>{topScore}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Completion</Text>
              <Text style={styles.summaryValue}>100%</Text>
            </View>
          </View>
        </View>

        {/* Explanation & Footer */}
        <View style={styles.gradingKey}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Report Explanation:</Text>
          <Text>
            This report represents the aggregate results for the "{exam?.title}" examination. 
            Percentage scores are calculated based on raw marks obtained across all subject papers.
            The institutional pass mark is set at 40%. Assessments are verified via OMR/AI grading systems.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by SchoolHub Smart Assessment System</Text>
          <Text style={styles.footerText}>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExamGradeReport;
