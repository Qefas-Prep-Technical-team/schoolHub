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

interface TranscriptPDFProps {
  student: any;
  school: any;
  grades: any[];
  className: string;
}

export const TranscriptPDF: React.FC<TranscriptPDFProps> = ({ student, school, grades, className }) => {
  // 1. Grouping Logic: Each Exam Attempt is a Section
  const sectionsMap: Record<string, { 
    id: string;
    title: string; 
    session: string; 
    term?: string;
    papers: any[];
    totalScore: number;
    totalMax: number;
    avgPercent: number;
    attemptDate: string;
  }> = {};

  grades.forEach(g => {
    if (g.exam) {
      // Filter out redundant "Total" or aggregate records that the system might have saved as a grade
      const subjectName = g.subject?.toLowerCase() || '';
      const examTitle = g.exam.title?.toLowerCase() || '';
      const isTotalRecord = subjectName.includes('(total)') || 
                           subjectName === examTitle || 
                           g.assessmentType === 'TOTAL';

      if (isTotalRecord) return;

      const examId = g.examId || g.exam.title;
      if (!sectionsMap[examId]) {
        sectionsMap[examId] = {
          id: examId,
          title: g.exam.title,
          session: g.exam.session?.name || 'Academic Session',
          term: g.exam.term,
          papers: [],
          totalScore: 0,
          totalMax: 0,
          avgPercent: 0,
          attemptDate: g.createdAt
        };
      }
      
      sectionsMap[examId].papers.push(g);
      sectionsMap[examId].totalScore += g.score;
      sectionsMap[examId].totalMax += g.maxMarks;
    }
  });

  const sections = Object.values(sectionsMap).map(s => ({
    ...s,
    avgPercent: s.totalMax > 0 ? Math.round((s.totalScore / s.totalMax) * 100) : 0
  }));

  const totalScore = grades.reduce((acc, g) => acc + g.score, 0);
  const totalMax = grades.reduce((acc, g) => acc + g.maxMarks, 0);
  const overallPercent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  return (
    <Document title={`Academic Transcript - ${student?.name}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Institutional Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school?.name || 'ACADEMIC INSTITUTION'}</Text>
            <Text style={styles.reportType}>OFFICIAL STUDENT PERFORMANCE RECORD</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {school?.logo && <Image src={school.logo} style={styles.logo} />}
            <Text style={{ fontSize: 8, color: '#94A3B8', marginTop: 5 }}>DATE ISSUED: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Student Identification Card */}
        <View style={{ flexDirection: 'row', backgroundColor: '#1E293B', padding: 20, borderRadius: 12, marginBottom: 30, justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
                <Text style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 'bold' }}>Student Name</Text>
                <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'black' }}>{student?.name}</Text>
                <Text style={{ fontSize: 8, color: '#94A3B8', marginTop: 4 }}>REGISTRATION: {student?.studentCode} • CLASS: {className}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8 }}>
                <Text style={{ fontSize: 8, color: '#FFFFFF', opacity: 0.7 }}>CUMULATIVE GPA / SCORE</Text>
                <Text style={{ fontSize: 24, fontWeight: 'black', color: '#FFFFFF' }}>{overallPercent}%</Text>
            </View>
        </View>

        {/* Exam Sections (One Section per Exam Attempt) */}
        <View style={{ gap: 40 }}>
          {sections.map((section, idx) => (
            <View key={idx} style={{ width: '100%' }} wrap={false}>
              {/* Section Header: The Exam Title */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 2, borderBottomColor: '#1E293B', paddingBottom: 8, marginBottom: 15 }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: 'black', color: '#1E293B' }}>{section.title.toUpperCase()}</Text>
                    <Text style={{ fontSize: 8, color: '#64748B', fontWeight: 'bold' }}>SESSION: {section.session} {section.term ? `• ${section.term} TERM` : ''}</Text>
                  </View>
                  <Text style={{ fontSize: 8, color: '#94A3B8' }}>ATTEMPTED ON: {new Date(section.attemptDate).toLocaleDateString()}</Text>
              </View>

              {/* Subject Papers List Under This Exam */}
              <View style={{ backgroundColor: '#FFFFFF' }}>
                  {/* Table Header */}
                  <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                      <Text style={{ flex: 4, fontSize: 8, fontWeight: 'black', color: '#475569' }}>SUBJECT & PAPER DESCRIPTION</Text>
                      <Text style={{ flex: 2, fontSize: 8, fontWeight: 'black', color: '#475569', textAlign: 'center' }}>ASSESSMENT TYPE</Text>
                      <Text style={{ flex: 1.5, fontSize: 8, fontWeight: 'black', color: '#475569', textAlign: 'right' }}>OBTAINED</Text>
                      <Text style={{ flex: 1.5, fontSize: 8, fontWeight: 'black', color: '#475569', textAlign: 'right' }}>OUT OF</Text>
                      <Text style={{ flex: 1.5, fontSize: 8, fontWeight: 'black', color: '#475569', textAlign: 'right' }}>WEIGHT %</Text>
                      <Text style={{ flex: 1, fontSize: 8, fontWeight: 'black', color: '#475569', textAlign: 'right' }}>GRADE</Text>
                  </View>

                  {/* List of Papers */}
                  {section.papers.map((paper, pIdx) => {
                      const p = Math.round((paper.score / paper.maxMarks) * 100);
                      const g = p >= 75 ? 'A1' : p >= 70 ? 'B2' : p >= 65 ? 'B3' : p >= 60 ? 'C4' : p >= 55 ? 'C5' : p >= 50 ? 'C6' : p >= 45 ? 'D7' : p >= 40 ? 'E8' : 'F9';
                      return (
                          <View key={pIdx} style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#F1F5F9', alignItems: 'center' }}>
                              <View style={{ flex: 4 }}>
                                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1E293B' }}>{paper.subject}</Text>
                                  <Text style={{ fontSize: 8, color: '#64748B', marginTop: 2 }}>{paper.subjectPaper?.title || 'Main Examination Component'}</Text>
                              </View>
                              <Text style={{ flex: 2, fontSize: 8, color: '#64748B', textAlign: 'center', fontWeight: 'bold' }}>{paper.assessmentType || 'GENERAL'}</Text>
                              <Text style={{ flex: 1.5, fontSize: 11, fontWeight: 'black', color: '#1E293B', textAlign: 'right' }}>{paper.score}</Text>
                              <Text style={{ flex: 1.5, fontSize: 9, color: '#94A3B8', textAlign: 'right' }}>{paper.maxMarks}</Text>
                              <Text style={{ flex: 1.5, fontSize: 11, fontWeight: 'black', color: p >= 40 ? '#10B981' : '#EF4444', textAlign: 'right' }}>{p}%</Text>
                              <Text style={{ flex: 1, fontSize: 11, fontWeight: 'black', color: p >= 40 ? '#10B981' : '#EF4444', textAlign: 'right' }}>{g}</Text>
                          </View>
                      );
                  })}
              </View>

              {/* Exam Section Summary */}
              <View style={{ backgroundColor: '#F8FAFC', padding: 20, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                  <View style={{ flexDirection: 'row', gap: 40 }}>
                      <View>
                          <Text style={{ fontSize: 7, color: '#64748B', fontWeight: 'black', marginBottom: 4 }}>TOTAL OBTAINED</Text>
                          <Text style={{ fontSize: 14, fontWeight: 'black', color: '#1E293B' }}>{section.totalScore} <Text style={{ fontSize: 8, color: '#94A3B8' }}>pts</Text></Text>
                      </View>
                      <View>
                          <Text style={{ fontSize: 7, color: '#64748B', fontWeight: 'black', marginBottom: 4 }}>MAXIMUM POSSIBLE</Text>
                          <Text style={{ fontSize: 14, fontWeight: 'black', color: '#1E293B' }}>{section.totalMax} <Text style={{ fontSize: 8, color: '#94A3B8' }}>pts</Text></Text>
                      </View>
                      <View>
                          <Text style={{ fontSize: 7, color: '#64748B', fontWeight: 'black', marginBottom: 4 }}>EXAM PERFORMANCE</Text>
                          <Text style={{ fontSize: 14, fontWeight: 'black', color: section.avgPercent >= 40 ? '#10B981' : '#EF4444' }}>{section.avgPercent}%</Text>
                      </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 8, fontWeight: 'black', color: '#1E293B' }}>SECTION VERIFIED</Text>
                      <Text style={{ fontSize: 6, color: '#94A3B8', marginTop: 2 }}>AUTHENTIC ACADEMIC RECORD</Text>
                  </View>
              </View>
            </View>
          ))}
        </View>

        {/* Document Authentication Footer */}
        <View style={{ marginTop: 'auto', paddingTop: 40, borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
                <View style={{ width: 120, borderTopWidth: 1, borderTopColor: '#1E293B', marginBottom: 5 }} />
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#94A3B8' }}>REGISTRAR SEAL & SIGNATURE</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 8, fontWeight: 'black', color: '#1E293B' }}>QEFAS HUB TRANSCRIPT SERVICES</Text>
                <Text style={{ fontSize: 6, color: '#94A3B8' }}>This is a computer generated document. Valid only with official seal.</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
                <View style={{ width: 120, borderTopWidth: 1, borderTopColor: '#1E293B', marginBottom: 5 }} />
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#94A3B8' }}>PRINCIPAL / HEAD OF CENTER</Text>
            </View>
        </View>
      </Page>
    </Document>
  );
};

