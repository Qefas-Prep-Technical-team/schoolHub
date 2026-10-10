const fs = require('fs');
const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/sessions/page.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('TooltipProvider')) {
  content = content.replace(/import { Button } from "@\/components\/ui\/button";/, "import { Button } from \"@/components/ui/button\";\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';\nimport { Info } from 'lucide-react';");
}

const headerTarget = /<h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">\s*Academic Sessions\s*<\/h1>/;
const headerReplacement = `<div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Academic Sessions
              </h1>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                    Configure the global academic timeline for your school. Define session dates, segment them into active terms, and securely archive past years to preserve historical data.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>`;

if(content.match(headerTarget)) {
    content = content.replace(headerTarget, headerReplacement);
}

const newSessionTarget = /<h2 className="text-base font-bold text-slate-900 dark:text-white">\s*New Session\s*<\/h2>/;
const newSessionReplacement = `<div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      New Session
                    </h2>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                            <Info size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                          Create a new academic year schema. You can define exact start and end dates and provision exact dates for First, Second, and Third terms.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>`;

if(content.match(newSessionTarget)) {
    content = content.replace(newSessionTarget, newSessionReplacement);
}

fs.writeFileSync(path, content);
console.log('Sessions page updated');
