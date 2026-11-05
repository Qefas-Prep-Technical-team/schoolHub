"use client";

import React from "react";

interface TabSkeletonProps {
  tabId: string;
}

export function TabSkeleton({ tabId }: TabSkeletonProps) {
  if (tabId === "tab1") {
    // Overview Skeleton
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-4 shadow-sm">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-4 shadow-sm">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-4 h-96 shadow-sm">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tabId === "students" || tabId === "exams") {
    // List/Table Skeleton
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 space-y-4 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="space-y-1.5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tabId === "subjects" || tabId === "teachers") {
    // Grid Skeleton
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-4 shadow-sm"
          >
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="flex items-center gap-2 pt-2">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-12 text-center shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Loading content...</p>
    </div>
  );
}

