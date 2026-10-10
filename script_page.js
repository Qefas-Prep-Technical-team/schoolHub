const fs = require('fs');

const runReplacements = (path, replacements) => {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  let changed = false;

  // Add imports if missing
  if (!content.includes('import { TooltipProvider')) {
    if (content.includes('lucide-react')) {
      content = content.replace(/from 'lucide-react';/, "from 'lucide-react';\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';");
    } else {
      content = "import { Info } from 'lucide-react';\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';\n" + content;
    }
    
    // Add Info import if missing from lucide-react
    if (content.includes('from \'lucide-react\'') && !content.includes('Info,')) {
        content = content.replace(/import \{(.*?)\} from ['"]lucide-react['"]/g, (match, p1) => {
            if(!p1.includes('Info')) {
                return `import {${p1}, Info} from 'lucide-react'`;
            }
            return match;
        });
    }
    changed = true;
  }

  for (const [targetRegex, replacement] of replacements) {
    if (content.match(targetRegex)) {
      content = content.replace(targetRegex, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(path, content);
    console.log(`Updated ${path}`);
  }
};

runReplacements('c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/page.tsx', [
  [
    /<h3 className="text-base font-bold text-slate-900 dark:text-white">Today at a glance<\/h3>/,
    `<div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Today at a glance</h3>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                        <Info size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Provides a real-time snapshot of the school's operational capacity and registered entities. Monitoring these aggregates helps identify immediate discrepancies in expected enrollment or staffing numbers.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`
  ],
  [
    /<span className="text-xs text-slate-500 font-medium">Total Students<\/span>/,
    `<div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Total Students</span>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                        <Info size={12} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Reflects the total count of active, enrolled student accounts in the current session. A sudden drop may indicate unrecorded transfers or system data loss.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`
  ],
  [
    /<span className="text-xs text-slate-500 font-medium">Total Teachers<\/span>/,
    `<div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Total Teachers</span>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                        <Info size={12} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Reflects the total count of active faculty staff members. Use this metric to ensure you maintain optimal student-to-teacher ratios across the institution.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`
  ],
  [
    /<span className="text-xs text-slate-500 font-medium">Total Classes<\/span>/,
    `<div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Total Classes</span>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                        <Info size={12} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Reflects the total number of distinct classroom cohorts configured. Useful for auditing spatial requirements and general school capacity.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`
  ],
  [
    /<span className="text-xs text-slate-500 font-medium">Total Subjects<\/span>/,
    `<div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Total Subjects</span>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                        <Info size={12} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Reflects the breadth of your academic curriculum. Monitoring this ensures curriculum diversity and highlights potential gaps in educational offerings.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`
  ]
]);
