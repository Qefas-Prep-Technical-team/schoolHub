import React from 'react';
import { Edit2 } from 'lucide-react';
import { SchoolProfile } from './types';
import AccreditationBadge from './AccreditationBadge';

interface SchoolProfileHeaderProps {
  school: SchoolProfile;
  onEdit?: () => void;
}

const SchoolProfileHeader: React.FC<SchoolProfileHeaderProps> = ({ school, onEdit }) => {
  return (
    <header className="flex w-full flex-col gap-4 @container md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-5">
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl h-24 w-24 bg-white dark:bg-slate-800 p-2 shadow-sm"
          style={{ backgroundImage: `url(${school.logo})` }}
        />
        
        <div className="flex flex-col">
          <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
            {school.name}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">
            {school.motto}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <AccreditationBadge status={school.compliance.accreditationStatus} />
        
        <button
          onClick={onEdit}
          className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
        >
          <Edit2 size={18} />
          <span className="truncate">Edit Profile</span>
        </button>
      </div>
    </header>
  );
};

export default SchoolProfileHeader;