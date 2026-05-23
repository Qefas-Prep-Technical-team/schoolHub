import { Prisma } from '@prisma/client';

console.log(Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === 'attendance')?.fields.map(f => `${f.name}: ${f.type}`));
