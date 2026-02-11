// app/components/SubjectsTable.jsx
export default function SubjectsTable() {
  const subjects = [
    { name: 'Mathematics', assessment: '85%', exam: '90%', overall: '88%' },
    { name: 'Physics', assessment: '92%', exam: '97%', overall: '95%' },
    { name: 'English Literature', assessment: '80%', exam: '88%', overall: '84%' },
    { name: 'History', assessment: '72%', exam: '78%', overall: '76%' },
    { name: 'Chemistry', assessment: '88%', exam: '91%', overall: '90%' }
  ]

  return (
    <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">
        Subjects & Grades - Term 3
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark">
            <tr>
              <th className="p-3 font-medium">Subject</th>
              <th className="p-3 font-medium text-center">Assessment</th>
              <th className="p-3 font-medium text-center">Final Exam</th>
              <th className="p-3 font-medium text-center">Overall Grade</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr 
                key={index}
                className={index < subjects.length - 1 ? 'border-b border-border-light dark:border-border-dark' : ''}
              >
                <td className="p-3 font-medium text-text-light dark:text-text-dark">
                  {subject.name}
                </td>
                <td className="p-3 text-center text-text-muted-light dark:text-text-muted-dark">
                  {subject.assessment}
                </td>
                <td className="p-3 text-center text-text-muted-light dark:text-text-muted-dark">
                  {subject.exam}
                </td>
                <td className="p-3 text-center font-bold text-text-light dark:text-text-dark">
                  {subject.overall}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}