'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PeriodForm from './components/PeriodForm';
import { PeriodFormData } from './components/types';

export default function AddPeriodPage() {
  const router = useRouter();

  const handleSubmit = async (data: PeriodFormData) => {
    try {
      // Simulate API call
      console.log('Submitting period data:', data);
      
      // In real app, you would call an API
      // await fetch('/api/timetable/periods', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      // });

      // Show success message
      alert('Period added successfully!');
      
      // Redirect back to timetable
      router.push('/timetable');
    } catch (error) {
      console.error('Failed to add period:', error);
      alert('Failed to add period. Please try again.');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      router.push('/timetable');
    }
  };

  const handleBack = () => {
    router.push('/timetable');
  };

  return (
    <div className="flex h-screen">    
      <main className="flex-1 overflow-y-auto p-8">
        <PeriodForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onBack={handleBack}
          mode="add"
        />
      </main>
    </div>
  );
}