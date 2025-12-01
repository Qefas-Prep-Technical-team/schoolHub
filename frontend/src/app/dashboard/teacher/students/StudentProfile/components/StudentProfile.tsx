'use client';

import ChartsGrid from "./ChartsGrid";
import ProfileHeader from "./ProfileHeader";
import StatsGrid from "./StatsGrid";
import TabsNavigation from "./TabsNavigation";
import { Student } from "./types";

const StudentProfile: React.FC = () => {
  const student: Student = {
    id: 1,
    name: 'Alex Johnson',
    grade: 'Grade 5',
    age: 10,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm5O7n1VFt3BoiR43ewuH7LqEMydg-nuNm7frM5Af3pi-fscoLpA7MpUO-1zDrapbrDrQslVok-o16z5lXjeoTm8rFM46belnnbILk6O9RA4o8Gye2390RxB2JglxhjtTGbN0-iK0CwPL0C5xTxfkzjReXBhTKFEHV3mrUZ0UDk9yYARMt7-Frm6-BhShKq3uuC9nnjS2-Qo-31ivcXC1aGzm3r-FN9xzS-U5ZXpj4bMBUfU2WJEXCqspiRpNQCV-gJ6564bU7AR8',
    performance: 'Developing',
    parentName: 'Sarah Johnson',
    teacherName: 'Dr. Eleanor Vance',
    teacherRole: 'Science Teacher',
    teacherAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUZ-ECmKZbdVUR9uyk0uoZkvm-NTZJ_kdVxBavGvw2_P3UI-D1jX8G5t2_S9xAB1a2W3Y3uFPe7DwKYpw6ZXWmOQ__wEf_2QN4HAssrCB5LjAQxO7e9LbF0xA0rz3Ve7-HbKlfYeYSIST5o_wBqQ_MvBCJmL3NcQFL8p0Ca9I6ME-mCqr3_-efMZJCWQA5U4BjjPsElk1CGMRd2uHjYCYvcXK7HPEu4gCUhfKHowHZm6ZhLgTJGgBwIttb2m215YsKCHhFjCXmG0g',
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark">
      <div className="relative flex min-h-screen w-full">
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="w-full max-w-6xl mx-auto">
            <ProfileHeader student={student} />
            <TabsNavigation />
            {/* <StatsGrid />
            <ChartsGrid /> */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;