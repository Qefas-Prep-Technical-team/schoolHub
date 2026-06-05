import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
    return (
        <div className="space-y-8 pb-12 p-6">
            <Skeleton className="h-12 w-1/3 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-64 rounded-[2.5rem]" />
                <Skeleton className="h-64 rounded-[2.5rem]" />
            </div>
        </div>
    );
}
