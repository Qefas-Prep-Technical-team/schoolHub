const TableHeader: React.FC = () => {
  const headers = [
    'Student Name',
    'Student ID',
    'CA',
    'Assignment',
    'Exam',
    'Total',
    'Grade',
    'Status',
    'Actions'
  ];

  return (
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-800/50">
        {headers.map((header, index) => (
          <th
            key={header}
            className={`px-4 py-3 text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal ${
              index >= 2 && index <= 7 ? 'text-center' : ''
            } ${index === headers.length - 1 ? 'text-right' : ''}`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;