const fs = require('fs');
const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/LinkingCodeCards.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('TooltipProvider')) {
  content = content.replace(/import { Button } from "@\/components\/ui\/button";/, "import { Button } from \"@/components/ui/button\";\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';\nimport { Info } from 'lucide-react';");
}

// Update Personal Code card
content = content.replace(
    /<p className="text-\[10px\] font-bold text-slate-500 uppercase tracking-widest">Admin Code<\/p>/,
    `<div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Code</p>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-primary focus:outline-none">
                          <Info size={12} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                        Your secure, personal administrative linking code. Share this exclusively with staff members who need direct administrative permissions or oversight connections to your profile.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>`
);

// Update School Code card
content = content.replace(
    /<p className="text-\[10px\] font-bold text-slate-500 uppercase tracking-widest">General Code<\/p>/,
    `<div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">General Code</p>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                            <Info size={12} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                          The public pairing code for your institution. Share this broadly with parents and students so they can correctly associate their personal accounts with your school network.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>`
);

fs.writeFileSync(path, content);
console.log('LinkingCodeCards updated');
