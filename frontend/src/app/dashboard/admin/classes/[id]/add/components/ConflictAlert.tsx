import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Conflict } from './types';

interface ConflictAlertProps {
  conflicts: Conflict[];
  onDismiss?: () => void;
}

const ConflictAlert: React.FC<ConflictAlertProps> = ({ conflicts, onDismiss }) => {
  if (!conflicts.length) return null;

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
      <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
      <div className="flex-1">
        <h3 className="font-bold text-amber-500">Scheduling Conflict Detected</h3>
        <ul className="list-disc list-inside text-amber-600 dark:text-amber-400 text-sm mt-1 space-y-1">
          {conflicts.map((conflict, index) => (
            <li key={index}>{conflict.message}</li>
          ))}
        </ul>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-amber-500/70 hover:text-amber-500 flex-shrink-0"
          aria-label="Dismiss alert"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default ConflictAlert;