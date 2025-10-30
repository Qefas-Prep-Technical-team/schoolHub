"use client";

import React from "react";

export default function SectionHeader() {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-text-light dark:text-text-dark sm:text-4xl">
        Here’s What You Can Do With SchoolHub.
      </h1>
      <p className="text-base text-text-secondary-light dark:text-text-secondary-dark sm:text-lg">
        Simplify management and maximize learning with these tools.
      </p>
    </div>
  );
}
