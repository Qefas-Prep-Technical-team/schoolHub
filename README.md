🎓 SchoolHub

SchoolHub is a full-stack educational management platform designed for simplicity, scalability, and efficiency.
It enables schools to manage students, teachers, administrators, and academic records seamlessly.

📂 Project Structure

This repository is organized into two main directories:

schoolHub/
│
├── frontend/ # Next.js client application
└── backend/ # Node.js + Express API server

Directory Overview

frontend/ → Handles UI, client-side logic, and API communication

backend/ → Manages authentication, database operations, and business logic

🛠 Tech Stack
Frontend

Next.js

Backend

Node.js

Express.js

Database

Supabase (PostgreSQL)

ORM

Prisma

🚀 Getting Started

Follow these steps to set up your local development environment.

1️⃣ Clone the Repository
git clone https://github.com/Qefas-Prep-Technical-team/schoolHub.git
cd schoolHub

2️⃣ Install Dependencies

You must install packages for both frontend and backend.

🔹 Backend Setup
cd backend
npm install

🔹 Frontend Setup
cd ../frontend
npm install

3️⃣ Configure Environment Variables

Create a .env file in both the frontend and backend folders.

Backend .env should include:

Supabase connection strings

Prisma database URL

Resend API keys

JWT secrets (if applicable)

Example:

DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_KEY=
RESEND_API_KEY=
JWT_SECRET=

Frontend .env should include:

Backend API URL

Public keys (if required)

Example:

NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

4️⃣ Run Development Servers

Open multiple terminals to run the required services.

▶ Run Backend
cd backend
npm run dev

▶ Run Web Frontend (Next.js)
cd frontend
npm run dev

▶ Run Desktop App (Tauri + Vite)
cd desktop
npm install
npm run tauri dev

▶ Run Mobile App (Expo)
cd Mobile
npm install
npm start

5️⃣ Clear Errors and Cache (Troubleshooting)

If you encounter unexpected errors, caching issues, or dependency conflicts, follow these steps to reset the project state:

🔹 Clear Next.js Cache (Web Frontend)
cd frontend
rm -rf .next
npm run dev

🔹 Clear Expo Cache (Mobile App)
cd Mobile
npx expo start -c

🔹 Clear Global npm Cache & Reinstall Dependencies (Any Project)
# Run this in the specific project directory (e.g., frontend, backend, desktop, Mobile)
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

📖 Folder Breakdown
frontend/

Next.js pages

Reusable UI components

State management

API integration logic

backend/

Express routes

Controllers

Middleware

Prisma schema

Authentication and authorization logic

🧪 Development Notes

Ensure your database is running before starting the backend.

Run Prisma migrations if necessary:

npx prisma migrate dev

Generate Prisma client:

npx prisma generate

🤝 Contributing

For updates, feature requests, or technical collaboration, contact the Qefas-Prep Technical Team.
🌿 Branching Strategy

This project follows a structured Git workflow using three primary branches:

main
staging
development

1️⃣ main

Contains the stable, production-ready code

Represents the final version of the project

Only fully tested and approved features are merged here

Used for live deployment

⚠️ No direct development should be done on this branch.

2️⃣ staging

Used for review and live demo display

Acts as a testing environment before production

Features merged here are considered stable but not yet final

Used for stakeholder review and QA testing

3️⃣ development

Used for active development

All new features, bug fixes, and improvements start here

May contain unstable or experimental code

Developers should branch from this for feature work

🔁 Workflow Summary
development → staging → main

Developers write code in development

After testing, changes are merged into staging

Once approved and verified, changes are merged into main

✅ Best Practice Rules

Never push directly to main

Use Pull Requests for merging

Always test in staging before merging to main

Keep development updated with latest changes from main
