const fs = require('fs');
const schemaPath = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/backend/prisma/schema.prisma';
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Remove url from datasource to fix Prisma 7 compatibility
content = content.replace(/datasource db \{[\s\S]*?url\s+=.*?\r?\n\}/, 'datasource db {\n  provider = "postgresql"\n}');

// 2. Add trial fields to specified models
const trialFields = `
  // Trial details
  trialUsed      Boolean   @default(false)
  trialPlan      String?
  trialEndsAt    DateTime?
  isTrialActive  Boolean   @default(false)
`;

const models = ['School', 'Teacher', 'Student', 'Parent'];

models.forEach(model => {
    // We match the model and look for the last field before the closing brace or after lastPaymentDate
    // Using a more robust regex that looks for the model block
    const modelRegex = new RegExp(`model ${model} \\{([\\s\\S]*?)\\}`, 'g');
    
    content = content.replace(modelRegex, (match, body) => {
        if (body.includes('trialUsed')) return match; // Already updated
        
        // Find a good place to insert - ideally after lastPaymentDate or at the end of the fields
        if (body.includes('lastPaymentDate')) {
            return match.replace(/(lastPaymentDate\s+DateTime\?)/, `$1${trialFields}`);
        } else {
            // Fallback: insert before the closing brace
            return match.replace(/\}$/, `${trialFields}\n}`);
        }
    });
    console.log(`Processed model ${model}`);
});

fs.writeFileSync(schemaPath, content);
console.log('Schema updated successfully');
