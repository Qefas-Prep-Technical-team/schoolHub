export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  className: string;
  status: "Active" | "Inactive";
  avatar: string;
  selected: boolean; // for checkbox
}

export const students: Student[] = [
  {
    id: "1",
    name: "Jane Cooper",
    email: "jane.cooper@example.com",
    studentId: "#S-58934",
    className: "Grade 10 - A",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    selected: false,
  },
  {
    id: "2",
    name: "Cody Fisher",
    email: "cody.fisher@example.com",
    studentId: "#S-12398",
    className: "Grade 11 - B",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    selected: false,
  },
  {
    id: "3",
    name: "Esther Howard",
    email: "esther.howard@example.com",
    studentId: "#S-78901",
    className: "Grade 9 - C",
    status: "Inactive",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    selected: false,
  },
  {
    id: "4",
    name: "Ronald Richards",
    email: "ronald.richards@example.com",
    studentId: "#S-45678",
    className: "Grade 12 - A",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    selected: false,
  },
  {
    id: "5",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    studentId: "#S-98765",
    className: "Grade 8 - B",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    selected: false,
  },
  {
    id: "6",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    studentId: "#S-54321",
    className: "Grade 7 - C",
    status: "Inactive",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    selected: false,
  },
];
