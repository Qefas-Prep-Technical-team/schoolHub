'use client';

import React, { useState, useMemo } from 'react';
import SubjectCard from '@/app/dashboard/admin/classes/[id]/components/subjects/components/SubjectCard';
import StudentSubjectDetailsModal from './components/StudentSubjectDetailsModal';
import { Subject } from '@/app/dashboard/admin/classes/[id]/components/subjects/components/types';
import Pagination from '@/components/ui/Pagination';
import { BookOpen, BookText, Award, Clock, Flame, PlayCircle, ArrowRight, User, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useExams, useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useRouter } from 'next/navigation';

interface StudentSubjectsPageProps {
  classSubjects?: any[];
  className?: string;
}

export default function SubjectsPage({ 
  classSubjects = [], 
  className = ''
}: StudentSubjectsPageProps) {
  const { data: studentProfile } = useStudentProfile();
  
  // Fetch student exam attempts and standalone grades to calculate real performance
  const { data: attemptsResponse } = useStudentExamAttempts({ limit: 1000 });
  const attempts = attemptsResponse?.attempts || attemptsResponse?.data || [];
  
  const { data: gradesResponse } = useGrades(undefined, { limit: 1000 });
  const standaloneGrades = gradesResponse?.grades || [];
  
  // Map real classSubject data to Subject type
  const subjects: Subject[] = useMemo(() => {
    // Filter out subjects that aren't for the student's department
    let filteredClassSubjects = classSubjects;
    const anyProfile = studentProfile as any;
    const deptId = anyProfile?.data?.student?.departmentId || anyProfile?.student?.departmentId || anyProfile?.departmentId;
    if (deptId) {
      filteredClassSubjects = classSubjects.filter(cs => {
        const scope = cs.subject?.scope;
        if (scope === 'SCHOOL' || scope === 'GLOBAL') return true;
        if (scope === 'CLASS') return true; 
        if (scope === 'DEPARTMENT') {
          const deptIds = cs.subject?.departments?.map((d: any) => d.departmentId) || [];
          return deptIds.includes(deptId);
        }
        return true;
      });
    }

    return filteredClassSubjects.map(cs => {
      const subjectId = cs.subject.id;
      const subjectName = (cs.subject.name || '').toUpperCase();
      
      // Calculate real performance based on student attempts for this subject
      let performance = 0;
      let totalScore = 0;
      let totalMarks = 0;

      // Check Exam Attempts
      attempts.forEach((a: any) => {
        a.subjects?.forEach((sub: any) => {
          if ((sub.subjectName || '').toUpperCase() === subjectName) {
            totalScore += sub.score || 0;
            totalMarks += sub.totalMarks || 0;
          }
        });
      });

      // Check Standalone Grades
      standaloneGrades.forEach((g: any) => {
        if ((g.subject || '').toUpperCase() === subjectName) {
          totalScore += g.score || 0;
          totalMarks += g.maxMarks || 0;
        }
      });

      if (totalMarks > 0) {
        performance = Math.round((totalScore / totalMarks) * 100);
      }

      return {
        id: subjectId,
        name: cs.subject.name,
        code: cs.subject.code,
        description: cs.subject.description || '',
        teacherName: cs.subject.teacher?.name || 'Not assigned',
        teacherId: cs.subject.teacherId || '',
        icon: '',
        assignments: 0,
        exams: cs.subject._count?.subjectExamPapers || 0,
        averageScore: 0,
        classPerformance: performance, // Now using real performance data
        enrolledStudents: 0,
        credits: 0,
        semester: 'fall',
        academicYear: ''
      };
    });
  }, [classSubjects, studentProfile, attempts]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Calculate Paginated Subjects
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return subjects.slice(startIndex, startIndex + itemsPerPage);
  }, [subjects, currentPage]);

  const totalPages = Math.ceil(subjects.length / itemsPerPage);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailsOpen(true);
  };

  const featuredSubject = subjects[0];
  const otherSubjects = subjects.slice(1);

  // Fetch upcoming/active exams for the student
  const { data: examsData = [] } = useExams({ status: 'PUBLISHED' });
  
  // Find the closest upcoming or ongoing exam
  const featuredAssessment = useMemo(() => {
    if (!examsData || examsData.length === 0) return null;
    const now = new Date();
    
    // Prioritize ongoing, then upcoming, then recently finished
    const ongoing = examsData.find((e: any) => e.attempts?.[0]?.status === 'IN_PROGRESS');
    if (ongoing) return ongoing;

    const upcoming = examsData.filter((e: any) => new Date(e.startDate) > now).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (upcoming.length > 0) return upcoming[0];

    const active = examsData.filter((e: any) => new Date(e.startDate) <= now && (!e.endDate || new Date(e.endDate) > now));
    if (active.length > 0) return active[0];

    return examsData[0]; // fallback to first exam
  }, [examsData]);

  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* Hero Banner (Skillery Style) */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary to-primary/80 dark:from-slate-800 dark:to-slate-900 border border-transparent dark:border-slate-800 text-white p-8 md:p-12 shadow-xl shadow-primary/10 dark:shadow-none">
        <div className="absolute top-0 right-0 p-8 opacity-20 dark:opacity-5 transform translate-x-8 -translate-y-8 pointer-events-none">
          <BookText size={160} strokeWidth={1} className="text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white">
            Ready to keep learning?
          </h2>
          <p className="text-primary-100 dark:text-slate-400 text-base md:text-lg font-medium max-w-xl">
            Let's keep your learning journey going. You're just one step closer to your goals in {className}.
          </p>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subjects</p>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{subjects.length}</h4>
            <span className="text-xs text-slate-500 font-medium">Enrolled in {className}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Award size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignments</p>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{subjects.reduce((sum, s) => sum + s.assignments, 0)}</h4>
            <span className="text-xs text-slate-500 font-medium">Completed this term</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hours</p>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">18.5</h4>
            <span className="text-xs text-slate-500 font-medium">Spent learning</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Flame size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Streak</p>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">3</h4>
            <span className="text-xs text-slate-500 font-medium">Days in a row</span>
          </div>
        </div>
      </div>

      {/* Featured Subject (Continue Learning -> Upcoming Assessment) */}
      {featuredAssessment && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Upcoming Assessment</h3>
          <div 
            onClick={() => router.push(`/dashboard/student/exams&quizzes/${featuredAssessment.id}`)}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-full md:w-48 h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/5 transition-colors">
              <Award size={48} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
            </div>
            
            <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {(featuredAssessment.subjectPapers?.[0]?.subject as any)?.code || 'ASMNT'}
                </span>
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {featuredAssessment.category || 'Assessment'}
                </span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 truncate">
                {featuredAssessment.title}
              </h4>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <Clock size={14} />
                <span>
                  {featuredAssessment.startDate ? `Starts: ${new Date(featuredAssessment.startDate).toLocaleDateString()}` : 'Available Now'}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-sm h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `100%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {featuredAssessment.durationMinutes ? `${featuredAssessment.durationMinutes} min` : 'Untimed'}
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <Button 
                className="w-full md:w-auto h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 font-bold px-8 shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/student/exams&quizzes/${featuredAssessment.id}`);
                }}
              >
                Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Grid (For You) */}
      <div id="all-subjects" className="space-y-4 pt-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">For You</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedSubjects.map((subject, idx) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onClick={handleSubjectClick}
              performanceLabel="My Performance"
            />
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="text-blue-500" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No subjects assigned yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium max-w-sm mx-auto">
              There are currently no subjects assigned to this class. Check back later or contact your administrator.
            </p>
          </div>
        )}

        {subjects.length > 0 && (
          <div className="pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages || 1}
              totalItems={subjects.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <StudentSubjectDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
}
