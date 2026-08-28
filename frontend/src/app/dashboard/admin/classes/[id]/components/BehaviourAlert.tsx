import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil((alerts?.length || 0) / itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [alerts]);

  const paginatedAlerts = alerts?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center py-10">
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Behaviour Alerts
      </h3>
      <div className="flex flex-col gap-4">
        {paginatedAlerts.map((alert, index) => (
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

      {alerts.length > itemsPerPage && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, alerts.length)}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{alerts.length}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-1 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                {(() => {
                  const getVisiblePages = () => {
                    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
                    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                  };

                  return getVisiblePages().map((page, i) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-offset-0">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`relative inline-flex items-center px-3 py-1 text-sm font-semibold focus:z-20 transition-colors ${
                          currentPage === page 
                            ? 'z-10 bg-blue-600 dark:bg-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.4)] dark:shadow-[0_4px_12px_rgba(59,130,246,0.5)] ring-1 ring-blue-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
                            : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-1 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviourAlert;