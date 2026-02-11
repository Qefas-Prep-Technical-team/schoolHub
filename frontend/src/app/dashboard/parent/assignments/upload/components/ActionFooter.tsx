'use client'

import { useState } from 'react'
import { Send, Cloud } from 'lucide-react'
import { Button } from './ui/Button'

export default function ActionFooter() {
  const [lastSaved, setLastSaved] = useState('10 mins ago')

  const handleSaveDraft = () => {
    // Save draft logic here
    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setLastSaved(`just now (${timeString})`)
  }

  const handleSubmit = () => {
    // Submit assignment logic here
    alert('Assignment submitted successfully!')
  }

  return (
    <div className="fixed bottom-0 left-0 bg-white w-full bg-card-light dark:bg-card-dark border-t border-[#e8ebf3] dark:border-gray-800 p-4 shadow-lg z-40">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        {/* Last Saved Info */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-text-sec-light dark:text-text-sec-dark">
          <Cloud className="size-5" />
          <span>Last saved draft: {lastSaved}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto"
          >
            Save as Draft
          </Button>
          
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            Submit Assignment
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}