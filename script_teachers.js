const fs = require('fs');

const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/teachers/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('TooltipProvider')) {
  content = content.replace(/from 'lucide-react'/, "from 'lucide-react'\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'");
  if (!content.includes('Info,')) {
    content = content.replace(/ClipboardList,/, "ClipboardList, Info,");
  }
}

let changed = false;

const target1 = `<h1 className="text-xl font-bold text-gray-900 dark:text-white">Teacher Overview</h1>`;
const replacement1 = `<div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Teacher Overview</h1>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none">
                                        <Info size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Comprehensive directory of your teaching staff. Monitor individual faculty status, assigned subjects, and manage personnel records all in one place.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  changed = true;
}

const target2 = `<h3 className="text-sm font-bold text-gray-800 dark:text-white">Attendance Trend</h3>`;
const replacement2 = `<div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Attendance Trend</h3>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none">
                                            <Info size={14} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                        Visualizes the aggregate weekly attendance pattern of all teachers. Identify recurring days of high absenteeism or tardiness to optimize scheduling and substitute coverage.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  changed = true;
}

if (changed) {
  fs.writeFileSync(path, content);
  console.log('updated page.tsx');
} else {
  console.log('Target strings not found');
}
