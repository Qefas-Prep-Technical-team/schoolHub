const fs = require('fs');
const path = 'c:/Users/HP/Documents/GitHub/Qefas Project/schoolHub/frontend/src/app/dashboard/admin/teachers/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace Tooltip from @/components/ui/tooltip with UITooltip
content = content.replace(
  /import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@\/components\/ui\/tooltip'/,
  "import { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'"
);

// Replace the two occurrences of <Tooltip delayDuration={300}> with <UITooltip delayDuration={300}>
// and </Tooltip> with </UITooltip> inside the TooltipProvider tags
content = content.replace(/<Tooltip delayDuration=\{300\}>/g, '<UITooltip delayDuration={300}>');
content = content.replace(/<\/Tooltip>\s*<\/TooltipProvider>/g, '</UITooltip>\n                        </TooltipProvider>');

fs.writeFileSync(path, content);
console.log('fixed tooltip import collision');
