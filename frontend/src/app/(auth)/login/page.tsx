"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PortalsHero from "./components/PortalsHero";
import PortalCard from "./components/PortalCard";
import WrongPortalAlert from "./components/WrongPortalAlert";

function SignInContent() {
  const searchParams = useSearchParams();
  const detectedRole = (searchParams?.get("detected_role") || "").toLowerCase().trim();

  const portals = [
    {
      role: "ADMIN",
      icon: "admin_panel_settings",
      title: "School Admin",
      description: "Oversee entire school operations, staff, and analytics.",
      href: "/login/school-admin",
      isMatched: detectedRole === "school admin" || detectedRole === "admin",
    },
    {
      role: "TEACHER",
      icon: "school",
      title: "Teacher",
      description: "Manage classes, assignments, grades, and student progress.",
      href: "/login/teacher",
      isMatched: detectedRole === "teacher",
    },
    {
      role: "STUDENT",
      icon: "person",
      title: "Student",
      description: "Access courses, submit assignments, and track your performance.",
      href: "/login/student",
      isMatched: detectedRole === "student",
    },
    {
      role: "PARENT",
      icon: "family_restroom",
      title: "Parent",
      description: "Stay updated on your child's academic journey and school news.",
      href: "/login/parent",
      isMatched: detectedRole === "parent",
    },
  ];

  return (
    <div className="w-full transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <PortalsHero />

        <div className="max-w-2xl mx-auto mb-8">
          <WrongPortalAlert />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal, idx) => (
            <PortalCard
              key={portal.title}
              role={portal.role}
              icon={portal.icon}
              title={portal.title}
              description={portal.description}
              href={portal.href}
              delay={idx * 0.1}
              isHighlighted={portal.isMatched}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
