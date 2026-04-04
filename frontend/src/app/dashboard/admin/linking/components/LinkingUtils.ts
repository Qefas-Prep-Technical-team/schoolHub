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
  
  // Determine identification codes
  const peerCode = item.leftEntityId === currentUserId ? item.rightCode : item.leftCode;
  const requestCode = (req.requesterId === currentUserId) ? (req.targetCode || item.targetCode) : (req.requesterCode || item.requesterCode);
  
  // If the viewer is an Admin but NOT a participant in the link, 
  // both leftCode and rightCode are informative. We pick the non-School code if possible.
  let adminObservedCode = item.leftCode !== currentUserId && item.rightCode !== currentUserId ? (item.leftCode || item.rightCode) : undefined;
  
  // For requests, if Admin is observing
  if (!adminObservedCode && req.requesterId !== currentUserId && req.targetId !== currentUserId) {
    adminObservedCode = req.requesterCode || req.targetCode || item.requesterCode || item.targetCode;
  }

  const bestCode = adminObservedCode || peerCode || requestCode || '---';

  if (person) {
    return {
      name: person.name || person.fullName || person.username || bestCode || 'Verified Member',
      email: person.email || 'No Email',
      className: className,
      code: person.teacherCode || person.studentCode || person.parentCode || person.adminCode || bestCode,
      image: person.profileImage || person.avatar
    };
  }

  if (school) {
    return {
      name: school.name || 'Unknown School',
      email: school.schoolEmail || 'School Entity',
      className: undefined,
      code: school.schoolCode || bestCode,
      image: school.logo
    };
  }

  if (req.class) {
    return {
      name: className || 'Unknown Class',
      email: 'Classroom Entity',
      className: undefined,
      code: req.class.classCode || bestCode,
      image: undefined
    };
  }
  
  return {
    name: item.peerName || bestCode || 'Linked Member',
    email: item.peerEmail || 'No Email',
    code: bestCode,
    image: item.peerImage
  };
};
