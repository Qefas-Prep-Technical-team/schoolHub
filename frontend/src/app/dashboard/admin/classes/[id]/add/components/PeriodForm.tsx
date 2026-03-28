/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, ChevronLeft } from 'lucide-react';
import FormField from './FormField';
import TimeInput from './TimeInput';
import TeacherAvailabilityButton from './TeacherAvailabilityButton';
import ConflictAlert from './ConflictAlert';
import { Conflict, PeriodFormData } from './types'; // ✅ use shared types

const periodFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  teacher: z.string().min(1, 'Teacher is required'),
  day: z.string().min(1, 'Day is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  classroom: z.string().min(1, 'Classroom is required'),
  priority: z.string(),
  notes: z.string(),
  status: z.string().min(1, 'Status is required'), // ✅ add
});

interface PeriodFormProps {
  initialData?: Partial<PeriodFormData>;
  onSubmit: (data: PeriodFormData) => void | Promise<void>; // ✅ allow async
  onCancel: () => void;
  onBack: () => void;
  mode?: 'add' | 'edit';
}


const PeriodForm: React.FC<PeriodFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onBack,
  mode = 'add'
}) => {
  const [showAlert, setShowAlert] = useState(true);
  const [conflicts, setConflicts] = useState<Conflict[]>([
    {
      type: 'teacher',
      message: 'Teacher "Dr. Evelyn Reed" is already booked for "Grade 10 Physics" at this time.'
    },
    {
      type: 'classroom',
      message: 'Classroom "CR-201" is unavailable.'
    }
  ]);

  const defaultValues: PeriodFormData = {
    subject: initialData?.subject || 'Physics',
    teacher: initialData?.teacher || 'Dr. Evelyn Reed',
    day: initialData?.day || 'Monday',
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '10:00',
    classroom: initialData?.classroom || 'CR-201 (Science Lab)',
    priority: initialData?.priority || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'available',

  };

const {
  control,
  handleSubmit,
  formState: { errors, isSubmitting },
  watch,
  setValue
} = useForm<PeriodFormData>({
  resolver: zodResolver(periodFormSchema) as any,
  defaultValues,
});

  const subjects = [
    'Select a subject',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography',
    'Art',
    'Music',
    'Physical Education'
  ];

  const teachers = [
    'Select a teacher',
    'Dr. Evelyn Reed',
    'Mr. Benjamin Carter',
    'Ms. Olivia Chen',
    'Mr. Samuel Wilson',
    'Mrs. Aisha Khan',
    'Dr. Robert Kim'
  ];

  const days = [
    'Select a day',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  const classrooms = [
    'Select a classroom',
    'CR-201 (Science Lab)',
    'LH-105 (Lecture Hall)',
    'AR-303 (Art Room)',
    'MR-401 (Music Room)',
    'GYM-001 (Gymnasium)',
    'LAB-301 (Chemistry Lab)',
    'CR-102 (Computer Room)'
  ];

  const priorities = [
    'No priority',
    'Low',
    'Medium',
    'High'
  ];

  const handleCheckTeacherAvailability = () => {
    const currentValues = watch();
    console.log('Checking availability for:', currentValues);
    // Implement API call to check teacher availability
  };

  const handleSave = async (data: PeriodFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to save period:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">
            {mode === 'add' ? 'Add New Timetable Period' : 'Edit Timetable Period'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
            {mode === 'add' 
              ? 'Fill in the details to schedule a new period for the timetable.'
              : 'Modify the period details below.'
            }
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={18} />
          <span className="truncate">Back</span>
        </button>
      </div>

      {/* Conflict Alert */}
      {conflicts.length > 0 && showAlert && (
        <ConflictAlert 
          conflicts={conflicts} 
          onDismiss={() => setShowAlert(false)} 
        />
      )}

      {/* Form Card */}
      <div className="bg-white dark:bg-[#1f172c] rounded-xl border border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit(handleSave)}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                {/* Subject */}
                <FormField label="Subject" htmlFor="subject">
                  <Controller
                    name="subject"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="subject"
                        {...field}
                        className={`form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                          errors.subject 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-700'
                        } bg-transparent h-12 px-3 text-base font-normal leading-normal`}
                      >
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </FormField>

                {/* Teacher */}
                <FormField label="Teacher">
                  <div className="flex items-center gap-2">
                    <Controller
                      name="teacher"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                            errors.teacher 
                              ? 'border-red-500' 
                              : 'border-gray-300 dark:border-gray-700'
                          } bg-transparent h-12 px-3 text-base font-normal leading-normal`}
                        >
                          {teachers.map((teacher) => (
                            <option key={teacher} value={teacher}>
                              {teacher}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <TeacherAvailabilityButton onClick={handleCheckTeacherAvailability} />
                  </div>
                  {errors.teacher && (
                    <p className="text-red-500 text-sm mt-1">{errors.teacher.message}</p>
                  )}
                </FormField>

                {/* Day of the Week */}
                <FormField label="Day of the Week" htmlFor="day">
                  <Controller
                    name="day"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="day"
                        {...field}
                        className={`form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                          errors.day 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-700'
                        } bg-transparent h-12 px-3 text-base font-normal leading-normal`}
                      >
                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.day && (
                    <p className="text-red-500 text-sm mt-1">{errors.day.message}</p>
                  )}
                </FormField>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <TimeInput
                        {...field}
                        label="Start Time"
                        id="startTime"
                      />
                    )}
                  />
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <TimeInput
                        {...field}
                        label="End Time"
                        id="endTime"
                      />
                    )}
                  />
                </div>
                {(errors.startTime || errors.endTime) && (
                  <div className="text-red-500 text-sm -mt-4">
                    {errors.startTime?.message || errors.endTime?.message}
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                {/* Classroom */}
                <FormField label="Classroom" htmlFor="classroom">
                  <Controller
                    name="classroom"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="classroom"
                        {...field}
                        className={`form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
                          errors.classroom 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-700'
                        } bg-transparent h-12 px-3 text-base font-normal leading-normal`}
                      >
                        {classrooms.map((classroom) => (
                          <option key={classroom} value={classroom}>
                            {classroom}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.classroom && (
                    <p className="text-red-500 text-sm mt-1">{errors.classroom.message}</p>
                  )}
                </FormField>

                {/* Priority */}
                <FormField label="Priority" htmlFor="priority" optional>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="priority"
                        {...field}
                        className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-transparent h-12 px-3 text-base font-normal leading-normal"
                      >
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </FormField>

                {/* Notes */}
                <FormField label="Notes" htmlFor="notes" optional>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        id="notes"
                        {...field}
                        rows={4}
                        placeholder="Add any specific notes for this period..."
                        className="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal"
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 dark:bg-[#1f172c]/50 border-t border-gray-200 dark:border-gray-800 rounded-b-xl">
            <button
              type="button"
              onClick={onCancel}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-gray-700 dark:text-gray-300 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <span className="truncate">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span className="truncate">
                {isSubmitting ? 'Saving...' : 'Save Period'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeriodForm;