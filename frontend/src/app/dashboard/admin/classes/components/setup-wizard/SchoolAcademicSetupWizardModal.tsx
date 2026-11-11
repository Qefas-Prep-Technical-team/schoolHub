'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  EyeOff,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { schoolService } from '@/lib/api/services/schoolService';
import { schoolQueryKeys } from '@/lib/api/hooks/useSchool';
import {
  subjectService,
  Subject,
} from '@/app/dashboard/admin/subjects/services/subjectService';
import {
  departmentService,
  Department,
} from '@/app/dashboard/admin/departments/services/departmentService';
import {
  sessionService,
  Session,
} from '@/lib/api/services/sessionService';
import {
  classService,
  Class,
} from '@/app/dashboard/admin/classes/services/classService';
import {
  NigerianStandardSubject,
  NigerianStandardDepartment,
  SUGGESTED_NIGERIAN_DEPARTMENTS,
  SUGGESTED_NIGERIAN_SUBJECTS,
} from '@/utils/curriculumConstants';
import { cn } from '@/lib/utils';

import {
  StepSchoolProfile,
  SetupProfileFormData,
} from './StepSchoolProfile';
import { StepAcademicLevels } from './StepAcademicLevels';
import { StepCurriculumSubjects } from './StepCurriculumSubjects';
import { StepAcademicDepartments } from './StepAcademicDepartments';
import { StepClassAndOnboardingGuide } from './StepClassAndOnboardingGuide';

export const getSetupWizardStorageKeys = (schoolId: string) => ({
  savedKey: `qefas_school_setup_wizard_saved_${schoolId}`,
  dismissedKey: `qefas_school_setup_wizard_dont_show_${schoolId}`,
});

interface SchoolAcademicSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  existingClasses: Class[];
  onClassesUpdated: () => void;
  onOpenFullClassModal: () => void;
}

const STEPS = [
  {
    step: 1,
    title: 'School Profile',
    subtitle: 'Identity & Grading',
    icon: Building2,
  },
  {
    step: 2,
    title: 'Academic Levels',
    subtitle: 'KG, Primary, JSS, SSS',
    icon: GraduationCap,
  },
  {
    step: 3,
    title: 'Subjects',
    subtitle: 'Curriculum & Schemes',
    icon: BookOpen,
  },
  {
    step: 4,
    title: 'Departments',
    subtitle: 'Science, Arts, Commercial',
    icon: Building2,
  },
  {
    step: 5,
    title: 'Create Class & Guide',
    subtitle: 'Classes, Linking & AI',
    icon: Layers,
  },
] as const;

export const SchoolAcademicSetupWizardModal: React.FC<
  SchoolAcademicSetupWizardModalProps
