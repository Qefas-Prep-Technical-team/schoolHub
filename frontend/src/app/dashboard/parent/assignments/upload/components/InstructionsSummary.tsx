import { Info } from 'lucide-react'

export default function InstructionsSummary() {
  return (
    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 p-5">
      <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
        <Info className="size-5" />
        Quick Instructions
      </h3>
      <ul className="text-sm text-text-main-light dark:text-text-main-dark space-y-2 list-disc list-inside marker:text-primary">
        <li>Ensure the report is in PDF format.</li>
        <li>Video should not exceed 3 minutes.</li>
        <li>Include your name in the filename.</li>
        <li>Check for plagiarism before uploading.</li>
      </ul>
      <button className="mt-4 text-sm font-bold text-primary hover:underline">
        View Full Rubric
      </button>
    </div>
  )
}