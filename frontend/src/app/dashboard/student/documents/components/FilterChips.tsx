'use client';

import { FilterChip } from './types';
import { Chip } from './ui/Chip';

interface FilterChipsProps {
  chips: FilterChip[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

export default function FilterChips({ 
  chips, 
  activeFilter, 
  onFilterChange 
}: FilterChipsProps) {
  return (
    <div className="flex gap-2 p-1 flex-wrap mb-6">
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          active={chip.active}
          onClick={() => onFilterChange(chip.id)}
          count={chip.count}
        >
          {chip.label}
        </Chip>
      ))}
    </div>
  );
}