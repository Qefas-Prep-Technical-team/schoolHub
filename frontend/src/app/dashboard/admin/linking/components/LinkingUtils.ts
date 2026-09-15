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
        progressBar: 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      };
    case 'SCHOOL_STUDENT':
      return {
        label: 'Student',
        border: 'border-l-pink-500',
        shadow: 'shadow-pink-100/60 dark:shadow-pink-900/20',
        badge: 'bg-pink-500 text-white',
        avatar: 'bg-pink-500',
        avatarGlow: 'bg-pink-500',
        topBar: 'bg-pink-500',
        code: 'text-pink-600 dark:text-pink-400',
        codeBox: 'bg-pink-50/60 border-pink-100 dark:bg-pink-900/10 dark:border-pink-800/40',
        acceptBtn: 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/20',
        noteBar: 'bg-pink-300',
        hover: 'hover:text-pink-500',
        progressBar: 'bg-gradient-to-r from-pink-400 to-pink-600 shadow-[0_0_8px_rgba(244,114,182,0.6)]',
      };
    case 'SCHOOL_ADMIN':
      return {
        label: 'Admin',
        border: 'border-l-blue-500',
        shadow: 'shadow-blue-100/60 dark:shadow-blue-900/20',
        badge: 'bg-blue-600 text-white',
        avatar: 'bg-blue-600',
        avatarGlow: 'bg-blue-500',
        topBar: 'bg-blue-500',
        code: 'text-blue-600 dark:text-blue-400',
        codeBox: 'bg-blue-50/60 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/40',
        acceptBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
        noteBar: 'bg-blue-300',
        hover: 'hover:text-blue-500',
        progressBar: 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_8px_rgba(96,165,250,0.6)]',
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
        progressBar: 'bg-gradient-to-r from-purple-400 to-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.6)]',
      };
    case 'STUDENT_CLASS':
      return {
        label: 'Student → Class',
        border: 'border-l-pink-500',
        shadow: 'shadow-pink-100/60 dark:shadow-pink-900/20',
        badge: 'bg-pink-600 text-white',
        avatar: 'bg-pink-600',
        avatarGlow: 'bg-pink-500',
        topBar: 'bg-pink-500',
        code: 'text-pink-600 dark:text-pink-400',
        codeBox: 'bg-pink-50/60 border-pink-100 dark:bg-pink-900/10 dark:border-pink-800/40',
        acceptBtn: 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/20',
        noteBar: 'bg-pink-300',
        hover: 'hover:text-pink-500',
        progressBar: 'bg-gradient-to-r from-pink-400 to-pink-600 shadow-[0_0_8px_rgba(244,114,182,0.6)]',
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
        progressBar: 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      };
    default:
      return {
        label: linkType?.replace(/_/g, ' ') || 'Link',
        border: 'border-l-slate-400',
        shadow: 'shadow-slate-100/60 dark:shadow-slate-900/20',
        badge: 'bg-slate-500 text-white',
        avatar: 'bg-slate-500',
        avatarGlow: 'bg-slate-500',
        topBar: 'bg-slate-400',
        code: 'text-slate-600 dark:text-slate-400',
        codeBox: 'bg-slate-50/60 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/40',
        acceptBtn: 'bg-slate-500 hover:bg-slate-600 text-white shadow-slate-500/20',
        noteBar: 'bg-slate-300',
        hover: 'hover:text-slate-500',
        progressBar: 'bg-gradient-to-r from-slate-400 to-slate-600 shadow-[0_0_8px_rgba(148,163,184,0.6)]',
      };
  }
}

export const getMemberDetails = (item: any, currentUserId?: string) => {
  // Handling both LinkRequest and RelationshipLink
  const req = item.approvedFromRequest || item;
  const classObj = req.class || item.class;
  const school = req.targetSchool || req.requesterSchool || item.school;
  
  // Robust person identification - filter out the current user so we find the peer
  const participants = [
    req.requesterTeacher, req.targetTeacher,
    req.requesterStudent, req.targetStudent,
    req.requesterParent, req.targetParent,
    req.requesterAdmin, req.approverAdmin,
    req.sender, req.receiver
  ].filter(Boolean);
  
  const person = participants.find((p: any) => p.id !== currentUserId) || 
                 (participants.length > 0 && !classObj && !school ? participants[0] : null);

  const className = classObj ? (classObj.name + (classObj.section ? ` - ${classObj.section}` : '')) : undefined;
  
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
      classCode: classObj?.classCode || null,
      grade: person.grade || person.year || person.level || null,
      subject: person.subject || person.specialization || null,
      role,
      schoolName: school?.name || null,
      schoolLogo: school?.logo || null,
      code: person.teacherCode || person.studentCode || person.parentCode || person.adminCode || bestCode,
      image: person.profileImage || person.avatar
    };
  }

  const isClassLink = item.linkType === 'TEACHER_CLASS' || item.linkType === 'STUDENT_CLASS';

  if (classObj || isClassLink) {
    const fallbackName = school?.name ? `${school.name} Class` : 'Unknown Class';
    const finalName = className || (item.peerName && item.peerName !== 'Linked Member' ? item.peerName : fallbackName);

    return {
      name: finalName,
      email: school?.name || 'Classroom Entity',
      phone: null,
      className: undefined,
      classCode: classObj?.classCode || null,
      grade: classObj?.grade || null,
      subject: classObj?.subject || null,
      role: 'Class',
      schoolName: school?.name || null,
      schoolLogo: school?.logo || null,
      code: classObj?.classCode || bestCode,
      image: undefined
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
