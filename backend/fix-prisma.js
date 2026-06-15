const fs = require('fs');
const content = fs.readFileSync('prisma/schema.prisma');
const clean = Buffer.alloc(content.length);
let j = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] !== 0) {
    clean[j++] = content[i];
  }
}
fs.writeFileSync('prisma/schema.prisma', clean.slice(0, j));
console.log('Fixed schema.prisma');
