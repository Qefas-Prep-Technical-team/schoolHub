/**
 * Shared password strength utility.
 *
 * Previously lived in SchoolCard.tsx and was imported by ParentForm,
 * TeacherRegisterForm, and StudentRegisterForm. Extracted here so it is
 * role-agnostic and import-safe regardless of which form file is refactored.
 */

export interface PasswordStrengthResult {
  strength: number; // 0–4
  message: string;
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { strength: 0, message: '' };

  let strength = 0;

  if (password.length >= 8)          strength++;
  if (/[A-Z]/.test(password))        strength++;
  if (/[0-9]/.test(password))        strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const messages: Record<number, string> = {
    0: '',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
  };

  return { strength, message: messages[strength] ?? '' };
}
