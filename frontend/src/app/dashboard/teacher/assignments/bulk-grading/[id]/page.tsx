'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GradingStats from '../components/GradingStats';
import GradingToolbar from '../components/GradingToolbar';
import StudentGradingTable from '../components/StudentGradingTable';
import Breadcrumbs from '../../preview/components/Breadcrumbs';
import { AssignmentInfo, AssignmentStats, StudentSubmission } from '../components/types';


// Mock data
const mockUser = {
  name: 'Dr. Eleanor Vance',
  role: 'History Teacher',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpf4HDvBgHpDQLPJUjVxjwkQx089-fmcf3L57rt3cE4HJ2P_aHbm-FGSYrFDiz0seyCV59LsuzPM-Oyd6Y-ud2yeGxy4PZgcocXtZ83i_vEhMp-NWmBLc2SWNHi2XmSajr_CuILx553bDt9uKb-zccFi3QrM0lzTuXg8KtS4F0TJQTzNf4aZY0bnG9EkgaCuPCoNuvhQzRE_QsVtF-_gakEXRDLz4UrcpLUJ8RkyxDZppNnI707L7olNPb3D-lOZ3_tYboJ1wIw2Q'
};

const mockAssignment: AssignmentInfo = {
  id: 'asgn123',
  title: 'Unit 5: Historical Essay',
  dueDate: 'Oct 26, 2024, 11:59 PM',
  maxScore: 100,
  subject: 'History',
  description: 'Essay on historical significance of chosen event'
};

const mockSubmissions: StudentSubmission[] = [
  {
    id: 'sub1',
    studentId: '12345',
    name: 'Alex Johnson',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBabJ4l9re0OXFEzJ2hQlksNi2CxHEGgpHrKIUf1ZoH162IlaVT2SadX4cHto8TMsfBCj_UzmJHDXcXZtnYfWpVqxdwfBEBt3IMox_rbjN8m1nFGBIeZcEie2jI4NMNJFwXryoqNug2JsjxocANyhvcgvJfPXkjNpfW0w7AOCw5jNtLasVhOJPJ9lpDB4US-6sxpe3g5i-d1-9XWXnfLanKC7x-uAV-Mg9CbfLrqKPdx9iDZzgqJBQJ-PVqFqQttIR8cDzhIKNiZMk',
    submittedAt: '2024-10-25',
    fileUrl: '/submissions/alex-johnson-essay.pdf',
    status: 'graded',
    score: 92,
    maxScore: 100
  },
  {
    id: 'sub2',
    studentId: '12346',
    name: 'Maria Garcia',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcS7QtBG4AZCLF0W6rdV_UVjoO5IVFn_Kc0zhWumGh8_QlbI9dT6zcttED3pzEYkC8WdLj3zSsRoVuIUTkqT9y1qwZQDFX1LxTR54NWuamQ-6LuLC8kFFhQ0AX0QNnCHRoDLyr_RNsA1KSvCS-t43VId3rRz2RYS9NeRQ6AX4nIegk4d6ZBLcR1XY0IL5KA9TqbqWYBCCwfDfhpy88vhFSGX4icBmd8xscY51h5mNvwC4R6XnaF19yWLVeJ3__nZ3NAkOcjiqtBcM',
    submittedAt: '2024-10-26',
    fileUrl: '/submissions/maria-garcia-essay.pdf',
    status: 'ungraded',
    score: null,
    maxScore: 100
  },
  {
    id: 'sub3',
    studentId: '12347',
    name: 'James Smith',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYSNejfRZ0_ot_YCEbw2d1m7WY8oeDfILMnFt_Sh0hcpwrgXjA-HkoXNtMFm5PuiX99Nq3Ywy0GvaQyvRk5TDV1kpzEMuXTnw-iv1k-DXjIcgHJQASMIeE7QSabuBpdt75ka8GSD5V5dGDMJOv-ev2P8u4IUMLbIN2EpHcSZKgeIS2JwDij4gUCTyUeVThhdaxsp-6zbkrU9LO690xLp_vSa-6Av5XeS0JBrFqvUYPEpCdI6bauU-VvN9v6RUJa2IJkg3HI4MFo7w',
    submittedAt: '2024-10-27',
    fileUrl: '/submissions/james-smith-essay.pdf',
    status: 'late',
    score: null,
    maxScore: 100
  },
  {
    id: 'sub4',
    studentId: '12348',
    name: 'Emily White',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj-68Ex1AnOs7bSkP_A3XtvbzkvTa9R0RN0Tw96HKCBxPL-RVyUjEbD2_YwWhMAkIS0AXR1W4mbJR8bppIxTupjy88Mo1BtNpivv1x6UT9gkpn8zFjQ5BoCIpvLIBfB4NUhuc55xKp0i8i3i299y2ztLWuhtq03xNdfgN9_u67EsB0b-BOZMcajfPJvAFAEbYEAFrnMl4jQsQ2yHcDn8YjzKjvmM5MeF1wwK4hjZ2XbDDPfEQxwohY4pJWwhhuZGmiFa_XBwQVuqo',
    submittedAt: null,
    fileUrl: null,
    status: 'not-submitted',
    score: 0,
    maxScore: 100
  }
];

