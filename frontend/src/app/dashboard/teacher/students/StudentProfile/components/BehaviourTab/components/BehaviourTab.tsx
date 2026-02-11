'use client';

import { useState } from 'react';
import { BehaviourNote, BehaviourScore, PositiveNote } from './type';
import BehaviourHeader from './BehaviourHeader';
import BehaviourScoreCard from './BehaviourScoreCard';
import PositiveNotes from './PositiveNotes';
import BehaviourTimeline from './BehaviourTimeline';


const BehaviourTab: React.FC = () => {
  const [score] = useState<BehaviourScore>({
    score: 85,
    feedback: "Excellent conduct this term. Keep up the great work!"
  });

  const [positiveNotes] = useState<PositiveNote[]>([
    {
      id: 1,
      category: 'Leadership',
      date: 'Oct 26, 2023',
      icon: 'thumb_up'
    },
    {
      id: 2,
      category: 'Helping Others',
      date: 'Oct 15, 2023',
      icon: 'volunteer_activism'
    },
    {
      id: 3,
      category: 'Task Completion',
      date: 'Sep 30, 2023',
      icon: 'done'
    }
  ]);

  const [timelineNotes] = useState<BehaviourNote[]>([
    {
      id: 1,
      type: 'positive',
      category: 'Leadership',
      date: 'Oct 26, 2023',
      description: "Samantha took the initiative to organize her group's project, ensuring everyone had a role and stayed on task. Her leadership was commendable.",
      icon: 'thumb_up'
    },
    {
      id: 2,
      type: 'negative',
      category: 'Class Disruption',
      date: 'Oct 20, 2023',
      description: "Talking with a classmate during the math lecture after being asked to stop. A brief conversation was held after class.",
      icon: 'thumb_down'
    },
    {
      id: 3,
      type: 'positive',
      category: 'Helping Others',
      date: 'Oct 15, 2023',
      description: "Noticed a new student was struggling to find their way and walked them to the library. Showed great empathy and kindness.",
      icon: 'volunteer_activism'
    },
    {
      id: 4,
      type: 'neutral',
      category: 'Punctuality',
      date: 'Sep 25, 2023',
      description: "Arrived 5 minutes late to class due to a music lesson running over. Provided a note from the music teacher.",
      icon: 'schedule'
    }
  ]);

  const handleAddReport = () => {
    console.log('Add behaviour report clicked');
    // Implement add report logic
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <BehaviourHeader
        studentName="Samantha Miller"
        studentInfo="Grade 5, Class 5B"
        onAddReport={handleAddReport}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <BehaviourScoreCard score={score} />
          <PositiveNotes notes={positiveNotes} />
        </div>

        {/* Right Column: Timeline */}
        <BehaviourTimeline notes={timelineNotes} />
      </div>
    </div>
  );
};

export default BehaviourTab;