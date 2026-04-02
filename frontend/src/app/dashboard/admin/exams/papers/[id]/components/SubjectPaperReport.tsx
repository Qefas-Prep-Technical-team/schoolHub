"use client";

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

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
  metadata: {
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
  colName: { width: '35%' },
  colCode: { width: '15%' },
  colScore: { width: '15%', textAlign: 'center' },
  colMax: { width: '10%', textAlign: 'center' },
  colPercent: { width: '10%', textAlign: 'center' },
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
  gradingKey: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gradingTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  gradingText: {
    fontSize: 8,
    color: '#64748B',
    lineHeight: 1.5,
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
});

interface SubjectPaperReportProps {
  paper: any;
  attempts: any[];
  school: any;
}

const SubjectPaperReport: React.FC<SubjectPaperReportProps> = ({
  paper,
  attempts,
  school,
}) => {
  const avgScore = attempts.length > 0
    ? (attempts.reduce((sum, a) => sum + (a.score / a.totalMarks) * 100, 0) / attempts.length).toFixed(1)
    : '0';

  const passRate = attempts.length > 0
    ? ((attempts.filter(a => (a.score / a.totalMarks) >= (paper.passMark || 40) / 100).length / attempts.length) * 100).toFixed(0)
    : '0';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school?.name || 'Academic Institution'}</Text>
            <Text style={styles.reportTitle}>Subject Performance Analysis</Text>
          </View>
          {school?.logo && <Image src={school.logo} style={styles.logo} />}
        </View>

        {/* Paper Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Subject Paper</Text>
            <Text style={styles.metaValue}>{paper?.title}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Subject</Text>
            <Text style={styles.metaValue}>{paper?.subject?.name || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Teacher</Text>
            <Text style={styles.metaValue}>{paper?.teacher?.name || 'Assigned Staff'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date Generated</Text>
            <Text style={styles.metaValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Pass Mark</Text>
            <Text style={styles.metaValue}>{paper?.passMark || 40}%</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Participants</Text>
            <Text style={styles.metaValue}>{attempts?.length} Students</Text>
          </View>
        </View>

        {/* Student Results Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colNo]}>#</Text>
            <Text style={[styles.headerText, styles.colName]}>Student Name</Text>
            <Text style={[styles.headerText, styles.colCode]}>Reg Code</Text>
            <Text style={[styles.headerText, styles.colScore]}>Score</Text>
            <Text style={[styles.headerText, styles.colMax]}>Max</Text>
            <Text style={[styles.headerText, styles.colPercent]}>%</Text>
            <Text style={[styles.headerText, { width: '10%', textAlign: 'center' }]}>Status</Text>
          </View>

          {attempts.map((attempt, index) => {
            const percentage = ((attempt.score / attempt.totalMarks) * 100).toFixed(1);
            const isPass = parseFloat(percentage) >= (paper.passMark || 40);

            return (
              <View
                key={attempt.id}
                style={[styles.tableRow, index % 2 === 1 ? styles.evenRow : {}]}
              >
                <Text style={[styles.rowText, styles.colNo]}>{index + 1}</Text>
                <Text style={[styles.rowText, styles.colName]}>
                  {attempt.examAttempt?.student?.name}
                </Text>
                <Text style={[styles.rowText, styles.colCode]}>
                  {attempt.examAttempt?.student?.studentCode}
                </Text>
                <Text style={[styles.rowText, styles.colScore, { fontWeight: 'bold' }]}>
                  {attempt.score}
                </Text>
                <Text style={[styles.rowText, styles.colMax]}>
                  {attempt.totalMarks}
                </Text>
                <Text style={[styles.rowText, styles.colPercent]}>
                  {percentage}%
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    isPass ? styles.passBadge : styles.failBadge,
                  ]}
                >
                  <Text>{isPass ? 'PASS' : 'FAIL'}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summary Area */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Analytical Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Subject Average</Text>
              <Text style={styles.summaryValue}>{avgScore}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Success Rate</Text>
              <Text style={styles.summaryValue}>{passRate}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Assessment Type</Text>
              <Text style={styles.summaryValue}>Final Exam</Text>
            </View>
          </View>
        </View>

        {/* Grading Key & Explanation */}
        <View style={styles.gradingKey}>
          <Text style={styles.gradingTitle}>Grading Key & Explanation</Text>
          <Text style={styles.gradingText}>
            This report summarizes the performance of students for the "{paper?.title}" subject paper. 
            The raw score represents the total points awarded by the AI grading engine or human marker.
            Percentage is calculated as (Raw Score / Maximum Marks) * 100.
            Results undergo strict validation to ensure academic integrity.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by SchoolHub Smart Assessment System</Text>
          <Text style={styles.footerText}>
            Confidential Academic Record • {new Date().getFullYear()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default SubjectPaperReport;
