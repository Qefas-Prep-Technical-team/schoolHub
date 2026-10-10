const fs = require('fs');

const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/invitations/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('TooltipProvider')) {
  content = content.replace(/from "lucide-react";/, 'from "lucide-react";\nimport { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";');
  if (!content.includes('Info,')) {
    content = content.replace(/List, LayoutGrid \} from "lucide-react";/, 'List, LayoutGrid, Info } from "lucide-react";');
  }
}

const targetRegex = /<h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">\s*Invitations\s*<\/h1>/;

const replacement = `<div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Invitations
                </h1>
                <TooltipProvider>
                  <UITooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none mt-1">
                        <Info size={20} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                      Manage pending onboarding flows. Here you can generate secure invite links, track account claiming status, and verify newly registered students and faculty.
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>`;

if (content.match(targetRegex)) {
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync(path, content);
  console.log('updated invitations page');
} else {
  console.log('Target string not found');
}
