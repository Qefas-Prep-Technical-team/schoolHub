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

Open two terminals to run both services simultaneously.

▶ Run Backend
cd backend
npm run dev

▶ Run Frontend
cd frontend
npm run dev

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
