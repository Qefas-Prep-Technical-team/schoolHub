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
    marginTop: 30,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  stampLabel: {
    fontSize: 7,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gradingScale: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  gradingTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  gradingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gradingItem: {
    fontSize: 7,
    color: '#64748B',
  }
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
            <Text style={styles.studentCode}>Registration Number: {result.student?.studentCode || 'N/A'}</Text>
            
            <View style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={[styles.scoreLabel, { width: 80 }]}>Class/Grade</Text>
                <Text style={{ fontSize: 10, color: '#1E293B', fontWeight: 'bold' }}>{result.className}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={[styles.scoreLabel, { width: 80 }]}>Academic Session</Text>
                <Text style={{ fontSize: 10, color: '#1E293B', fontWeight: 'bold' }}>{result.session?.name || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.scoreLabel, { width: 80 }]}>Student Email</Text>
                <Text style={{ fontSize: 10, color: '#1E293B', fontWeight: 'bold' }}>{result.student?.email || 'N/A'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 15, marginTop: 5 }}>
              <View>
                <Text style={styles.scoreLabel}>Weighted Score</Text>
                <Text style={{ fontSize: 13, fontWeight: 'black', color: '#1E293B' }}>
                  {result.totalScore} <Text style={{ fontSize: 9, color: '#94A3B8' }}>/ {result.totalMarks}</Text>
                </Text>
              </View>
              <View>
                <Text style={styles.scoreLabel}>Percentage</Text>
                <Text style={{ fontSize: 13, fontWeight: 'black', color: statusColor }}>{percent}%</Text>
              </View>
              <View>
                <Text style={styles.scoreLabel}>Grade</Text>
                <Text style={{ fontSize: 13, fontWeight: 'black', color: statusColor }}>
                  {percent >= 75 ? 'A1' : percent >= 70 ? 'B2' : percent >= 65 ? 'B3' : percent >= 60 ? 'C4' : percent >= 55 ? 'C5' : percent >= 50 ? 'C6' : percent >= 45 ? 'D7' : percent >= 40 ? 'E8' : 'F9'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 20, marginTop: 15 }}>
              <View>
                <Text style={styles.scoreLabel}>Assessment Title</Text>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#475569' }}>{result.title}</Text>
              </View>
              <View>
                <Text style={styles.scoreLabel}>Proficiency Status</Text>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: statusColor }}>
                  {percent >= 75 ? 'DISTINCTION' : percent >= 50 ? 'CREDIT' : percent >= 40 ? 'PASS' : 'FAIL'}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.scoreRing, { borderColor: statusColor }]}>
            <Text style={styles.scoreValue}>{percent}%</Text>
            <Text style={styles.scoreLabel}>Success</Text>
          </View>
        </View>

        {/* Subjects Breakdown */}
        <Text style={styles.sectionTitle}>SUBJECT PROFICIENCY BREAKDOWN</Text>
        <View style={styles.subjectsGrid}>
          {result.subjects?.map((sub: any, i: number) => {
            const subPercent = Math.round((sub.score / sub.totalMarks) * 100);
            const subColor = subPercent >= 70 ? '#10B981' : subPercent >= 40 ? '#F59E0B' : '#EF4444';
            const subGrade = subPercent >= 75 ? 'A1' : subPercent >= 70 ? 'B2' : subPercent >= 65 ? 'B3' : subPercent >= 60 ? 'C4' : subPercent >= 55 ? 'C5' : subPercent >= 50 ? 'C6' : subPercent >= 45 ? 'D7' : subPercent >= 40 ? 'E8' : 'F9';
            
            return (
              <View key={i} style={styles.subjectCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <Text style={styles.subjectName}>{sub.subjectName}</Text>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: subColor }}>{subGrade}</Text>
                </View>
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

        {/* Grading Scale Summary */}
        <View style={styles.gradingScale}>
          <Text style={styles.gradingTitle}>Official Grading Key (Nigerian Standard)</Text>
          <View style={styles.gradingRow}>
            <Text style={styles.gradingItem}>A1: 75-100 (Distinction)</Text>
            <Text style={styles.gradingItem}>B2: 70-74 (Very Good)</Text>
            <Text style={styles.gradingItem}>B3: 65-69 (Good)</Text>
            <Text style={styles.gradingItem}>C4-C6: 50-64 (Credit)</Text>
            <Text style={styles.gradingItem}>D7-E8: 40-49 (Pass)</Text>
            <Text style={styles.gradingItem}>F9: 0-39 (Fail)</Text>
          </View>
        </View>

        {/* Descriptive Summary */}
        <View style={[styles.summaryBox, { marginTop: 20 }]}>
          <Text style={styles.summaryHeader}>REGISTRAR'S ACADEMIC INSIGHT</Text>
          <Text style={styles.summaryText}>
            {result.performanceInsight || `The student ${result.student?.name} has achieved a weighted aggregate of ${result.totalScore} with a proficiency level of ${percent >= 75 ? 'Distinction' : percent >= 50 ? 'Credit' : percent >= 40 ? 'Pass' : 'Fail'}.`}
          </Text>
        </View>

        {/* Verification & Signatures */}
        <View style={styles.signatureSection}>
           <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Class Teacher's Sign</Text>
           </View>
           <View style={styles.stampBox}>
              <Text style={styles.stampLabel}>OFFICIAL{"\n"}SCHOOL STAMP</Text>
           </View>
           <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Principal's Signature</Text>
           </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>Certified Academic Transcript</Text>
            <Text style={styles.footerText}>Date Generated: {new Date().toLocaleDateString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerText}>Powered by SchoolHub Nigeria</Text>
            <Text style={styles.footerText}>Doc ID: {result.id?.slice(0,12).toUpperCase()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default IndividualStudentReport;
