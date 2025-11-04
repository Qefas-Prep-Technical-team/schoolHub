"use client";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    negative?: boolean;
}

export default function StatCard({ title, value, change, negative }: StatCardProps) {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{title}</p>
            <h2 className="text-2xl font-semibold mt-2">{value}</h2>
            <p className={cn("text-sm mt-1", negative ? "text-red-500" : "text-green-500")}>
                {change}
            </p>
        </div>
    );
}
