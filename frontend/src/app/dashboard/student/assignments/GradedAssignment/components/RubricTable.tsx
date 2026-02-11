interface RubricItem {
  criteria: string;
  score: string;
  comments: string;
}

interface RubricTableProps {
  items: RubricItem[];
  total: string;
}

export default function RubricTable({ items, total }: RubricTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#333333] dark:text-white">Grading Rubric</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[#888888] dark:text-gray-400">
                Criteria
              </th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[#888888] dark:text-gray-400">
                Score
              </th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[#888888] dark:text-gray-400">
                Comments
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 font-medium text-[#333333] dark:text-gray-200">
                  {item.criteria}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-[#333333] dark:text-gray-200">
                  {item.score}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.comments}</td>
              </tr>
            ))}
          </tbody>s
          <tfoot className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <td className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[#333333] dark:text-gray-200">
                Total
              </td>
              <td className="px-6 py-4 text-lg font-bold text-primary">{total}</td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}