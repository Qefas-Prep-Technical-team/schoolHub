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
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  schoolInfo: {
    flex: 1,
    alignItems: 'center',
  },
  schoolName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 10,
    marginBottom: 2,
  },
  schoolContact: {
    fontSize: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  photoBox: {
    width: 80,
    height: 100,
    borderWidth: 1,
    borderColor: '#000',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
    textAlign: 'center',
    marginBottom: 15,
  },
  bioSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    fontSize: 9,
  },
  bioRow: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 6,
  },
  bioLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  bioValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
    marginRight: 10,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 10,
  },
  leftColumn: {
    flex: 1.5,
  },
  rightColumn: {
    flex: 1,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableHeader: {
    backgroundColor: '#E5E7EB',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  tableCell: {
    fontSize: 8,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
    justifyContent: 'center',
  },
  tableCellSubject: {
    fontSize: 8,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'left',
    flex: 3,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  sectionTitle: {
    backgroundColor: '#E5E7EB',
    fontSize: 9,
    fontWeight: 'bold',
    padding: 4,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 0,
  },
  remarksSection: {
    marginTop: 15,
    fontSize: 9,
  },
  remarkBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginTop: 4,
    minHeight: 30,
    marginBottom: 10,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  signatureLine: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginTop: 15,
  },
  stampBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 25,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    backgroundColor: '#EFF6FF',
  },
  stampText: {
    fontSize: 5,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
  },
});

interface IndividualStudentReportProps {
  result: any;
  school: any;
  isComprehensive?: boolean;
  hasPerformanceAccess?: boolean;
}

