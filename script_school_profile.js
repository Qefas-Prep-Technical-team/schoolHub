const fs = require('fs');

const runReplacements = (path, replacements) => {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  let changed = false;

  // Add imports if missing
  if (!content.includes('TooltipProvider')) {
    content = content.replace(/from 'lucide-react';/, "from 'lucide-react';\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';");
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

runReplacements('c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/school-profile/page.tsx', [
  [
    `<h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">About Institution</h2>`,
    `<div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">About Institution</h2>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Displays your official institutional mission and description. This information represents your school's public identity across the system.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>`
  ],
  [
    `<h2 className="text-base font-semibold text-slate-800 dark:text-white">Leadership Protocol</h2>`,
    `<div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-800 dark:text-white">Leadership Protocol</h2>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                          <Info size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                        Lists key administrative personnel and their delegated access levels. Ensure only authorized staff members hold top-tier roles here.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>`
  ],
  [
    `<h2 className="text-base font-semibold text-slate-800 dark:text-white mb-6">Digital Capabilities</h2>`,
    `<div className="flex items-center gap-2 mb-6">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">Digital Capabilities</h2>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Highlights your system credentials and authorized feature access tier. Upgrading your plan will unlock additional capabilities here.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>`
  ],
  [
    `<h2 className="text-base font-semibold text-slate-800 dark:text-white">Governance & Social</h2>`,
    `<div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-800 dark:text-white">Governance & Social</h2>
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                              <Info size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                            Consolidates core foundational details, such as the principal and institutional categorization, along with your official social media channels.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>`
  ],
  [
    `<h2 className="text-base font-semibold text-slate-800 dark:text-white">Academic Levels</h2>`,
    `<div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-800 dark:text-white">Academic Levels</h2>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                          <Info size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                        Displays the overarching grade frameworks applied across your school (e.g., Junior Secondary, Senior Secondary). These dictate class formations.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>`
  ],
  [
    `<h2 className="text-base font-semibold text-slate-800 dark:text-white">Grading System Configuration</h2>`,
    `<div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-800 dark:text-white">Grading System Configuration</h2>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                          <Info size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                        Defines the standardized assessment thresholds applied to student scores institution-wide. It ensures consistent evaluation matrices.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>`
  ],
  [
    `<h2 className="text-base font-semibold text-slate-800 dark:text-white mb-6">Connectivity</h2>`,
    `<div className="flex items-center gap-2 mb-6">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">Connectivity</h2>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Centralizes essential communication nodes—email, phone lines, and physical coordinates—facilitating parent and staff outreach.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>`
  ],
  [
    `<h2 className="text-base font-semibold text-slate-800 dark:text-white mb-6">Institutional Stats</h2>`,
    `<div className="flex items-center gap-2 mb-6">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">Institutional Stats</h2>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Quickly audits key performance indicators and validation statuses that reflect the administrative health of the institution.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>`
  ]
]);
