import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

import { sendVerificationEmail } from './src/modules/auth/auth.service';

async function main() {
  const email = process.env.TEST_EMAIL || 'test@example.com';
  console.log(`Sending test email to ${email}...`);
  try {
    const result = await sendVerificationEmail(email, '123456', 'welcome');
    console.log('Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

main().catch(console.error);
