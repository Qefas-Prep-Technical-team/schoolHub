interface DashboardLayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

export default function DashboardLayout({ leftColumn, rightColumn }: DashboardLayoutProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
      {/* LEFT COLUMN (Main Data) */}
      <div className="xl:col-span-8 flex flex-col gap-6 md:gap-8">
        {leftColumn}
      </div>
      
      {/* RIGHT COLUMN (Alerts & Quick Actions) */}
      <div className="xl:col-span-4 flex flex-col gap-6 md:gap-8">
        {rightColumn}
      </div>
    </div>
  );
}