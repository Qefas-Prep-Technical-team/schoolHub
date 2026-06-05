/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssignmentFormData, Attachment } from './components/types';
import AssignmentDetails from './components/AssignmentDetails';
import Attachments from './components/Attachments';
import DueDateScheduling from './components/DueDateScheduling';
import Settings from './components/Settings';
import SubmitBar from './components/SubmitBar';
import { useCreateAssignment } from '@/lib/api/hooks/useAssignments';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useSchoolSubjects } from '@/lib/api/hooks/useSchool';
import { useTeacherClasses, useTeacherSubjects } from '@/lib/api/hooks/useTeacher';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { toast } from 'react-toastify';

export default function CreateAssignmentPage() {
    const router = useRouter();
    const { selectedSchoolId } = useDashboardStore();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    
    const isAdmin = user?.role === 'ADMIN';
    const isTeacher = user?.role === 'TEACHER';

    const { mutateAsync: createAssignment } = useCreateAssignment(selectedSchoolId || '', isAdmin);

    // Fetch available data for Admin
    const { data: adminClassesData, isLoading: isAdminClassesLoading } = useClasses(isAdmin ? selectedSchoolId || '' : undefined);
    const { data: adminSubjectsData, isLoading: isAdminSubjectsLoading } = useSchoolSubjects(isAdmin ? selectedSchoolId || '' : '');

    // Fetch available data for Teacher
    const { data: teacherClassesData, isLoading: isTeacherClassesLoading } = useTeacherClasses(isTeacher ? selectedSchoolId || '' : undefined);
    const { data: teacherSubjectsData, isLoading: isTeacherSubjectsLoading } = useTeacherSubjects(isTeacher ? selectedSchoolId || '' : undefined);

    const isClassesLoading = isAdmin ? isAdminClassesLoading : isTeacherClassesLoading;
    const isSubjectsLoading = isAdmin ? isAdminSubjectsLoading : isTeacherSubjectsLoading;

    const classesData = isAdmin ? adminClassesData : teacherClassesData;
    const subjectsData = isAdmin ? adminSubjectsData : teacherSubjectsData;

    const availableClasses = Array.isArray(classesData) ? classesData : (classesData?.data || classesData?.classes || []);
    const availableSubjects = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.data || subjectsData?.subjects || []);

    // Form state
    const [formData, setFormData] = useState<AssignmentFormData>({
        title: '',
        subject: '',
        classes: [],
        instructions: '',
        attachments: [],
        dueDate: '',
        publishStatus: 'draft',
        allowLateSubmissions: true,
        maxScore: 100,
        scheduledDate: ''
    });

    // Update form field
    const updateFormField = <K extends keyof AssignmentFormData>(
        field: K,
        value: AssignmentFormData[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (action: 'draft' | 'publish') => {
        setIsLoading(true);

        try {
            // Validate form
            if (action === 'publish' && !formData.title.trim()) {
                alert('Please enter a title for the assignment');
                setIsLoading(false);
                return;
            }

            // Prepare submission data
            const submissionData = {
                ...formData,
                status: action === 'draft' ? 'draft' : formData.publishStatus,
                publishNow: action === 'publish' && formData.publishStatus === 'publish-now',
                scheduledFor: formData.publishStatus === 'schedule-later' ? formData.scheduledDate : null
            };

            // In a real app, you would upload files first
            const uploadedAttachments = await uploadFiles(formData.attachments as any);

            // Submit to API using hook
            const result = await createAssignment({
                title: submissionData.title,
                classIds: submissionData.classes.map(c => c.id),
                subjectId: submissionData.subject || "1", // Fallback subject ID for now if empty
                instructions: submissionData.instructions,
                dueDate: submissionData.dueDate || undefined,
                maxScore: submissionData.maxScore,
                status: submissionData.status,
                attachments: uploadedAttachments
            });

            toast.success("Assignment created successfully!");
            // Redirect to assignments page
            router.push(`/dashboard/admin/assignments`);

        } catch (error) {
            console.error('Error creating assignment:', error);
            alert('Failed to create assignment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Mock file upload function
    const uploadFiles = async (attachments: Attachment[]): Promise<string[]> => {
        // In a real app, you would upload files to a storage service
        return attachments.map(att => `https://example.com/uploads/${att.name}`);
    };

    // Handle cancel
    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.back();
        }
    };



    const shouldShowLoading = selectedSchoolId && (isClassesLoading || isSubjectsLoading);

    if (shouldShowLoading) {
        return (
            <main className="max-w-4xl mx-auto pb-16 space-y-8 animate-pulse">
                <div className="flex flex-wrap justify-between gap-3 mb-8">
                    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                </div>
                <div className="space-y-6">
                    <div className="h-[400px] w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto pb-16 space-y-8">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between gap-3 mb-8">
                <h1 className="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Create New Assignment
                </h1>
            </div>

            <div className="space-y-6">
                {/* Assignment Details */}
                <AssignmentDetails
                    title={formData.title}
                    onTitleChange={(title) => updateFormField('title', title)}
                    subject={formData.subject}
                    onSubjectChange={(subject) => updateFormField('subject', subject)}
                    classes={formData.classes}
                    onClassesChange={(classes) => updateFormField('classes', classes)}
                    instructions={formData.instructions}
                    onInstructionsChange={(instructions) => updateFormField('instructions', instructions)}
                    availableSubjects={availableSubjects}
                    availableClasses={availableClasses}
                />

                {/* Attachments */}
                <Attachments
                    attachments={formData.attachments}
                    onAttachmentsChange={(attachments) => updateFormField('attachments', attachments as any)}
                />

                {/* Due Date & Scheduling */}
                <DueDateScheduling
                    dueDate={formData.dueDate}
                    onDueDateChange={(date) => updateFormField('dueDate', date)}
                    publishStatus={formData.publishStatus}
                    onPublishStatusChange={(status) => updateFormField('publishStatus', status)}
                    scheduledDate={formData.scheduledDate}
                    onScheduledDateChange={(date) => updateFormField('scheduledDate', date)}
                />

                {/* Settings */}
                <Settings
                    allowLateSubmissions={formData.allowLateSubmissions}
                    onAllowLateSubmissionsChange={(allow) => updateFormField('allowLateSubmissions', allow)}
                    maxScore={formData.maxScore}
                    onMaxScoreChange={(score) => updateFormField('maxScore', score)}
                />
            </div>
            <SubmitBar
                onCancel={handleCancel}
                onSaveDraft={() => handleSubmit('draft')}
                onPublish={() => handleSubmit('publish')}
                isLoading={isLoading}
                publishStatus={formData.publishStatus}
            />
        </main>
    );
}
