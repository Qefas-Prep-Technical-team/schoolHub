"use client";

import React from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-card-light p-5 dark:border-border-dark dark:bg-card-dark">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-semibold text-text-light dark:text-text-dark">
          {title}
        </h2>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {description}
        </p>
      </div>
    </div>
  );
}
