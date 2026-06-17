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
import { useTeacherClasses, useTeacherSubjects } from '@/lib/api/hooks/useTeacher';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api/client';
import { imageService } from '@/lib/api/services/imageService';

export default function CreateAssignmentPage() {
    const router = useRouter();
    const { selectedSchoolId } = useDashboardStore();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    
    const effectiveSchoolId = selectedSchoolId || user?.schools?.[0]?.schoolId || '';

    // Fetch classes and subjects assigned to the teacher
    const { data: classesData, isLoading: isClassesLoading } = useTeacherClasses(effectiveSchoolId);
    const { data: subjectsData, isLoading: isSubjectsLoading } = useTeacherSubjects(effectiveSchoolId);

    const availableClasses = Array.isArray(classesData) ? classesData : (classesData?.data || classesData?.classes || []);
    const availableSubjects = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.data || subjectsData?.subjects || []);

    // We pass `false` for isAdmin since this is the teacher version
    const { mutateAsync: createAssignment } = useCreateAssignment(effectiveSchoolId, false);

    // Form state
    const [formData, setFormData] = useState<AssignmentFormData>({
        title: '',
        subject: '',
        classes: [],
        instructions: '',
        attachments: [],
        dueDate: '',
        publishStatus: 'publish-now',
        allowLateSubmissions: true,
        maxScore: 100,
        scheduledDate: '',
        scoreReleaseDate: ''
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
            if (!formData.title.trim()) {
                toast.error('Please enter a title for the assignment');
                setIsLoading(false);
                return;
            }

            if (formData.classes.length === 0) {
                toast.error('Please select at least one class');
                setIsLoading(false);
                return;
            }

            if (!formData.subject) {
                toast.error('Please select a subject');
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
                subjectId: submissionData.subject,
                instructions: submissionData.instructions,
                dueDate: submissionData.dueDate || undefined,
                maxScore: submissionData.maxScore,
                status: submissionData.status,
                attachments: uploadedAttachments,
                videoUrl: submissionData.videoUrl || undefined,
                referenceUrl: submissionData.referenceUrl || undefined,
                scoreReleaseDate: submissionData.scoreReleaseDate || undefined
            });

            toast.success("Assignment created successfully!");
            // Redirect to assignment details page
            const createdId = Array.isArray(result.data) && result.data.length > 0 
                ? result.data[0].id 
                : (result.data?.id || result.id);
            router.push(`/dashboard/teacher/assignments/${createdId}`);

        } catch (error: any) {
            console.error('Error creating assignment:', error);
            toast.error(error.message || 'Failed to create assignment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Upload files using Bunny.net proxy endpoint
    const uploadFiles = async (attachments: Attachment[]): Promise<string[]> => {
        const uploadedUrls: string[] = [];

        for (const attachment of attachments) {
            // If already uploaded and has url, skip upload
            if (attachment.url) {
                uploadedUrls.push(attachment.url);
                continue;
            }

            // Ensure we have a file object
            if (!attachment.file) {
                console.warn(`Attachment ${attachment.name} missing File object. Skipping.`);
                continue;
            }

            try {
                // Upload directly to Supabase storage and log with the backend
                const { publicUrl } = await imageService.proxyUploadToBunny(attachment.file, effectiveSchoolId);
                
                if (publicUrl) {
                    uploadedUrls.push(publicUrl);
                } else {
                    throw new Error('Upload failed for file');
                }
            } catch (error) {
                console.error(`Failed to upload ${attachment.name}:`, error);
                throw error; // Let the handleSubmit catch it and show alert
            }
        }

        return uploadedUrls;
    };

    // Handle cancel
    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.back();
        }
    };

    const shouldShowLoading = !!effectiveSchoolId && (isClassesLoading || isSubjectsLoading);

    if (shouldShowLoading) {
        return (
            <main className="max-w-4xl mx-auto pb-16 space-y-8 p-4 md:p-0">
                <div className="flex flex-wrap justify-between gap-3 mb-8 animate-pulse">
                    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800/80 rounded-lg"></div>
                </div>
                <div className="space-y-6 animate-pulse">
                    {/* Assignment Details Skeleton */}
                    <div className="h-[400px] w-full bg-slate-100 dark:bg-[#1C1C1E] rounded-xl border border-slate-200 dark:border-[#2D2D2F]"></div>
                    {/* Attachments Skeleton */}
                    <div className="h-32 w-full bg-slate-100 dark:bg-[#1C1C1E] rounded-xl border border-slate-200 dark:border-[#2D2D2F]"></div>
                    {/* Scheduling Skeleton */}
                    <div className="h-64 w-full bg-slate-100 dark:bg-[#1C1C1E] rounded-xl border border-slate-200 dark:border-[#2D2D2F]"></div>
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
                    videoUrl={formData.videoUrl}
                    onVideoUrlChange={(videoUrl) => updateFormField('videoUrl', videoUrl)}
                    referenceUrl={formData.referenceUrl}
                    onReferenceUrlChange={(referenceUrl) => updateFormField('referenceUrl', referenceUrl)}
                    availableClasses={availableClasses}
                    availableSubjects={availableSubjects}
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
                    scoreReleaseDate={formData.scoreReleaseDate}
                    onScoreReleaseDateChange={(date) => updateFormField('scoreReleaseDate', date)}
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