> = ({
  isOpen,
  onClose,
  schoolId,
  existingClasses,
  onClassesUpdated,
  onOpenFullClassModal,
}) => {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
    const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

    // Step 1 State
    const [profileForm, setProfileForm] = useState<SetupProfileFormData>({
      name: '',
      motto: '',
      principal: '',
      schoolType: 'Private',
      schoolEmail: '',
      phone: '',
      website: '',
      address: '',
      logo: '',
      gradingSystem: [],
    });
    const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

    // Step 2 State
    const [levels, setLevels] = useState<string[]>([]);
    const [addingLevelName, setAddingLevelName] = useState<string | null>(null);
    const [isBulkSavingLevels, setIsBulkSavingLevels] = useState<boolean>(false);

    // Step 3 & 4 State
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [addingSubjectCode, setAddingSubjectCode] = useState<string | null>(null);
    const [addingDepartmentCode, setAddingDepartmentCode] = useState<string | null>(
      null
    );

    // Step 5 State
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isCreatingClass, setIsCreatingClass] = useState<boolean>(false);
    const [isCompletingWizard, setIsCompletingWizard] = useState<boolean>(false);
    const [isAdvancingStep, setIsAdvancingStep] = useState<boolean>(false);
    const [isDismissingWizard, setIsDismissingWizard] = useState<boolean>(false);

    const loadSchoolSetupData = useCallback(async () => {
      if (!schoolId) return;
      setLoadingInitial(true);
      try {
        const results = await Promise.allSettled([
          schoolService.getProfile(schoolId),
          subjectService.getSubjects(schoolId),
          departmentService.getDepartments(schoolId),
          sessionService.getSessions(schoolId),
        ]);

        if (results[0].status === 'fulfilled' && results[0].value) {
          const p = results[0].value;
          setProfileForm({
            name: p.name || '',
            motto: p.motto || '',
            principal: p.principal || '',
            schoolType: p.schoolType || 'Private',
            schoolEmail: p.schoolEmail || '',
            phone: p.phone || '',
            website: p.website || '',
            address: p.address || '',
            logo: p.logo || '',
            gradingSystem: Array.isArray(p.gradingSystem) ? p.gradingSystem : [],
          });
          setLevels(Array.isArray(p.levels) ? p.levels : []);
        }

        if (results[1].status === 'fulfilled') {
          setSubjects(results[1].value || []);
        }

        if (results[2].status === 'fulfilled') {
          setDepartments(results[2].value || []);
        }

        if (results[3].status === 'fulfilled') {
          setSessions(results[3].value || []);
        }
      } catch (err) {
        console.error('Failed to load setup wizard data:', err);
      } finally {
        setLoadingInitial(false);
      }
    }, [schoolId]);

    useEffect(() => {
      if (isOpen && schoolId) {
        loadSchoolSetupData();
      }
    }, [isOpen, schoolId, loadSchoolSetupData]);

    // Step 1: Save School Profile
    const handleProfileChange = (
      field: keyof SetupProfileFormData,
      value: unknown
    ) => {
      setProfileForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleSaveProfile = async () => {
      if (!schoolId) return;
      if (!profileForm.name.trim()) {
        toast.error('Official School Name is required');
        return;
      }
      setIsSavingProfile(true);
      try {
        await schoolService.updateProfile(schoolId, {
          ...profileForm,
          levels,
        });
        queryClient.invalidateQueries({
          queryKey: [...schoolQueryKeys.all, 'profile'],
        });
        toast.success('School profile settings saved!');
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(
          errorObj.response?.data?.message || 'Failed to save school profile'
        );
      } finally {
        setIsSavingProfile(false);
      }
    };

    // Step 2: Add / Remove Levels
    const handleAddLevel = async (levelName: string) => {
      if (!schoolId) return;
      const trimmed = levelName.trim();
      if (!trimmed) return;
      if (levels.some((l) => l.trim().toLowerCase() === trimmed.toLowerCase())) {
        toast.info(`${trimmed} is already in your school's levels.`);
        return;
      }

      setAddingLevelName(trimmed);
      try {
        const updated = [...levels, trimmed];
        await schoolService.updateProfile(schoolId, { levels: updated });
        setLevels(updated);
        queryClient.invalidateQueries({
          queryKey: [...schoolQueryKeys.all, 'profile'],
        });
        toast.success(`Added ${trimmed} to your school's levels!`);
      } catch (err) {
        console.error('Failed to add level:', err);
        toast.error(`Failed to add ${trimmed}`);
      } finally {
        setAddingLevelName(null);
      }
    };

    const handleAddAllSuggestedLevels = async (suggested: string[]) => {
      if (!schoolId || suggested.length === 0) return;
      setIsBulkSavingLevels(true);
      try {
        const updated = Array.from(new Set([...levels, ...suggested]));
        await schoolService.updateProfile(schoolId, { levels: updated });
        setLevels(updated);
        queryClient.invalidateQueries({
          queryKey: [...schoolQueryKeys.all, 'profile'],
        });
        toast.success(
          `Added ${suggested.length} standard levels to your school's levels!`
        );
      } catch (err) {
        console.error('Failed to bulk add levels:', err);
        toast.error('Failed to add suggested levels');
      } finally {
        setIsBulkSavingLevels(false);
      }
    };

    const handleRemoveLevel = async (levelName: string) => {
      if (!schoolId) return;
      setAddingLevelName(levelName);
      try {
        const updated = levels.filter((l) => l !== levelName);
        await schoolService.updateProfile(schoolId, { levels: updated });
        setLevels(updated);
        queryClient.invalidateQueries({
          queryKey: [...schoolQueryKeys.all, 'profile'],
        });
        toast.info(`Removed ${levelName} from your school's levels.`);
      } catch (err) {
        console.error('Failed to remove level:', err);
        toast.error(`Failed to remove ${levelName}`);
      } finally {
        setAddingLevelName(null);
      }
    };

    // Helper: Seed subject + 10-week scheme
    const seedNigerianSubjectWithScheme = async (
      sug: NigerianStandardSubject
    ): Promise<Subject> => {
      const newSubject = await subjectService.createSubject({
        name: sug.name,
        code: sug.code,
        description: sug.description,
        schoolId,
        scope: 'SCHOOL',
      });

      if (sug.schemesOfWork && sug.schemesOfWork.length > 0 && newSubject.id) {
        apiClient
          .post(`/academic/subjects/${newSubject.id}/scheme/sync`, {
            entries: sug.schemesOfWork.map((sw) => ({
              week: sw.week,
              topic: sw.topic,
              objectives: sw.objectives,
              term: 1,
              status: 'PUBLISHED',
            })),
          })
          .catch((err) =>
            console.warn('Failed to pre-seed scheme of work:', err)
          );
      }

      return newSubject;
    };

    // Step 3: Add Suggested or Custom Subject
    const handleAddSuggestedSubject = async (sug: NigerianStandardSubject) => {
      if (!schoolId || addingSubjectCode) return;
      setAddingSubjectCode(sug.code);
      try {
        const newSubject = await seedNigerianSubjectWithScheme(sug);

        const matchingStandardDepts = SUGGESTED_NIGERIAN_DEPARTMENTS.filter((d) =>
          d.recommendedSubjectCodes.some(
            (code) => code.toLowerCase() === sug.code.toLowerCase()
          )
        );

        const matchingSchoolDeptIds = departments
          .filter((schoolDept) => {
            const deptCodeLower = (schoolDept.code || '').trim().toLowerCase();
            const deptNameLower = (schoolDept.name || '').trim().toLowerCase();
            return matchingStandardDepts.some(
              (std) =>
                deptNameLower === std.name.trim().toLowerCase() ||
                deptCodeLower === std.code.trim().toLowerCase() ||
                deptCodeLower.startsWith(`${std.code.trim().toLowerCase()}-`)
            );
          })
          .map((d) => d.departmentId || d.id)
          .filter(Boolean);

        if (matchingSchoolDeptIds.length > 0 && newSubject.id) {
          await subjectService
            .attachDepartments(newSubject.id, matchingSchoolDeptIds)
            .catch((err) =>
              console.warn('Failed to auto-link subject to departments:', err)
            );
        }

        setSubjects((prev) => [newSubject, ...prev]);
        queryClient.invalidateQueries({
          queryKey: schoolQueryKeys.subjects(schoolId),
        });
        toast.success(
          matchingSchoolDeptIds.length > 0
            ? `Added ${sug.name} to your school's subjects (and linked to ${matchingSchoolDeptIds.length} department(s))!`
            : `Added ${sug.name} to your school's subjects!`
        );
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(
          errorObj.response?.data?.message || `Failed to add ${sug.name}`
        );
      } finally {
        setAddingSubjectCode(null);
      }
    };

    const handleAddCustomSubject = async (data: {
      name: string;
      code: string;
      description?: string;
    }) => {
      if (!schoolId) return;
      try {
        const newSubject = await subjectService.createSubject({
          name: data.name,
          code: data.code,
          description: data.description,
          schoolId,
          scope: 'SCHOOL',
        });
        setSubjects((prev) => [newSubject, ...prev]);
        queryClient.invalidateQueries({
          queryKey: schoolQueryKeys.subjects(schoolId),
        });
        toast.success(`Added ${data.name} to your school's subjects!`);
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(
          errorObj.response?.data?.message || `Failed to add ${data.name}`
        );
      }
    };

    // Step 4: Add Suggested or Custom Department
    const handleAddSuggestedDepartment = async (
      sug: NigerianStandardDepartment
    ) => {
      if (!schoolId || addingDepartmentCode) return;
      setAddingDepartmentCode(sug.code);
      try {
        const newDept = await departmentService.createDepartment({
          name: sug.name,
          code: sug.code,
          description: sug.description,
          schoolId,
          scope: 'SCHOOL',
        });

        const targetDeptUuid = newDept.departmentId || newDept.id;
        const subjectIdsToLink: string[] = [];
        const newlyCreatedSubjects: Subject[] = [];

        for (const recCode of sug.recommendedSubjectCodes) {
          const recCodeLower = recCode.trim().toLowerCase();
          const standardSubj = SUGGESTED_NIGERIAN_SUBJECTS.find(
            (s) => s.code.trim().toLowerCase() === recCodeLower
          );

          const existingSubj = subjects.find((s) => {
            const sCode = (s.code || '').trim().toLowerCase();
            const sName = (s.name || '').trim().toLowerCase();
            return (
              sCode === recCodeLower ||
              sCode.startsWith(`${recCodeLower}-`) ||
              (standardSubj && sName === standardSubj.name.trim().toLowerCase())
            );
          });

          if (existingSubj) {
            subjectIdsToLink.push(existingSubj.id);
          } else if (standardSubj) {
            try {
              const createdSubj = await seedNigerianSubjectWithScheme(
                standardSubj
              );
              newlyCreatedSubjects.push(createdSubj);
              subjectIdsToLink.push(createdSubj.id);
            } catch (subErr) {
              console.warn(
                `Could not auto-create subject ${standardSubj.name}:`,
                subErr
              );
            }
          }
        }

        if (targetDeptUuid && subjectIdsToLink.length > 0) {
          await departmentService
            .attachSubjects(targetDeptUuid, subjectIdsToLink)
            .catch((err) =>
              console.warn('Failed to attach subjects to department:', err)
            );
        }

        if (newlyCreatedSubjects.length > 0) {
          setSubjects((prev) => [...newlyCreatedSubjects, ...prev]);
        }

        setDepartments((prev) => [newDept, ...prev]);
        queryClient.invalidateQueries({
          queryKey: schoolQueryKeys.departments(schoolId),
        });
        toast.success(
          `Added ${sug.name} to your school's departments (with ${subjectIdsToLink.length} linked subjects)!`
        );
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(
          errorObj.response?.data?.message || `Failed to add ${sug.name}`
        );
      } finally {
        setAddingDepartmentCode(null);
      }
    };

    const handleAddCustomDepartment = async (data: {
      name: string;
      code: string;
      description?: string;
    }) => {
      if (!schoolId) return;
      try {
        const newDept = await departmentService.createDepartment({
          name: data.name,
          code: data.code,
          description: data.description,
          schoolId,
          scope: 'SCHOOL',
        });
        setDepartments((prev) => [newDept, ...prev]);
        queryClient.invalidateQueries({
          queryKey: schoolQueryKeys.departments(schoolId),
        });
        toast.success(`Added ${data.name} to your school's departments!`);
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(
          errorObj.response?.data?.message || `Failed to add ${data.name}`
        );
      }
    };

    // Step 5: Create Class
    const handleCreateClass = async (data: {
      name: string;
      section?: string;
      level?: string;
      sessionId?: string;
      term?: string;
      subjectIds: string[];
      departmentIds: string[];
    }) => {
      if (!schoolId) return;
      setIsCreatingClass(true);
      try {
        if (
          data.level &&
          !levels.some(
            (l) => l.trim().toLowerCase() === data.level!.trim().toLowerCase()
          )
        ) {
          const updatedLevels = [...levels, data.level.trim()];
          await schoolService.updateProfile(schoolId, { levels: updatedLevels });
          setLevels(updatedLevels);
        }

        await classService.createClass({
          name: data.name,
          section: data.section,
          level: data.level,
          session: data.sessionId || undefined,
          term: data.term,
          scope: 'SCHOOL',
          schoolId,
          subjectIds: data.subjectIds,
          departmentIds: data.departmentIds,
        });

        toast.success(`Class "${data.name}" created successfully!`);
        onClassesUpdated();
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(
          errorObj.response?.data?.message || 'Failed to create class'
        );
      } finally {
        setIsCreatingClass(false);
      }
    };

    // Save & Complete Wizard or Don't Show Again (Persisted in DB via School.profileCompleted + localStorage fallback)
    const persistCompletionToDatabase = async (includeProfileFields: boolean) => {
      if (!schoolId) return;
      try {
        await schoolService.updateProfile(schoolId, {
          ...(includeProfileFields && profileForm.name.trim()
            ? { ...profileForm, levels }
            : {}),
          profileCompleted: true,
        });
        queryClient.invalidateQueries({
          queryKey: [...schoolQueryKeys.all, 'profile'],
        });
      } catch (err) {
        console.warn('Could not persist profileCompleted flag to DB:', err);
      }
    };

    const handleCompleteAndSaveWizard = async () => {
      if (isCompletingWizard) return;
      setIsCompletingWizard(true);
      try {
        if (schoolId) {
          await persistCompletionToDatabase(true);
          const { savedKey, dismissedKey } = getSetupWizardStorageKeys(schoolId);
          localStorage.setItem(savedKey, 'true');
          if (dontShowAgain) {
            localStorage.setItem(dismissedKey, 'true');
          }
        }
        toast.success('School setup saved! You can reopen this guide anytime.');
        onClose();
      } finally {
        setIsCompletingWizard(false);
      }
    };

    const handleDontShowAgainClick = async () => {
      if (isDismissingWizard) return;
      setIsDismissingWizard(true);
      try {
        if (schoolId) {
          const { dismissedKey } = getSetupWizardStorageKeys(schoolId);
          localStorage.setItem(dismissedKey, 'true');
          await persistCompletionToDatabase(false);
        }
        toast.info("Setup guide hidden across all your devices. You can reopen it anytime from the Admin Dashboard header.");
        onClose();
      } finally {
        setIsDismissingWizard(false);
      }
    };

    const handleCloseModal = async () => {
      if (dontShowAgain && schoolId) {
        const { dismissedKey } = getSetupWizardStorageKeys(schoolId);
        localStorage.setItem(dismissedKey, 'true');
        await persistCompletionToDatabase(false);
      }
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
          <DialogContent className="w-[95vw] sm:max-w-[860px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden max-h-[92dvh] flex flex-col">
            {/* Top Gradient Header */}
                <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3.5 sm:pb-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 shrink-0 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pr-6 sm:pr-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                          <Sparkles size={11} /> 5-Step Institutional Onboarding
                        </div>
                          <DialogTitle className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
                            School Academic &amp; Class Setup Guide
                          </DialogTitle>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isDismissingWizard || isCompletingWizard}
                        onClick={handleDontShowAgainClick}
                        className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                      >
                        {isDismissingWizard ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} /> Don&apos;t Show Again
                          </>
                        )}
                      </Button>
                    </div>

                      {/* 5-Step Interactive Stepper (Horizontally scrollable on mobile, 5-column grid on desktop) */}
                      <div className="flex sm:grid sm:grid-cols-5 gap-1.5 pt-3.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar -mx-1 px-1">
                        {STEPS.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentStep === item.step;
                          const isCompleted = currentStep > item.step;
                          return (
                            <button
                              key={item.step}
                              type="button"
                              onClick={() => setCurrentStep(item.step)}
                              className={cn(
                                'flex flex-col items-start p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-left transition-all min-w-[112px] sm:min-w-0 shrink-0',
                                isActive
                                  ? 'bg-white/15 border-indigo-400 text-white shadow-sm'
                                  : isCompleted
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                              )}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span
                                  className={cn(
                                    'size-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0',
                                    isActive
                                      ? 'bg-indigo-500 text-white'
                                      : isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white/10 text-slate-300'
                                  )}
                                >
                                  {isCompleted ? <CheckCircle2 size={12} /> : item.step}
                                </span>
                                <Icon size={13} className="opacity-75" />
                              </div>
                              <p className="text-[11px] font-bold truncate w-full">
                                {item.title}
                              </p>
                                <p className="text-[9px] opacity-70 truncate w-full">
                                  {item.subtitle}
                                </p>
                            </button>
                          );
                        })}
                      </div>
                    </DialogHeader>

                    {/* Step Body */}
                      <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                        {loadingInitial ? (
                          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <Loader2 className="animate-spin text-indigo-600" size={32} />
                            <p className="text-sm font-medium">
                              Loading your school&apos;s academic configuration...
                            </p>
                          </div>
                        ) : (
                          <>
                            {currentStep === 1 && (
                              <StepSchoolProfile
                                schoolId={schoolId}
                                formData={profileForm}
                                onChange={handleProfileChange}
                                onSaveProfile={handleSaveProfile}
                                isSaving={isSavingProfile}
                              />
                            )}

                            {currentStep === 2 && (
                              <StepAcademicLevels
                                levels={levels}
                                onAddLevel={handleAddLevel}
                                onAddAllSuggestedLevels={handleAddAllSuggestedLevels}
                                onRemoveLevel={handleRemoveLevel}
                                addingLevelName={addingLevelName}
                                isBulkSaving={isBulkSavingLevels}
                              />
                            )}

                            {currentStep === 3 && (
                              <StepCurriculumSubjects
                                subjects={subjects}
                                onAddSuggestedSubject={handleAddSuggestedSubject}
                                onAddCustomSubject={handleAddCustomSubject}
                                addingSubjectCode={addingSubjectCode}
                              />
                            )}

                            {currentStep === 4 && (
                              <StepAcademicDepartments
                                departments={departments}
                                onAddSuggestedDepartment={handleAddSuggestedDepartment}
                                onAddCustomDepartment={handleAddCustomDepartment}
                                addingDepartmentCode={addingDepartmentCode}
                              />
                            )}

                            {currentStep === 5 && (
                              <StepClassAndOnboardingGuide
                                levels={levels}
                                subjects={subjects}
                                departments={departments}
                                sessions={sessions}
                                existingClasses={existingClasses}
                                onCreateClass={handleCreateClass}
                                onOpenFullClassModal={() => {
                                  handleCloseModal();
                                  onOpenFullClassModal();
                                }}
                                isCreatingClass={isCreatingClass}
                              />
                            )}
                          </>
                        )}
                      </div>

                      {/* Footer Controls */}
                        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={dontShowAgain}
                              onChange={(e) => setDontShowAgain(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 shrink-0"
                            />
                            <span className="leading-tight">Don&apos;t show this setup popup automatically again</span>
                          </label>

                            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                              {currentStep > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={isCompletingWizard || isAdvancingStep}
                                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                                  className="h-10 px-3.5 sm:px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                                >
                                  <ChevronLeft size={15} /> Previous
                                </Button>
                              )}

                              {currentStep < 5 ? (
                                <Button
                                  type="button"
                                  disabled={isAdvancingStep}
                                  onClick={async () => {
                                    if (currentStep === 1 && profileForm.name.trim()) {
                                      setIsAdvancingStep(true);
                                      try {
                                        await schoolService
                                          .updateProfile(schoolId, { ...profileForm, levels })
                                          .catch(() => null);
                                      } finally {
                                        setIsAdvancingStep(false);
                                      }
                                    }
                                    setCurrentStep((prev) => Math.min(5, prev + 1));
                                  }}
                                  className="h-10 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm flex-1 sm:flex-initial"
                                >
                                  {isAdvancingStep ? (
                                    <>
                                      <Loader2 size={15} className="animate-spin" /> Saving...
                                    </>
                                  ) : (
                                    <>
                                      Save &amp; Next Step <ChevronRight size={15} />
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  disabled={isCompletingWizard}
                                  onClick={handleCompleteAndSaveWizard}
                                  className="h-10 px-5 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm flex-1 sm:flex-initial"
                                >
                                  {isCompletingWizard ? (
                                    <>
                                      <Loader2 size={15} className="animate-spin" /> Saving Setup...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={15} /> Finish &amp; Save Setup
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      );
  };
