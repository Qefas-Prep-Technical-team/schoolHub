const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/dashboard/teacher/records/preview/page.tsx', 'utf8');
c = c.replace(/\{isEditing \? \(\s*<input[\s\S]*?\)\s*:\s*\(\s*(<button[\s\S]*?<\/button>)\s*\)\s*\}/g, '$1');
c = c.replace(/const isEditing = editingIds\.has\(student\.id\);/g, '');
c = c.replace(/<td className="px-4 py-4">\s*<div className="flex items-center justify-center gap-2">\s*<button[\s\S]*?<svg[\s\S]*?<\/svg>\s*<\/button>\s*<\/div>\s*<\/td>/g, '');
fs.writeFileSync('frontend/src/app/dashboard/teacher/records/preview/page.tsx', c);
console.log('done');
