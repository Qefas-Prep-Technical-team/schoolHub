const fs = require("fs");
const file = "c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/subjects/page.tsx";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  "  Edit2\n} from \"lucide-react\";\nimport SubjectCard from \"./components/SubjectCard\";",
  "  Edit2,\n  Info\n} from \"lucide-react\";\nimport { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from \"@/components/ui/tooltip\";\nimport SubjectCard from \"./components/SubjectCard\";"
);

c = c.replace(
  "              <h1 className=\"text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]\">\n                Subjects<span style={{ color: primaryColor }}>.</span>\n              </h1>",
  "              <div className=\"flex items-center gap-3\">\n                <h1 className=\"text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]\">\n                  Subjects<span style={{ color: primaryColor }}>.</span>\n                </h1>\n                <TooltipProvider>\n                    <Tooltip delayDuration={300}>\n                        <TooltipTrigger asChild>\n                            <button type=\"button\" className=\"text-slate-400 hover:text-blue-500 focus:outline-none mt-2\">\n                                <Info size={28} strokeWidth={2.5} />\n                            </button>\n                        </TooltipTrigger>\n                        <TooltipContent side=\"right\" className=\"max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl text-left\">\n                            Manage all academic subjects taught within the institution.\n                        </TooltipContent>\n                    </Tooltip>\n                </TooltipProvider>\n              </div>"
);

c = c.replace(
  "<p className=\"text-sm font-semibold text-slate-500 dark:text-slate-400\">Total Subjects</p>",
  "<div className=\"flex items-center gap-1.5\">\n                        <p className=\"text-sm font-semibold text-slate-500 dark:text-slate-400\">Total Subjects</p>\n                        <TooltipProvider>\n                            <Tooltip delayDuration={300}>\n                                <TooltipTrigger asChild>\n                                    <button type=\"button\" className=\"text-slate-400 hover:text-blue-500 focus:outline-none\">\n                                        <Info size={14} />\n                                    </button>\n                                </TooltipTrigger>\n                                <TooltipContent side=\"top\" className=\"max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl\">\n                                    Total number of subjects configured across the school.\n                                </TooltipContent>\n                            </Tooltip>\n                        </TooltipProvider>\n                    </div>"
);

c = c.replace(
  "<p className=\"text-sm font-semibold text-slate-500 dark:text-slate-400\">Active Departments</p>",
  "<div className=\"flex items-center gap-1.5\">\n                        <p className=\"text-sm font-semibold text-slate-500 dark:text-slate-400\">Active Departments</p>\n                        <TooltipProvider>\n                            <Tooltip delayDuration={300}>\n                                <TooltipTrigger asChild>\n                                    <button type=\"button\" className=\"text-slate-400 hover:text-blue-500 focus:outline-none\">\n                                        <Info size={14} />\n                                    </button>\n                                </TooltipTrigger>\n                                <TooltipContent side=\"top\" className=\"max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl\">\n                                    Number of functional academic departments currently active.\n                                </TooltipContent>\n                            </Tooltip>\n                        </TooltipProvider>\n                    </div>"
);

c = c.replace(
  "<p className=\"text-sm font-semibold text-slate-500 dark:text-slate-400\">System Status</p>",
  "<div className=\"flex items-center gap-1.5\">\n                        <p className=\"text-sm font-semibold text-slate-500 dark:text-slate-400\">System Status</p>\n                        <TooltipProvider>\n                            <Tooltip delayDuration={300}>\n                                <TooltipTrigger asChild>\n                                    <button type=\"button\" className=\"text-slate-400 hover:text-blue-500 focus:outline-none\">\n                                        <Info size={14} />\n                                    </button>\n                                </TooltipTrigger>\n                                <TooltipContent side=\"top\" className=\"max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl\">\n                                    Current status of the subject synchronization system.\n                                </TooltipContent>\n                            </Tooltip>\n                        </TooltipProvider>\n                    </div>"
);

fs.writeFileSync(file, c);
console.log("Replaced successfully");

