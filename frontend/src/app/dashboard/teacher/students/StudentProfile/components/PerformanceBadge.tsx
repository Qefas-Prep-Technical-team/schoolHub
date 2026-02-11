interface PerformanceBadgeProps {
  performance: 'Excelling' | 'Meeting' | 'Developing' | 'Concern' | string;
}

const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ performance }) => {
 const getBadgeStyles = () => {
  switch (performance) {
    case 'Excelling':
      return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    case 'Meeting':
      return { backgroundColor: 'rgba(54, 112, 226, 0.1)', color: '#3670e2' };
    case 'Developing':
      return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    case 'Concern':
      return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    default:
      return { backgroundColor: '#f3f4f6', color: '#111827' };
  }
};

return (
  <span
    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
    style={getBadgeStyles()}
  >
    {performance}
  </span>
);

};


export default PerformanceBadge;