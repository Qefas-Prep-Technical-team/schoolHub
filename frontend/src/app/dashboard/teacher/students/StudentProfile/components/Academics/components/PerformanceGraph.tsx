import { PerformanceData } from "./types";
import Button from "./ui/Button";


const PerformanceGraph: React.FC = () => {
  const performanceData: PerformanceData = {
    subject: 'Mathematics',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGPxqaxVW_89MkU93cOxkUd1YG05lDTQ_4O4uGUNABhvJbXkREdfaP35fkU4SxDzL9s1KmB_kMF74kDykEcfpckqPVtxIgVFNnd99eCLuQdo2yui_5Fetx6Ld63KY_q9bYsozBI-6zoSfRYvQodzG2GTP832uGJ_RvWccGN-my6tDwHrE3UbjlN3quGKjY67A6r6dyZICr2B4uNSrwA5_YNinNfPim5ETv_P5bJLdo3OiWgTxKXj40jtkONjsmsjXSZqETSkt6gDE',
    altText: 'A line graph showing student performance over four quarters. The trend is generally upward, starting at 80% and ending at 88%.'
  };

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold">
          Performance Over Time
        </h2>
        <Button variant="outline" icon="arrow_drop_down">
          {performanceData.subject}
        </Button>
      </div>
      <div className="mt-6 h-72 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <img 
          className="w-full h-full object-contain p-4" 
          src={performanceData.imageUrl} 
          alt={performanceData.altText}
        />
      </div>
    </div>
  );
};

export default PerformanceGraph;