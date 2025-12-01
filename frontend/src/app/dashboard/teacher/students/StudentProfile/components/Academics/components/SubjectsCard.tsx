
import SubjectItem from "./SubjectItem";
import { Subject } from "./types";


const SubjectsCard: React.FC = () => {
  const subjects: Subject[] = [
    {
      id: 1,
      name: 'Mathematics',
      teacher: 'Mr. Harrison',
      score: 88,
      trend: 'up',
      icon: 'calculate',
      active: true
    },
    {
      id: 2,
      name: 'English Literature',
      teacher: 'Ms. Albright',
      score: 74,
      trend: 'down',
      icon: 'history_edu'
    },
    {
      id: 3,
      name: 'Physics',
      teacher: 'Mr. Newton',
      score: 92,
      trend: 'up',
      icon: 'science'
    }
  ];

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm">
      <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold">
        Subjects
      </h2>
      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700 mt-4">
        {subjects.map((subject) => (
          <SubjectItem key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
};

export default SubjectsCard;