const fs = require('fs');

const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/team/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('TooltipProvider')) {
  content = content.replace(/from "lucide-react"/, 'from "lucide-react"\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"');
  if (!content.includes('Info,')) {
    content = content.replace(/Search \} from "lucide-react"/, 'Search, Info } from "lucide-react"');
  }
}

const targetRegex = /<h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">\s*Admin Team\s*<\/h1>/;

const replacement = `<div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Admin Team
                                </h1>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none mt-1">
                                                <Info size={20} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                            Central hub for managing institutional access rights. Regulate active system operators, assign administrative roles, and carefully review pending staff authorization requests.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>`;

if (content.match(targetRegex)) {
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync(path, content);
  console.log('updated page.tsx');
} else {
  console.log('Target string not found');
}
