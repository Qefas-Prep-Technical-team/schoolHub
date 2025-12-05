'use client';

import { useState } from 'react';
import { Goal } from '@/types';
import Card from './ui/Card';
import Button from './ui/Button';
import { Plus } from 'lucide-react';

interface ImprovementGoalsProps {
  goals: Goal[];
}

export default function ImprovementGoals({ goals }: ImprovementGoalsProps) {
  const [goalList, setGoalList] = useState<Goal[]>(goals);
  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const newGoalItem: Goal = {
        id: Date.now().toString(),
        text: newGoal.trim(),
        completed: false,
      };
      setGoalList([...goalList, newGoalItem]);
      setNewGoal('');
    }
  };

  const toggleGoalCompletion = (id: string) => {
    setGoalList(goalList.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  return (
    <Card className="md:col-span-2 xl:col-span-1">
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Improvement Goals
        </h3>
      </div>
      <ul className="space-y-3 mb-4">
        {goalList.map((goal) => (
          <li key={goal.id} className="flex items-start gap-3">
            <button
              onClick={() => toggleGoalCompletion(goal.id)}
              className="mt-1 focus:outline-none"
            >
              <span className={`material-symbols-outlined ${
                goal.completed ? 'text-green-500' : 'text-primary'
              }`}>
                {goal.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </button>
            <p className={`text-sm text-gray-700 dark:text-gray-300 ${
              goal.completed ? 'line-through opacity-60' : ''
            }`}>
              {goal.text}
            </p>
          </li>
        ))}
      </ul>
      
      <div className="space-y-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a new goal..."
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
        />
        <Button
          variant="primary"
          onClick={handleAddGoal}
          icon={<Plus className="h-4 w-4" />}
          className="w-full"
        >
          Set New Goal
        </Button>
      </div>
    </Card>
  );
}