/* eslint-disable @typescript-eslint/no-explicit-any */

export const isClassLink = (type: string) => type === 'STUDENT_CLASS' || type === 'TEACHER_CLASS';

export const getMemberDetails = (item: any, currentUserId?: string) => {
  // Handling both LinkRequest and RelationshipLink
  const req = item.approvedFromRequest || item;
  
  const person = 
    req.requesterTeacher || req.targetTeacher ||
    req.requesterStudent || req.targetStudent ||
    req.requesterParent || req.targetParent ||
    req.requesterAdmin || req.approverAdmin ||
    req.sender || req.receiver;

  const className = req.class ? (req.class.name + (req.class.section ? ` - ${req.class.section}` : '')) : undefined;

  if (person) {
    return {
      name: person.name || person.fullName || 'Unknown Member',
      email: person.email || 'No Email',
      className: className,
      code: person.teacherCode || person.studentCode || person.parentCode || person.adminCode || 
            item.peerCode || (item.leftEntityId === currentUserId ? item.rightCode : item.leftCode) || 'No Code'
    };
  }

  if (req.class) {
    return {
      name: className || 'Unknown Class',
      email: 'Classroom Entity',
      className: undefined,
      code: req.class.classCode
    };
  }
  
  return {
    name: item.peerName || 'Linked Member',
    email: item.peerEmail || 'No Email',
    code: item.peerCode || (item.leftEntityId === currentUserId ? item.rightCode : item.leftCode) || 'No Code'
  };
};
