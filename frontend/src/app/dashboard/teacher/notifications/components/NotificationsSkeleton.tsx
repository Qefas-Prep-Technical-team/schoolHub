import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="rounded-[2rem] border-none shadow-sm overflow-hidden h-[120px]">
          <CardContent className="p-5 flex gap-5 items-start h-full">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3 mt-1">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-[40%]" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-[80%]" />
              <div className="flex justify-between items-center pt-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-6 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NotificationStatsSkeleton() {
  return (
    <Card className="rounded-[2rem] border-none shadow-sm h-[400px]">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex flex-col items-center mb-8 space-y-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        
        <div className="space-y-4 flex-1">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="pt-4 space-y-4">
            <Skeleton className="h-2 w-20 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
