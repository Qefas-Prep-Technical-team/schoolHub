const fs = require('fs');

// CLASSES
const classesFile = 'c:\\Users\\HP\\Documents\\GitHub\\Qefas Project\\schoolHub\\frontend\\src\\app\\dashboard\\admin\\classes\\page.tsx';
let classesContent = fs.readFileSync(classesFile, 'utf8');

const classesRegex = /const commonTableStyles = \{[\s\S]*?styles: \{ fontSize: 9, cellPadding: 5, lineColor: \[226, 232, 240\], lineWidth: 0\.1, font: 'helvetica' \}\n\s*\};/;
const classesReplacement = `const commonTableStyles = {
                        theme: 'grid',
                        headStyles: { fillColor: [255, 255, 255], textColor: [220, 20, 20], fontStyle: 'bold', halign: 'left', cellPadding: 6 },
                        bodyStyles: { textColor: [30, 30, 30], fontStyle: 'bold' },
                        alternateRowStyles: { fillColor: [255, 255, 255] },
                        styles: { fontSize: 9, cellPadding: 5, lineColor: [200, 220, 255], lineWidth: 0.5, font: 'helvetica' }
                    };`;

classesContent = classesContent.replace(classesRegex, classesReplacement);
fs.writeFileSync(classesFile, classesContent, 'utf8');

// SUBJECTS
const subjectsFile = 'c:\\Users\\HP\\Documents\\GitHub\\Qefas Project\\schoolHub\\frontend\\src\\app\\dashboard\\admin\\subjects\\page.tsx';
let subjectsContent = fs.readFileSync(subjectsFile, 'utf8');

const subjectsRegex = /theme: 'plain',\n\s*headStyles: \{ fillColor: \[241, 245, 249\], textColor: \[15, 23, 42\], fontStyle: 'bold', halign: 'left', cellPadding: 6 \},\n\s*bodyStyles: \{ textColor: \[51, 65, 85\] \},\n\s*alternateRowStyles: \{ fillColor: \[248, 250, 252\] \},\n\s*styles: \{ fontSize: 9, cellPadding: 5, lineColor: \[226, 232, 240\], lineWidth: 0\.1, font: 'helvetica' \}/;
const subjectsReplacement = `theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [220, 20, 20], fontStyle: 'bold', halign: 'left', cellPadding: 6 },
        bodyStyles: { textColor: [30, 30, 30], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 5, lineColor: [200, 220, 255], lineWidth: 0.5, font: 'helvetica' }`;

subjectsContent = subjectsContent.replace(subjectsRegex, subjectsReplacement);
fs.writeFileSync(subjectsFile, subjectsContent, 'utf8');

console.log("Replaced table styles successfully!");
