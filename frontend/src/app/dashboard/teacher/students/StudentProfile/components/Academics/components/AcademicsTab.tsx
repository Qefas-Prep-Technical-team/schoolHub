'use client';

import AddNoteButton from "./AddNoteButton";
import ExpandableSection from "./ExpandableSection";
import PerformanceGraph from "./PerformanceGraph";
import SubjectsCard from "./SubjectsCard";
import { ExpandableSectionT } from "./types";

const AcademicsTab: React.FC = () => {
  const expandableSections: ExpandableSectionT[] = [
    {
      id: 1,
      title: 'Test History',
      content: 'No test data available for the selected period.'
    },
    {
      id: 2,
      title: 'Homework History',
      content: 'No homework data available.'
    }
  ];

  const handleAddNote = () => {
    console.log('Add academic note clicked');
    // Implement your add note logic here
  };

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <SubjectsCard />
        
        {expandableSections.map((section) => (
          <ExpandableSection key={section.id} section={section} />
        ))}
      </div>
      
      {/* Right Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <PerformanceGraph />
        <AddNoteButton onClick={handleAddNote} />
      </div>
    </div>
  );
};

export default AcademicsTab;