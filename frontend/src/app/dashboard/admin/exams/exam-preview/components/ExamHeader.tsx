import Badge from './ui/Badge';

interface ExamHeaderProps {
    exam: {
        title: string;
        subject: string;
        className: string;
        duration: number;
        totalMarks: number;
        status: 'draft' | 'published' | 'scheduled';
        type: 'cbt' | 'written';
        assignedTeacher: string;
    };
}

export default function ExamHeader({ exam }: ExamHeaderProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return { bg: 'bg-[#f39c12]/20', text: 'text-[#f39c12]' };
            case 'published':
                return { bg: 'bg-green-500/20', text: 'text-green-500' };
            case 'scheduled':
                return { bg: 'bg-blue-500/20', text: 'text-blue-500' };
            default:
                return { bg: 'bg-gray-200', text: 'text-gray-800' };
        }
    };

    const statusColor = getStatusColor(exam.status);

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap items-center gap-3">
                <Badge className={`${statusColor.bg} ${statusColor.text}`}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                </Badge>
                <Badge variant="secondary">
                    {exam.type.toUpperCase()}
                </Badge>
                <Badge variant="secondary">
                    Assigned: {exam.assignedTeacher}
                </Badge>
            </div>

            <div className="flex min-w-72 flex-col gap-2">
                <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    {exam.title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                    Subject: {exam.subject} | Class: {exam.className} | Duration: {exam.duration} mins | Total Marks: {exam.totalMarks}
                </p>
            </div>
        </div>
    );
}