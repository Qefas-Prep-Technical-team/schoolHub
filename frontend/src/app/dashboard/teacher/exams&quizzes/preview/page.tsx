import { Suspense } from "react";
import ExamPreviewPage from "./components/ExamPreviewPage";

export default function ExamPreview() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading Preview...</div>}>
      <ExamPreviewPage />
    </Suspense>
  );
}
