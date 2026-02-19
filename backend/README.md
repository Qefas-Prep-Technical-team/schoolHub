🚀 SchoolHub Backend

Welcome to the SchoolHub Backend repository.

This service handles all backend logic, authentication, database operations, and core business rules for the SchoolHub platform.

⚠️ Ensure the backend is properly configured before running the project.

📁 Project Structure

The backend is structured for clarity, scalability, and maintainability.

All important setup files and application logic are located inside the src/ directory.

backend/
│
└── src/
├── config/
├── interfaces/
├── middleware/
├── modules/
├── routes/
└── services/

📂 src/ Folder Breakdown
1️⃣ config/

Stores configuration logic for the project.

Includes:

cloudinary.ts → Cloud storage configuration

database.ts → Database connection setup

env.ts → Environment variable configuration

This ensures all environment-related setup is centralized.

2️⃣ interfaces/

Contains all TypeScript interfaces used throughout the project.

This ensures:

Strong type safety

Cleaner controllers and services

Better maintainability

3️⃣ middleware/

Stores global middleware logic such as:

Authentication protection

Authorization rules

Request validation

Error handling

This ensures secure and consistent request handling across the application.

4️⃣ modules/

This is where the core business logic is organized.

Each module represents a specific feature or domain of the system (e.g., Auth, Student, Teacher, School, etc.).

Each module contains:

module-name/
│
├── controller.ts
├── middleware.ts
└── route.ts

Structure Explanation

controller.ts → Handles request logic and responses

middleware.ts → Feature-specific middleware

route.ts → Routes related only to that module

✅ This modular approach prevents overcrowding API logic across multiple folders and keeps each feature self-contained.

5️⃣ routes/

This acts as the main routing branch.

It imports and connects all module routes into a central router.

Think of it as the entry point for all API branches.

6️⃣ services/

Contains reusable services required across the application.

Examples:

Token generation

Email sending (Resend)

Utility functions

Shared business logic

This keeps controllers clean and focused.

🏗 Architectural Philosophy

The backend follows:

Modular architecture

Clear separation of concerns

Feature-based folder structure

Scalable API design

This makes the project easy to maintain and extend as SchoolHub grows.

⚙️ Setup Reminder

Before running the backend:

Ensure .env is configured properly.

Database connection is valid.

Prisma client is generated.

Required services (Supabase, Cloudinary, etc.) are configured.

🔐 Best Practices

Do not place business logic inside routes.

Keep controllers lightweight.

Use services for reusable logic.

Keep modules independent and organized.
