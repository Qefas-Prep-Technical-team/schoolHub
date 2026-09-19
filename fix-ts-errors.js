const fs = require('fs');
const path = require('path');

// 1. Fix duplicate require2FA in auth.controller.ts
const authControllerPath = path.join(__dirname, 'backend', 'src', 'modules', 'auth', 'auth.controller.ts');
if (fs.existsSync(authControllerPath)) {
  let content = fs.readFileSync(authControllerPath, 'utf8');
  
  // Replace double instances of require2FA with single instance
  content = content.replace(/require2FA: user\.isTwoFactorEnabled \|\| false,\s*require2FA: user\.isTwoFactorEnabled \|\| false,/g, 'require2FA: user.isTwoFactorEnabled || false,');
  
  // Save file
  fs.writeFileSync(authControllerPath, content);
  console.log('Fixed duplicated require2FA in auth.controller.ts');
} else {
  console.log('Could not find auth.controller.ts');
}

// 2. Fix ZodError type issue in validateZodRequest.ts
const middlewarePath = path.join(__dirname, 'backend', 'src', 'middleware', 'validateZodRequest.ts');
if (fs.existsSync(middlewarePath)) {
  let content = fs.readFileSync(middlewarePath, 'utf8');
  
  // The error is TS2339: Property 'errors' does not exist on type 'ZodError<unknown>'.
  // We can just cast the error to ZodError or use ZodError type explicitly.
  content = content.replace(/error\.errors/g, '(error as any).errors');
  
  fs.writeFileSync(middlewarePath, content);
  console.log('Fixed ZodError in validateZodRequest.ts');
} else {
  console.log('Could not find validateZodRequest.ts');
}
