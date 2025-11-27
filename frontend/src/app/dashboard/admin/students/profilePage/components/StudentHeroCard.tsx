// StudentHeroCard.jsx
import React from 'react'

export default function StudentHeroCard({ student }) {
  return (
    <div className="w-full lg:w-80 flex-shrink-0">
      <div className="sticky top-6 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 lg:p-5 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-24 h-24 lg:w-28 lg:h-28 mb-3"
              style={{ backgroundImage: `url(${student.profilePicture})` }}
              alt={`Student profile picture of ${student.name}`}
            ></div>
            <span className="absolute bottom-1 right-1 flex items-center justify-center h-6 px-2 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ring-2 lg:ring-4 ring-card-light dark:ring-card-dark">
              {student.status}
            </span>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xl lg:text-2xl font-bold leading-tight text-text-light dark:text-text-dark">{student.name}</p>
            <p className="text-sm lg:text-base font-normal leading-normal text-gray-500 dark:text-gray-400 mt-1">{student.grade}, ID: #{student.id}</p>
          </div>
        </div>
        
        <div className="flex flex-col w-full gap-2 lg:gap-3 mt-4 lg:mt-5">
          <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 lg:h-10 px-3 lg:px-4 bg-primary/20 text-primary text-sm font-bold leading-normal transition-colors hover:bg-primary/30">
            <span className="truncate">Edit Profile</span>
          </button>
          <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 lg:h-10 px-3 lg:px-4 bg-primary/20 text-primary text-sm font-bold leading-normal transition-colors hover:bg-primary/30">
            <span className="truncate">Reset Password</span>
          </button>
          <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 lg:h-10 px-3 lg:px-4 bg-primary text-white text-sm font-bold leading-normal transition-colors hover:bg-primary/90">
            <span className="truncate">Message Parent</span>
          </button>
        </div>
      </div>
    </div>
  )
}