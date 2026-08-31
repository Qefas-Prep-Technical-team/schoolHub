'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  UserPlus, 
  MessageSquare, 
  AlertTriangle,
  History,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'grade' | 'enrollment' | 'message' | 'alert';
  title: string;
  description: string;
  time: string;
  color: string;
  icon?: any;
}

interface RecentPersonalActivityProps {
  activities?: ActivityItem[];
}

const RecentPersonalActivity: React.FC<RecentPersonalActivityProps> = ({ activities = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(activities.length / itemsPerPage));
  
  const currentItems = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'grade': return CheckCircle2;
      case 'enrollment': return UserPlus;
      case 'alert': return AlertTriangle;
      case 'message':
      default: return MessageSquare;
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm h-full transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Latest Events</p>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
           <History size={16} className="text-slate-400" />
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 h-full">
            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-500">No Recent Activity</p>
          </div>
        ) : (
          currentItems.map((item, idx) => {
            const IconComponent = item.icon || getIcon(item.type);
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
              >
                <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${
                  item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                }`}>
                  <IconComponent size={18} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title}</h4>
                    <span className="text-[10px] font-medium text-slate-500">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {activities.length > itemsPerPage && (
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-xs font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      
      <button className="mt-5 w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
        View All Activity
      </button>
    </div>
  );
};

export default RecentPersonalActivity;
