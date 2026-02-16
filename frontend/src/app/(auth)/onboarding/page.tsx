"use client";

import React, { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore, type UserType } from "@/app/(auth)/login/services/auth-store";

import Step1 from "./_steps/Step1";
import SchoolSetup from "./_steps/admin/SchoolSetup";
import SubjectSetup from "./_steps/teacher/SubjectSetup";
import ClassJoin from "./_steps/student/ClassJoin";
import ChildLink from "./_steps/parent/ChildLink";
import FeatureSection from "./_steps/FeatureSection";
import RoleBaseFlow from "./_components/RoleBaseFlow";

const ALLOWED: UserType[] = ["ADMIN", "TEACHER", "STUDENT", "PARENT"];

export default function OnboardingPage() {
  const searchParams = useSearchParams();

  // 1) Read type from URL
  const urlTypeRaw = searchParams.get("type")?.toUpperCase() ?? null;
  const urlType = (ALLOWED.includes(urlTypeRaw as UserType) ? (urlTypeRaw as UserType) : null);

  // 2) Zustand fallback (if you still want it)
  const storeUserType = useAuthStore((s) => s.userType);
  const setUserType = useAuthStore((s) => s.setUserType);

  // 3) Decide the effective type: URL param wins
  const effectiveType = urlType ?? storeUserType ?? null;

  // Optional: keep store in sync with URL (so rest of app knows)
  useEffect(() => {
    if (urlType && urlType !== storeUserType) setUserType(urlType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlType]);

  const steps = useMemo(() => {
    switch (effectiveType) {
      case "ADMIN":
        return [<Step1 key="step1" />, <SchoolSetup key="schoolSetup" />, <FeatureSection key="featureSection" />];
      case "TEACHER":
        return [<Step1 key="step1" />, <SubjectSetup key="subjectSetup" />, <FeatureSection key="featureSection" />];
      case "STUDENT":
        return [<Step1 key="step1" />, <ClassJoin key="classJoin" />, <FeatureSection key="featureSection" />];
      case "PARENT":
        return [<Step1 key="step1" />, <ChildLink key="childLink" />, <FeatureSection key="featureSection" />];
      default:
        return [<Step1 key="step1" />];
    }
  }, [effectiveType]);

  return <RoleBaseFlow steps={steps} />;
}
