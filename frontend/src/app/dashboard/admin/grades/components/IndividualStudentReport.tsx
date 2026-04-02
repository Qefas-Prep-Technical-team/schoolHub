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
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 2,
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
  reportType: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  studentProfile: {
    flexDirection: 'row',
    marginBottom: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileMain: {
    flex: 1,
  },
  studentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  studentCode: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  scoreRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 30,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  scoreLabel: {
    fontSize: 8,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 5,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 40,
  },
  subjectCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectPercent: {
    fontSize: 10,
    color: '#64748B',
  },
  summaryBox: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 25,
    color: '#FFFFFF',
    marginTop: 'auto',
  },
  summaryHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.6,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
  },
});

interface IndividualStudentReportProps {
  result: any;
  school: any;
}

const IndividualStudentReport: React.FC<IndividualStudentReportProps> = ({
  result,
  school,
}) => {
  const percent = Math.round((result.totalScore / result.totalMarks) * 100);
  const statusColor = percent >= 70 ? '#10B981' : percent >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school?.name || 'Academic Institution'}</Text>
            <Text style={styles.reportType}>Official Performance Certificate</Text>
          </View>
          {school?.logo && <Image src={school.logo} style={styles.logo} />}
        </View>

        {/* Student Profile & Overall Score */}
        <View style={styles.studentProfile}>
          <View style={styles.profileMain}>
            <Text style={styles.studentName}>{result.student?.name}</Text>
            <Text style={styles.studentCode}>REG: {result.student?.studentCode || 'N/A'}</Text>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <View>
                <Text style={styles.scoreLabel}>Assessment</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{result.title}</Text>
              </View>
              <View>
                <Text style={styles.scoreLabel}>Status</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: statusColor }}>
                  {percent >= 40 ? 'QUALIFIED' : 'RETAKE REQUIRED'}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.scoreRing, { borderColor: statusColor }]}>
            <Text style={styles.scoreValue}>{percent}%</Text>
            <Text style={styles.scoreLabel}>Mastery</Text>
          </View>
        </View>

        {/* Subjects Breakdown */}
        <Text style={styles.sectionTitle}>Topic Proficiency breakdown</Text>
        <View style={styles.subjectsGrid}>
          {result.subjects?.map((sub: any, i: number) => {
            const subPercent = Math.round((sub.score / sub.totalMarks) * 100);
            const subColor = subPercent >= 70 ? '#10B981' : subPercent >= 40 ? '#F59E0B' : '#EF4444';
            
            return (
              <View key={i} style={styles.subjectCard}>
                <Text style={styles.subjectName}>{sub.subjectName}</Text>
                <View style={styles.subjectStats}>
                  <Text style={[styles.subjectScore, { color: subColor }]}>
                    {sub.score}<Text style={{ fontSize: 10, color: '#94A3B8' }}> / {sub.totalMarks}</Text>
                  </Text>
                  <Text style={styles.subjectPercent}>{subPercent}%</Text>
                </View>
                <View style={{ height: 3, backgroundColor: '#F1F5F9', borderRadius: 2, marginTop: 10 }}>
                  <View style={{ height: 3, backgroundColor: subColor, width: `${subPercent}%`, borderRadius: 2 }} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Descriptive Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryHeader}>Academic Insight</Text>
          <Text style={styles.summaryText}>
            The student {result.student?.name} has achieved an overall mastery level of {percent}% 
            in the "{result.title}" assessment. This performance indicates a 
            {percent >= 70 ? 'n exceptional' : percent >= 40 ? ' solid' : ' limited'} 
            understanding of the curriculum. Relative to peer performance, this result 
            displays {percent >= result.classAverage ? 'above-average' : 'developing'} analytical capabilities.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>Certified Academic Record</Text>
            <Text style={styles.footerText}>Date: {new Date().toLocaleDateString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerText}>Generated by SchoolHub Analytics</Text>
            <Text style={styles.footerText}>Verification ID: {result.id?.slice(0,8).toUpperCase()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default IndividualStudentReport;
