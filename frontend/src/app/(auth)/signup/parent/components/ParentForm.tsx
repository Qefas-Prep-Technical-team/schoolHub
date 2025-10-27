"use client";

export default function ParentForm() {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col gap-3 p-4">
        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#0d171b] dark:text-white">
          Join SchoolHub as a Parent
        </h1>
        <p className="text-lg font-normal leading-normal text-[#4c809a] dark:text-gray-400">
          Stay connected to your child’s progress and school updates.
        </p>
      </div>

      <div className="mt-8 space-y-6 p-4">
        <label className="flex flex-col">
          <p className="text-base font-medium pb-2 text-[#0d171b] dark:text-gray-300">Full Name</p>
          <input
            type="text"
            placeholder="Enter your full name"
            className="form-input h-14 rounded-lg border border-input-border-light dark:border-input-border-dark bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </label>

        <label className="flex flex-col">
          <p className="text-base font-medium pb-2 text-[#0d171b] dark:text-gray-300">Email</p>
          <input
            type="email"
            placeholder="Enter your email"
            className="form-input h-14 rounded-lg border border-input-border-light dark:border-input-border-dark bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </label>

        <label className="flex flex-col">
          <p className="text-base font-medium pb-2 text-[#0d171b] dark:text-gray-300">Password</p>
          <div className="relative">
            <input
              type="password"
              placeholder="Enter your password"
              className="form-input h-14 w-full rounded-lg border border-input-border-light dark:border-input-border-dark bg-background-light dark:bg-background-dark p-4 pr-12 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#4c809a] dark:text-gray-400">
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
        </label>

        <label className="flex flex-col">
          <p className="text-base font-medium pb-2 text-[#0d171b] dark:text-gray-300">Confirm Password</p>
          <input
            type="password"
            placeholder="Confirm your password"
            className="form-input h-14 rounded-lg border border-input-border-light dark:border-input-border-dark bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </label>

        <label className="flex flex-col">
          <div className="flex items-center justify-between pb-2">
            <p className="text-base font-medium text-[#0d171b] dark:text-gray-300">Student Code or Email</p>
            <span className="text-sm text-[#4c809a] dark:text-gray-400">Optional</span>
          </div>
          <input
            type="text"
            placeholder="Enter code or email to link your child"
            className="form-input h-14 rounded-lg border border-input-border-light dark:border-input-border-dark bg-background-light dark:bg-background-dark p-4 text-base font-normal text-[#0d171b] dark:text-white placeholder:text-[#4c809a] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-[#4c809a] dark:text-gray-500 mt-2">
            You can link to your child `&apos;`s account later from your dashboard.
          </p>
        </label>

        <button className="w-full h-14 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark">
          Create Parent Account
        </button>

        <p className="text-center text-sm text-[#4c809a] dark:text-gray-400">
          Already have an account?{" "}
          <a className="font-medium text-primary hover:underline" href="#">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
