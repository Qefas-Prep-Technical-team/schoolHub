/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function TimerHeader() {
  // SET YOUR DEADLINE HERE
 const deadline = "2025-12-20T23:59:59";


  const calculateTimeLeft = () => {
    const difference = +new Date(deadline) - +new Date()
    let timeLeft:any = {}

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 border-b border-[#e8ebf3] dark:border-gray-800">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            Science
          </span>
          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="size-3" />
            High Priority
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
          Science Fair Project Report
        </h1>
        <p className="text-text-sec-light dark:text-text-sec-dark text-base">
          Class 5A • Due Feb 20, 2025 at 11:59 PM
        </p>
      </div>

      {/* WORKING TIMER */}
      <div className="w-full lg:w-auto bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm border border-[#e8ebf3] dark:border-gray-800">
        <p className="text-xs font-semibold text-text-sec-light dark:text-text-sec-dark uppercase mb-2 text-center">
          Time Remaining
        </p>

        <div className="flex gap-3 justify-center">

          {/* DAYS */}
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-[#e8ebf3] dark:bg-gray-800 text-primary">
              <span className="text-lg font-bold">{String(timeLeft.days).padStart(2, "0")}</span>
            </div>
            <span className="text-[10px] mt-1 text-text-sec-light dark:text-text-sec-dark font-medium">
              DAYS
            </span>
          </div>

          <span className="text-xl font-bold self-center -mt-4">:</span>

          {/* HOURS */}
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-[#e8ebf3] dark:bg-gray-800 text-primary">
              <span className="text-lg font-bold">{String(timeLeft.hours).padStart(2, "0")}</span>
            </div>
            <span className="text-[10px] mt-1 text-text-sec-light dark:text-text-sec-dark font-medium">
              HRS
            </span>
          </div>

          <span className="text-xl font-bold self-center -mt-4">:</span>

          {/* MINUTES */}
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-[#e8ebf3] dark:bg-gray-800 text-primary">
              <span className="text-lg font-bold">{String(timeLeft.minutes).padStart(2, "0")}</span>
            </div>
            <span className="text-[10px] mt-1 text-text-sec-light dark:text-text-sec-dark font-medium">
              MIN
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
