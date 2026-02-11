'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Button from './Button';
import { Term } from '../types';

interface TermSelectorProps {
  terms: Term[];
  onTermChange?: (term: Term) => void;
}

export default function TermSelector({ terms, onTermChange }: TermSelectorProps) {
  const [selectedTerm, setSelectedTerm] = useState<Term>(terms.find(t => t.active) || terms[0]);

  const handleTermSelect = (term: Term) => {
    setSelectedTerm(term);
    onTermChange?.(term);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">
        Viewing Term:
      </p>
      {/* Active Term Button */}
      <Button
        variant="primary"
        icon={<ChevronDown className="h-4 w-4" />}
        onClick={() => handleTermSelect(selectedTerm)}
      >
        {selectedTerm.label}
      </Button>

      {/* Other Term Buttons */}
      {terms
        .filter(term => term.id !== selectedTerm.id)
        .map(term => (
          <Button
            key={term.id}
            variant="secondary"
            onClick={() => handleTermSelect(term)}
          >
            {term.label}
          </Button>
        ))}
    </div>
  );
}