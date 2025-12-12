'use client'

import React from 'react'

export default function AddChildCard() {
  const handleAddChild = () => {
    // Add child logic here
    console.log('Add new child clicked')
  }

  return (
    <div 
      onClick={handleAddChild}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent p-6 min-h-[300px] hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:border-primary/50 transition-all cursor-pointer group"
    >
      <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary">
          person_add
        </span>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Register Another Child
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-[200px]">
          Have another child enrolled? Add their profile here.
        </p>
      </div>
    </div>
  )
}