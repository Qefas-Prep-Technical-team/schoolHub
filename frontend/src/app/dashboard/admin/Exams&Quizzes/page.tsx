import AssessmentGrid from "./components/AssessmentGrid";
import Header from "./components/Header";
import SearchFilters from "./components/SearchFilters";
import StatsCards from "./components/StatsCards";


const mockAssessments = [
    {
        id: '1',
        title: 'Grade 10 Mathematics Midterm Exam',
        subject: 'Mathematics',
        class: 'Grade 10',
        teacher: 'Mr. Smith',
        type: 'CBT',
        date: 'Oct 25, 2023',
        duration: 'Duration: 90 mins',
        status: 'upcoming' as const,
    },
    {
        id: '2',
        title: 'Literary Analysis Essay',
        subject: 'English',
        class: 'Grade 11',
        teacher: 'Ms. Davis',
        type: 'Assignment',
        date: 'Due: Sep 20, 2023',
        duration: 'Submitted: Sep 19, 2023',
        status: 'graded' as const,
    },
    {
        id: '3',
        title: 'Grade 11 Chemistry Quiz 3',
        subject: 'Chemistry',
        class: 'Grade 11',
        teacher: 'Dr. Lee',
        type: 'CBT',
        date: 'Oct 18, 2023',
        duration: 'Duration: 25 mins',
        status: 'ongoing' as const,
    },
    {
        id: '4',
        title: 'Grade 9 Physics Lab Report',
        subject: 'Physics',
        class: 'Grade 9',
        teacher: 'Ms. Jones',
        type: 'Assignment',
        date: 'Due: Nov 1, 2023',
        duration: 'Awaiting Submission',
        status: 'marking' as const,
    },
    {
        id: '5',
        title: 'Grade 12 Biology Final Exam',
        subject: 'Biology',
        class: 'Grade 12',
        teacher: 'Mr. Khan',
        type: 'Written',
        date: 'Nov 05, 2023',
        duration: 'Duration: 120 mins',
        status: 'completed' as const,
    },
    {
        id: '6',
        title: 'History Pop Quiz',
        subject: 'History',
        class: 'Grade 10',
        teacher: 'Mrs. Chen',
        type: 'CBT',
        date: 'Oct 17, 2023',
        duration: 'Duration: 15 mins',
        status: 'draft' as const,
    },
];

export default function Dashboard() {
    return (

        <main className="w-full max-w-7xl mx-auto">
            <Header />
            <StatsCards />
            <SearchFilters />
            <AssessmentGrid assessments={mockAssessments} />
        </main>

    );
}