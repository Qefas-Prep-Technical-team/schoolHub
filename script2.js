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

  for (const [target, replacement] of replacements) {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(path, content);
    console.log(`Updated ${path}`);
  }
};

// 1. DashboardCharts.tsx
runReplacements('c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/components/dashboard/DashboardCharts.tsx', [
  [
    `<h3 className="text-base font-semibold text-slate-800 dark:text-white">Student Attendance Overview</h3>`,
    `<div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">Student Attendance Overview</h3>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                        <Info size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Visualizes daily attendance patterns across the school over recent weeks. Use this to quickly spot downward trends or anomalies in student turnout.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`
  ],
  [
    `<h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Performance Insights</h3>`,
    `<div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Performance Insights</h3>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                        <Info size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Analyzes current academic data to surface automated, data-driven recommendations and predictions regarding school-wide educational health.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`
  ],
  [
    `<h3 className="text-base font-semibold text-slate-800 dark:text-white">Academic Performance</h3>`,
    `<div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">Academic Performance</h3>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                        <Info size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Maps the aggregate trajectory of average assessment scores across all subjects and grades. A consistent drop may point to systemic issues in recent curriculum delivery.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>`
  ]
]);

// 2. ExamStatus.tsx
runReplacements('c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/components/dashboard/ExamStatus.tsx', [
  [
    `<h3 className="text-base font-bold text-slate-900 dark:text-white">Exam Overview</h3>`,
    `<div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Exam Overview</h3>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                <Info size={16} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                            Displays the operational status of upcoming and ongoing major examinations across the institution. Use this to track critical assessment periods and ensure preparations are on schedule.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>`
  ]
]);

// 3. StaffInsights.tsx
runReplacements('c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/components/dashboard/StaffInsights.tsx', [
  [
    `<h3 className="text-base font-bold text-slate-900 dark:text-white">Staff Insights</h3>`,
    `<div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Staff Insights</h3>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                <Info size={16} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                            Aggregates attendance metrics for all faculty members. High absence or lateness rates here may require administrative attention to maintain consistent classroom coverage.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>`
  ]
]);

// 4. AlertsPanel.tsx
runReplacements('c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/components/dashboard/AlertsPanel.tsx', [
  [
    `<h3 className="text-base font-bold text-slate-900 dark:text-white">System Alerts</h3>`,
    `<div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">System Alerts</h3>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                <Info size={16} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                            Highlights urgent notifications, missed submissions, or operational anomalies requiring your immediate administrative review.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>`
  ]
]);

// 5. RecentActivity.tsx
runReplacements('c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/components/dashboard/RecentActivity.tsx', [
  [
    `<h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity Log</h3>`,
    `<div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity Log</h3>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                                <Info size={16} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                            Provides a chronological timeline of recent system updates, data modifications, and staff actions. Use this log to trace operational events and audit administrative changes.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>`
  ]
]);

// 6. UsageLimitsCard.tsx
runReplacements('c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/components/subscription/UsageLimitsCard.tsx', [
  [
    `<h3 className="font-semibold text-slate-900 dark:text-white">Platform Usage</h3>`,
    `<div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">Platform Usage</h3>
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                            <Info size={16} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                        Monitors current utilization against your subscription plan's limits. Keep an eye on these quotas to avoid sudden disruptions in new student enrollments or feature access.
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>`
  ]
]);
