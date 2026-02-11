'use client'

import React from 'react'

export default function PageHeading() {
  const handleAddChild = () => {
    // Add child logic here
    console.log('Add child clicked')
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Children
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
          Manage your children&apos;s academic information
        </p>
      </div>
      
      <button
        onClick={handleAddChild}
        className="group flex items-center justify-center gap-2 h-11 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        <span className="text-sm font-bold">Add Child</span>
      </button>
    </div>
  )
}