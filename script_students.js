const fs = require('fs');
const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/students/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('TooltipProvider')) {
  content = content.replace(/from "framer-motion";/, 'from "framer-motion";\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";\nimport { Info } from "lucide-react";');
}

// 1. Update main header
content = content.replace(
  /<h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Overview<\/h1>/,
  `<div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Overview</h1>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Comprehensive student directory. Manage individual student records, track status updates, and filter down by class, department, or gender.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>`
);

// 2. Update stats array
const oldStatsRegex = /const stats = \[\s*\{\s*label: "Total Students",\s*value: studentStats\?\.total \?\? 0,\s*icon: GraduationCap,\s*iconBg: "#ede9fe",\s*iconColor: "#7c3aed",\s*note: "vs last year",\s*\},\s*\{\s*label: "Active Students",\s*value: studentStats\?\.verifiedCount \?\? 0,\s*icon: ShieldCheck,\s*iconBg: "#d1fae5",\s*iconColor: "#059669",\s*note: "vs last semester",\s*\},\s*\{\s*label: "On Leave",\s*value: studentStats\?\.pendingCount \?\? 0,\s*icon: Zap,\s*iconBg: "#fef3c7",\s*iconColor: "#d97706",\s*note: "This Semester",\s*\},\s*\{\s*label: "Avg Attendance",\s*value: \`\$\{attendanceRate \?\? 0\}%\`,\s*icon: Activity,\s*iconBg: "#dbeafe",\s*iconColor: "#2563eb",\s*note: "This Semester",\s*\},\s*\];/s;

const newStats = `const stats = [
    {
      label: "Total Students",
      value: studentStats?.total ?? 0,
      icon: GraduationCap,
      iconBg: "#ede9fe",
      iconColor: "#7c3aed",
      note: "vs last year",
      tooltip: "The cumulative count of all enrolled students in the database, including both active and pending accounts.",
    },
    {
      label: "Active Students",
      value: studentStats?.verifiedCount ?? 0,
      icon: ShieldCheck,
      iconBg: "#d1fae5",
      iconColor: "#059669",
      note: "vs last semester",
      tooltip: "Students who have completed the onboarding process and possess verified platform credentials.",
    },
    {
      label: "On Leave",
      value: studentStats?.pendingCount ?? 0,
      icon: Zap,
      iconBg: "#fef3c7",
      iconColor: "#d97706",
      note: "This Semester",
      tooltip: "Students marked as pending or temporarily absent from active classroom participation.",
    },
    {
      label: "Avg Attendance",
      value: \`\${attendanceRate ?? 0}%\`,
      icon: Activity,
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      note: "This Semester",
      tooltip: "The overall average attendance rate calculated from today's active roll calls across all classes.",
    },
  ];`;

content = content.replace(oldStatsRegex, newStats);

// 3. Update stat rendering
const oldCardRender = /<div className="flex items-center justify-between mb-3">\s*<span className="text-xs font-medium text-gray-500 dark:text-gray-400">\{stat\.label\}<\/span>\s*<div\s*className="size-8 rounded-lg flex items-center justify-center shrink-0"\s*style=\{\{ backgroundColor: stat\.iconBg, color: stat\.iconColor \}\}\s*>\s*<stat\.icon size=\{15\} \/>\s*<\/div>\s*<\/div>/s;

const newCardRender = `<div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                  {stat.tooltip && (
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                            <Info size={12} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                          {stat.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div
                  className="size-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
                >
                  <stat.icon size={15} />
                </div>
              </div>`;

content = content.replace(oldCardRender, newCardRender);

fs.writeFileSync(path, content);
console.log('updated students page');
