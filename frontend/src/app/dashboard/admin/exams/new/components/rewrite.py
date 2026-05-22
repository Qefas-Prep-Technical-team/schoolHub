import re
import os

filepath = r'c:\Users\Student\Documents\GitHub\schoolHub\frontend\src\app\dashboard\admin\exams\new\components\CreateExamForm.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import { \n  Loader2, \n  School,',
    'import { \n  Loader2, \n  School, \n  Trash2,\n  Plus,\n  BookCheck,'
)
content = content.replace(
    'import { useSchoolSettings } from "@/lib/api/hooks/useSchool";',
    'import { useSchoolSettings } from "@/lib/api/hooks/useSchool";\nimport { adminService } from "@/lib/api/services/adminService";'
)

# 2. State and Queries
content = content.replace(
    'const [activeStep, setActiveStep] = useState(1);',
    'const [activeStep, setActiveStep] = useState(1);\n  const [subjectPapers, setSubjectPapers] = useState<{id: string; subjectId: string; teacherId: string}[]>([]);\n  const [isCreating, setIsCreating] = useState(false);'
)

query_injection = '''
  // Fetch Teachers
  const { data: teachersData } = useQuery({
    queryKey: ["school-teachers", watchedSchoolId],
    queryFn: async () => {
      const res = await adminService.getSchoolTeachers(watchedSchoolId);
      return res.data || [];
    },
    enabled: !!watchedSchoolId,
  });

  // Fetch Subjects
  const { data: subjectsData } = useQuery({
    queryKey: ["school-subjects", watchedSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/subjects?schoolId=${watchedSchoolId}`);
      return data.data || [];
    },
    enabled: !!watchedSchoolId,
  });
'''
content = content.replace(
    '// Fetch Departments - Now dependent on classId',
    query_injection + '\n  // Fetch Departments - Now dependent on classId'
)

# 3. onSubmit
old_submit = '''  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateExamDTO) => examService.createExam(data),
    onSuccess: (data) => {
      toast.success("Exam created successfully!");
      setExamContext(data.id, data.schoolId, data.sessionId || "");
      router.push(`/dashboard/admin/exams/${data.id}/papers`);
    },
    onError: (error: { response?: { data?: { message?: string } }, message?: string }) => {
      const message = error.response?.data?.message || error.message || "Failed to create exam";
      toast.error(typeof message === 'string' ? message : "An error occurred");
    },
  });

  const onSubmit = (data: ExamFormValues) => mutate({
    ...data,
    description: data.description || "",
    startDate: data.startDate || undefined,
    endDate: data.endDate || undefined,
    resultReleaseAt: data.resultReleaseAt || undefined,
  });'''

new_submit = '''  const onSubmit = async (data: ExamFormValues) => {
    setIsCreating(true);
    try {
      const examData = {
        ...data,
        description: data.description || "",
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        resultReleaseAt: data.resultReleaseAt || undefined,
      };
      const exam = await examService.createExam(examData);
      
      // Create subject papers
      for (const paper of subjectPapers) {
        if (paper.subjectId && paper.teacherId) {
          const subjectName = subjectsData?.find((s: any) => s.id === paper.subjectId)?.name || "Subject";
          await examService.createSubjectPaper(exam.id, {
            title: `${subjectName} Exam`,
            durationMinutes: 60,
            passMark: 50,
            subjectId: paper.subjectId,
            teacherId: paper.teacherId,
            instructions: "Please answer all questions carefully.",
          });
        }
      }

      toast.success("Exam created successfully!");
      setExamContext(exam.id, exam.schoolId, exam.sessionId || "");
      router.push(`/dashboard/admin/exams/${exam.id}/papers`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to create exam";
      toast.error(typeof message === 'string' ? message : "An error occurred");
    } finally {
      setIsCreating(false);
    }
  };'''
content = content.replace(old_submit, new_submit)

# 4. Next Step
content = content.replace('setActiveStep(3);\n    }\n  };', 'setActiveStep(3);\n    }\n    else if (activeStep === 3) {\n      setActiveStep(4);\n    }\n  };')
content = content.replace(
'''  const steps = [
    { id: 1, label: "Basic Info", desc: "Exam Name & Category" },
    { id: 2, label: "Scope & Target", desc: "Who is taking this?" },
    { id: 3, label: "Results Release", desc: "Sharing Settings" }
  ];''',
'''  const steps = [
    { id: 1, label: "Exam Details", desc: "Basic Info & Category" },
    { id: 2, label: "Target", desc: "Who is taking this?" },
    { id: 3, label: "Release", desc: "When can they see it?" },
    { id: 4, label: "Papers", desc: "Subjects & Teachers" }
  ];'''
)

