import { NavItem, Assessment, AssessmentGroup } from "./types";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "#" },
  { label: "Courses", icon: "import_contacts", href: "#" },
  { label: "Grades", icon: "bar_chart_4_bars", href: "#" },
  {
    label: "Assessments",
    icon: "checklist",
    href: "#",
    active: true,
    filled: true,
  },
  { label: "Schedule", icon: "calendar_month", href: "#" },
];

export const userInfo = {
  name: "Olivia Rhye",
  email: "olivia@school.edu",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB0bqUqQcfTGKLDgZ2dGfYkFEVJ1y2t1T8d0iCtwDGSQn84BrqF4QZAio6VY9KNddMJbDew40-4M7OwqhHglIjzuoQBzED02D8IkhoBKzbr7lVIuwGpXssaA01j4dRd-Vkw961ZcfYxOsbo2bRqjD33n8RZEP2Hfdv6TeVewS831YhAMLXqyYC9hWh9mH5ZXUsbuXYyj00P8E8VVvJjK-brBSgMJ-642iqA-nGTW3a7E9nxkDQM5sAQTGI6oyRAWcMau0nxTKWGE5k",
};

export const featuredAssessment = {
  title: "Biology Mid-Term Exam",
  date: "Tuesday, October 26 at 10:00 AM",
  subject: "Biology",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA_9-aXJF5fps1WzkRGzPS1LZyTbXu9k4XshxRg_R1_EFyFSbYZ6ewIpvClmxHxoL06QmPHCPPYQ1rK9Fc3l761kRezvOP_-BFKem5xBA15593CLSXB59KxNfmClwjbAvbAgDqqvvcz8ovh5bXlBkOHDFNYagQ6CEESqjgO5XV5SGWLzcJglXi3TjH8R3hPlo1FPyk5W7I6nIsRA9aYpRKX6dha9ks11DsXFKvjLJYSXeP9hcTCpMUwc5WaW21Jwe0WTvTkwNcGrOA",
  countdown: {
    days: 2,
    hours: 3,
    minutes: 45,
    seconds: 12,
  },
};

export const assessmentGroups: AssessmentGroup[] = [
  {
    id: "1",
    title: "Tuesday, October 26",
    assessments: [
      {
        id: "1",
        title: "Biology Mid-Term Exam",
        type: "exam",
        date: "October 26",
        time: "10:00 AM",
        duration: "90 minutes",
        format: "CBT",
        subject: "Biology",
      },
    ],
  },
  {
    id: "2",
    title: "Upcoming This Week",
    assessments: [
      {
        id: "2",
        title: "History: Chapter 5 Quiz",
        type: "quiz",
        date: "Oct 28",
        time: "2:00 PM",
        duration: "30 minutes",
        format: "CBT",
        subject: "History",
      },
      {
        id: "3",
        title: "Literature: Essay Submission",
        type: "submission",
        date: "Oct 29",
        time: "11:59 PM",
        duration: "3 hours",
        format: "Written",
        subject: "Literature",
      },
    ],
  },
];
