import React from 'react';
import { Link2, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LinkingHeaderProps {
  onConnectClick: () => void;
}

export function LinkingHeader({ onConnectClick }: LinkingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Linking Hub
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
          Manage connections between parents, students, and teachers.
        </p>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={onConnectClick}
          className="bg-primary text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Link2 className="mr-2 h-5 w-5" /> Connect with Code
        </Button>
        <Button variant="outline" className="h-12 px-6 rounded-xl font-bold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:scale-[1.02] active:scale-95 transition-all">
          <UserPlus className="mr-2 h-5 w-5" /> Invite Member
        </Button>
      </div>
    </div>
  );
}
