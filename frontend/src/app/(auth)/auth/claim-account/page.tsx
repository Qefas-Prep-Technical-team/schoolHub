"use client";

import { Suspense } from "react";
import ClaimAccountForm from "./components/ClaimAccountForm";

export default function ClaimAccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse">Loading claim form...</div>}>
        <ClaimAccountForm />
      </Suspense>
    </div>
  );
}
