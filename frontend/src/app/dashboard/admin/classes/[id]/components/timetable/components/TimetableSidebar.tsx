import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  School,
  Settings,
  Megaphone
} from 'lucide-react';

interface TimetableSidebarProps {
  activeItem?: 'dashboard' | 'timetable' | 'teachers' | 'students' | 'settings';
}

const TimetableSidebar: React.FC<TimetableSidebarProps> = ({ activeItem = 'timetable' }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'timetable', label: 'Timetable', icon: <Calendar size={20} /> },
    { id: 'teachers', label: 'Teachers', icon: <Users size={20} /> },
    { id: 'students', label: 'Students', icon: <School size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="flex h-screen flex-col bg-[#121721] p-4 w-64 sticky top-0">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCSjnogVdnI9g8YuFwSq1TKrpvc071mPwvHgSugXMoM9L6-OvxCfRsyywBwOd557_-gA_dgyXy5Zt-7-YgJhfcSq9F98xD3I_NI8_GQwVD6o9gI-IttKlXwnUD7YXfSOQ-YK_qWrmRkkkBYH09qTbQ_AvqH9Ohth8QNRO-oz2lO1LECBPaGNaMhbrWcCrlW1HIW2GpczUG5XlEiOB9iAeIusO-Gm3yHCM610dFgib1zMCxw0NNvb9LHiUJ_4hCwkUZa9DVGDs3q7qI")'
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-white text-base font-medium leading-normal">
              Admin Panel
            </h1>
            <p className="text-[#95a5c6] text-sm font-normal leading-normal">
              School Management
            </p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2 mt-4">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeItem === item.id
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:bg-primary/20 hover:text-white'
              }`}
            >
              {item.icon}
              <p className="text-sm font-medium leading-normal">{item.label}</p>
            </a>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto">
        <button className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
          <Megaphone size={18} className="mr-2" />
          <span className="truncate">New Announcement</span>
        </button>
      </div>
    </aside>
  );
};

export default TimetableSidebar;