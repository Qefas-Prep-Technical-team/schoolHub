'use client'

import { useState } from 'react'

export default function NotesArea() {
  const [notes, setNotes] = useState('')
  const maxLength = 500

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      setNotes(e.target.value)
    }
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      <label htmlFor="comments" className="text-lg font-bold">
        Notes to Teacher 
        <span className="text-sm font-normal text-text-sec-light dark:text-text-sec-dark ml-1">
          (Optional)
        </span>
      </label>
      <div className="relative">
        <textarea
          id="comments"
          value={notes}
          onChange={handleChange}
          placeholder="Add any specific details regarding the submission or difficulties faced..."
          rows={4}
          className="block p-4 w-full text-sm text-text-main-light dark:text-text-main-dark bg-card-light dark:bg-card-dark rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary resize-none shadow-sm"
        />
        <div className="absolute bottom-2 right-2 text-xs text-text-sec-light dark:text-text-sec-dark bg-card-light dark:bg-card-dark px-2 rounded">
          {notes.length}/{maxLength}
        </div>
      </div>
    </div>
  )
}