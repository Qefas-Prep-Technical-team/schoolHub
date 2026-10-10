const fs = require("fs");
const file = "c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/subjects/page.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace(
    "import SubjectCard from \"./components/SubjectCard\";",
    "import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from \"@/components/ui/tooltip\";\r\nimport SubjectCard from \"./components/SubjectCard\";"
);
fs.writeFileSync(file, content);
console.log("Fixed imports again");

