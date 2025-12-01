import { BehaviourScore } from "./type";


interface BehaviourScoreCardProps {
  score: BehaviourScore;
}

const BehaviourScoreCard: React.FC<BehaviourScoreCardProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-slate-900 dark:text-slate-50 text-base font-medium leading-normal">
          Behaviour Score
        </p>
        <p className={`${getScoreColor(score.score)} text-2xl font-bold`}>
          {score.score}
        </p>
      </div>
      <div className="w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div 
          className={`h-2 rounded-full ${getProgressColor(score.score)}`} 
          style={{ width: `${score.score}%` }}
        />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {score.feedback}
      </p>
    </div>
  );
};

export default BehaviourScoreCard;