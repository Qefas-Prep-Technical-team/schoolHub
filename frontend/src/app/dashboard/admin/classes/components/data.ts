import { User, NavItem, StatCard, FilterChip, ClassData } from './types';

export const adminUser: User = {
  name: 'Admin Name',
  role: 'Administrator',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPsmQ9BmshHN9vQQ5b4tdTrGvjwWXFM3zfG-vLZgLsJoccFSc0-WjqK8rdz3WyVctRlCRHvbjCRIyRjYU6cx62EevdSr_K9ZVlcQ2rn1y-F0RBm4cNsR2Ph0D4s39nN_bhua7tm1rCUfdTMVyuQTptQn7bouuwlnX7o7zkgDy7sHmmWKE0Vi0zJH1OnXGMW1T5LRevtCOiPD_q_RYMwfnz-6w2hccAhOqaPFnUyNAdk6CMCkBlH0uczwQakzSYGgGdo9Rgg5-RD8E',
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Classes', icon: 'school', href: '/admin/classes', active: true, fill: true },
  { label: 'Students', icon: 'group', href: '/admin/students' },
  { label: 'Teachers', icon: 'person', href: '/admin/teachers' },
  { label: 'Settings', icon: 'settings', href: '/admin/settings' },
];

export const statCards: StatCard[] = [
  {
    id: 'total-classes',
    title: 'Total Classes',
    value: 24,
    change: 2,
    changeType: 'increase',
  },
  {
    id: 'teachers-assigned',
    title: 'Teachers Assigned',
    value: 18,
    change: 5,
    changeType: 'increase',
  },
  {
    id: 'students-enrolled',
    title: 'Students Enrolled',
    value: 450,
    change: 1,
    changeType: 'decrease',
  },
  {
    id: 'timetable-completion',
    title: 'Timetable Completion',
    value: '85%',
    change: 10,
    changeType: 'increase',
  },
];

export const filterChips: FilterChip[] = [
  {
    id: 'grade',
    label: 'Grade',
    value: 'all',
    options: ['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
  },
  {
    id: 'class-arm',
    label: 'Class Arm',
    value: 'all',
    options: ['All', 'A', 'B', 'C', 'D', 'E'],
  },
  {
    id: 'homeroom-teacher',
    label: 'Homeroom Teacher',
    value: 'all',
    options: ['All', 'Ms. Evelyn Reed', 'Mr. David Chen', 'Ms. Sarah Jones', 'Mr. Brian Miller'],
  },
  {
    id: 'session-term',
    label: 'Session/Term',
    value: 'all',
    options: ['All', '2024-2025', 'Term 1', 'Term 2', 'Term 3'],
  },
];

export const classData: ClassData[] = [
  {
    id: 'grade-9-a',
    name: 'Grade 9 – A',
    grade: '9',
    section: 'A',
    teacher: {
      name: 'Ms. Evelyn Reed',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhgSeBOjtqeC1HxROTJDUdXQIbEoQkdUIPp_LXD2XyDHgL7Tk2E7HBbuZ8nmK50K8_lIs4uewMisO3tkn6w64jAvXn4AbXlNGR5zMJgYON08uPvhTNy5EwHRhLhxRmiTsM5CZE42s87k4qT74075sEj3E9i-bE2vx8vi3GsnbvY7KY_-8mhNFQRtRHbZp9YKQnVwJkHuE9Ahq9yZwvWrLP-le9otrOKyntLCTlCty08T1g3MwyZIm9kF1O4uL1uNyTaoRSPLEtGI4',
    },
    studentCount: 28,
    subjectCount: 8,
    timetableStatus: 'complete',
  },
  {
    id: 'grade-9-b',
    name: 'Grade 9 – B',
    grade: '9',
    section: 'B',
    teacher: {
      name: 'Mr. David Chen',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAG-tZrSSKE_bBsSFvsvQQ-fUdUUIeIQuMZFbsO7_xFRpaQxpFfW2Z3PTldHCLbNX7Pz71n-j8qzrp9p0IZ7KbZdAj8CEUXzJWnpRypVVhpvQjgWgYyKWNeoVX-bwBbMxvpHZVlkyfF-7wh8LsrJx4S0Ik_bkrykc5RvBdRursOnbXBIAWT4qUPv_MZuF9gHpGqKM1gQD_YfQjoBADHZIFoPtmsa38a6TG-D1TJzscAQRAzar3TKx6fCXzv3gqyZ_l-hJETEsEPo4',
    },
    studentCount: 25,
    subjectCount: 8,
    timetableStatus: 'incomplete',
  },
  {
    id: 'grade-10-a',
    name: 'Grade 10 – A',
    grade: '10',
    section: 'A',
    teacher: {
      name: 'Ms. Sarah Jones',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp6khfjLcchC5I8zLK1Id8rcx4IMIzt4kGHiF13DlTRVWFXpQ1pNcADRrXfprWKPGtuaMg3bjBQbOv4IzPaX-E-i1OcVVvBd-IsaQH5I59RLafR42tlpbKh33GHA9Qg7HHvJo0JhsgUV9RF5c2SnvyLFtdy-y26pXZ3cUkk3EjspsGb9bkDxJkGMhjuTnAeVZN57_dtLlqAhEBO69TbzWH7zA4MHsLk6xGyvMmlvSYvs0_NqO5czIlUAQX0PVuK2WDd3XP-hQKjhg',
    },
    studentCount: 30,
    subjectCount: 9,
    timetableStatus: 'complete',
  },
  {
    id: 'grade-8-c',
    name: 'Grade 8 – C',
    grade: '8',
    section: 'C',
    teacher: {
      name: 'Mr. Brian Miller',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_MOEa02qaHX96a4d6bhpqSXfLKFnGQeoBrZw1fAcCKGZUYFzVqBdnryJMNTxG0vNxbk4A1jAqS6gXv7RBEc1M4PljjjvXgMA_nVBF7ksYabZNmAo3yIYMGSfChBZEm0sUw83SQ89YnrK_cfsqIg-vDCvsg30vEmBdTtjC1n0BKUHJF8ayLlZ7zYSLeUvLxpZTZaGLCmI11U4bQ0gIxf7qn9wqLDmfkGplt3wfFIbYDe6BPyhm8smvaZhFFHTB4ciixA9hwXVfOQM',
    },
    studentCount: 22,
    subjectCount: 7,
    timetableStatus: 'complete',
  },
];