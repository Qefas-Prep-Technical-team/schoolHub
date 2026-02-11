# Flexiti Studio Fullstack Template

A fullstack template project with frontend and backend in one repository.

---

## Project Structure

my-project/
├── backend/
│ ├── src/
│ ├── package.json
│ └── tsconfig.json
├── frontend/
│ ├── src/
│ ├── package.json
│ └── tsconfig.json (or next.config.js)
├── .gitignore
└── README.md

yaml
Copy
Edit

---

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
Frontend
In a new terminal window/tab:


cd frontend
npm install
npm run dev
Updating Packages
To update all npm packages to their latest versions:


npm outdated          # Check outdated packages
npm update            # Update minor and patch versions
npm install <pkg>@latest  # Update specific package to latest major version
For upgrading all dependencies interactively:


npx npm-check-updates -u
npm install
(You may need to install npm-check-updates globally first: npm install -g npm-check-updates)

Using degit to Clone This Template
To clone this repo without git history, use:


npx degit your-username/your-repo my-new-project
ok
cd my-new-project
.gitignore
Make sure your .gitignore includes:


node_modules/
**/node_modules/
dist/
build/
.env
License
MIT



---

Just copy that into a new file named `README.md` in your project root folder.

If you want me to customize it further, just ask!

# == task== 
TODO: SET UP SCHOOL LOGIN PAGE
TODO: setup other admin registration
TODO: set up reset password
