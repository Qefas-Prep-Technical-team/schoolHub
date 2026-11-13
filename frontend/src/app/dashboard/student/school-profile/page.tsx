'use client';

import React, { useMemo } from 'react';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useActiveLinks } from '@/lib/api/hooks/useLinks';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import ConnectedSchoolProfileView from '@/components/school-profile/ConnectedSchoolProfileView';

interface ActiveRelationshipItem {
  linkType?: string;
  schoolId?: string;
  leftEntityType?: string;
  leftEntityId?: string;
  rightEntityType?: string;
  rightEntityId?: string;
  school?: { id?: string; name?: string };
}

export default function StudentSchoolProfilePage() {
  const { user } = useAuthStore();
  const { data: studentProfile, isLoading: isLoadingProfile } =
    useStudentProfile();
  const { data: activeLinksData, isLoading: isLoadingLinks } = useActiveLinks({
    category: 'network',
  });

  const connectedSchoolId = useMemo<string | null>(() => {
    if (studentProfile?.schoolId) return studentProfile.schoolId;
    if (studentProfile?.school?.id) return studentProfile.school.id;

    const items = (
      activeLinksData as { items?: ActiveRelationshipItem[] } | undefined
    )?.items;
    if (Array.isArray(items)) {
      const schoolLink = items.find(
        (item) =>
          item.linkType === 'SCHOOL_STUDENT' ||
          item.leftEntityType === 'SCHOOL' ||
          item.rightEntityType === 'SCHOOL',
      );
      if (schoolLink) {
        if (schoolLink.school?.id) return schoolLink.school.id;
        if (schoolLink.schoolId) return schoolLink.schoolId;
        if (schoolLink.leftEntityType === 'SCHOOL' && schoolLink.leftEntityId) {
          return schoolLink.leftEntityId;
        }
        if (
          schoolLink.rightEntityType === 'SCHOOL' &&
          schoolLink.rightEntityId
        ) {
          return schoolLink.rightEntityId;
        }
      }
    }

    const userWithSchool = user as { schoolId?: string } | null;
    return userWithSchool?.schoolId || null;
  }, [studentProfile, activeLinksData, user]);

  return (
    <ConnectedSchoolProfileView
      role="student"
      schoolId={connectedSchoolId}
      isContextLoading={isLoadingProfile || (!connectedSchoolId && isLoadingLinks)}
      emptyTitle="No Connected School Found"
      emptyDescription="Your student account is not currently linked to an institution. Connect with your school in the Linking Hub to view its official profile, leadership, and academic grading system."
      emptyActionHref="/dashboard/student/linking"
      emptyActionLabel="Go to Linking Hub"
    />
  );
}
