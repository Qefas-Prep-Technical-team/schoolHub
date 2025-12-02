'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssignmentFormData, Attachment } from './components/types';
import AssignmentDetails from './components/AssignmentDetails';
import Attachments from './components/Attachments';
import DueDateScheduling from './components/DueDateScheduling';
import Settings from './components/Settings';
import SubmitBar from './components/SubmitBar';


export default function CreateAssignmentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<AssignmentFormData>({
        title: '',
        subject: '',
        classes: [
            { id: '1', name: 'Period 3 - Algebra' },
            { id: '2', name: 'Period 5 - Algebra' }
        ],
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
            const uploadedAttachments = await uploadFiles(formData.attachments);

            // Submit to API
            const response = await fetch('/api/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...submissionData,
                    attachments: uploadedAttachments
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create assignment');
            }

            const result = await response.json();

            // Redirect to assignments page or show success message
            router.push(`/assignments/${result.id}`);

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
                />

                {/* Attachments */}
                <Attachments
                    attachments={formData.attachments}
                    onAttachmentsChange={(attachments) => updateFormField('attachments', attachments)}
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