"use client";

export default function PrimaryButton() {
  return (
    <div className="flex justify-center">
      <button className="flex w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-colors">
        <span className="truncate">Go to login</span>
      </button>
    </div>
  );
}
