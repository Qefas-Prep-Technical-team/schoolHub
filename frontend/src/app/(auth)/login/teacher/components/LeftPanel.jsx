export default function LeftPanel() {
    return (
        <div className="hidden lg:flex lg:w-1/2 min-h-screen flex-col items-center justify-center bg-primary/10 dark:bg-primary/20 p-8 relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-primary/20 dark:bg-primary/30"></div>
            <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full bg-primary/20 dark:bg-primary/30"></div>
            <div className="flex flex-col max-w-md items-center text-center">
                <img
                    alt="Teacher illustration"
                    className="mb-8 w-full max-w-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzvdO9ECPmFHQy3uwKKMYpam_2unekYZ3bMS81UpFa3RTTN9QcbMXcrKA5hm18c5QDyAvDjZd4oiMmq1tOUa4J0UQpnLOr-8lZtPkNeW4EZIGoFk2Erd9uLrP0LGA9TQ3CKTke_m92IKPSLudyBiwN3i4ldaETHS6fFoLrUKGDHgcs5CSj8M1uRqY593iq6Q8MK-W-UFTFRhnh2xM8D_VSoJxoqaIP-3fZgsCNK00tXsuT2fHMcxbI78eV9Ee4qWpnsijpn-sT03Q"
                />
                <h1 className="text-[#0d1b19] dark:text-gray-200 text-[32px] font-bold leading-tight pb-3">
                    Teacher Portal
                </h1>
                <p className="text-[#0d1b19] dark:text-gray-300 text-lg font-normal">
                    Inspire, Teach, and Track Every Learner’s Journey.
                </p>
            </div>
        </div>
    );
}
