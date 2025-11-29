/* eslint-disable @typescript-eslint/no-explicit-any */
import { Class, Student, Subject, GradeFormData } from "./types";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Textarea from "./ui/Textarea";


interface GradeFormFieldsProps {
    formData: GradeFormData;
    currentGrade: string;
    onInputChange: (field: keyof GradeFormData, value: any) => void;
}

// Mock data - in a real app, this would come from an API
const mockStudents: Student[] = [
    { id: '1', name: 'John Doe', studentId: 'STU-001' },
    { id: '2', name: 'Jane Smith', studentId: 'STU-002' },
    { id: '3', name: 'Mike Johnson', studentId: 'STU-003' },
];

const mockClasses: Class[] = [
    { id: '1', name: 'Grade 10 - Math' },
    { id: '2', name: 'Grade 10 - Science' },
    { id: '3', name: 'Grade 11 - Math' },
];

const mockSubjects: Subject[] = [
    { id: '1', name: 'Algebra II' },
    { id: '2', name: 'Biology' },
    { id: '3', name: 'Chemistry' },
];

const assessmentTypes = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'midterm', label: 'Midterm Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'project', label: 'Project' },
    { value: 'homework', label: 'Homework' },
];

export default function GradeFormFields({
    formData,
    currentGrade,
    onInputChange
}: GradeFormFieldsProps) {
    return (
        <div className="p-6 space-y-6">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="Student"
                    value={formData.studentId}
                    onChange={(value) => onInputChange('studentId', value)}
                    options={[
                        { value: '', label: 'Search for a student...' },
                        ...mockStudents.map(student => ({
                            value: student.id,
                            label: `${student.name} (${student.studentId})`
                        }))
                    ]}
                    required
                />

                <Select
                    label="Class"
                    value={formData.classId}
                    onChange={(value) => onInputChange('classId', value)}
                    options={[
                        { value: '', label: 'Select a class' },
                        ...mockClasses.map(cls => ({
                            value: cls.id,
                            label: cls.name
                        }))
                    ]}
                    required
                />

                <Select
                    label="Subject"
                    value={formData.subjectId}
                    onChange={(value) => onInputChange('subjectId', value)}
                    options={[
                        { value: '', label: 'Select a subject' },
                        ...mockSubjects.map(subject => ({
                            value: subject.id,
                            label: subject.name
                        }))
                    ]}
                    required
                />

                <Select
                    label="Assessment Type"
                    value={formData.assessmentType}
                    onChange={(value) => onInputChange('assessmentType', value)}
                    options={[
                        { value: '', label: 'Select type (e.g., Quiz)' },
                        ...assessmentTypes
                    ]}
                    required
                />
            </div>

            {/* Score Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    label="Score"
                    type="number"
                    value={formData.score?.toString() || ''}
                    onChange={(value) => onInputChange('score', value ? parseFloat(value) : null)}
                    placeholder="e.g., 85"
                    min={0}
                    max={formData.maxMarks}
                    required
                />

                <Input
                    label="Max Marks"
                    type="number"
                    value={formData.maxMarks.toString()}
                    onChange={(value) => onInputChange('maxMarks', parseInt(value) || 100)}
                    min={1}
                    max={1000}
                    required
                />

                <div className="flex flex-col">
                    <label className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Grade
                    </label>
                    <div className="flex items-center w-full h-12 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-4">
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {currentGrade}
                        </p>
                    </div>
                </div>
            </div>

            {/* Remarks */}
            <Textarea
                label="Remarks / Comments (Optional)"
                value={formData.remarks}
                onChange={(value) => onInputChange('remarks', value)}
                placeholder="Add any comments here..."
                rows={4}
            />
        </div>
    );
}
