const stats = [
    { label: 'Total Assessments', value: '124' },
    { label: 'Ongoing', value: '8' },
    { label: 'Upcoming', value: '15' },
    { label: 'Completed', value: '101' },
];

export default function StatsCards() {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800"
                >
                    <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
                        {stat.label}
                    </p>
                    <p className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">
                        {stat.value}
                    </p>
                </div>
            ))}
        </section>
    );
}