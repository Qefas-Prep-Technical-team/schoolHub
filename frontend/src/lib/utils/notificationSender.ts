export interface ResolvedSenderInfo {
  name: string;
  role: string;
  isDirect: boolean;
  avatarText: string;
}

export function formatSenderType(type?: string): string {
  if (!type) return 'User';
  switch (type.toUpperCase()) {
    case 'STUDENT': return 'Student';
    case 'TEACHER': return 'Teacher';
    case 'PARENT': return 'Parent';
    case 'ADMIN': return 'School Admin';
    case 'SCHOOL': return 'School Administration';
    default: return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }
}

export function resolveNotificationSender(n: any): ResolvedSenderInfo {
  if (!n) {
    return { name: 'System', role: 'System', isDirect: false, avatarText: 'S' };
  }

  const meta = (n.meta || n.data || {}) as Record<string, any>;
  const directName = n.senderName || meta.senderName;

  // 1. If explicit senderName is present (and not a generic "system")
  if (
    directName &&
    typeof directName === 'string' &&
    directName.trim().length > 0 &&
    !['system', 'undefined', 'null'].includes(directName.trim().toLowerCase())
  ) {
    const role = n.senderRole || meta.senderRole || (n.senderType ? formatSenderType(n.senderType) : 'Sender');
    return {
      name: directName.trim(),
      role,
      isDirect: true,
      avatarText: directName.trim().charAt(0).toUpperCase(),
    };
  }

  // 2. Named entity fields in meta
  const metaName =
    meta.studentName ||
    meta.teacherName ||
    meta.parentName ||
    meta.adminName ||
    meta.requesterName ||
    meta.authorName ||
    meta.student?.name ||
    meta.teacher?.name ||
    meta.parent?.fullName ||
    meta.parent?.name ||
    meta.admin?.name ||
    meta.school?.name;

  if (metaName && typeof metaName === 'string' && metaName.trim().length > 0) {
    const role =
      meta.studentName || meta.student?.name ? 'Student'
      : meta.teacherName || meta.teacher?.name ? 'Teacher'
      : meta.parentName || meta.parent?.fullName || meta.parent?.name ? 'Parent'
      : meta.adminName || meta.admin?.name ? 'School Admin'
      : meta.school?.name ? 'School'
      : 'User';

    return {
      name: metaName.trim(),
      role,
      isDirect: true,
      avatarText: metaName.trim().charAt(0).toUpperCase(),
    };
  }

  // 3. Link Request relations
  if (n.linkRequest) {
    const lr = n.linkRequest;
    const reqPerson = lr.requesterStudent || lr.requesterTeacher || lr.requesterParent;
    if (reqPerson) {
      const name = reqPerson.name || reqPerson.fullName;
      if (name) {
        const role = lr.requesterStudent ? 'Student' : lr.requesterTeacher ? 'Teacher' : 'Parent';
        return {
          name: name.trim(),
          role,
          isDirect: true,
          avatarText: name.trim().charAt(0).toUpperCase(),
        };
      }
    }
    if (lr.requesterSchool?.name) {
      return {
        name: lr.requesterSchool.name.trim(),
        role: 'School',
        isDirect: true,
        avatarText: lr.requesterSchool.name.trim().charAt(0).toUpperCase(),
      };
    }
    const targetPerson = lr.targetStudent || lr.targetTeacher || lr.targetParent;
    if (targetPerson) {
      const name = targetPerson.name || targetPerson.fullName;
      if (name) {
        const role = lr.targetStudent ? 'Student' : lr.targetTeacher ? 'Teacher' : 'Parent';
        return {
          name: name.trim(),
          role,
          isDirect: true,
          avatarText: name.trim().charAt(0).toUpperCase(),
        };
      }
    }
  }

  // 4. Pattern matching on message / title
  const msg = typeof n.message === 'string' ? n.message : '';
  const title = typeof n.title === 'string' ? n.title : '';

  // e.g. "John Doe requested to join Class 1"
  const joinMatch = msg.match(/^(.+?)\s+requested\s+to\s+join/i);
  if (joinMatch && joinMatch[1] && !joinMatch[1].toLowerCase().includes('user')) {
    const cleanName = joinMatch[1].replace(/^(student|teacher|parent)\s+/i, '').trim();
    return {
      name: cleanName,
      role: 'Student',
      isDirect: true,
      avatarText: cleanName.charAt(0).toUpperCase(),
    };
  }

  // e.g. "John Doe sent you a link request"
  const linkMatch = msg.match(/^(.+?)\s+sent\s+you\s+a\s+link\s+request/i);
  if (linkMatch && linkMatch[1] && !['student', 'teacher', 'parent', 'school', 'user'].includes(linkMatch[1].toLowerCase())) {
    const cleanName = linkMatch[1].trim();
    return {
      name: cleanName,
      role: 'Requester',
      isDirect: true,
      avatarText: cleanName.charAt(0).toUpperCase(),
    };
  }

  // e.g. "Student John Doe in your class has updated..."
  const studentPrefix = msg.match(/^Student\s+([A-Za-z\s'-]+?)\s+(?:in\s+your\s+class|has)/i);
  if (studentPrefix && studentPrefix[1]) {
    const cleanName = studentPrefix[1].trim();
    return {
      name: cleanName,
      role: 'Student',
      isDirect: true,
      avatarText: cleanName.charAt(0).toUpperCase(),
    };
  }

  // e.g. "Teacher Jane Doe has requested..."
  const teacherPrefix = msg.match(/^Teacher\s+([A-Za-z\s'-]+?)\s+(?:has|requested)/i);
  if (teacherPrefix && teacherPrefix[1]) {
    const cleanName = teacherPrefix[1].trim();
    return {
      name: cleanName,
      role: 'Teacher',
      isDirect: true,
      avatarText: cleanName.charAt(0).toUpperCase(),
    };
  }

  // e.g. "Behaviour Alert: John Doe"
  const behaviourMatch = title.match(/^Behaviour\s+Alert:\s*(.+)$/i);
  if (behaviourMatch && behaviourMatch[1]) {
    const cleanName = behaviourMatch[1].trim();
    return {
      name: cleanName,
      role: 'Student Alert',
      isDirect: true,
      avatarText: cleanName.charAt(0).toUpperCase(),
    };
  }

  // e.g. "New message from John Doe" or "Message from John Doe"
  const messageFromMatch = msg.match(/^(?:New\s+message\s+from|Message\s+from)\s+([A-Za-z\s'-]+?)(?::|$)/i);
  if (messageFromMatch && messageFromMatch[1]) {
    const cleanName = messageFromMatch[1].trim();
    return {
      name: cleanName,
      role: 'Sender',
      isDirect: true,
      avatarText: cleanName.charAt(0).toUpperCase(),
    };
  }

  // 5. Fallback on Sender Type or Notification Type
  if (n.senderType) {
    const roleName = formatSenderType(n.senderType);
    return {
      name: roleName,
      role: roleName,
      isDirect: n.senderType !== 'SCHOOL',
      avatarText: roleName.charAt(0).toUpperCase(),
    };
  }

  if (n.type === 'ANNOUNCEMENT' || n.isAnnouncement) {
    return { name: 'School Broadcast', role: 'School', isDirect: false, avatarText: 'S' };
  }

  if (n.type === 'ACADEMIC') {
    return { name: 'Academic Office', role: 'Academic', isDirect: false, avatarText: 'A' };
  }

  return { name: 'School Hub', role: 'System', isDirect: false, avatarText: 'S' };
}
