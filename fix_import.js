const fs = require('fs');
const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/classes/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('Info,')) {
    content = content.replace('Layers,', 'Layers,\n    Info,');
}

fs.writeFileSync(path, content);
console.log('Successfully fixed Info import');
