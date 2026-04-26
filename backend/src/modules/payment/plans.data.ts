export const PRICING_PLANS = [
  {
    "category": "parents",
    "tabs": [
      {
        "id": "parents-free",
        "type": "free",
        "name": "Parent Free",
        "pricing": { "monthly": 0, "yearly": 0 },
        "description": "Essential monitoring for one child's academic journey",
        "features": [
          "Link 1 student account",
          "Basic result view",
          "Attendance overview",
          "Profile management"
        ],
        "hasTrial": false,
        "trialDays": 0,
        "isPopular": false,
        "storage": "1GB"
      },
      {
        "id": "parents-essential",
        "type": "essential",
        "name": "Parent Essential",
        "pricing": { "monthly": 1500, "yearly": 15000 },
        "description": "Enhanced oversight and multi-child support for active parents",
        "features": [
          "Link up to 3 students",
          "Detailed performance analytics",
          "Weekly activity reports",
          "Real-time notifications"
        ],
        "hasTrial": true,
        "trialDays": 14,
        "isPopular": true,
        "storage": "5GB"
      },
      {
        "id": "parents-pro",
        "type": "pro",
        "name": "Parent Professional",
        "pricing": { "monthly": 3000, "yearly": 30000 },
        "description": "Comprehensive tracking for large families and educational planners",
        "features": [
          "Unlimited student links",
          "Advanced academic forecasting",
          "Direct teacher communication",
          "Priority support access"
        ],
        "hasTrial": true,
        "trialDays": 14,
        "isPopular": false,
        "storage": "15GB"
      }
    ]
  },
  {
    "category": "students",
    "tabs": [
      {
        "id": "students-free",
        "type": "free",
        "name": "Student Free",
        "pricing": { "monthly": 0, "yearly": 0 },
        "description": "Foundational access to learning materials and results",
        "features": [
          "Individual dashboard",
          "Course access",
          "Basic quiz attempts",
          "Result history"
        ],
        "hasTrial": false,
        "trialDays": 0,
        "isPopular": false,
        "storage": "1GB"
      },
      {
        "id": "students-essential",
        "type": "essential",
        "name": "Student Essential",
        "pricing": { "monthly": 1000, "yearly": 10000 },
        "description": "Boosted learning tools for dedicated academic progress",
        "features": [
          "Advanced study planner",
          "Unlimited quiz attempts",
          "Subject performance insights",
          "Mock examination portal"
        ],
        "hasTrial": true,
        "trialDays": 7,
        "isPopular": true,
        "storage": "10GB"
      },
      {
        "id": "students-pro",
        "type": "pro",
        "name": "Student Professional",
        "pricing": { "monthly": 2000, "yearly": 20000 },
        "description": "Maximum learning potential with AI assistance and deeper data",
        "features": [
          "AI-driven study recommendations",
          "Personalized result breakdown",
          "Offline mode access",
          "Premium resources library"
        ],
        "hasTrial": true,
        "trialDays": 14,
        "isPopular": false,
        "storage": "25GB"
      }
    ]
  },
  {
    "category": "schools",
    "tabs": [
      {
        "id": "schools-free",
        "type": "free",
        "name": "Free Tier",
        "pricing": { "monthly": 0, "yearly": 0 },
        "description": "Foundational tools for emerging schools to streamline basic operations",
        "features": [
          "Essential Admin Dashboard",
          "Management for 1 Admin",
          "Up to 50 Student Enrolments",
          "Standard Academic Reports",
          "Core Examination Tools",
          "Up to 3 Active Classes"
        ],
        "hasTrial": false,
        "trialDays": 0,
        "isPopular": false,
        "storage": "1GB"
      },
      {
        "id": "schools-starter",
        "type": "starter",
        "name": "Institutional Starter",
        "pricing": { "monthly": 5000, "yearly": 50000 },
        "description": "Comprehensive management for small institutions and private academies",
        "features": [
          "Enhanced Admin Control",
          "Up to 5 Administrative Accounts",
          "200 Student Capacity",
          "Automated Result Workflows",
          "Email & SMS Notifications",
          "Performance Analytics"
        ],
        "hasTrial": true,
        "trialDays": 14,
        "isPopular": true,
        "storage": "10GB"
      },
      {
        "id": "schools-growth",
        "type": "growth",
        "name": "Institutional Growth",
        "pricing": { "monthly": 15000, "yearly": 150000 },
        "description": "Scalable infrastructure for established schools with expanding departments",
        "features": [
          "Unlimited Administrator Access",
          "Unlimited Student Capacity",
          "Department Management",
          "Advanced Communication Suite",
          "Batch Result Processing",
          "Biometric Attendance Integration"
        ],
        "hasTrial": true,
        "trialDays": 30,
        "isPopular": false,
        "storage": "100GB"
      }
    ]
  },
  {
    "category": "teachers",
    "tabs": [
      {
        "id": "teachers-free",
        "type": "free",
        "name": "Educator Free",
        "pricing": { "monthly": 0, "yearly": 0 },
        "description": "Essential digital companion for individual educators",
        "features": [
          "Basic quiz maker",
          "Lesson planner",
          "Single class management",
          "Result entry"
        ],
        "hasTrial": false,
        "trialDays": 0,
        "isPopular": false,
        "storage": "2GB"
      },
      {
        "id": "teachers-essential",
        "type": "essential",
        "name": "Educator Essential",
        "pricing": { "monthly": 2000, "yearly": 20000 },
        "description": "Standardized toolset for individual teachers and educational creators",
        "features": [
          "Digital Course Creation",
          "Automated Quiz Generator",
          "Progression Tracking",
          "Performance Insights",
          "Resource Library"
        ],
        "hasTrial": true,
        "trialDays": 7,
        "isPopular": true,
        "storage": "10GB"
      },
      {
        "id": "teachers-pro",
        "type": "pro",
        "name": "Educator Professional",
        "pricing": { "monthly": 4000, "yearly": 40000 },
        "description": "Advanced autonomy for private tutors and independent educators",
        "features": [
          "Personalized Teacher Profile",
          "Multi-Class Management",
          "Dynamic Certificate Issuance",
          "Advanced Student Analytics",
          "Branded Reports"
        ],
        "hasTrial": true,
        "trialDays": 14,
        "isPopular": false,
        "storage": "25GB"
      }
    ]
  }
];

export const PRICING_FAQ = [
    {
        "question": "How do I choose the right plan for my school?",
        "answer": "Consider the size of your school and the specific features you need. Our Starter plan is great for small schools, while the Growth plan offers advanced features for larger institutions."
    },
    {
        "question": "Can I switch plans later?",
        "answer": "Yes, you can upgrade or downgrade your plan at any time. The changes will take effect at the start of your next billing cycle."
    },
    {
        "question": "Is there a free trial available?",
        "answer": "Yes, we offer a free trial for all our premium plans. You can explore the features and decide which plan works best for you before committing."
    },
    {
        "question": "What payment methods do you accept?",
        "answer": "We accept major credit cards, bank transfers, and other secure payment methods through our integrated payment gateway."
    }
];
