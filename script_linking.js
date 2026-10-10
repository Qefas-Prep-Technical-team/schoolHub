const fs = require('fs');
const path1 = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/LinkingHeader.tsx';
const path2 = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/LinkingStats.tsx';

let content1 = fs.readFileSync(path1, 'utf8');
if (!content1.includes('TooltipProvider')) {
  content1 = content1.replace(/from 'lucide-react';/, "from 'lucide-react';\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';\nimport { Info } from 'lucide-react';");
}

const headerTarget = /<h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">\s*Linking Hub\s*<\/h1>/;
const headerReplacement = `<div className="flex items-center gap-3">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
            Linking Hub
          </h1>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button type="button" className="text-gray-400 hover:text-primary transition-colors focus:outline-none mb-2">
                  <Info size={24} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                Centralized hub for managing school network connections. Track active parent-student-teacher links, review pending connection requests, and access your school's unique QR codes for easy onboarding.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>`;
if(content1.match(headerTarget)) {
    content1 = content1.replace(headerTarget, headerReplacement);
    fs.writeFileSync(path1, content1);
    console.log('LinkingHeader updated');
}

let content2 = fs.readFileSync(path2, 'utf8');
if (!content2.includes('TooltipProvider')) {
  content2 = content2.replace(/from 'lucide-react';/, "from 'lucide-react';\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';\nimport { Info } from 'lucide-react';");
}

// Active Connections Tooltip
content2 = content2.replace(
    /<p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Active Connections<\/p>/,
    `<div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Connections</p>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-400 hover:text-blue-500 focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  Total number of verified network links currently established between parents, students, and teachers.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>`
);

// Pending Requests Tooltip
content2 = content2.replace(
    /<p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Pending Requests<\/p>/,
    `<div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Requests</p>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-400 hover:text-primary focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  Unprocessed connection requests awaiting administrative approval or rejection.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>`
);

// All Students (Usage) Tooltip
content2 = content2.replace(
    /<p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">All Students<\/p>/,
    `<div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">All Students</p>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-400 hover:text-purple-500 focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  Total student seat utilization relative to your active subscription plan limit.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>`
);

fs.writeFileSync(path2, content2);
console.log('LinkingStats updated');