const mockStats: AssignmentStats = {
  totalStudents: 25,
  graded: 15,
  ungraded: 10,
  averageScore: 88.5
};

export default function BulkGradingPage() {
  const params = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [stats, setStats] = useState<AssignmentStats>(mockStats);
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In real app, fetch from API
        // const response = await fetch(`/api/assignments/${params.id}/grade-all`);
        // const data = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setAssignment(mockAssignment);
        setSubmissions(mockSubmissions);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleScoreChange = useCallback((submissionId: string, score: number) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, score, status: 'graded' as const }
        : sub
    ));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Filter only changed submissions
      const changedSubmissions = submissions.filter(sub => 
        sub.score !== null && sub.status === 'graded'
      );

      if (changedSubmissions.length === 0) {
        alert('No grades to save. Please enter scores for ungraded submissions.');
        setIsSaving(false);
        return;
      }

      const response = await fetch(`/api/assignments/${params.id}/grade-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissions: changedSubmissions.map(sub => ({
            id: sub.id,
            score: sub.score,
            feedback: sub.feedback || '',
            allowResubmission: sub.allowResubmission || false,
            notifyParent: sub.notifyParent || false
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save grades');
      }

      // Update stats
      const gradedCount = submissions.filter(sub => sub.score !== null).length;
      const avgScore = submissions
        .filter(sub => sub.score !== null)
        .reduce((sum, sub) => sum + (sub.score || 0), 0) / gradedCount;

      setStats(prev => ({
        ...prev,
        graded: gradedCount,
        ungraded: submissions.length - gradedCount,
        averageScore: avgScore
      }));

      alert(`Successfully saved ${changedSubmissions.length} grades!`);
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Failed to save grades. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportGrades = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissions }),
      });

      if (!response.ok) {
        throw new Error('Failed to export grades');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades-assignment-${assignment?.title}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting grades:', error);
      alert('Failed to export grades. Please try again.');
    }
  };

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/assignments/${params.id}/grade/${submissionId}`);
  };

  const handleDownloadFile = (submissionId: string) => {
    const submission = submissions.find(sub => sub.id === submissionId);
    if (submission?.fileUrl) {
      console.log('Downloading file:', submission.fileUrl);
      // Implement actual file download
    }
  };

  const filteredSubmissions = searchQuery
    ? submissions.filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.studentId.includes(searchQuery)
      )
    : submissions;

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Assignments', href: '/assignments' },
    { label: assignment?.title || 'Loading...', href: `/assignments/${params.id}` },
    { label: 'Grade All' }
  ];

  if (isLoading) {
    return (
    
        <div className="flex h-[60vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (!assignment) {
    return (
      
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">
            error
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Assignment Not Found
          </h2>
          <button
            onClick={() => router.push('/assignments')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            Back to Assignments
          </button>
        </div>
    
    );
  }

  return (
  
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Heading */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Grade: {assignment.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Due: {assignment.dueDate} • {assignment.maxScore} Points Possible • {assignment.subject}
            </p>
          </div>
        </div>

        {/* Stats */}
        <GradingStats stats={stats} />

        {/* Main Grading Interface */}
        <div className="mt-6">
          <GradingToolbar
            onSearch={handleSearch}
            onSaveAll={handleSaveAll}
            onExportGrades={handleExportGrades}
            isLoading={isSaving}
          />

          <StudentGradingTable
            submissions={filteredSubmissions}
            onScoreChange={handleScoreChange}
            onViewSubmission={handleViewSubmission}
            onDownloadFile={handleDownloadFile}
          />
        </div>

        {/* Bulk Actions Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.push(`/assignments/${params.id}`)}
            className="rounded-xl border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Assignment
          </button>
          
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save All Grades'
            )}
          </button>
        </div>
      </div>
   
  );
}