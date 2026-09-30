import { sendVerificationEmail } from './src/modules/auth/auth.service';

async function main() {
  try {
    const email = process.env.TEST_EMAIL || 'test@example.com';
    console.log('Sending test email to:', email);
    await sendVerificationEmail(email, '123456');
    console.log('Successfully sent test email!');
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

main();
