import React from 'react'
import ChildCard from './ChildCard'
import AddChildCard from './AddChildCard'

interface Child {
  id: string
  name: string
  age: number
  grade: string
  class: string
  studentId: string
  imageUrl: string
  attendance: number
  gradeValue: string | number
  gradePercentage?: string
  status: 'active' | 'inactive'
  badge: {
    text: string
    color: 'green' | 'blue' | 'purple'
    icon: string
  }
}

const childrenData: Child[] = [
  {
    id: '1',
    name: 'Liam Johnson',
    age: 10,
    grade: 'A',
    class: 'Class 5-B',
    studentId: '#STU-2024-001',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvNqCWr86ivdkXUpf0q4vsv9PfNNrWqEIyzpyihxuSy2-MPQFaKmV0hvqSJwC6jhmhgrttC6n_okCrKqtNPgV-dN8kNsBs07b1PMza_B-euHM_RUELhuDnABmnKWqoFytPGMFBzbKAzYMPtYfcTs9R65R4G7vQ36bgCGkI7kNVJNnYc8hCesRvTlicAMWnjoUCKo7CPH4JiQc6DO1xafBSxwt0DDsx8PbIx84F1m1GxEPpFwrv4yJxng-kTmH563UUbQWqP8u9IB0',
    attendance: 98,
    gradeValue: 'A',
    gradePercentage: '92%',
    status: 'active',
    badge: {
      text: 'Top Performer',
      color: 'green',
      icon: 'stars',
    },
  },
  {
    id: '2',
    name: 'Emma Johnson',
    age: 7,
    grade: 'B+',
    class: 'Class 2-A',
    studentId: '#STU-2024-002',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbNaCIfUIdudfzoRUQby1nh1IGf4uN5nwVVoyo7V7X58uttGXq-6ew-HOJAETySYZPUXh8V_r0P-jSRiMhwDMWQiqdD_xbXk1vqYEfSTVteul-BXk5SlVNvqKOkA0VbnuvCd1M5lG2B21pG1UHmcB5c-7WNI2N1C0QH4lYCuU5USoDUmNPxmeaX2sYQGFFENlmO1qnWvgDtsy1IwFtobYO91ClrgZBrAFWAAb-utuz0TxkTsWoI5-C-WiC_WtlB3frTiwmAI_SDlE',
    attendance: 90,
    gradeValue: 'B+',
    gradePercentage: '88%',
    status: 'inactive',
    badge: {
      text: 'Steady Progress',
      color: 'blue',
      icon: 'trending_up',
    },
  },
  {
    id: '3',
    name: 'Noah Johnson',
    age: 5,
    grade: 'N/A',
    class: 'Kindergarten',
    studentId: '#STU-2024-003',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqLXyNJWrIsceZUcqwj7XuYxay17GzrmNzJZEJ19gJuk8Us8ywcxOohQL6wchEu9oEe-g36Bnk9JSJh_EYWzt-HfbA_VeZ_6OVyEjHhmO1rf3o9TMHnH-y_xlSFcoF38fFujGdbiUOxG9QiL09B-cqJNa27kuJ8pXoTugulQtf_oaSoluOS6_k3J2W9rWg18qUiUFylaraGeNobBDwpWOka8Gt_hF7H7EdQNeJGkTLx79lDS24QZjiOMFkAq_VI7JvpyeUQVjf6E8',
    attendance: 95,
    gradeValue: 'N/A',
    status: 'inactive',
    badge: {
      text: 'Energetic Learner',
      color: 'purple',
      icon: 'bolt',
    },
  },
]

export default function ChildrenGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {childrenData.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
      <AddChildCard />
    </div>
  )
}