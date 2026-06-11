/* eslint-disable @typescript-eslint/no-explicit-any */

export const isClassLink = (type: string) => type === 'STUDENT_CLASS' || type === 'TEACHER_CLASS';

/** Returns a full colour config for each link type, used to colour-code cards. */
export function getLinkTypeConfig(linkType: string) {
  switch (linkType) {
    case 'SCHOOL_TEACHER':
      return {
        label: 'Teacher',
        border: 'border-l-emerald-500',
        shadow: 'shadow-emerald-100/60 dark:shadow-emerald-900/20',
        badge: 'bg-emerald-500 text-white',
        avatar: 'bg-emerald-500',
        avatarGlow: 'bg-emerald-500',
        topBar: 'bg-emerald-500',
        code: 'text-emerald-600 dark:text-emerald-400',
        codeBox: 'bg-emerald-50/60 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/40',
        acceptBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
        noteBar: 'bg-emerald-300',
        hover: 'hover:text-emerald-500',
      };
    case 'SCHOOL_STUDENT':
      return {
        label: 'Student',
        border: 'border-l-blue-500',
        shadow: 'shadow-blue-100/60 dark:shadow-blue-900/20',
        badge: 'bg-blue-500 text-white',
        avatar: 'bg-blue-500',
        avatarGlow: 'bg-blue-500',
        topBar: 'bg-blue-500',
        code: 'text-blue-600 dark:text-blue-400',
        codeBox: 'bg-blue-50/60 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/40',
        acceptBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
        noteBar: 'bg-blue-300',
        hover: 'hover:text-blue-500',
      };
    case 'SCHOOL_ADMIN':
      return {
        label: 'Admin',
        border: 'border-l-indigo-500',
        shadow: 'shadow-indigo-100/60 dark:shadow-indigo-900/20',
        badge: 'bg-indigo-600 text-white',
        avatar: 'bg-indigo-600',
        avatarGlow: 'bg-indigo-500',
        topBar: 'bg-indigo-500',
        code: 'text-indigo-600 dark:text-indigo-400',
        codeBox: 'bg-indigo-50/60 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800/40',
        acceptBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
        noteBar: 'bg-indigo-300',
        hover: 'hover:text-indigo-500',
      };
    case 'TEACHER_CLASS':
      return {
        label: 'Teacher → Class',
        border: 'border-l-purple-500',
        shadow: 'shadow-purple-100/60 dark:shadow-purple-900/20',
        badge: 'bg-purple-600 text-white',
        avatar: 'bg-purple-600',
        avatarGlow: 'bg-purple-500',
        topBar: 'bg-purple-500',
        code: 'text-purple-600 dark:text-purple-400',
        codeBox: 'bg-purple-50/60 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800/40',
        acceptBtn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
        noteBar: 'bg-purple-300',
        hover: 'hover:text-purple-500',
      };
    case 'STUDENT_CLASS':
      return {
        label: 'Student → Class',
        border: 'border-l-violet-500',
        shadow: 'shadow-violet-100/60 dark:shadow-violet-900/20',
        badge: 'bg-violet-600 text-white',
        avatar: 'bg-violet-600',
        avatarGlow: 'bg-violet-500',
        topBar: 'bg-violet-500',
        code: 'text-violet-600 dark:text-violet-400',
        codeBox: 'bg-violet-50/60 border-violet-100 dark:bg-violet-900/10 dark:border-violet-800/40',
        acceptBtn: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
        noteBar: 'bg-violet-300',
        hover: 'hover:text-violet-500',
      };
    case 'PARENT_STUDENT':
      return {
        label: 'Parent → Student',
        border: 'border-l-amber-500',
        shadow: 'shadow-amber-100/60 dark:shadow-amber-900/20',
        badge: 'bg-amber-500 text-white',
        avatar: 'bg-amber-500',
        avatarGlow: 'bg-amber-500',
        topBar: 'bg-amber-500',
        code: 'text-amber-600 dark:text-amber-400',
        codeBox: 'bg-amber-50/60 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/40',
        acceptBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
        noteBar: 'bg-amber-300',
        hover: 'hover:text-amber-500',
      };
    default:
      return {
        label: linkType?.replace(/_/g, ' ') || 'Link',
        border: 'border-l-orange-400',
        shadow: 'shadow-orange-100/60 dark:shadow-orange-900/20',
        badge: 'bg-orange-500 text-white',
        avatar: 'bg-orange-500',
        avatarGlow: 'bg-orange-500',
        topBar: 'bg-orange-400',
        code: 'text-orange-600 dark:text-orange-400',
        codeBox: 'bg-orange-50/60 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800/40',
        acceptBtn: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20',
        noteBar: 'bg-orange-300',
        hover: 'hover:text-orange-500',
      };
  }
}

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

  const school = req.targetSchool || req.requesterSchool || item.school;

  const className = req.class ? (req.class.name + (req.class.section ? ` - ${req.class.section}` : '')) : undefined;
  
  // Determine identification codes
  let peerCode = item.leftEntityId === currentUserId ? item.rightCode : item.leftCode;
  
  // If we are viewing as an Admin acting on behalf of a School, neither leftEntityId nor rightEntityId will match currentUserId.
  // We need to pick the non-SCHOOL code as the "peer".
  if (item.leftEntityId !== currentUserId && item.rightEntityId !== currentUserId) {
    if (item.leftEntityType === 'SCHOOL' && item.rightEntityType !== 'SCHOOL') {
      peerCode = item.rightCode;
    } else if (item.rightEntityType === 'SCHOOL' && item.leftEntityType !== 'SCHOOL') {
      peerCode = item.leftCode;
    } else {
      peerCode = item.leftCode || item.rightCode;
    }
  }

  const requestCode = (req.requesterId === currentUserId) ? (req.targetCode || item.targetCode) : (req.requesterCode || item.requesterCode);
  
  // Try to use the specifically determined peerCode for RelationshipLinks, fallback to request logic
  const bestCode = peerCode || requestCode || '---';

  // Extract role from linkType if we have to guess
  const inferredRole = item.linkType?.includes('TEACHER') ? 'Teacher' 
    : item.linkType?.includes('STUDENT') ? 'Student'
    : item.linkType?.includes('PARENT') ? 'Parent'
    : item.linkType?.includes('ADMIN') ? 'Admin'
    : 'Member';

  if (person) {
    // Determine role label from which field matched
    const role = req.requesterTeacher || req.targetTeacher ? 'Teacher'
      : req.requesterStudent || req.targetStudent ? 'Student'
      : req.requesterParent || req.targetParent ? 'Parent'
      : req.requesterAdmin || req.approverAdmin ? 'Admin'
      : inferredRole;

    return {
      name: person.name || person.fullName || person.username || bestCode || `Verified ${role}`,
      email: person.email || 'No Email',
      phone: person.phone || person.phoneNumber || null,
      className: className,
      classCode: req.class?.classCode || null,
      grade: person.grade || person.year || person.level || null,
      subject: person.subject || person.specialization || null,
      role,
      schoolName: school?.name || null,
      schoolLogo: school?.logo || null,
      code: person.teacherCode || person.studentCode || person.parentCode || person.adminCode || bestCode,
      image: person.profileImage || person.avatar
    };
  }

  if (school) {
    return {
      name: school.name || 'Unknown School',
      email: school.schoolEmail || 'School Entity',
      phone: school.phone || null,
      className: undefined,
      classCode: null,
      grade: null,
      subject: null,
      role: 'School',
      schoolName: school.name,
      schoolLogo: school.logo,
      code: school.schoolCode || bestCode,
      image: school.logo
    };
  }

  if (req.class) {
    return {
      name: className || 'Unknown Class',
      email: 'Classroom Entity',
      phone: null,
      className: undefined,
      classCode: req.class.classCode || null,
      grade: req.class.grade || null,
      subject: req.class.subject || null,
      role: 'Class',
      schoolName: null,
      schoolLogo: null,
      code: req.class.classCode || bestCode,
      image: undefined
    };
  }
  
  return {
    name: item.peerName || bestCode || `Linked ${inferredRole}`,
    email: item.peerEmail || 'No Email',
    phone: null,
    className: undefined,
    classCode: null,
    grade: null,
    subject: null,
    role: inferredRole,
    schoolName: school?.name || null,
    schoolLogo: school?.logo || null,
    code: bestCode,
    image: item.peerImage
  };
};
