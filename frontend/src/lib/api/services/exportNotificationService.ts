import { apiClient } from '@/lib/api/client';

export interface ExportNotificationPayload {
  schoolId: string;
  actorName: string;
  actorRole: string;
  resourceTitle: string;
  recordCount: number;
  format: 'PDF' | 'EXCEL' | 'CSV';
}

/**
 * Dispatches an academic audit notification to the connected school's leadership:
 * Principal, School Owner / Proprietor, and Registrar.
 */
export async function dispatchExportLeadershipNotification(
  payload: ExportNotificationPayload
): Promise<boolean> {
  const { schoolId, actorName, actorRole, resourceTitle, recordCount, format } = payload;
  if (!schoolId) return false;

  const roleLabel =
    actorRole === 'TEACHER'
      ? 'Teacher'
      : actorRole === 'ADMIN'
        ? 'Administrator'
        : actorRole;

  const formatLabel =
    format === 'EXCEL' ? 'Excel Spreadsheet (.xlsx)' : format === 'CSV' ? 'CSV (.csv)' : 'PDF Document (.pdf)';

  const countStr = recordCount === 1 ? '1 student record' : `${recordCount} student records`;

  const title = `Academic Export: ${resourceTitle}`;
  const message = `${actorName} (${roleLabel}) exported ${countStr} for "${resourceTitle}" in ${formatLabel} format.`;

  try {
    // 1. Fetch team members to locate Principal, Owner, Registrar
    let targetAdminIds: string[] = [];
    try {
      const teamRes = await apiClient.get('/admin/team', { params: { schoolId } });
      const team = teamRes.data?.data;
      if (Array.isArray(team)) {
        const leadershipRoles = ['PRINCIPAL', 'VICE_PRINCIPAL', 'SCHOOL_OWNER', 'PROPRIETOR', 'REGISTRAR', 'SUPER_ADMIN'];
        targetAdminIds = team
          .filter((member: { id?: string; role?: string; adminRole?: string }) => {
            const r = String(member.role || member.adminRole || '').toUpperCase();
            return leadershipRoles.some((lr) => r.includes(lr));
          })
          .map((m: { id: string }) => m.id)
          .filter(Boolean);
      }
    } catch { }

    // 2. Dispatch notifications
    const createPromises = [];

    // Fan-out to specific leadership members if resolved
    if (targetAdminIds.length > 0) {
      for (const adminId of targetAdminIds) {
        createPromises.push(
          apiClient.post('/notifications', {
            recipientType: 'ADMIN',
            recipientId: adminId,
            type: 'ACADEMIC',
            title,
            message,
            priority: 'NORMAL',
            meta: {
              audit: 'EXPORT_RECORD',
              format,
              resourceTitle,
              recordCount,
            },
          }).catch(() => null)
        );
      }
    } else {
      // General school fan-out
      createPromises.push(
        apiClient.post('/notifications', {
          recipientType: 'SCHOOL',
          recipientId: schoolId,
          type: 'ACADEMIC',
          title,
          message,
          priority: 'NORMAL',
          meta: {
            audit: 'EXPORT_RECORD',
            format,
            resourceTitle,
            recordCount,
          },
        }).catch(() => null)
      );
    }

    await Promise.all(createPromises);
    return true;
  } catch (err) {
    console.warn('Failed to dispatch export notification to leadership:', err);
    return false;
  }
}