export const ReportPageContent: React.FC<{ result: any; school: any; isComprehensive?: boolean; hasPerformanceAccess?: boolean }> = ({ 
  result, 
  school, 
  isComprehensive = false,
  hasPerformanceAccess = false
}) => {
  const percent = Math.round((result.totalScore / result.totalMarks) * 100);
  const gradeLabel = percent >= 75 ? 'A' : percent >= 60 ? 'B' : percent >= 50 ? 'C' : percent >= 40 ? 'D' : 'F';
  const remark = percent >= 75 ? 'EXCELLENT' : percent >= 60 ? 'VERY GOOD' : percent >= 50 ? 'GOOD' : percent >= 40 ? 'PASS' : 'FAIL';

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {school?.logo ? (
          <Image src={school.logo} style={styles.logo} />
        ) : (
          <View style={styles.logo} />
        )}
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolName}>{school?.name || 'Academic Institution'}</Text>
          <Text style={styles.schoolAddress}>{school?.settings?.address || 'School Address'}</Text>
          <Text style={styles.schoolContact}>TEL: {school?.settings?.phone || 'N/A'}; Email: {school?.settings?.email || 'N/A'}</Text>
        </View>
        <View style={styles.photoBox}>
            {result.student?.profileImage ? (
              <Image src={result.student.profileImage} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 6, color: '#9CA3AF', fontWeight: 'bold', textAlign: 'center' }}>NO PHOTO</Text>
              </View>
            )}
        </View>
      </View>

      <Text style={styles.reportTitle}>STUDENT'S PERFORMANCE REPORT</Text>

      {/* Bio Section */}
      <View style={styles.bioSection}>
        <View style={styles.bioRow}>
          <Text style={styles.bioLabel}>NAME:</Text>
          <Text style={styles.bioValue}>{result.student?.name}</Text>
        </View>
        <View style={styles.bioRow}>
          <Text style={styles.bioLabel}>GENDER:</Text>
          <Text style={styles.bioValue}>{result.student?.gender || 'N/A'}</Text>
        </View>
        <View style={styles.bioRow}>
          <Text style={styles.bioLabel}>CLASS:</Text>
          <Text style={styles.bioValue}>{result.className}</Text>
        </View>
        <View style={styles.bioRow}>
          <Text style={styles.bioLabel}>SESSION:</Text>
          <Text style={styles.bioValue}>{result.session?.name || 'N/A'}</Text>
        </View>
        <View style={styles.bioRow}>
          <Text style={styles.bioLabel}>ADMISSION NO:</Text>
          <Text style={styles.bioValue}>{result.student?.studentCode || 'N/A'}</Text>
        </View>
        <View style={styles.bioRow}>
          <Text style={styles.bioLabel}>D.O.B:</Text>
          <Text style={styles.bioValue}>{result.student?.dateOfBirth ? new Date(result.student.dateOfBirth).toLocaleDateString() : 'N/A'}</Text>
        </View>
        {isComprehensive && (
          <>
            <View style={styles.bioRow}>
              <Text style={styles.bioLabel}>HT (cm):</Text>
              <Text style={styles.bioValue}>{result.student?.height || 'N/A'}</Text>
            </View>
            <View style={styles.bioRow}>
              <Text style={styles.bioLabel}>WT (kg):</Text>
              <Text style={styles.bioValue}>{result.student?.weight || 'N/A'}</Text>
            </View>
            <View style={styles.bioRow}>
              <Text style={styles.bioLabel}>CLUB/SOCIETY:</Text>
              <Text style={styles.bioValue}>{result.student?.club || 'N/A'}</Text>
            </View>
            <View style={styles.bioRow}>
              <Text style={styles.bioLabel}>FAV. COL:</Text>
              <Text style={styles.bioValue}>{result.student?.favouriteColour || 'N/A'}</Text>
            </View>
          </>
        )}
      </View>

      {/* Main Layout */}
      <View style={styles.mainContent}>
        {/* Left Column - Cognitive Domain */}
        <View style={[styles.leftColumn, !isComprehensive ? { flex: 1 } : {}]}>
          <Text style={styles.sectionTitle}>COGNITIVE DOMAIN</Text>
          <View style={[styles.table, { borderTopWidth: 0 }]}>
            {/* Table Header */}
            {isComprehensive ? (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableHeader, styles.flex2]}>SUBJECTS</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>C.A</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>EXAM</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>TOTAL</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>GRADE</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>POS.</Text>
                  <Text style={[styles.tableHeader, styles.flex2]}>REMARKS</Text>
                  <Text style={[styles.tableHeader, styles.flex1, { borderRightWidth: 0 }]}>CLASS AVG</Text>
                </View>
            ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableHeader, styles.flex2]}>SUBJECTS</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>SCORE</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>MAX</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>PERCENT</Text>
                  <Text style={[styles.tableHeader, styles.flex1]}>GRADE</Text>
                  <Text style={[styles.tableHeader, styles.flex2, { borderRightWidth: 0 }]}>REMARKS</Text>
                </View>
            )}

            {/* Table Body */}
            {result.subjects?.map((sub: any, i: number) => {
              const subPercent = Math.round((sub.score / sub.totalMarks) * 100);
              const subGrade = subPercent >= 75 ? 'A' : subPercent >= 60 ? 'B' : subPercent >= 50 ? 'C' : subPercent >= 40 ? 'D' : 'F';
              const subRemark = subPercent >= 75 ? 'EXCELLENT' : subPercent >= 60 ? 'VERY GOOD' : subPercent >= 50 ? 'GOOD' : subPercent >= 40 ? 'PASS' : 'FAIL';
              
              if (isComprehensive) {
                  // Mocking CA/Exam split until fully integrated
                  const mockedCA = Math.round(sub.score * 0.3);
                  const mockedExam = sub.score - mockedCA;

                  return (
                    <View key={i} style={styles.tableRow}>
                      <Text style={[styles.tableCellSubject, styles.flex2]}>{sub.subjectName}</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{sub.caScore ?? mockedCA}</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{sub.examScore ?? mockedExam}</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{sub.score}</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{subGrade}</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{sub.position || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.flex2]}>{subRemark}</Text>
                      <Text style={[styles.tableCell, styles.flex1, { borderRightWidth: 0 }]}>{sub.classAverage || 'N/A'}</Text>
                    </View>
                  );
              } else {
                  return (
                    <View key={i} style={styles.tableRow}>
                      <Text style={[styles.tableCellSubject, styles.flex2]}>{sub.subjectName}</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{sub.score}</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{sub.totalMarks}</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{subPercent}%</Text>
                      <Text style={[styles.tableCell, styles.flex1]}>{subGrade}</Text>
                      <Text style={[styles.tableCell, styles.flex2, { borderRightWidth: 0 }]}>{subRemark}</Text>
                    </View>
                  );
              }
            })}
          </View>

          {/* Performance Summary */}
          <Text style={styles.sectionTitle}>PERFORMANCE SUMMARY</Text>
          <View style={[styles.table, { borderTopWidth: 0, flexDirection: 'row' }]}>
            <View style={{ flex: 1 }}>
               <View style={styles.tableRow}>
                 <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#E5E7EB', fontWeight: 'bold' }]}>Total Obtained:</Text>
                 <Text style={[styles.tableCell, { flex: 1 }]}>{result.totalScore}</Text>
               </View>
               <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                 <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#E5E7EB', fontWeight: 'bold' }]}>Total Obtainable:</Text>
                 <Text style={[styles.tableCell, { flex: 1 }]}>{result.totalMarks}</Text>
               </View>
            </View>
            <View style={{ flex: 1 }}>
               <View style={styles.tableRow}>
                 <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#E5E7EB', fontWeight: 'bold' }]}>%AGE:</Text>
                 <Text style={[styles.tableCell, { flex: 1 }]}>{percent}%</Text>
               </View>
               <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                 <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#E5E7EB', fontWeight: 'bold' }]}>GRADE:</Text>
                 <Text style={[styles.tableCell, { flex: 1 }]}>{gradeLabel}</Text>
               </View>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderColor: '#000' }}>
               <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{remark}</Text>
            </View>
          </View>

          {/* Visual Performance Chart */}
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>PERFORMANCE CHART</Text>
          <View style={[styles.table, { borderTopWidth: 0, padding: 10, flexDirection: 'column' }]}>
            {result.subjects?.map((sub: any, i: number) => {
              const subPercent = Math.round((sub.score / sub.totalMarks) * 100);
              const barColor = subPercent >= 75 ? '#10B981' : subPercent >= 60 ? '#3B82F6' : subPercent >= 50 ? '#F59E0B' : '#EF4444';
              
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ width: 80, fontSize: 8, fontWeight: 'bold' }} {...({ numberOfLines: 1 } as any)}>{sub.subjectName}</Text>
                  <View style={{ flex: 1, height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden', flexDirection: 'row', marginLeft: 5, marginRight: 5 }}>
                     <View style={{ width: `${subPercent}%`, height: '100%', backgroundColor: barColor }} />
                  </View>
                  <Text style={{ width: 25, fontSize: 8, textAlign: 'right', fontWeight: 'bold', color: barColor }}>{subPercent}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Right Column - Domains & Attendance */}
        {isComprehensive && (
            <View style={styles.rightColumn}>
            {/* Attendance */}
            <Text style={styles.sectionTitle}>ATTENDANCE SUMMARY</Text>
            <View style={[styles.table, { borderTopWidth: 0 }]}>
                <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3, textAlign: 'left' }]}>No of Times School Opened</Text>
                <Text style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>{result.attendance?.total || 0}</Text>
                </View>
                <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3, textAlign: 'left' }]}>No of Times Present</Text>
                <Text style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>{result.attendance?.present || 0}</Text>
                </View>
                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.tableCell, { flex: 3, textAlign: 'left' }]}>No of Times Absent</Text>
                <Text style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>{result.attendance?.absent || 0}</Text>
                </View>
            </View>

            {/* Affective Domain */}
            <Text style={styles.sectionTitle}>AFFECTIVE DOMAIN</Text>
            <View style={[styles.table, { borderTopWidth: 0 }]}>
                <View style={[styles.tableRow, { backgroundColor: '#E5E7EB' }]}>
                <Text style={[styles.tableCell, { flex: 4, textAlign: 'left' }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>5</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>4</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>3</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>2</Text>
                <Text style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>1</Text>
                </View>
                {['Attentiveness', 'Honesty', 'Neatness', 'Politeness', 'Punctuality', 'Self Control', 'Obedience'].map((trait, idx) => (
                <View key={idx} style={[styles.tableRow, idx === 6 ? { borderBottomWidth: 0 } : {}]}>
                    <Text style={[styles.tableCell, { flex: 4, textAlign: 'left' }]}>{trait}</Text>
                    {[5,4,3,2,1].map(val => (
                    <Text key={val} style={[styles.tableCell, { flex: 1, borderRightWidth: val === 1 ? 0 : 1 }]}>
                        {result.termlyEvaluation?.affective?.[trait.toLowerCase()] === val ? '✓' : ''}
                    </Text>
                    ))}
                </View>
                ))}
            </View>

            {/* Psychomotor Domain */}
            <Text style={styles.sectionTitle}>PSYCHOMOTOR DOMAIN</Text>
            <View style={[styles.table, { borderTopWidth: 0 }]}>
                <View style={[styles.tableRow, { backgroundColor: '#E5E7EB' }]}>
                <Text style={[styles.tableCell, { flex: 4, textAlign: 'left' }]}></Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>5</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>4</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>3</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>2</Text>
                <Text style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>1</Text>
                </View>
                {['Handling Tools', 'Drawing/Painting', 'Handwriting', 'Public Speaking', 'Sports & Games'].map((trait, idx) => (
                <View key={idx} style={[styles.tableRow, idx === 4 ? { borderBottomWidth: 0 } : {}]}>
                    <Text style={[styles.tableCell, { flex: 4, textAlign: 'left' }]}>{trait}</Text>
                    {[5,4,3,2,1].map(val => (
                    <Text key={val} style={[styles.tableCell, { flex: 1, borderRightWidth: val === 1 ? 0 : 1 }]}>
                        {result.termlyEvaluation?.psychomotor?.[trait.toLowerCase().replace('/', '')] === val ? '✓' : ''}
                    </Text>
                    ))}
                </View>
                ))}
            </View>

            {/* Rating Indices */}
            <Text style={styles.sectionTitle}>Rating Indices</Text>
            <View style={[styles.table, { borderTopWidth: 0, padding: 4 }]}>
                <Text style={{ fontSize: 7, marginBottom: 2 }}>5 - Maintains an Excellent degree of traits.</Text>
                <Text style={{ fontSize: 7, marginBottom: 2 }}>4 - Maintains a High level of traits.</Text>
                <Text style={{ fontSize: 7, marginBottom: 2 }}>3 - Acceptable level of traits.</Text>
                <Text style={{ fontSize: 7, marginBottom: 2 }}>2 - Shows Minimal regard for traits.</Text>
                <Text style={{ fontSize: 7 }}>1 - Has No regard for traits.</Text>
            </View>
            </View>
        )}
      </View>

      {/* Grading Scale */}
      {isComprehensive && (
        <View style={[styles.table, { flexDirection: 'row' }]}>
            <View style={{ flex: 1.5, borderRightWidth: 1, borderColor: '#000' }}>
                <Text style={styles.sectionTitle}>GRADE SCALE</Text>
                <View style={{ padding: 6 }}>
                <Text style={{ fontSize: 8 }}>70-100% = A (EXCELLENT)   60-69.9% = B (VERY GOOD)</Text>
                <Text style={{ fontSize: 8 }}>50-59.9% = C (GOOD)   40-49.9% = D (PASS)</Text>
                <Text style={{ fontSize: 8 }}>0-39.9% = F (FAIL)</Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>GRADE ANALYSIS</Text>
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                {['GRADE','A','B','C','D','F'].map((g, i) => (
                    <Text key={i} style={[styles.tableCell, { flex: 1, backgroundColor: '#E5E7EB', borderRightWidth: i===5?0:1 }]}>{g}</Text>
                ))}
                </View>
                <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#E5E7EB' }]}>NO</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{result.subjects?.filter((s:any) => (s.score/s.totalMarks)*100 >= 75).length || '-'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{result.subjects?.filter((s:any) => (s.score/s.totalMarks)*100 >= 60 && (s.score/s.totalMarks)*100 < 75).length || '-'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{result.subjects?.filter((s:any) => (s.score/s.totalMarks)*100 >= 50 && (s.score/s.totalMarks)*100 < 60).length || '-'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{result.subjects?.filter((s:any) => (s.score/s.totalMarks)*100 >= 40 && (s.score/s.totalMarks)*100 < 50).length || '-'}</Text>
                <Text style={[styles.tableCell, { flex: 1, borderRightWidth: 0 }]}>{result.subjects?.filter((s:any) => (s.score/s.totalMarks)*100 < 40).length || '-'}</Text>
                </View>
            </View>
        </View>
      )}

      {/* Remarks Section */}
      <View style={styles.remarksSection}>
        <Text style={{ fontStyle: 'italic', fontSize: 9 }}>Teacher's Remark:</Text>
        <View style={styles.remarkBox}>
          <Text style={{ fontStyle: 'italic' }}>{result.termlyEvaluation?.teacherRemark || (hasPerformanceAccess ? result.performanceInsight : null) || 'An excellent performance. Keep it up!'}</Text>
        </View>
        <View style={[styles.signatureRow, { marginTop: 15 }]}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 8 }}>Class Teacher's Signature</Text>
            <View style={[styles.signatureLine, { width: 140 }]} />
            <Text style={{ fontSize: 6, color: '#6B7280', marginTop: 2 }}>Signature / Date</Text>
          </View>
          
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={styles.stampBox}>
              {school?.logo ? (
                <Image src={school.logo} style={{ width: 35, height: 35, opacity: 0.6 }} />
              ) : (
                <Text style={styles.stampText}>STAMP</Text>
              )}
            </View>
            <Text style={{ fontSize: 6, color: '#3B82F6', marginTop: 4, fontWeight: 'bold' }}>OFFICIAL STAMP</Text>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 8 }}>Principal's Signature</Text>
            <View style={[styles.signatureLine, { width: 140 }]} />
            <Text style={{ fontSize: 6, color: '#6B7280', marginTop: 2 }}>Signature / Date</Text>
          </View>
        </View>

        {isComprehensive && (
            <>
                <Text style={{ fontStyle: 'italic', fontSize: 9, marginTop: 10 }}>Principal's Remark:</Text>
                <View style={styles.remarkBox}>
                <Text style={{ fontStyle: 'italic', textAlign: 'center', fontWeight: 'bold' }}>{result.termlyEvaluation?.principalRemark || 'An outstanding result!! You should keep it up'}</Text>
                </View>

                <View style={[styles.signatureRow, { marginTop: 15, borderTopWidth: 0.5, borderTopColor: '#E5E7EB', paddingTop: 8 }]}>
                <Text style={{ fontWeight: 'bold', fontSize: 8 }}>Next Term Begins: .....................................................</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 8 }}>Date: {new Date().toLocaleDateString()}</Text>
                </View>
            </>
        )}
      </View>
    </Page>
  );
};

