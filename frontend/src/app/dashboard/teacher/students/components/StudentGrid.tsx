import StudentCard from "./StudentCard";
import { Student } from "./types";

const students: Student[] = [
  {
    id: 1,
    name: 'Olivia Martinez',
    grade: 'Grade 10-A',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbssJ33L8KzxV9m_Gl8LLIYnun_HOVA8aLLWCnKcSbc6unLihSPZ9G8_u44PMQ_r0k4YYxaVeTLuEIBu5Op6sUuytwtwJLkyWGujnsUrjzb_cLtnce9CPKsq1VFCUvKOHOP51_3jJoAj-QAUtqKSABFjZWuzHwdPSuI4tw4cd6unG7nWboYC2LUYsN_FLZOpxfBuW630OnC-KqZX2rdIBlIt6UwQNJ4WEddUwIwywB4x11WjHgfJPInSD0f6cH2VSFOYQzZvru-ec',
    performance: 'High',
    attendance: 98,
    lastExam: '92/100',
  },
  {
    id: 2,
    name: 'Liam Chen',
    grade: 'Grade 10-B',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABXfZy7dFc0lQdWn1Kb9iwAGMBgQ6qurPDidSaXS857Q1X93Sl691oTBUjFw79edDi2HW-S1pcG8JNu2JRXB64hSRF3PzEyD2caByRS_mS69GRroBUd_o3grUh4hhK97nEGB2KlavfUpuk185qsSnL6TPDHx13UhClb_CdrA7Fo2-E8cH73vPcAyyP-_yUVTlEZiclvOhrYUlus5spwYjdY684SWqIBlXB7N2Rx5s4N2QsR6PwzL8TnwdkGA8E5inPiRIxLFqQRo4',
    performance: 'Medium',
    attendance: 91,
    lastExam: '78/100',
  },
  {
    id: 3,
    name: 'Noah Patel',
    grade: 'Grade 10-A',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXXDDEJmjMQnfIWSYVWbq2hFQhA_npy9rkYH0nDfFkfdU7ReGEa-Dfwyqfi0eb73wpLiohMV4Ms5f5UaPkMjKl2u-PekwoQMpU4zkEAUoop0E655PpTFLQis774tgNuCJkH1byWkNqUfmcS5kS4BnTW2ddM9XEPVP0y1pFQD-51yqsmCnJMue8jVnTM0mpsYTktsMyT5Q32Y1W1yYDRo9mfRYwDGYQjKPAVhxDrd8cY8xu9n2MKBXqIisyO4eGxboOD5Q9r1_bnkY',
    performance: 'Low',
    attendance: 82,
    lastExam: '65/100',
  },
  {
    id: 4,
    name: 'Emma Rodriguez',
    grade: 'Grade 10-C',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjMTPE8Tsg9HWsWXzS0VvaBf_T9iFQi6WD2PbMxY6kOwneeQBEvXht_u01a-VFeIr-NlMiJBRTvTzYxM3XDl6vEBwCIHQ0LtfiDNVHlZVTP6Uu3rI8a02yFxLAJTypT1c1DeLp74FkGkG5gRxx45Z1V1U0Xj0lK_a1vSEk5CkOh6Igho8F8Q4Guqy8HB8RxPpBMCWx-EtupI-z5x3drsWWtD9S_-2PFTPkUQbLhMcm1-XyFVy1QFo0_HSn1OebQYV_I5fY3M11_78',
    performance: 'High',
    attendance: 99,
    lastExam: '95/100',
  },
];

const StudentGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
};

export default StudentGrid;