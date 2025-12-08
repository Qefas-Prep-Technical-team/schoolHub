import { NavItem, FilterOption, Question, QuizInfo } from "./types";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "#" },
  { label: "Courses", icon: "book", href: "#" },
  { label: "Grades", icon: "school", href: "#" },
  {
    label: "Exams & Quizzes",
    icon: "quiz",
    href: "#",
    active: true,
    filled: true,
  },
];

export const bottomNavItems: NavItem[] = [
  { label: "Settings", icon: "settings", href: "#" },
  { label: "Log Out", icon: "logout", href: "#" },
];

export const userInfo = {
  name: "Alex Morgan",
  studentId: "12345",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD65H8UI__vVYSTp_qfmkqUpRQbn5j6M44cQQhrHDz-8RK5xORx9GCmfs6rxtIJYFqn9H-jdfnXUy3E8vskImvKrJI_HfJ69VTeHXQafT1TfIO9DH-FFKddmmy3qQOOTiXmVsRfCNAA_GW3yfEO8NsRkmiDSzhdT4rIOWmRA0jdOGbuOKvJrbWCXR8unvKz3kgdGj95hVPrmaiJ4wxv0ZqgZ8aOmVeOIzK3PFyUxPyEc0LsNepRaJmtiD0K60UGFpRjeDuSeCZQnEk",
};

export const quizInfo: QuizInfo = {
  title: "Chapter 5 Biology Quiz",
  description: "Analyze your performance question by question.",
  totalQuestions: 3,
  score: 2.5,
  maxScore: 3,
  date: "Taken on October 26, 2023",
};

export const filterOptions: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Correct", value: "correct" },
  { label: "Wrong", value: "wrong" },
  { label: "Unanswered", value: "unanswered" },
];

export const questions: Question[] = [
  {
    id: "1",
    number: 1,
    question: "Which organelle is known as the powerhouse of the cell?",
    userAnswer: "Mitochondria",
    correctAnswer: "Mitochondria",
    explanation:
      "The mitochondrion is responsible for generating most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
    status: "correct",
    points: 1,
    maxPoints: 1,
  },
  {
    id: "2",
    number: 2,
    question: "What is the chemical formula for water?",
    userAnswer: "CO2",
    correctAnswer: "H2O",
    explanation:
      "A water molecule consists of two hydrogen atoms bonded to a single oxygen atom.",
    status: "wrong",
    points: 0,
    maxPoints: 1,
  },
  {
    id: "3",
    number: 3,
    question: "Select all primary colors.",
    userAnswer: "Red, Yellow",
    correctAnswer: "Red, Yellow, Blue",
    explanation:
      "The primary colors in the RYB color model are red, yellow, and blue. You correctly identified two of the three.",
    status: "partially-correct",
    points: 0.5,
    maxPoints: 1,
  },
];
