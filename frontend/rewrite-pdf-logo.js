const fs = require('fs');

const classesFile = 'c:\\Users\\HP\\Documents\\GitHub\\Qefas Project\\schoolHub\\frontend\\src\\app\\dashboard\\admin\\classes\\page.tsx';
let content = fs.readFileSync(classesFile, 'utf8');

const regexClasses = /const doc = new jsPDF\(\{ orientation: 'portrait', unit: 'mm', format: 'a4' \}\);\s*\/\/ Add Header\s*doc\.setFontSize\(22\);\s*doc\.setTextColor\(15, 23, 42\);\s*\/\/ Slate 900\s*doc\.text\(schoolProfile\?\.name \|\| 'School Report', 105, 20, \{ align: 'center' \}\);\s*doc\.setFontSize\(10\);\s*doc\.setTextColor\(100, 116, 139\);\s*\/\/ Slate 500\s*let yPos = 28;/;

const replacementClasses = `const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    
                    let yPos = 15;
                    // Add Header Logo
                    if (schoolProfile?.logo) {
                        try {
                            const img = new Image();
                            img.crossOrigin = 'Anonymous';
                            img.src = schoolProfile.logo;
                            await new Promise((resolve, reject) => {
                                img.onload = resolve;
                                img.onerror = reject;
                            });
                            
                            const maxH = 15;
                            const ratio = img.width / img.height;
                            const w = maxH * ratio;
                            
                            doc.addImage(img, 'PNG', 105 - (w / 2), yPos, w, maxH);
                            yPos += maxH + 8;
                        } catch (e) {
                            console.error("Failed to load school logo for PDF", e);
                        }
                    }

                    // Add Header
                    doc.setFontSize(22);
                    doc.setTextColor(15, 23, 42); // Slate 900
                    doc.text(schoolProfile?.name || 'School Report', 105, yPos, { align: 'center' });
                    yPos += 8;
                    
                    doc.setFontSize(10);
                    doc.setTextColor(100, 116, 139); // Slate 500`;

content = content.replace(regexClasses, replacementClasses);
fs.writeFileSync(classesFile, content, 'utf8');


const subjectsFile = 'c:\\Users\\HP\\Documents\\GitHub\\Qefas Project\\schoolHub\\frontend\\src\\app\\dashboard\\admin\\subjects\\page.tsx';
let subjectsContent = fs.readFileSync(subjectsFile, 'utf8');

const regexSubjects = /const doc = new jsPDF\(\{ orientation: 'portrait', unit: 'mm', format: 'a4' \}\);\s*\/\/ Add Header\s*doc\.setFontSize\(22\);\s*doc\.setTextColor\(15, 23, 42\);\s*\/\/ Slate 900\s*doc\.text\(schoolProfile\?\.name \|\| 'School Report', 105, 20, \{ align: 'center' \}\);\s*doc\.setFontSize\(10\);\s*doc\.setTextColor\(100, 116, 139\);\s*\/\/ Slate 500\s*let yPos = 28;/;

const replacementSubjects = `const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      let yPos = 15;
      // Add Header Logo
      if (schoolProfile?.logo) {
          try {
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              img.src = schoolProfile.logo;
              await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
              });
              
              const maxH = 15;
              const ratio = img.width / img.height;
              const w = maxH * ratio;
              
              doc.addImage(img, 'PNG', 105 - (w / 2), yPos, w, maxH);
              yPos += maxH + 8;
          } catch (e) {
              console.error("Failed to load school logo for PDF", e);
          }
      }

      // Add Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(schoolProfile?.name || 'School Report', 105, yPos, { align: 'center' });
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500`;

subjectsContent = subjectsContent.replace(regexSubjects, replacementSubjects);
fs.writeFileSync(subjectsFile, subjectsContent, 'utf8');

console.log("Replaced successfully!");
