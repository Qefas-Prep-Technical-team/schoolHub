import HeaderActions from "./HeaderActions";
import PerformanceBadge from "./PerformanceBadge";

import { Student } from "./types";


interface ProfileHeaderProps {
  student: Student;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ student }) => {
  return (
    <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark @container">
      <div className="flex w-full flex-col gap-4 @[640px]:flex-row @[640px]:justify-between @[640px]:items-center">
        <div className="flex items-center gap-4">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 lg:h-32 lg:w-32 flex-shrink-0"
            style={{ backgroundImage: `url("${student.avatarUrl}")` }}
          />
          <div className="flex flex-col justify-center gap-1">
            <div className="flex items-center gap-3">
              <p className="text-text-primary-light dark:text-text-primary-dark text-2xl lg:text-3xl font-bold">
                {student.name}
              </p>
              <PerformanceBadge performance={student.performance} />
            </div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base">
              {student.grade}, {student.age} years old
            </p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base">
              Parent/Guardian: {student.parentName}
            </p>
          </div>
        </div>
        <HeaderActions />
      </div>
    </div>
  );
};

export default ProfileHeader;