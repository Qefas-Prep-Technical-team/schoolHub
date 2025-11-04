export default function Announcements() {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
            <h2 className="text-base font-medium">Announcements</h2>

            <div className="space-y-3">
                <div className="border p-3 rounded-lg">
                    <h3 className="font-medium text-sm">Parent-Teacher Meeting</h3>
                    <p className="text-sm text-muted-foreground">
                        Scheduled for Oct 25th, 2023. Sign-ups are open.
                    </p>
                </div>

                <div className="border p-3 rounded-lg">
                    <h3 className="font-medium text-sm">School Holiday</h3>
                    <p className="text-sm text-muted-foreground">
                        The school will be closed on Nov 1st for a national holiday.
                    </p>
                </div>
            </div>

            <button className="w-full text-sm font-medium text-blue-600 hover:underline">
                Create New Announcement
            </button>
        </div>
    );
}
