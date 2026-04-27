"use client";
import React from "react";
import PortalsHero from "./components/PortalsHero";
import PortalCard from "./components/PortalCard";

export default function SignInPage() {
  const portals = [
    {
      icon: "admin_panel_settings",
      title: "School Admin",
      description: "Oversee entire school operations, staff, and analytics.",
      href: "/login/school-admin",
    },
    {
      icon: "school",
      title: "Teacher",
      description: "Manage classes, assignments, grades, and student progress.",
      href: "/login/teacher",
    },
    {
      icon: "person",
      title: "Student",
      description: "Access courses, submit assignments, and track your performance.",
      href: "/login/student",
    },
    {
      icon: "family_restroom",
      title: "Parent",
      description: "Stay updated on your child's academic journey and school news.",
      href: "/login/parent",
    },
  ];

  return (
    <div className="min-h-[80vh] bg-[#f8f9ff] dark:bg-slate-950 transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-6 py-20">
        <PortalsHero />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal, idx) => (
            <PortalCard
              key={portal.title}
              icon={portal.icon}
              title={portal.title}
              description={portal.description}
              href={portal.href}
              delay={idx * 0.1}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
