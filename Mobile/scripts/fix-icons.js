const fs = require('fs');

function fixIcons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace className with explicit color or remove if not needed
  // <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" /> => <ArrowLeft size={20} color="#334155" />
  
  // Actually a simpler regex is just to remove className from lucide icons.
  // The icons use 'currentColor' by default, or we can just leave them if they don't have color.
  
  const iconNames = ['ArrowLeft', 'Clock', 'CheckCircle', 'CheckCircle2', 'Eye', 'FileText', 'PlayCircle', 'BarChart2', 'XCircle', 'AlertCircle', 'HelpCircle'];
  
  iconNames.forEach(icon => {
    const regex = new RegExp(`<${icon}\\s+([^>]*?)className="([^"]+)"([^>]*?)>`, 'g');
    content = content.replace(regex, (match, p1, p2, p3) => {
      let extra = '';
      if (p2.includes('text-emerald-')) extra = 'color="#10b981" ';
      else if (p2.includes('text-rose-')) extra = 'color="#f43f5e" ';
      else if (p2.includes('text-amber-')) extra = 'color="#f59e0b" ';
      else if (p2.includes('text-blue-')) extra = 'color="#3b82f6" ';
      else if (p2.includes('text-slate-700')) extra = 'color="#334155" ';
      else if (p2.includes('text-slate-500')) extra = 'color="#64748b" ';
      else if (p2.includes('text-slate-400')) extra = 'color="#94a3b8" ';
      else if (p2.includes('text-slate-300')) extra = 'color="#cbd5e1" ';
      else if (p2.includes('text-indigo-')) extra = 'color="#4f46e5" ';
      
      let styleStr = '';
      if (p2.includes('mr-1')) styleStr = 'style={{ marginRight: 4 }} ';
      if (p2.includes('mr-2')) styleStr = 'style={{ marginRight: 8 }} ';
      if (p2.includes('mr-3')) styleStr = 'style={{ marginRight: 12 }} ';
      if (p2.includes('mb-3')) styleStr = 'style={{ marginBottom: 12 }} ';
      if (p2.includes('mb-4')) styleStr = 'style={{ marginBottom: 16 }} ';
      
      // Remove any existing color="" if we are adding one
      let newP1 = p1;
      let newP3 = p3;
      if (extra) {
        newP1 = newP1.replace(/color="[^"]+"\s*/g, '');
        newP3 = newP3.replace(/color="[^"]+"\s*/g, '');
      }

      return `<${icon} ${newP1}${extra}${styleStr}${newP3}>`;
    });
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

fixIcons('c:/Users/Student/Documents/GitHub/schoolHub/Mobile/app/exams/[id].tsx');
fixIcons('c:/Users/Student/Documents/GitHub/schoolHub/Mobile/app/exams/[id]/review.tsx');
