import { Student } from "./types";
import { AvatarCell } from "./AvatarCell";
import { StatusBadge } from "./StatusBadge";
import { StudentActions } from "./StudentActions";

export function StudentRow({ student }: { student: Student }) {
  return (
    <tr className="border-b border-border-light dark:border-border-dark hover:bg-background-light/40 dark:hover:bg-background-dark/40 transition">
      <td className="p-4">
        <AvatarCell name={student.name} avatar={student.avatar} />
      </td>

      <td className="p-4 text-sm text-text-light dark:text-text-dark">
        {student.className}
      </td>

      <td className="p-4 text-sm text-text-light dark:text-text-dark">
        {student.gender}
      </td>

      <td className="p-4">
        <StatusBadge status={student.status} />
      </td>

      <td className="p-4 text-right">
        <StudentActions />
      </td>
    </tr>
  );
}
