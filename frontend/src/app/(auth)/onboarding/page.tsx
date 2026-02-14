"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

import Step1 from "./_steps/Step1";
import SchoolSetup from "./_steps/admin/SchoolSetup";
import SubjectSetup from "./_steps/teacher/SubjectSetup";
import ClassJoin from "./_steps/student/ClassJoin";
import ChildLink from "./_steps/parent/ChildLink";
import FeatureSection from "./_steps/FeatureSection";
import RoleBaseFlow from "./_components/RoleBaseFlow";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const { userType: storeUserType } = useAuthStore();

  // Extract from URL
  const typeFromUrl = searchParams.get("type");

  // Decide which type to use
  const userType = useMemo(() => {
    return typeFromUrl ?? storeUserType ?? "STUDENT";
  }, [typeFromUrl, storeUserType]);

  const getSteps = () => {
    switch (userType) {
      case "ADMIN":
        return [
          <Step1 key="step1" />,
          <SchoolSetup key="schoolSetup" />,
          <FeatureSection key="featureSection" />,
        ];
      case "TEACHER":
        return [
          <Step1 key="step1" />,
          <SubjectSetup key="subjectSetup" />,
          <FeatureSection key="featureSection" />,
        ];
      case "STUDENT":
        return [
          <Step1 key="step1" />,
          <ClassJoin key="classJoin" />,
          <FeatureSection key="featureSection" />,
        ];
      case "PARENT":
        return [
          <Step1 key="step1" />,
          <ChildLink key="childLink" />,
          <FeatureSection key="featureSection" />,
        ];
      default:
        return [<Step1 key="step1" />];
    }
  };

  return <RoleBaseFlow steps={getSteps()} />;
}
