"use client";

import React, { useEffect, useState } from "react";

export default function ExamSchedule() {
  // === set exam start/end here ===
  // For testing: set startTime to a few seconds in the past to see the count-up immediately
  // const startTime = new Date(Date.now() - 10_000); // started 10s ago (testing)
  // const endTime = new Date(Date.now() + 5 * 60_000); // ends in 5 minutes (testing)

  const startTime = new Date("2025-12-13T09:00:00");
  const endTime = new Date("2025-12-20T10:30:00");
  // ================================

  type Status = "not_started" | "running" | "ended";

  const [displayTime, setDisplayTime] = useState("00:00:00");
  const [status, setStatus] = useState<Status>(() => {
    const now = Date.now();
    if (now < startTime.getTime()) return "not_started";
    if (now >= startTime.getTime() && now <= endTime.getTime()) return "running";
    return "ended";
  });

  // Format ms -> HH:MM:SS (handles ms >= 24h too)
  const formatHHMMSS = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  useEffect(() => {
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      const now = Date.now();

      if (now < startTime.getTime()) {
        // BEFORE start: show countdown until start
        setStatus("not_started");
        setDisplayTime(formatHHMMSS(startTime.getTime() - now));
      } else if (now >= startTime.getTime() && now <= endTime.getTime()) {
        // DURING exam: show elapsed since start (count up)
        setStatus("running");
        setDisplayTime(formatHHMMSS(now - startTime.getTime()));
      } else {
        // AFTER end
        setStatus("ended");
        setDisplayTime("00:00:00");
      }
    };

    // run immediately so user sees value without waiting 1s
    tick();
    const id = setInterval(tick, 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [startTime.getTime(), endTime.getTime()]); // stable dependencies

  const statusBadgeClass =
    status === "not_started"
      ? "bg-yellow-50 text-yellow-700 border-yellow-100"
      : status === "running"
      ? "bg-green-50 text-green-700 border-green-100"
      : "bg-red-50 text-red-700 border-red-100";

  const statusLabel =
    status === "not_started" ? "Not Started" : status === "running" ? "In Progress" : "Completed";

  return (
    <div className="w-full rounded-2xl border border-primary/20 bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exam Schedule</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusBadgeClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Start Date & Time</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {startTime.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {status === "not_started" ? "Time Until Start" : status === "running" ? "Time Elapsed" : "Exam Finished"}
          </p>

          <p className="mt-1 text-3xl font-mono font-bold text-primary dark:text-primary">{displayTime}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">End Date & Time</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {endTime.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
