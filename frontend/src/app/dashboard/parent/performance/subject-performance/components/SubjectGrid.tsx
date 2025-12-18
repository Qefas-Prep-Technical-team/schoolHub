'use client';

import { useState, useMemo } from 'react';
import {
    Calculator,
    Beaker,
    BookOpen,
    Palette,
    History,
    Dumbbell,
} from 'lucide-react';
import SubjectCard from './SubjectCard';

const initialSubjects = [
    {
        id: '1',
        name: 'Mathematics',
        teacher: 'Mr. Anderson',
        score: 98,
        grade: 'A+',
        gradeColor: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 ring-green-600/20',
        icon: Calculator,
        iconColor: 'text-primary',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        progressColor: 'bg-primary',
        classAverage: 85,
        comment: 'Alex demonstrates exceptional understanding of algebraic concepts. Consistently participates in class discussions.',
    },
    {
        id: '2',
        name: 'Science',
        teacher: 'Mrs. Robinson',
        score: 72,
        grade: 'C-',
        gradeColor: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 ring-orange-600/20',
        icon: Beaker,
        iconColor: 'text-orange-600 dark:text-orange-400',
        iconBg: 'bg-orange-50 dark:bg-orange-900/20',
        progressColor: 'bg-orange-500',
        classAverage: 78,
        comment: 'Needs to focus more on lab reports and submitting homework on time. Great potential in biology section.',
        needsAttention: true,
    },
    {
        id: '3',
        name: 'World History',
        teacher: 'Mr. Clark',
        score: 88,
        grade: 'B+',
        gradeColor: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-blue-700/10',
        icon: History,
        iconColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        progressColor: 'bg-primary',
        classAverage: 82,
        comment: 'Excellent essay on the Industrial Revolution. Keep up the good work on primary source analysis.',
    },
    {
        id: '4',
        name: 'English Lit',
        teacher: 'Ms. Johnson',
        score: 91,
        grade: 'A-',
        gradeColor: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 ring-green-600/20',
        icon: BookOpen,
        iconColor: 'text-pink-600 dark:text-pink-400',
        iconBg: 'bg-pink-50 dark:bg-pink-900/20',
        progressColor: 'bg-primary',
        classAverage: 88,
        comment: 'Participates well. Reading comprehension has improved significantly this term.',
    },
    {
        id: '5',
        name: 'Visual Arts',
        teacher: 'Mr. Banks',
        score: 95,
        grade: 'A',
        gradeColor: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 ring-green-600/20',
        icon: Palette,
        iconColor: 'text-teal-600 dark:text-teal-400',
        iconBg: 'bg-teal-50 dark:bg-teal-900/20',
        progressColor: 'bg-primary',
        classAverage: 92,
        comment: 'Very creative portfolio. Shows great attention to detail in the watercolor unit.',
    },
    {
        id: '6',
        name: 'Physical Ed.',
        teacher: 'Coach Carter',
        score: 85,
        grade: 'B',
        gradeColor: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-blue-700/10',
        icon: Dumbbell,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',
        progressColor: 'bg-primary',
        classAverage: 88,
        comment: 'Good team player. Needs to remember gym kit on Mondays.',
    },
];

interface SubjectGridProps {
    searchQuery?: string;
    filters?: {
        term: string;
        assessmentType: string;
    };
}

export default function SubjectGrid({ searchQuery = '', filters }: SubjectGridProps) {
    const [subjects] = useState(initialSubjects);

    const filteredSubjects = useMemo(() => {
        return subjects.filter(subject => {
            const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                subject.teacher.toLowerCase().includes(searchQuery.toLowerCase());

            // Add filter logic based on term and assessment type
            if (filters?.term && filters.term !== 'All Terms') {
                // Implement term filtering logic
            }

            if (filters?.assessmentType && filters.assessmentType !== 'All Assessments') {
                // Implement assessment type filtering logic
            }

            return matchesSearch;
        });
    }, [subjects, searchQuery, filters]);

    const handleSubjectClick = (subjectId: string) => {
        // Navigate to subject detail page or open modal
        console.log('Clicked subject:', subjectId);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
                <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onClick={() => handleSubjectClick(subject.id)}
                />
            ))}
        </div>
    );
}