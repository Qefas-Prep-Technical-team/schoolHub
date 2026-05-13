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
    ? (attempts.reduce((sum, a) => {
        const marks = a.totalMarks || a.maxMarks || paper.totalMarks || 100;
        const score = a.score || 0;
        return sum + (score / marks) * 100;
      }, 0) / attempts.length).toFixed(1)
    : '0';

  const passRate = attempts.length > 0
    ? ((attempts.filter(a => {
        const marks = a.totalMarks || a.maxMarks || paper.totalMarks || 100;
        const score = a.score || 0;
        return (score / marks) >= (paper.passMark || 40) / 100;
      }).length / attempts.length) * 100).toFixed(0)
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
          {school?.logo && <Image src={school.logo as string} style={styles.logo} />}
        </View>

        {/* Paper Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Subject Paper</Text>
            <Text style={styles.metaValue}>{paper?.title}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Academic Session</Text>
            <Text style={styles.metaValue}>{new Date().getFullYear()}/{new Date().getFullYear() + 1} Session</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Term</Text>
            <Text style={styles.metaValue}>First Term</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Subject</Text>
            <Text style={styles.metaValue}>{paper?.subject?.name || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Assigned Staff</Text>
            <Text style={styles.metaValue}>{paper?.teacher?.name || 'Academic Dept'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date Generated</Text>
            <Text style={styles.metaValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Total Marks (WA)</Text>
            <Text style={styles.metaValue}>{paper?.totalMarks || 0} pts</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Paper Pass Mark</Text>
            <Text style={styles.metaValue}>{paper?.passMark || 40}% ({((paper?.passMark || 40) / 100 * (paper?.totalMarks || 0)).toFixed(1)} pts)</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Class Enrollment</Text>
            <Text style={styles.metaValue}>{attempts?.length} Students</Text>
          </View>
        </View>

        {/* Student Results Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colNo]}>#</Text>
            <Text style={[styles.headerText, styles.colName]}>Student Name</Text>
            <Text style={[styles.headerText, { width: '20%', color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' }]}>Registration No.</Text>
            <Text style={[styles.headerText, styles.colScore]}>Score</Text>
            <Text style={[styles.headerText, styles.colPercent]}>%</Text>
            <Text style={[styles.headerText, { width: '10%', textAlign: 'center', color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' }]}>Grade</Text>
          </View>

          {attempts.map((attempt, index) => {
            const marks = attempt.totalMarks || attempt.maxMarks || paper.totalMarks || 100;
            const score = attempt.score || 0;
            const percentage = Math.round((score / marks) * 100);
            const isPass = percentage >= (paper.passMark || 40);
            const grade = percentage >= 75 ? 'A1' : percentage >= 70 ? 'B2' : percentage >= 65 ? 'B3' : percentage >= 60 ? 'C4' : percentage >= 55 ? 'C5' : percentage >= 50 ? 'C6' : percentage >= 45 ? 'D7' : percentage >= 40 ? 'E8' : 'F9';

            return (
              <View
                key={attempt.id}
                style={[styles.tableRow, index % 2 === 1 ? styles.evenRow : {}]}
              >
                <Text style={[styles.rowText, styles.colNo]}>{index + 1}</Text>
                <Text style={[styles.rowText, styles.colName]}>
                  {attempt.examAttempt?.student?.name}
                </Text>
                <Text style={[styles.rowText, { width: '20%', fontSize: 9, color: '#334155' }]}>
                  {attempt.examAttempt?.student?.studentCode}
                </Text>
                <Text style={[styles.rowText, styles.colScore, { fontWeight: 'bold' }]}>
                  {attempt.score}
                </Text>
                <Text style={[styles.rowText, styles.colPercent]}>
                  {percentage}%
                </Text>
                <Text style={[styles.rowText, { width: '10%', textAlign: 'center', fontWeight: 'bold', color: isPass ? '#10B981' : '#EF4444' }]}>
                  {grade}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Analytical Performance Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Analytical Performance Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Mean Percentage</Text>
              <Text style={styles.summaryValue}>{avgScore}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Subject Success Rate</Text>
              <Text style={styles.summaryValue}>{passRate}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Assessment Category</Text>
              <Text style={styles.summaryValue}>Continuous Assessment</Text>
            </View>
          </View>
        </View>

        <View style={styles.gradingKey}>
          <Text style={styles.gradingTitle}>Official Grading Standards (WAEC/NECO)</Text>
          <Text style={styles.gradingText}>
            A1 (Distinction): 75-100% | B2 (Very Good): 70-74% | B3 (Good): 65-69% {"\n"}
            C4-C6 (Credit): 50-64% | D7-E8 (Pass): 40-49% | F9 (Fail): 0-39% {"\n"}
            This report serves as an internal academic record for institutional review.
          </Text>
        </View>

        {/* Verification & Signatures */}
        <View style={styles.signatureSection}>
           <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Subject Teacher</Text>
           </View>
           <View style={styles.stampBox}>
              <Text style={styles.stampLabel}>OFFICIAL{"\n"}STAMP</Text>
           </View>
           <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Head of Department</Text>
           </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Certified Subject Assessment Record • Qefas Hub Nigeria</Text>
          <Text style={styles.footerText}>
            Generated: {new Date().toLocaleDateString()} • {new Date().getFullYear()} Session
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default SubjectPaperReport;
