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