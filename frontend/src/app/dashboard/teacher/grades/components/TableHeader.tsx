const TableHeader: React.FC = () => {
  const headers = [
    { label: 'Student', align: 'left' },
    { label: 'Assessment', align: 'left' },
    { label: 'Score', align: 'center' },
    { label: 'Percentage', align: 'center' },
    { label: 'Grade', align: 'center' },
    { label: 'Status', align: 'center' },
    { label: 'Actions', align: 'right' }
  ];

  return (
    <thead>
      <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        {headers.map((header) => (
          <th
            key={header.label}
            className={`px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 leading-none ${
              header.align === 'center' ? 'text-center' : 
              header.align === 'right' ? 'text-right' : 
              'text-left'
            }`}
          >
            {header.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
