import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const subjects = [
  { name: 'Math', score: 85 },
  { name: 'Science', score: 92 },
  { name: 'History', score: 88 },
  { name: 'English', score: 90 },
  { name: 'Art', score: 78 },
];

const SubjectScoresChart: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-light dark:border-border-dark p-6 bg-card-light dark:bg-card-dark">
      <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-medium">
        Recent Subject Scores
      </p>
      <div className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={subjects} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis tick={{ fill: '#6b7280' }} />
            <Tooltip />
            <Bar dataKey="score" fill="#3670e2" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubjectScoresChart;
