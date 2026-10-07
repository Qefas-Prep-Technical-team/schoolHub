const fs = require('fs');

const subjectsFile = 'c:\\Users\\HP\\Documents\\GitHub\\Qefas Project\\schoolHub\\frontend\\src\\app\\dashboard\\admin\\subjects\\page.tsx';
let subjectsContent = fs.readFileSync(subjectsFile, 'utf8');

const regex = /const html2pdf = \(await import\('html2pdf\.js'\)\)\.default;[\s\S]*?setIsExporting\(false\);\n    }\n  };/m;

const newSubjectsExportLogic = `const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      // Add Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(schoolProfile?.name || 'School Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      let yPos = 28;
      if (schoolProfile?.motto) {
          doc.text(\`"\${schoolProfile.motto}"\`, 105, yPos, { align: 'center' });
          yPos += 8;
      }
      
      const contactParts = [];
      if (schoolProfile?.address) contactParts.push(schoolProfile.address);
      if (schoolProfile?.contactPhone) contactParts.push(schoolProfile.contactPhone);
      if (schoolProfile?.contactEmail) contactParts.push(schoolProfile.contactEmail);
      if (contactParts.length > 0) {
          doc.text(contactParts.join(' | '), 105, yPos, { align: 'center' });
          yPos += 12;
      }

      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175); // Blue 800
      doc.text('Subjects Report', 105, yPos, { align: 'center' });
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(\`Generated on \${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\`, 105, yPos, { align: 'center' });
      yPos += 15;

      const tableData = filteredSubjects.map(sub => [
        sub.name,
        sub.code,
        sub.teachersCount || 0,
        sub.classesCount || 0,
        sub.scope === 'SCHOOL' ? 'School-wide' : 'Private',
        sub.description || 'No description provided.'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Subject Name', 'Code', 'Teachers', 'Classes', 'Scope', 'Description']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 }
      });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(\`Qefas Prep Hub © \${new Date().getFullYear()} - Comprehensive Curriculum Management Suite\`, 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      doc.save('School_Subjects_Report.pdf');
    } catch (error) {
      console.error('PDF Export failed:', error);
      toast.error('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };`;

subjectsContent = subjectsContent.replace(regex, newSubjectsExportLogic);
fs.writeFileSync(subjectsFile, subjectsContent, 'utf8');

console.log("Replaced successfully!");
