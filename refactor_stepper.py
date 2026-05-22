import sys

with open(r'c:\Users\Student\Documents\GitHub\schoolHub\frontend\src\app\dashboard\admin\exams\new\components\CreateExamForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add MUI imports
imports = '''
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Typography from '@mui/material/Typography';
'''

content = content.replace('import { Input } from "@/components/ui/input";', imports + '\nimport { Input } from "@/components/ui/input";')

# Add stepper state variables inside the component
state_code = '''
  const steps = ['School & Session', 'Exam Details', 'Result Settings'];
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState<{ [k: number]: boolean }>({});

  const totalSteps = () => steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps() - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps();

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
  const handleStep = (step: number) => () => setActiveStep(step);
  const handleComplete = () => {
    setCompleted({ ...completed, [activeStep]: true });
    handleNext();
  };
'''
content = content.replace('  const { setExamContext } = useExamStore();', state_code + '\n  const { setExamContext } = useExamStore();')
content = content.replace('import { useEffect } from "react";', 'import React, { useEffect } from "react";')

# Now restructure the JSX
jsx_start_idx = content.find('  return (')
jsx_end_idx = content.rfind('  );\n}') + 6

old_jsx = content[jsx_start_idx:jsx_end_idx]

step1_content = '''
        {activeStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            {/* School Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-bold flex items-center gap-2">
                <School size={16} className="text-blue-500" /> Select School
              </Label>
              <select
                {...register("schoolId")}
                className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="">Choose a school...</option>
                {(user as any)?.schools?.map((s: any) => (
                  <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                ))}
              </select>
              {errors.schoolId && <p className="text-red-500 text-xs font-medium">{errors.schoolId.message}</p>}
            </div>

            {/* Session Selector */}
            <div className="space-y-3">
              {sessions && sessions.data?.length > 0 ? (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                    <Calendar size={16} /> Active Session Found (Optional)
                  </Label>
                  <select
                    {...register("sessionId")}
                    className="w-full h-12 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="">No Session (Select to link)</option>
                    {sessions.data?.map((session: any) => (
                      <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="h-12 flex items-center px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs italic border border-dashed border-slate-200">
                  {loadingSessions ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Fetching sessions...
                    </span>
                  ) : isError ? (
                    <span className="flex items-center gap-2 text-red-400">
                      <AlertCircle size={14} /> Error loading data
                    </span>
                  ) : !watchedSchoolId ? (
                    "Waiting for school selection..."
                  ) : (
                    "No sessions found for this school"
                  )}
                </div>
              )}
              {errors.sessionId && <p className="text-red-500 text-xs font-medium">{errors.sessionId.message}</p>}
            </div>
          </div>
        )}
'''

step2_content = '''
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-bold">Exam Title</Label>
              <Input
                id="title"
                placeholder="e.g. 2026 First Term Mock Exam"
                {...register("title")}
                className="h-12 rounded-2xl border-slate-200 dark:border-slate-800"
              />
              {errors.title && <p className="text-red-500 text-xs font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-bold">Instructions</Label>
              <Textarea
                id="description"
                placeholder="Describe the exam guidelines..."
                {...register("description")}
                className="rounded-2xl border-slate-200 dark:border-slate-800 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500/50" /> Start Date & Time
                </Label>
                <Input id="startDate" type="datetime-local" {...register("startDate")} className="h-12 rounded-2xl border-slate-200 dark:border-slate-800" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="endDate" className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  <Calendar size={16} className="text-rose-500/50" /> Concludes At
                </Label>
                <Input id="endDate" type="datetime-local" {...register("endDate")} className="h-12 rounded-2xl border-slate-200 dark:border-slate-800" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Assessment Type</Label>
                <select {...register("category")} className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-sm outline-none bg-transparent font-bold text-blue-600">
                  <option value="EXAM">Formal Examination</option>
                  <option value="QUIZ">Quick Quiz</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Scope</Label>
                <select {...register("scope")} className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-sm outline-none bg-transparent">
                  <option value="SCHOOL">Whole School</option>
                  <option value="CLASS">By Class</option>
                  <option value="DEPARTMENT">By Department</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-blue-500">Target Class</Label>
                <select {...register("classId")} className="w-full h-12 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/20 px-4 text-sm outline-none">
                  <option value="">Select a class...</option>
                  {classesData?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-widest font-black text-purple-500">Target Departments</Label>
              </div>
              {departmentsData && departmentsData.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {departmentsData.map((d: any) => {
                    const isSelected = watch("departmentIds")?.includes(d.id);
                    return (
                      <div key={d.id} onClick={() => {
                          const current = watch("departmentIds") || [];
                          setValue("departmentIds", current.includes(d.id) ? current.filter(id => id !== d.id) : [...current, d.id]);
                        }}
                        className={cursor-pointer group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all }
                      >
                        <div className={w-5 h-5 rounded-lg flex items-center justify-center transition-colors }>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold truncate leading-tight">{d.name}</span>
                          <span className="text-[10px] uppercase font-black opacity-50 tracking-tighter">{d.code}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-14 flex items-center px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] italic border border-dashed border-slate-200">
                  {watchedSchoolId ? "No departments found for this selection" : "Select a school first"}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Creation Mode</Label>
                <select {...register("creationMode")} className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-sm outline-none bg-transparent">
                  <option value="MANUAL">Manual</option>
                  <option value="AI">AI Assistant</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Mode</Label>
                <select {...register("mode")} className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-sm outline-none bg-transparent">
                  <option value="SINGLE_SUBJECT">Single Subject</option>
                  <option value="COMBINED">Combined</option>
                </select>
              </div>
            </div>
          </div>
        )}
'''

step3_content = '''
        {activeStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-sm font-bold flex items-center gap-2">
                <FileText size={16} className="text-blue-500" /> Result Visibility
              </Label>
              <select
                {...register("allowImmediateResult", { setValueAs: (v) => v === "true" })}
                className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              >
                <option value="true">Immediate (After Submission)</option>
                <option value="false">Hidden (Till Release Date)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="resultReleaseAt" className="text-sm font-bold flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" /> Result Release Date
              </Label>
              <Input
                id="resultReleaseAt"
                type="datetime-local"
                disabled={watch("allowImmediateResult") === true}
                {...register("resultReleaseAt")}
                className="h-12 rounded-2xl border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
        )}
'''

new_jsx = f'''
  return (
    <Box sx={{{{ width: '100%' }}}} className="max-w-4xl mx-auto space-y-8 pb-20">
      <Stepper nonLinear activeStep={{activeStep}} className="mb-8">
        {{steps.map((label, index) => (
          <Step key={{label}} completed={{completed[index]}}>
            <StepButton color="inherit" onClick={{handleStep(index)}}>
              {{label}}
            </StepButton>
          </Step>
        ))}}
      </Stepper>

      <form onSubmit={{handleSubmit(onSubmit)}} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
        
        {step1_content}
        {step2_content}
        {step3_content}

        <Box sx={{{{ display: 'flex', flexDirection: 'row', pt: 2 }}}}>
          <Button
            color="inherit"
            disabled={{activeStep === 0}}
            onClick={{handleBack}}
            sx={{{{ mr: 1 }}}}
            type="button"
          >
            Back
          </Button>
          <Box sx={{{{ flex: '1 1 auto' }}}} />
          
          {{activeStep !== steps.length - 1 ? (
            <Button onClick={{handleNext}} sx={{{{ mr: 1 }}}} type="button">
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={{isPending || !watchedSchoolId}}
              variant="contained"
            >
              {{isPending ? "Creating..." : "Create Exam"}}
            </Button>
          )}}
        </Box>
      </form>
    </Box>
  );
}}
'''

content = content.replace(old_jsx, new_jsx)

with open(r'c:\Users\Student\Documents\GitHub\schoolHub\frontend\src\app\dashboard\admin\exams\new\components\CreateExamForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
