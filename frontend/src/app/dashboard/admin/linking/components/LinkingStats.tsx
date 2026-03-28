import React from 'react';
import { ShieldCheck, Clock, Mail } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LinkingStatsProps {
  activeCount: number;
  pendingCount: number;
  totalCount: number;
}

export function LinkingStats({ activeCount, pendingCount, totalCount }: LinkingStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card className="rounded-3xl border-none shadow-sm bg-blue-500/5 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2 text-blue-600 dark:text-blue-400">
            <ShieldCheck size={20} />
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none shadow-none">Active</Badge>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{activeCount}</p>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Active Connections</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm bg-orange-500/5 dark:bg-orange-500/10 border-orange-100 dark:border-orange-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2 text-orange-600 dark:text-orange-400">
            <Clock size={20} />
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none shadow-none">Pending</Badge>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{pendingCount}</p>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Pending Requests</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm bg-purple-500/5 dark:bg-purple-500/10 border-purple-100 dark:border-purple-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2 text-purple-600 dark:text-purple-400">
            <Mail size={20} />
            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none shadow-none">Total</Badge>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCount}</p>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Total Linked</p>
        </CardContent>
      </Card>
    </div>
  );
}
