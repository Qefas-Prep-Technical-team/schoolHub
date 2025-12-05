import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Courses', href: '/courses', active: true },
    { label: 'Assignments', href: '/assignments' },
  ];

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e8ebf3] dark:border-b-white/10 px-4 sm:px-10 py-3 fixed w-full top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-10">
      <div className="flex items-center gap-4 text-[#0e121b] dark:text-white">
        <div className="size-6 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 className="text-[#0e121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          School Platform
        </h2>
      </div>
      
      <div className="hidden md:flex flex-1 justify-end">
        <div className="flex items-center gap-9">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm font-medium leading-normal transition-colors ${
                item.active
                  ? 'text-primary dark:text-primary'
                  : 'text-[#0e121b] dark:text-white/80 hover:text-primary dark:hover:text-primary'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-[#e8ebf3] dark:bg-white/10 text-[#0e121b] dark:text-white/80 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 hover:bg-[#d1d8e6] dark:hover:bg-white/20 transition-colors">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
        
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDnwQqd99Qpr1fLF9s13UQCqzZVcdKM42S4zUXq-6aSF-5N9DAoIS4ywpHkW3MVsdPFEmQEjDE8WqMBe6C7QCIgB5n5l72gmK7QDDo5BA1A2gu0p4UQ7Q4dJuDS2CEA3SQR_-giiJVXPoQIXFKrP1qEtxmNJeCoVYuQd9VNuC8aZP5CHTZaunWG-hhNQ7YZaIqYSAoI1UUl-XcRQxaocN6xMGslcSPnPHCXCgm-aCSRQ4eztPa4HPSqW7pcg7wZt7rlho_baPIAxP0")' }}
          onClick={() => router.push('/profile')}
          title="View profile"
        />
      </div>
    </header>
  );
}