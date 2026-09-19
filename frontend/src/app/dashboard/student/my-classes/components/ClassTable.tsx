import { MoreHorizontal, Play, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface ClassItem {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  room: string;
  progress: number;
  assignmentsDue: number;
  nextSession: string;
  days: string[];
  description: string;
  color: string;
}

interface ClassTableProps {
  isLoading: boolean;
  filteredClasses: ClassItem[];
}

export function ClassTable({ isLoading, filteredClasses }: ClassTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Situation</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-6 rounded-full" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium text-center">Situation</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {filteredClasses.map((cls, idx) => (
              <tr 
                key={cls.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: cls.color }}
                    >
                      {cls.title.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {cls.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {cls.subject}
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {cls.days.join(', ')}
                </td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                  {cls.nextSession.split(' - ')[0] || '10:00 AM'}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-green-200 bg-green-50 text-green-500">
                    <Bell size={14} />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 hover:text-green-500 hover:border-green-500 cursor-pointer transition-colors">
                           <span className="text-[10px]">✓</span>
                       </div>
                       <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-500 cursor-pointer transition-colors">
                           <span className="text-[10px]">✕</span>
                       </div>
                    </div>
                    <Link href={`/dashboard/student/my-classes/${cls.id}`}>
                      <Button className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-6 py-0 h-8 rounded-full tracking-wide">
                        VIEW DETAILS
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
