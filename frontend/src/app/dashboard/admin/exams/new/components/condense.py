import re
import os

filepath = r'c:\Users\Student\Documents\GitHub\schoolHub\frontend\src\app\dashboard\admin\exams\new\components\CreateExamForm.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update steps array
old_steps = '''  const steps = [
    { id: 1, label: "Exam Details", desc: "Basic Info & Category" },
    { id: 2, label: "Target", desc: "Who is taking this?" },
    { id: 3, label: "Release", desc: "When can they see it?" },
    { id: 4, label: "Papers", desc: "Subjects & Teachers" }
  ];'''
new_steps = '''  const steps = [
    { id: 1, label: "Exam Details", desc: "Basic Info & Category" },
    { id: 2, label: "Settings", desc: "Target & Release" },
    { id: 3, label: "Papers", desc: "Subjects & Teachers" }
  ];'''
content = content.replace(old_steps, new_steps)

# 2. Update width
content = content.replace('width: `${(activeStep - 1) * 33.33}%`', 'width: `${(activeStep - 1) * 50}%`')

# 3. Update handleNextStep
old_handle_next_step = '''  const handleNextStep = async () => {
    if (activeStep === 1) {
      const isValid = await trigger(["schoolId", "title", "category"]);
      if (isValid) {
        setActiveStep(2);
      } else {
        toast.error("Please fill in all required fields before proceeding.");
      }
    } else if (activeStep === 2) {
      if (watchedScope === "CLASS") {
        const isValid = await trigger(["classId"]);
        if (!isValid) {
          toast.error("Please select a target class.");
          return;
        }
      } else if (watchedScope === "DEPARTMENT") {
        const selectedDeps = watch("departmentIds") || [];
        if (selectedDeps.length === 0) {
          toast.error("Please select at least one department.");
          return;
        }
      }
      setActiveStep(3);
    }
    else if (activeStep === 3) {
      setActiveStep(4);
    }
  };'''

new_handle_next_step = '''  const handleNextStep = async () => {
    if (activeStep === 1) {
      const isValid = await trigger(["schoolId", "title", "category"]);
      if (isValid) {
        setActiveStep(2);
      } else {
        toast.error("Please fill in all required fields before proceeding.");
      }
    } else if (activeStep === 2) {
      if (watchedScope === "CLASS") {
        const isValid = await trigger(["classId"]);
        if (!isValid) {
          toast.error("Please select a target class.");
          return;
        }
      } else if (watchedScope === "DEPARTMENT") {
        const selectedDeps = watch("departmentIds") || [];
        if (selectedDeps.length === 0) {
          toast.error("Please select at least one department.");
          return;
        }
      }
      setActiveStep(3);
    }
  };'''
content = content.replace(old_handle_next_step, new_handle_next_step)

# 4. Update onClick inside stepper
content = re.sub(r'onClick=\{async \(\) => \{[\s\S]*?\}\}', '''onClick={async () => {
                  if (step.id < activeStep) {
                    setActiveStep(step.id);
                  } else if (step.id > activeStep) {
                    if (activeStep === 1) {
                      const val = await trigger(["schoolId", "title", "category"]);
                      if (val) {
                        if (step.id === 2) setActiveStep(2);
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
                    }
                  }
                }}''', content)

# 5. Combine Step 2 and Step 3 UI
target_boundary = '''              </AnimatePresence>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="step3"
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
                  <ShieldCheck size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">When can students see their results?</h2>
                  <p className="text-xs text-slate-500">Decide when students can view their grades and AI insights.</p>
                </div>
              </div>'''

replacement_boundary = '''              </AnimatePresence>

              <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-8"></div>

              <div className="flex items-center gap-4">
                <div 
                  className="size-12 rounded-2xl flex items-center justify-center border shadow-inner" 
                  style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <ShieldCheck size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">When can students see their results?</h2>
                  <p className="text-xs text-slate-500">Decide when students can view their grades and AI insights.</p>
                </div>
              </div>'''
content = content.replace(target_boundary, replacement_boundary)

# 6. Rename old step 4 to step 3
content = content.replace('{activeStep === 4 && (', '{activeStep === 3 && (')
content = content.replace('key="step4"', 'key="step3"')

# 7. Update bottom controller
content = content.replace('Step {activeStep} of 4', 'Step {activeStep} of 3')
content = content.replace('activeStep < 4 ? (', 'activeStep < 3 ? (')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully condensed to 3 steps.")
