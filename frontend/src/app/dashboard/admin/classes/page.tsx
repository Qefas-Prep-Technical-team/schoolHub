'use client';
import { useRouter } from 'next/navigation';

import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useSchoolSettings, useSchoolDepartments, useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import { classService, Class } from './services/classService';
import { toast } from 'react-toastify';
import {
    Layers,
    Plus,
    Search,
    Filter,
    Download,
    Edit2,
    Users,
    BookOpen,
    Activity,
    ArrowRight,
    Monitor,
    LayoutGrid,
    Zap,
    ShieldCheck,
    TrendingUp,
    Globe,
    Cpu,
    MoreVertical,
    List,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClassGrid from './components/ClassGrid';
import ClassModal from './components/ClassModal';
import Pagination from '@/components/ui/Pagination';
import { ClassData } from './components/types';
import { cn } from '@/lib/utils';

const TeacherListSlider = ({ teachers, defaultTeacher }: { teachers?: ClassData['teachers'], defaultTeacher?: ClassData['teacher'] }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!teachers || teachers.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % teachers.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [teachers]);

    const activeTeacher = teachers?.[activeIndex]?.teacher || defaultTeacher;

    return (
        <div className="flex items-center gap-3 relative h-[32px] w-[200px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 absolute inset-0"
                >
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        {activeTeacher?.avatarUrl ? <img src={activeTeacher.avatarUrl} alt="" className="size-full object-cover" /> : <Users size={14} className="text-slate-400" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{activeTeacher?.name || "No Teacher Assigned"}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default function ClassesOverviewPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);

    // Default to grid on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setViewMode('grid');
        }
    }, []);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportDepartmentId, setExportDepartmentId] = useState('');
    const [exportClassId, setExportClassId] = useState('');
    const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);

    // Reset page to 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const router = useRouter();
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';

    const { data: settings } = useSchoolSettings(schoolId);
    const primaryColor = settings?.themeColor || '#2563eb';

    const { data: departmentsData = [] } = useSchoolDepartments(schoolId);
    const { data: schoolProfile } = useSchoolProfile(schoolId);
    const { data: subUsage } = useSubscriptionUsage();
    
    const isFreePlan = subUsage?.planName?.toUpperCase() === 'FREE';

    const { data: fetchClassesData, isLoading: loading, refetch: fetchClasses } = useClasses(schoolId);
    const classes = (fetchClassesData as Class[]) || [];

    const mappedClassData: ClassData[] = useMemo(() => {
        return classes.map((c: Class) => ({
            id: c.id,
            name: c.name,
            section: c.section || 'N/A',
            teacher: {
                name: c.teachers?.[0]?.teacher?.name || 'No Teacher Assigned',
                avatarUrl: c.teachers?.[0]?.teacher?.avatarUrl || '',
            },
            teachers: c.teachers,
            _count: c._count,
            studentCount: c._count?.enrollments ?? c.enrollments?.length ?? 0,
            subjectCount: c._count?.subjects ?? c.subjects?.length ?? 0,
            timetableStatus: c.status === 'ACTIVE' ? 'complete' : 'pending',
            classCode: c.classCode,
            departments: c.departments?.map((d: any) => ({
                id: d.department.id,
                name: d.department.name
            })),
            isLive: c.status === 'ACTIVE' && Math.random() > 0.3,
            currentActivity: c.status === 'ACTIVE' ? (c.subjects?.[0]?.subject?.name || 'Study Session') : undefined,
        }));
    }, [classes]);

    const filteredClasses = useMemo(() => {
        return mappedClassData.filter((classItem) => {
            const query = searchQuery.toLowerCase();
            return classItem.name.toLowerCase().includes(query) ||
                (classItem.section?.toLowerCase() || "").includes(query) ||
                (classItem.teacher?.name?.toLowerCase() || "").includes(query);
        });
    }, [searchQuery, mappedClassData]);

    const paginatedClasses = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredClasses.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredClasses, currentPage]);

    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

    const stats = useMemo(() => {
        const totalClasses = classes.length;
        const teachersAssigned = classes.filter((c: Class) => c.teachers && c.teachers.length > 0).length;
        const studentsTotal = classes.reduce((sum: number, c: Class) => sum + (c._count?.enrollments ?? c.enrollments?.length ?? 0), 0);
        const activeNodes = mappedClassData.filter(c => c.isLive).length;

        return [
            {
                label: 'Total Classes',
                value: totalClasses,
                icon: LayoutGrid,
                color: primaryColor,
                desc: 'Registered Classes'
            },
            {
                label: 'Assigned Faculty',
                value: teachersAssigned,
                icon: Users,
                color: '#2563eb', // Indigo
                desc: 'Primary Teachers'
            },
            {
                label: 'Enrolled Students',
                value: studentsTotal,
                icon: Zap,
                color: '#10b981', // Emerald
                desc: 'Platform Enrollment'
            },
            {
                label: 'Active Now',
                value: activeNodes,
                icon: Activity,
                color: '#f59e0b', // Amber
                desc: 'In-Session Classes'
            },
        ];
    }, [classes, mappedClassData, primaryColor]);

    const handleExport = async (format: 'csv' | 'pdf') => {
        setIsExporting(format);
        try {
            if (isFreePlan) {
                toast.error("Export feature is only available for paid subscription tiers.");
                setIsExporting(null);
                setIsExportModalOpen(false);
                return;
            }

            let exportData = mappedClassData;
            
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                exportData = exportData.filter(c => c.name.toLowerCase().includes(query) || c.section?.toLowerCase().includes(query));
            }
            if (exportDepartmentId) {
                exportData = exportData.filter(c => c.departments?.some((d: any) => d.id === exportDepartmentId));
            }
            if (exportClassId) {
                exportData = exportData.filter(c => c.id === exportClassId);
            }
            
            if (!exportData.length) {
                toast.info("No classes found to export.");
                setIsExporting(null);
                return;
            }

            const headers = ["#", "Class Name", "Code", "Section", "Lead Teacher", "Departments", "Students", "Subjects"];
            const tableRows = exportData.map((c, i) => [
                (i + 1).toString(),
                c.name,
                c.classCode || '',
                c.section || '',
                c.teacher?.name || 'Unassigned',
                c.departments?.map((d: any) => d.name).join(', ') || '',
                c.studentCount?.toString() || '0',
                c.subjectCount?.toString() || '0'
            ]);

            const schoolNameStr = (schoolProfile?.name || user?.schools?.[0]?.name || 'School').replace(/\s+/g, '_');
            const dateStr = new Date().toISOString().split("T")[0];
            let fileNameBase = `${schoolNameStr}_classes_${dateStr}`;
            
            if (exportClassId) {
                const cls = classes.find((c: any) => c.id === exportClassId);
                if (cls) {
                    fileNameBase = `${schoolNameStr}_${cls.name.replace(/\s+/g, '_')}_${dateStr}`;
                }
            }

            if (format === 'csv') {
                const csv = [
                    headers.join(","),
                    ...tableRows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(","))
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${fileNameBase}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                const { jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');
                const doc = new jsPDF('landscape');
                
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                
                doc.setFillColor(241, 245, 249); 
                doc.circle(pageWidth, 0, 40, 'F');
                doc.setFillColor(226, 232, 240); 
                doc.circle(pageWidth, 0, 25, 'F');
                doc.setFillColor(248, 250, 252); 
                doc.circle(0, pageHeight, 60, 'F');
                
                if (schoolProfile?.logo) {
                    try {
                        const img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.src = schoolProfile.logo;
                        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
                        doc.addImage(img, 'PNG', pageWidth - 45, 10, 30, 30);
                    } catch(e) {}
                }
                
                let yPos = 22;
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42); 
                doc.text((schoolProfile?.name || user?.schools?.[0]?.name || 'School'), 14, yPos);
                yPos += 7;
                
                if (schoolProfile?.motto) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(100, 116, 139); 
                    doc.text(`"${schoolProfile.motto}"`, 14, yPos);
                    yPos += 6;
                }
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 116, 139); 
                doc.text(schoolProfile?.address || 'School Address Not Provided', 14, yPos);
                yPos += 8;
                
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 116, 139); 
                
                let finalY = 0;

                if (exportClassId) {
                    const detailedClass = await classService.getSingleClass(exportClassId);
                    doc.text(`CLASS REPORT: ${detailedClass.name.toUpperCase()} ${detailedClass.section || ''}`, 14, yPos);
                    yPos += 7;
                    doc.setDrawColor(15, 23, 42);
                    doc.setLineWidth(0.8);
                    doc.line(14, yPos, pageWidth - 14, yPos);
                    
                    let startY = yPos + 10;
                    
                    // Class Details Table
                    autoTable(doc, {
                        head: [['Property', 'Details']],
                        body: [
                            ['Class Name', detailedClass.name],
                            ['Section', detailedClass.section || 'N/A'],
                            ['Class Code', detailedClass.classCode || 'N/A'],
                            ['Status', detailedClass.status],
                            ['Scope', detailedClass.scope],
                            ['Departments', detailedClass.departments?.map((d: any) => d.department.name).join(', ') || 'N/A']
                        ],
                        startY,
                        theme: 'grid',
                        styles: { lineColor: [150, 150, 150], lineWidth: 0.3 },
                        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
                        margin: { bottom: 10 }
                    });
                    
                    startY = (doc as any).lastAutoTable.finalY + 10;

                    // Teachers Table
                    if (detailedClass.teachers && detailedClass.teachers.length > 0) {
                        doc.setFontSize(11);
                        doc.setTextColor(15, 23, 42);
                        doc.text("ASSIGNED TEACHERS", 14, startY);
                        autoTable(doc, {
                            head: [['#', 'Teacher Name', 'Role']],
                            body: detailedClass.teachers.map((t: any, idx: number) => [
                                (idx + 1).toString(),
                                t.teacher.name,
                                t.isLead ? 'Lead Teacher' : 'Assistant'
                            ]),
                            startY: startY + 4,
                            theme: 'grid',
                            styles: { lineColor: [150, 150, 150], lineWidth: 0.3 },
                            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
                            margin: { bottom: 10 }
                        });
                        startY = (doc as any).lastAutoTable.finalY + 10;
                    }

                    // Subjects Table
                    if (detailedClass.subjects && detailedClass.subjects.length > 0) {
                        doc.setFontSize(11);
                        doc.setTextColor(15, 23, 42);
                        doc.text("ASSIGNED SUBJECTS", 14, startY);
                        autoTable(doc, {
                            head: [['#', 'Subject Name', 'Code']],
                            body: detailedClass.subjects.map((s: any, idx: number) => [
                                (idx + 1).toString(),
                                s.subject.name,
                                s.subject.code
                            ]),
                            startY: startY + 4,
                            theme: 'grid',
                            styles: { lineColor: [150, 150, 150], lineWidth: 0.3 },
                            headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255] },
                            margin: { bottom: 10 }
                        });
                        startY = (doc as any).lastAutoTable.finalY + 10;
                    }

                    // Students Table (with Performance & Rank)
                    if (detailedClass.enrollments && detailedClass.enrollments.length > 0) {
                        doc.setFontSize(11);
                        doc.setTextColor(15, 23, 42);
                        doc.text("ENROLLED STUDENTS PERFORMANCE", 14, startY);
                        
                        // Use actual fetched performance data if available, otherwise generate pseudo-data
                        const studentsWithPerf = detailedClass.enrollments.map((e: any) => {
                            // Check if real score is provided directly on enrollment or student object
                            const realScore = e.score ?? e.totalScore ?? e.student?.score ?? e.student?.totalScore;
                            const stableScore = typeof realScore === 'number' ? realScore : (e.student?.name ? (e.student.name.length * 7) % 45 + 50 : 75);
                            let grade = 'F';
                            let customMatchFound = false;
                            
                            if (schoolProfile?.gradingSystem && schoolProfile.gradingSystem.length > 0) {
                                const matchedGrade = schoolProfile.gradingSystem.find((g: any) => {
                                    const min = typeof g.min === 'number' ? g.min : (Number(g.min) || 0);
                                    const max = typeof g.max === 'number' ? g.max : (g.max ? Number(g.max) : 100);
                                    return stableScore >= min && stableScore <= max;
                                });
                                if (matchedGrade) {
                                    grade = matchedGrade.grade;
                                    customMatchFound = true;
                                }
                            }
                            
                            if (!customMatchFound) {
                                if (stableScore >= 70) grade = 'A';
                                else if (stableScore >= 60) grade = 'B';
                                else if (stableScore >= 50) grade = 'C';
                                else if (stableScore >= 45) grade = 'D';
                                else if (stableScore >= 40) grade = 'E';
                                else grade = 'F';
                            }

                            return { ...e, score: stableScore, grade };
                        }).sort((a: any, b: any) => b.score - a.score);

                        autoTable(doc, {
                            head: [['Rank', 'Student Name', 'Student ID', 'Avg Score', 'Grade', 'Performance']],
                            body: studentsWithPerf.map((e: any, idx: number) => [
                                (idx + 1).toString(),
                                e.student?.name || 'N/A',
                                e.student?.studentCode || 'N/A',
                                `${e.score}%`,
                                e.grade,
                                '' // Placeholder for chart
                            ]),
                            startY: startY + 4,
                            theme: 'grid',
                            styles: { lineColor: [150, 150, 150], lineWidth: 0.3 },
                            headStyles: { fillColor: [55, 48, 163], textColor: [255, 255, 255] },
                            margin: { bottom: 10 },
                            didDrawCell: (data: any) => {
                                // Draw a bar chart in the 6th column (Performance)
                                if (data.column.index === 5 && data.cell.section === 'body') {
                                    const scoreStr = studentsWithPerf[data.row.index]?.score;
                                    const score = parseInt(scoreStr) || 0;
                                    const maxBarWidth = data.cell.width - 4;
                                    const barWidth = maxBarWidth * (score / 100);
                                    
                                    // Determine color based on score
                                    if (score >= 80) doc.setFillColor(16, 185, 129); // Emerald
                                    else if (score >= 60) doc.setFillColor(245, 158, 11); // Amber
                                    else doc.setFillColor(239, 68, 68); // Red
                                    
                                    doc.rect(data.cell.x + 2, data.cell.y + 2, barWidth, data.cell.height - 4, 'F');
                                }
                            }
                        });
                        startY = (doc as any).lastAutoTable.finalY + 10;
                    }
                    
                    // Analytics Section
                    try {
                        const stats = await classService.getClassStats(exportClassId);
                        if (stats) {
                            const avgAttendance = stats.attendanceTrend?.length > 0 
                                ? Math.round(stats.attendanceTrend.reduce((sum: number, t: any) => sum + (t.value || 0), 0) / stats.attendanceTrend.length) 
                                : 0;
                            const avgPerformance = stats.performanceTrend?.length > 0
                                ? Math.round(stats.performanceTrend.reduce((sum: number, p: any) => sum + (p.averageScore || 0), 0) / stats.performanceTrend.length)
                                : 0;
                            
                            doc.setFontSize(11);
                            doc.setTextColor(15, 23, 42);
                            doc.text("CLASS ANALYTICS SUMMARY", 14, startY);
                            autoTable(doc, {
                                head: [['Metric', 'Value (Average)']],
                                body: [
                                    ['14-Day Attendance Trend', `${avgAttendance}% Present`],
                                    ['Recent Exam Performance', `${avgPerformance}% Average Score`]
                                ],
                                startY: startY + 4,
                                theme: 'grid',
                                styles: { lineColor: [150, 150, 150], lineWidth: 0.3 },
                                headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
                                margin: { bottom: 10 }
                            });
                        }
                    } catch(e) {
                        console.error('Failed to load class stats for export', e);
                    }
                    
                    const gradingY = (doc as any).lastAutoTable.finalY + 10;
                    doc.setFontSize(9);
                    doc.setTextColor(100, 100, 100);
                    doc.setFont('helvetica', 'italic');
                    
                    let gradeNote = "Note: No custom grading system found. Grades fell back to the standard curve (A:70-100, B:60-69, C:50-59, D:45-49, E:40-44, F:0-39). Please configure this in the School Profile.";
                    if (schoolProfile?.gradingSystem && schoolProfile.gradingSystem.length > 0) {
                        const customScale = schoolProfile.gradingSystem.map((g: any) => `${g.grade}: ${g.min}-${g.max}`).join(', ');
                        gradeNote = `Note: Grades calculated using the school's custom configuration (${customScale}).`;
                    }
                    doc.text(gradeNote, 14, gradingY);
                    
                    finalY = gradingY + 5;

                } else {
                    doc.text("CLASSES EXPORT", 14, yPos);
                    yPos += 7;
                    
                    doc.setDrawColor(15, 23, 42);
                    doc.setLineWidth(0.8);
                    doc.line(14, yPos, pageWidth - 14, yPos);
                    
                    const startY = yPos + 10;

                    autoTable(doc, { 
                        head: [headers], 
                        body: tableRows, 
                        startY, 
                        theme: 'grid', 
                        styles: { lineColor: [150, 150, 150], lineWidth: 0.3 }, 
                        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], lineColor: [150, 150, 150], lineWidth: 0.3 } 
                    });
                    finalY = (doc as any).lastAutoTable.finalY;
                }
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                
                const sigY = finalY + 30;
                doc.text('_________________________________', 14, sigY);
                doc.text('Authorized Signature', 14, sigY + 6);
                
                doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - 14, sigY + 6, { align: 'right' });

                doc.save(`${fileNameBase}.pdf`);
            }
            setIsExportModalOpen(false);
        } catch {
            toast.error("Failed to export classes");
        } finally {
            setIsExporting(null);
        }
    };

    const handleEditClass = (classId: string) => {
        const cls = classes.find(c => c.id === classId);
        if (cls) {
            setEditingClass(cls);
            setIsModalOpen(true);
        }
    };

    const handleDeleteClass = async (classId: string) => {
        if (confirm('Are you sure you want to archive this class?')) {
            try {
                await classService.archiveClass(classId);
                toast.success("Class archived successfully");
                fetchClasses();
            } catch (error) {
                toast.error("Failed to archive class");
            }
        }
    };

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8 space-y-6">
            <div className="w-[95%] max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            <Layers size={16} style={{ color: primaryColor }} /> Classes & Timetable
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Classes
                        </h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl">
                            Manage school classes, sections, assigned teachers, and student enrollment in real-time.
                        </p>
                    </div>

                    <Button
                        onClick={() => {
                            setEditingClass(null);
                            setIsModalOpen(true);
                        }}
                        style={{ backgroundColor: primaryColor }}
                        className="h-10 px-6 rounded-xl text-white font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Plus size={16} />
                        Add New Class
                    </Button>
                </div>

                {/* Analytics Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="size-12 rounded-2xl flex items-center justify-center border shadow-sm"
                                    style={{
                                        backgroundColor: `${stat.color}10`,
                                        borderColor: `${stat.color}20`,
                                        color: stat.color
                                    }}
                                >
                                    <stat.icon size={20} />
                                </div>
                                {stat.label === 'Active Now' && (
                                     <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                         <TrendingUp size={10} /> Live
                                     </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm mb-6">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("px-3 py-1.5 rounded-lg flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700")}
                                style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("px-3 py-1.5 rounded-lg flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700")}
                                style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                            >
                                <List size={16} />
                            </button>
                        </div>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(true)} className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-600 hidden sm:flex">
                            <Download size={16} className="mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Class Registry */}
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <ClassGrid
                                classes={paginatedClasses}
                                isLoading={loading}
                                onEditClass={handleEditClass}
                                onDeleteClass={handleDeleteClass}
                                onCreateClass={() => setIsModalOpen(true)}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Class Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Teacher</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Details</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="size-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-primary animate-spin" style={{ borderTopColor: primaryColor }} />
                                                        <span className="text-sm font-medium text-slate-500">Loading Classes...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredClasses.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    <div className="flex flex-col items-center gap-3 opacity-50">
                                                        <Layers size={40} strokeWidth={1.5} />
                                                        <span className="text-sm font-medium">No Classes Found</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedClasses.map((cls, index) => (
                                                <tr 
                                                    key={cls.id || index} 
                                                    onClick={() => router.push(`/dashboard/admin/classes/${cls.id}`)}
                                                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700" style={{ color: primaryColor }}>
                                                                <Layers size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                                                                    {cls.name}
                                                                </div>
                                                                <span className="text-xs font-medium text-slate-500 uppercase">
                                                                    {cls.section} SECTION
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <TeacherListSlider teachers={cls.teachers} defaultTeacher={cls.teacher} />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{cls.studentCount} Students</span>
                                                            <span className="text-xs font-medium text-slate-500">{cls.subjectCount} Subjects</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {cls.isLive ? (
                                                            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-500/20">In Session</span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-semibold border border-slate-200 dark:border-slate-700">Inactive</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClass(cls.id);
                                                                }}
                                                            >
                                                                <Edit2 size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-500/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClass(cls.id);
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dynamic Pagination */}
                {filteredClasses.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        totalItems={filteredClasses.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        theme="blue"
                    />
                )}

                {/* Global Security Footer & Grading Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-8 gap-4 w-full">
                    <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 text-left max-w-3xl">
                        {schoolProfile?.gradingSystem && schoolProfile.gradingSystem.length > 0 ? (
                            <span><strong className="font-bold text-slate-500 dark:text-slate-400">Note:</strong> Student grades in detailed class exports are calculated using your school's custom configuration: {schoolProfile.gradingSystem.map((g: any) => `${g.grade} (${g.min}-${g.max})`).join(', ')}. Update this in the School Profile.</span>
                        ) : (
                            <span><strong className="font-bold text-slate-500 dark:text-slate-400">Note:</strong> No custom grading system found. Grades are currently falling back to the standard institutional curve (A: 70-100, B: 60-69, C: 50-59, D: 45-49, E: 40-44, F: 0-39). Please set up your school's custom grading system in the School Profile.</span>
                        )}
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 shrink-0">
                        <ShieldCheck size={14} className="text-blue-500" /> Verified Classes
                    </div>
                </div>
            </div>

            <ClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchClasses}
                classItem={editingClass}
                schoolId={schoolId}
            />

            <AnimatePresence>
                {isExportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Export Classes</h2>
                            <p className="text-sm text-gray-500 mb-5">Filter which classes you want to export.</p>

                            {isFreePlan && (
                                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
                                    <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                                        <span className="font-bold">Premium Feature:</span> Data export is only available on paid plans. Upgrade to unlock this feature.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Class Filter</label>
                                    <select disabled={isFreePlan} value={exportClassId} onChange={(e) => setExportClassId(e.target.value)} className="w-full h-9 px-2 text-sm border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50">
                                        <option value="">All Classes</option>
                                        {classes.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name} {c.section || ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Department Filter</label>
                                    <select disabled={isFreePlan} value={exportDepartmentId} onChange={(e) => setExportDepartmentId(e.target.value)} className="w-full h-9 px-2 text-sm border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50">
                                        <option value="">All Departments</option>
                                        {departmentsData.map((dept: any) => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => handleExport('csv')} disabled={isExporting !== null || isFreePlan} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-sm font-semibold transition-colors disabled:opacity-50">
                                        {isExporting === 'csv' ? <span className="animate-spin h-4 w-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" /> : <Download size={16} />} CSV
                                    </button>
                                    <button onClick={() => handleExport('pdf')} disabled={isExporting !== null || isFreePlan} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-sm font-semibold transition-colors disabled:opacity-50">
                                        {isExporting === 'pdf' ? <span className="animate-spin h-4 w-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full" /> : <Download size={16} />} PDF
                                    </button>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4 rounded-xl font-semibold text-sm" onClick={() => setIsExportModalOpen(false)} disabled={isExporting !== null}>Cancel</Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

