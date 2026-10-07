const fs = require('fs');

const classesFile = 'c:\\Users\\HP\\Documents\\GitHub\\Qefas Project\\schoolHub\\frontend\\src\\app\\dashboard\\admin\\classes\\page.tsx';
let classesContent = fs.readFileSync(classesFile, 'utf8');

const regexClasses = /const contactParts = \[\];[\s\S]*?yPos = 65;/;
const replacementClasses = `const contactParts = [];
                    if (schoolProfile?.address) contactParts.push(\`📍 \${schoolProfile.address}\`);
                    if (schoolProfile?.contactPhone) contactParts.push(\`📞 \${schoolProfile.contactPhone}\`);
                    if (schoolProfile?.contactEmail) contactParts.push(\`✉️ \${schoolProfile.contactEmail}\`);
                    
                    let contactY = 30;
                    if (schoolProfile?.motto) contactY = 34; // Push down if motto exists
                    
                    if (contactParts.length > 0) {
                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(100, 116, 139);
                        
                        // We use the same x-offset logic (18+w if logo, 14 if no logo)
                        const isLogo = !!schoolProfile?.logo;
                        // Approximate w based on a 16mm height, if logo exists we don't have w here, so just use a safe offset
                        const leftOffset = isLogo ? 38 : 14; 
                        doc.text(contactParts.join('   •   '), leftOffset, contactY);
                    }

                    yPos = 48; // Tighter space before report title`;

classesContent = classesContent.replace(regexClasses, replacementClasses);
fs.writeFileSync(classesFile, classesContent, 'utf8');

const subjectsFile = 'c:\\Users\\HP\\Documents\\GitHub\\Qefas Project\\schoolHub\\frontend\\src\\app\\dashboard\\admin\\subjects\\page.tsx';
let subjectsContent = fs.readFileSync(subjectsFile, 'utf8');

subjectsContent = subjectsContent.replace(regexClasses, replacementClasses);
fs.writeFileSync(subjectsFile, subjectsContent, 'utf8');

console.log("Replaced spacing successfully!");
