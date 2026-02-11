const GradeTrendChart: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-light dark:border-border-dark p-6 bg-card-light dark:bg-card-dark">
      <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-medium">
        Grade Trends
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-text-primary-light dark:text-text-primary-dark tracking-light text-4xl font-bold truncate">
          B+
        </p>
        <p className="text-success text-base font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-base">trending_up</span>
          +3.5%
        </p>
      </div>
      <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
        Last 6 Months
      </p>
      <div className="flex min-h-[200px] flex-1 flex-col gap-8 pt-4">
        <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 475 150" width="100%" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_chart)"></path>
          <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#3670e2" strokeLinecap="round" strokeWidth="3"></path>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chart" x1="236" x2="236" y1="1" y2="149">
              <stop stopColor="#3670e2" stopOpacity="0.2"></stop>
              <stop offset="1" stopColor="#3670e2" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
        </svg>
        <div className="flex justify-around">
          {months.map((month) => (
            <p key={month} className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold">
              {month}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradeTrendChart;