import React, { useState } from 'react';
import FilterSelect from './FilterSelect';
import { Class, Subject, Term } from './types';


interface GradeFiltersProps {
  terms: Term[];
  classes: Class[];
  subjects: Subject[];
  onFilterChange: (filters: {
    term: string;
    class: string;
    subject: string;
  }) => void;
}

const GradeFilters: React.FC<GradeFiltersProps> = ({
  terms,
  classes,
  subjects,
  onFilterChange,
}) => {
  const [selectedTerm, setSelectedTerm] = useState(terms[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');

  const handleTermChange = (value: string) => {
    setSelectedTerm(value);
    onFilterChange({
      term: value,
      class: selectedClass,
      subject: selectedSubject,
    });
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    onFilterChange({
      term: selectedTerm,
      class: value,
      subject: selectedSubject,
    });
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    onFilterChange({
      term: selectedTerm,
      class: selectedClass,
      subject: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-background-dark shadow-sm">
      <FilterSelect
        label="Term"
        id="term"
        options={terms.map((t) => ({ value: t.id, label: t.name }))}
        value={selectedTerm}
        onChange={handleTermChange}
      />
      <FilterSelect
        label="Class"
        id="class"
        options={classes.map((c) => ({ value: c.id, label: c.name }))}
        value={selectedClass}
        onChange={handleClassChange}
      />
      <FilterSelect
        label="Subject"
        id="subject"
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        value={selectedSubject}
        onChange={handleSubjectChange}
      />
    </div>
  );
};

export default GradeFilters;