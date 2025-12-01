
import GradeTrendChart from "./GradeTrendChart";
import SubjectScoresChart from "./SubjectScoresChart";


const ChartsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <GradeTrendChart />
      <SubjectScoresChart />
    </div>
  );
};

export default ChartsGrid;