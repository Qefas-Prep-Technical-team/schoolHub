/* eslint-disable @typescript-eslint/no-explicit-any */

export const isClassLink = (type: string) => type === 'STUDENT_CLASS' || type === 'TEACHER_CLASS';

export const getMemberDetails = (item: any, currentUserId?: string) => {
  // Handling both LinkRequest and RelationshipLink
  const req = item.approvedFromRequest || item;
  
  // Robust person identification
  const person = 
    req.requesterTeacher || req.targetTeacher ||
    req.requesterStudent || req.targetStudent ||
    req.requesterParent || req.targetParent ||
    req.requesterAdmin || req.approverAdmin ||
    req.sender || req.receiver;

  const school = req.targetSchool || req.requesterSchool;

  const className = req.class ? (req.class.name + (req.class.section ? ` - ${req.class.section}` : '')) : undefined;
  
  // Determine peer identification (for logic where we need to know the 'other' side)
  const isLeft = item.leftEntityId === currentUserId;
  const peerCode = isLeft ? item.rightCode : item.leftCode;
  const requestCode = (req.requesterId === currentUserId) ? (req.targetCode || item.targetCode) : (req.requesterCode || item.requesterCode);

  const bestCode = peerCode || requestCode || '---';

  if (person) {
    return {
      name: person.name || person.fullName || person.username || bestCode || 'Verified Member',
      email: person.email || 'No Email',
      className: className,
      code: person.teacherCode || person.studentCode || person.parentCode || person.adminCode || bestCode
    };
  }

  if (school) {
    return {
      name: school.name || 'Unknown School',
      email: school.schoolEmail || 'School Entity',
      className: undefined,
      code: school.schoolCode || bestCode
    };
  }

  if (req.class) {
    return {
      name: className || 'Unknown Class',
      email: 'Classroom Entity',
      className: undefined,
      code: req.class.classCode || bestCode
    };
  }
  
  return {
    name: item.peerName || bestCode || 'Linked Member',
    email: item.peerEmail || 'No Email',
    code: bestCode
  };
};
