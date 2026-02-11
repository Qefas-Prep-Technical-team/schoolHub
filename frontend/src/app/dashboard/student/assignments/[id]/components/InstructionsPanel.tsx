import { Assignment } from './types';

interface Props {
  instructions: Assignment['instructions'];
}

export default function InstructionsPanel({ instructions }: Props) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none rounded-lg bg-white dark:bg-slate-900/50 p-6">
      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Objective</h4>
      <p className="text-slate-700 dark:text-slate-300 mb-6">{instructions.objective}</p>
      
      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Requirements</h4>
      <ul className="space-y-2 mb-6">
        {instructions.requirements.map((req, index) => (
          <li key={index} className="text-slate-700 dark:text-slate-300">
            <strong>{req.label}:</strong> {req.value}
          </li>
        ))}
      </ul>
      
      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Guiding Questions</h4>
      <ol className="space-y-2 mb-6">
        {instructions.guidingQuestions.map((question, index) => (
          <li key={index} className="text-slate-700 dark:text-slate-300">
            {question}
          </li>
        ))}
      </ol>
      
      {instructions.additionalNotes && (
        <>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Additional Notes</h4>
          <p className="text-slate-700 dark:text-slate-300">{instructions.additionalNotes}</p>
        </>
      )}
    </div>
  );
}