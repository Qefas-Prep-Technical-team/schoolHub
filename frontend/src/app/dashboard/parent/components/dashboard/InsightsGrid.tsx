import React from 'react'
import AttendanceCard from './AttendanceCard'
import PerformanceCard from './PerformanceCard'
import ExamsCard from './ExamsCard'
import AssignmentsCard from './AssignmentsCard'

export default function InsightsGrid() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AttendanceCard />
      <PerformanceCard />
      <ExamsCard />
      <AssignmentsCard />
    </section>
  )
}