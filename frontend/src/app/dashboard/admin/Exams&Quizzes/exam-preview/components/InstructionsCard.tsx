interface InstructionsCardProps {
    instructions: string[];
}

export default function InstructionsCard({ instructions }: InstructionsCardProps) {
    return (
        <div className="p-4 @container">
            <div className="flex flex-col items-stretch justify-start rounded-xl bg-white dark:bg-gray-800 shadow-sm @xl:flex-row @xl:items-start p-6">
                <div
                    className="w-full flex-none @xl:w-48 bg-center bg-no-repeat aspect-square @xl:aspect-[3/4] bg-contain rounded-lg"
                    style={{
                        backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuChG5s8K4A3nlcs49Q_1UQHhVDTYkVBfTrztRtip0_m1ayWhpUo4w7lSfOSY7F4y0nJW1tvZ03m2gzC5r2MPo3pdhh1S-p3X_exdCmsosmwRCjY4ckXsYAgBCZwW3UCywpa1CgtRJELfT4CEpz9rOHIF5z9nJ8kAGt7lr0C6b_HAZ7twkdqvGwxXWPnDF9kE0GrrP6FdHukgFvB0ObC1foCbWjIJbrY9zuhB964Fdrin89ybAdorG_WEuOKh2_rtp6yNuUM6RzsGN8")',
                        backgroundSize: '80%'
                    }}
                />

                <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-2 py-4 @xl:px-6">
                    <p className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        Please read the following instructions carefully
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 text-base font-normal leading-normal space-y-1">
                        {instructions.map((instruction, index) => (
                            <li key={index} dangerouslySetInnerHTML={{ __html: instruction }} />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}