const IndividualStudentReport: React.FC<IndividualStudentReportProps> = ({
  result,
  school,
  isComprehensive = false,
  hasPerformanceAccess = false
}) => {
  return (
    <Document>
      <ReportPageContent 
        result={result} 
        school={school} 
        isComprehensive={isComprehensive} 
        hasPerformanceAccess={hasPerformanceAccess} 
      />
    </Document>
  );
};

export const ComprehensiveTranscriptReport: React.FC<{ transcript: any }> = ({ transcript }) => {
  if (!transcript) return null;

  const { student, school, className, sessionName, subjects, totalScore, totalMax, overallAverage, gpa, aiClassTeacherRemark, aiGeneralRemark } = transcript;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {school?.logo ? (
            <Image src={school.logo} style={styles.logo} />
          ) : (
            <View style={styles.logo} />
          )}
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school?.name || 'Academic Institution'}</Text>
            <Text style={styles.schoolAddress}>{school?.settings?.address || school?.address || 'School Address'}</Text>
            <Text style={styles.schoolContact}>TEL: {school?.settings?.phone || school?.phone || 'N/A'}; Email: {school?.settings?.email || school?.schoolEmail || 'N/A'}</Text>
          </View>
          <View style={styles.photoBox}>
            {student?.profileImage ? (
              <Image src={student.profileImage} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 6, color: '#9CA3AF', fontWeight: 'bold' }}>NO PHOTO</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.reportTitle}>OFFICIAL ACADEMIC TRANSCRIPT</Text>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <View style={styles.bioRow}>
            <Text style={styles.bioLabel}>NAME:</Text>
            <Text style={styles.bioValue}>{student?.name}</Text>
          </View>
          <View style={styles.bioRow}>
            <Text style={styles.bioLabel}>GENDER:</Text>
            <Text style={styles.bioValue}>{student?.gender || 'N/A'}</Text>
          </View>
          <View style={styles.bioRow}>
            <Text style={styles.bioLabel}>CLASS:</Text>
            <Text style={styles.bioValue}>{className}</Text>
          </View>
          <View style={styles.bioRow}>
            <Text style={styles.bioLabel}>SESSION:</Text>
            <Text style={styles.bioValue}>{sessionName}</Text>
          </View>
          <View style={styles.bioRow}>
            <Text style={styles.bioLabel}>ADMISSION NO:</Text>
            <Text style={styles.bioValue}>{student?.studentCode || 'N/A'}</Text>
          </View>
          <View style={styles.bioRow}>
            <Text style={styles.bioLabel}>DATE ISSUED:</Text>
            <Text style={styles.bioValue}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Cognitive Domain - Subject Breakdown */}
        <Text style={styles.sectionTitle}>ACADEMIC SUMMARY (COGNITIVE DOMAIN)</Text>
        <View style={[styles.table, { borderTopWidth: 0 }]}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { flex: 2.5 }]}>SUBJECTS</Text>
            <Text style={[styles.tableHeader, { flex: 1 }]}>C.A. (40)</Text>
            <Text style={[styles.tableHeader, { flex: 1 }]}>EXAM (60)</Text>
            <Text style={[styles.tableHeader, { flex: 1.2 }]}>TOTAL (100)</Text>
            <Text style={[styles.tableHeader, { flex: 1 }]}>GRADE</Text>
            <Text style={[styles.tableHeader, { flex: 1.5, borderRightWidth: 0 }]}>REMARKS</Text>
          </View>

          {/* Table Body */}
          {subjects.map((sub: any, i: number) => {
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCellSubject, { flex: 2.5 }]}>{sub.subjectName}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{sub.caScore}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{sub.examScore}</Text>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{sub.totalScore}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{sub.grade}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, borderRightWidth: 0 }]}>{sub.remark}</Text>
              </View>
            );
          })}
        </View>

        {/* Performance Summary */}
        <Text style={styles.sectionTitle}>PERFORMANCE SUMMARY & COMMENTS</Text>
        <View style={[styles.table, { borderTopWidth: 0, flexDirection: 'row' }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.2, backgroundColor: '#E5E7EB', fontWeight: 'bold' }]}>Cumulative Marks:</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{totalScore} / {totalMax}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.2, backgroundColor: '#E5E7EB', fontWeight: 'bold' }]}>Overall Average:</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{overallAverage}%</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.2, backgroundColor: '#E5E7EB', fontWeight: 'bold' }]}>GPA Equivalent:</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{gpa} / 4.0</Text>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.tableCell, { flex: 1.2, backgroundColor: '#E5E7EB', fontWeight: 'bold' }]}>Overall Grade:</Text>
              {(() => {
                const overallPct = overallAverage || 0;
                let overallGrade = 'F9';
                let overallRemark = 'FAIL';
                if (overallPct >= 75) { overallGrade = 'A1'; overallRemark = 'EXCELLENT'; }
                else if (overallPct >= 70) { overallGrade = 'B2'; overallRemark = 'VERY GOOD'; }
                else if (overallPct >= 65) { overallGrade = 'B3'; overallRemark = 'GOOD'; }
                else if (overallPct >= 60) { overallGrade = 'C4'; overallRemark = 'CREDIT'; }
                else if (overallPct >= 55) { overallGrade = 'C5'; overallRemark = 'CREDIT'; }
                else if (overallPct >= 50) { overallGrade = 'C6'; overallRemark = 'CREDIT'; }
                else if (overallPct >= 45) { overallGrade = 'D7'; overallRemark = 'PASS'; }
                else if (overallPct >= 40) { overallGrade = 'E8'; overallRemark = 'PASS'; }
                return <Text style={[styles.tableCell, { flex: 1 }]}>{overallGrade} ({overallRemark})</Text>;
              })()}
            </View>
          </View>
          <View style={{ flex: 1.5, padding: 6, borderLeftWidth: 1, borderColor: '#000' }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 2 }}>Class Teacher's Remark:</Text>
            <Text style={{ fontSize: 7, fontStyle: 'italic', marginBottom: 6 }}>{aiClassTeacherRemark}</Text>
            
            <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 2 }}>Principal's Overall Verdict:</Text>
            <Text style={{ fontSize: 7, fontStyle: 'italic' }}>{aiGeneralRemark}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={[styles.remarksSection, { marginTop: 30 }]}>
          <View style={styles.signatureRow}>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 8 }}>Class Teacher: System Assessed</Text>
              <View style={[styles.signatureLine, { width: 140 }]} />
              <Text style={{ fontSize: 6, color: '#6B7280', marginTop: 2 }}>Signature / Date</Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={styles.stampBox}>
                {school?.logo ? (
                  <Image src={school.logo} style={{ width: 35, height: 35, opacity: 0.6 }} />
                ) : (
                  <Text style={styles.stampText}>STAMP</Text>
                )}
              </View>
              <Text style={{ fontSize: 6, color: '#3B82F6', marginTop: 4, fontWeight: 'bold' }}>OFFICIAL STAMP</Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 8 }}>Principal: Board Rep.</Text>
              <View style={[styles.signatureLine, { width: 140 }]} />
              <Text style={{ fontSize: 6, color: '#6B7280', marginTop: 2 }}>Signature / Date</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default IndividualStudentReport;
