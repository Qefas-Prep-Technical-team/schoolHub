const fs = require('fs');
const p = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/AttendanceTab.tsx';
let c = fs.readFileSync(p, 'utf8');

const tRegex = /<h2 className="text-gray-900 dark:text-white text-xl font-bold">\s*Class Attendance\s*<\/h2>/;

const r = `            <div className="flex items-center gap-2">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                Class Attendance
              </h2>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Tracks daily presence, absence, and late arrivals for this class. Use this register to identify chronic absenteeism or correlate poor attendance directly with declining academic performance.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>`;

if (c.match(tRegex)) {
  c = c.replace(tRegex, r);
  fs.writeFileSync(p, c);
  console.log('done');
} else {
  console.log('target not found');
}
