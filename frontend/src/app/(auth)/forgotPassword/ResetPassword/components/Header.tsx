export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7ebf3] dark:border-b-white/10 px-10 py-3">
      <div className="flex items-center gap-4 text-[#0e121b] dark:text-white">
        <div className="size-6 text-primary">
          <svg
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 className="text-[#0e121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          SchoolHub
        </h2>
      </div>
    </header>
  );
}
