
import StatsCards from './StatsCards';
import AttendanceCalendar from './AttendanceCalendar';

export default function AttendancePage() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <StatsCards />
          <AttendanceCalendar />
        </div>
      </div>
    </main>
  );
}