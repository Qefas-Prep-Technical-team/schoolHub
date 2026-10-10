const fs = require('fs');
const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/(auth)/onboarding/page.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/sm:w-48 h-32/g, 'sm:w-60 h-40');

const regex = /(<div className="flex-1 space-y-2">[\s\S]*?<\/div>)\s*(<PreviewableImage[^>]+>)/g;
c = c.replace(regex, '$2\n                    $1');

fs.writeFileSync(path, c);
console.log('done');