# 5. Stepper
content = content.replace('width: `${(activeStep - 1) * 40}%`', 'width: `${(activeStep - 1) * 33.33}%`')

# Re-write the complex click handler to support step 4
content = re.sub(r'onClick=\{async \(\) => \{[\s\S]*?\}\}', '''onClick={async () => {
                  if (step.id < activeStep) {
                    setActiveStep(step.id);
                  } else if (step.id > activeStep) {
                    // Let the user skip forward only if valid
                    if (activeStep === 1) {
                      const val = await trigger(["schoolId", "title", "category"]);
                      if (val) {
                        if (step.id === 2) setActiveStep(2);
                        // simplifying direct jumping to avoid complex validation chains for now
                        // users can just click next
                      }
                    } else if (activeStep === 2) {
                      if (watchedScope === "CLASS") {
                        const valClass = await trigger(["classId"]);
                        if (valClass) setActiveStep(3);
                      } else if (watchedScope === "DEPARTMENT") {
                        const selectedDeps = watch("departmentIds") || [];
                        if (selectedDeps.length > 0) setActiveStep(3);
                      } else {
                        setActiveStep(3);
                      }
                    } else if (activeStep === 3) {
                      setActiveStep(4);
                    }
                  }
                }}''', content)

# Text replacements
content = content.replace('Select Category', 'Type of Test')
content = content.replace('Formal Exam', 'Main Exam')
content = content.replace('Short Quiz / Test', 'Quick Quiz')
content = content.replace('Scope & Target Audience', 'Who is taking this test?')
content = content.replace('Results Release', 'When can students see their results?')
content = content.replace('Academic Session', 'School Term / Session')

# 6. Step 4 UI
step4_ui = '''
          {activeStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="size-12 rounded-2xl flex items-center justify-center border shadow-inner" 
                  style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <BookCheck size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Subjects & Teachers</h2>
                  <p className="text-xs text-slate-500">Assign teachers to the subjects being tested. (Duration & Marks will default to 60mins/50marks and can be edited later).</p>
                </div>
              </div>

              <div className="space-y-4">
                {subjectPapers.map((paper, idx) => (
                  <div key={paper.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Subject</Label>
                      <select
                        value={paper.subjectId}
                        onChange={(e) => {
                          const newPapers = [...subjectPapers];
                          newPapers[idx].subjectId = e.target.value;
                          setSubjectPapers(newPapers);
                        }}
                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                      >
                        <option value="">Select Subject...</option>
                        {subjectsData?.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Assign Teacher</Label>
                      <select
                        value={paper.teacherId}
                        onChange={(e) => {
                          const newPapers = [...subjectPapers];
                          newPapers[idx].teacherId = e.target.value;
                          setSubjectPapers(newPapers);
                        }}
                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                      >
                        <option value="">Select Teacher...</option>
                        {teachersData?.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.user?.name || "Teacher"}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setSubjectPapers(subjectPapers.filter(p => p.id !== paper.id));
                        }}
                        className="h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={() => {
                    setSubjectPapers([...subjectPapers, { id: Math.random().toString(), subjectId: '', teacherId: '' }]);
                  }}
                  className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm tracking-wide transition-all"
                >
                  <Plus size={18} className="mr-2" />
                  Add Subject Paper
                </Button>
              </div>

            </motion.div>
          )}
'''
content = content.replace('</AnimatePresence>\n      </div>', '</AnimatePresence>\n      </div>\n' + step4_ui)

# 7. Controller Buttons updates
content = content.replace('Step {activeStep} of 3', 'Step {activeStep} of 4')
content = content.replace('Finalize grading settings', 'Assign subjects & teachers')
content = content.replace('activeStep < 3 ? (', 'activeStep < 4 ? (')
content = content.replace('disabled={isPending || !watchedSchoolId}', 'disabled={isCreating || !watchedSchoolId}')
content = content.replace('isPending ? (', 'isCreating ? (')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Successfully rewritten CreateExamForm.tsx')
