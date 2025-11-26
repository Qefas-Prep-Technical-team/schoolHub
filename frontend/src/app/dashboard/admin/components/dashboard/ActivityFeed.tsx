export default function ActivityFeed() {
    const activities = [
        { text: `New student "Alex Johnson" was enrolled in Grade 8.`, time: "2 min ago" },
        { text: `Invoice #INV-0078 for "Maria Garcia" was generated.`, time: "15 min ago" },
        { text: `Timetable for Grade 10 was updated by "Mr. Smith".`, time: "1 hour ago" },
        { text: `A new school-wide announcement was published.`, time: "3 hours ago" },
        { text: `Attendance for Grade 7 Math is below 80%.`, time: "Yesterday" },
    ];

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="text-base font-medium mb-3">Recent Activity Feed</h2>
            <div className="space-y-3">
                {activities.map((item, i) => (
                    <div key={i} className="flex justify-between border-b pb-2 last:border-none">
                        <p className="text-sm text-foreground">{item.text}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {item.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
