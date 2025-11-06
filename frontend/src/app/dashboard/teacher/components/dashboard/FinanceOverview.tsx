export default function FinanceOverview() {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
            <h2 className="text-base font-medium">Finance Overview</h2>

            <div>
                <p className="text-sm mb-1">Revenue vs Expenses</p>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-blue-500 h-2 rounded-full w-[75%]" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">$150k / $200k</p>
            </div>

            <div>
                <p className="text-sm mb-1">Outstanding Fees</p>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div className="bg-yellow-400 h-2 rounded-full w-[25%]" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">$25k</p>
            </div>
        </div>
    );
}
