const fs = require('fs');
const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/subdomain/page.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('TooltipProvider')) {
  content = content.replace(/from "lucide-react";/, 'from "lucide-react";\nimport { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";\nimport { Info } from "lucide-react";');
}

const target = /<h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">Visual Page Builder<\/h1>/;
const replacement = `<div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">Visual Page Builder</h1>
                <TooltipProvider>
                  <UITooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none mt-0.5">
                        <Info size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                      Customize your school's public-facing landing page. Update your hero banner, highlight core features, manage testimonials, and apply design templates to reflect your brand identity.
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>`;

if (content.match(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Subdomain page updated');
} else {
    console.log('Target string not found');
}
