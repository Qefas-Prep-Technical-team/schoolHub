'use client';

import SchoolImageSlider from "./SchoolSlider";

export default function SchoolCard() {
  return (
    <div className="flex flex-col md:flex-row gap-10 items-start justify-between">
      {/* Left Form */}
      <div className="flex flex-col gap-4 flex-1">
        <label className="flex flex-col gap-2">
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">School Name</p>
          <input
            className="form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4"
            placeholder="Enter your school name"
          />
        </label>

        <p className="text-gray-500 dark:text-gray-400 text-sm font-normal pt-0">
          Your school&apos;s web address will be: [schoolname].schoolhub.com
        </p>

        <label className="flex flex-col gap-2">
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Admin Name</p>
          <input
            className="form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4"
            placeholder="Enter your name"
          />
        </label>

        <label className="flex flex-col gap-2">
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Email Address</p>
          <input
            type="email"
            className="form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4"
            placeholder="Enter your email address"
          />
        </label>

        <label className="flex flex-col gap-2">
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Password</p>
          <input
            type="password"
            className="form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4"
            placeholder="Create a password"
          />
        </label>

        <label className="flex flex-col gap-2">
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">Confirm Password</p>
          <input
            type="password"
            className="form-input flex w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4"
            placeholder="Confirm your password"
          />
        </label>

        <label className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Custom Subdomain</p>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              Optional
            </span>
          </div>
          <div className="flex items-center">
            <input
              className="form-input flex-1 w-full rounded-l-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4"
              placeholder="your-school"
            />
            <span className="inline-flex items-center px-4 h-12 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">
              .schoolhub.com
            </span>
          </div>
        </label>

        <div className="flex flex-col gap-4 pt-4">
          <button className="flex items-center justify-center w-full bg-primary text-white font-bold h-14 px-6 rounded-lg text-lg hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300">
            Create School Account
          </button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have a school account?{' '}
            <a className="font-medium text-primary hover:underline" href="#">
              Log in
            </a>
          </p>
        </div>
      </div>

      {/* Right Image */}
      <div className="hidden md:flex items-center justify-center flex-1">
        
      <SchoolImageSlider />
      </div>
    </div>
  );
}
