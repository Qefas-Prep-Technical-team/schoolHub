const fs = require('fs');

const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/teachers/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStats = `const stats = [
        { label: 'Total Teachers', value: teachersList.length, icon: Users, iconBg: '#ede9fe', iconColor: '#7c3aed', note: 'Registered faculty' },
        { label: 'Active Teachers', value: teachersList.filter(t => t.status === 'active').length, icon: ShieldCheck, iconBg: '#d1fae5', iconColor: '#059669', note: 'Verified accounts' },
        { label: 'Total Subjects', value: uniqueSubjects.size, icon: Activity, iconBg: '#dbeafe', iconColor: '#2563eb', note: 'Subjects covered' },
        { label: 'Pending', value: teachersList.filter(t => t.status === 'pending').length, icon: Zap, iconBg: '#fef3c7', iconColor: '#d97706', note: 'Awaiting verification' },
    ]`;

const replacementStats = `const stats = [
        { label: 'Total Teachers', value: teachersList.length, icon: Users, iconBg: '#ede9fe', iconColor: '#7c3aed', note: 'Registered faculty', tooltip: 'The total number of teacher accounts created on the platform, regardless of verification status.' },
        { label: 'Active Teachers', value: teachersList.filter(t => t.status === 'active').length, icon: ShieldCheck, iconBg: '#d1fae5', iconColor: '#059669', note: 'Verified accounts', tooltip: 'Teachers who have successfully claimed their accounts and verified their identities.' },
        { label: 'Total Subjects', value: uniqueSubjects.size, icon: Activity, iconBg: '#dbeafe', iconColor: '#2563eb', note: 'Subjects covered', tooltip: 'The unique count of academic subjects currently assigned to the active teaching staff.' },
        { label: 'Pending', value: teachersList.filter(t => t.status === 'pending').length, icon: Zap, iconBg: '#fef3c7', iconColor: '#d97706', note: 'Awaiting verification', tooltip: 'Teacher accounts that have been invited but have not yet completed the claiming and verification process.' },
    ]`;

const targetRender = `<div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                                <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}>
                                    <stat.icon size={15} />
                                </div>
                            </div>`;

const replacementRender = `<div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                                    {stat.tooltip && (
                                        <TooltipProvider>
                                            <UITooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <button type="button" className="text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none">
                                                        <Info size={12} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                                    {stat.tooltip}
                                                </TooltipContent>
                                            </UITooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}>
                                    <stat.icon size={15} />
                                </div>
                            </div>`;

if (content.includes(targetStats) && content.includes(targetRender)) {
  content = content.replace(targetStats, replacementStats);
  content = content.replace(targetRender, replacementRender);
  fs.writeFileSync(path, content);
  console.log('updated cards');
} else {
  console.log('Could not find target strings for cards');
}
