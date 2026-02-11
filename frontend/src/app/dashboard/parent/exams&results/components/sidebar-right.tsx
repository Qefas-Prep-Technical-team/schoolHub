"use client"

import { Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js"

import { useMemo } from "react"
import Link from "next/link"

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface UpcomingExam {
  month: string
  day: number
  title: string
  subject: string
  time: string
}

export default function SidebarRight() {
  const upcomingExams: UpcomingExam[] = [
    { month: "OCT", day: 24, title: "Genetics Quiz 3", subject: "Biology", time: "10:00 AM" },
    { month: "OCT", day: 28, title: "Physics Midterm", subject: "Physics", time: "09:00 AM" }
  ]

  const subjectPerformance = [
    { subject: "Math", score: 92 },
    { subject: "Science", score: 88 },
    { subject: "English", score: 78 }
  ]

  const chartData = useMemo(() => {
    return {
      labels: subjectPerformance.map((s) => s.subject),
      datasets: [
        {
          label: "Performance",
          data: subjectPerformance.map((s) => s.score),
          backgroundColor: "rgba(59, 130, 246, 0.25)", // primary/25
          borderColor: "rgba(59, 130, 246, 1)",        // primary
          borderWidth: 2,
          pointBackgroundColor: "rgba(59, 130, 246, 1)"
        }
      ]
    }
  }, [])

  const chartOptions = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        grid: { color: "#e5e7eb" },
        angleLines: { color: "#e5e7eb" },
        pointLabels: {
          font: { size: 11 },
          color: "#6b7280"
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  }

  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">

      {/* Performance Radar */}
      <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Subject Performance</h3>
          <button className="text-primary text-xs font-bold hover:underline">
            Full Report
          </button>
        </div>

        <div className="w-full h-64">
          <Radar data={chartData} options={chartOptions} />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {subjectPerformance.map((item) => (
            <div key={item.subject} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.subject}</span>
              <span className="font-bold text-gray-900 dark:text-white">{item.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Upcoming Exams</h3>

        <div className="flex flex-col gap-4">
          {upcomingExams.map((exam, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 min-w-[50px]">
                <span className="text-xs font-bold text-gray-500">{exam.month}</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{exam.day}</span>
              </div>

              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {exam.title}
                </p>
                <p className="text-xs text-gray-500">
                  {exam.subject} • {exam.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Link
        className="w-full"
        href={"/dashboard/parent/exams&results/calender"}
        >
        
        <button className="w-full mt-4 py-2 text-sm cursor-pointer font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
          View Calendar
        </button>
        </Link>
      </div>
    </div>
  )
}
