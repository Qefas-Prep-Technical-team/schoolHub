import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'warning' | 'danger';
  title: string;
  description: string;
  student: string;
  reportedBy: string;
}

interface BehaviourAlertProps {
  alerts: AlertItem[];
}

const BehaviourAlert: React.FC<BehaviourAlertProps> = ({ alerts }) => {
  const getIcon = (type: 'warning' | 'danger') => {
    if (type === 'warning') {
      return <AlertTriangle className="text-yellow-500" size={20} />;
    }
    return <AlertCircle className="text-red-500" size={20} />;
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center py-10">
        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-500 mb-3 border border-green-200 dark:border-green-800">
          <AlertCircle size={24} className="text-green-500" />
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">No Alerts Recorded</p>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1 max-w-[260px] mx-auto">
          All quiet! There are no behavior incidents reported for this class.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Behaviour Alerts
      </h3>
      <div className="flex flex-col gap-4">
        {alerts.map((alert, index) => (
          <React.Fragment key={alert.id}>
            {index > 0 && (
              <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
            )}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getIcon(alert.type)}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {alert.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Student: {alert.student} - Reported by: {alert.reportedBy}
                </p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BehaviourAlert;