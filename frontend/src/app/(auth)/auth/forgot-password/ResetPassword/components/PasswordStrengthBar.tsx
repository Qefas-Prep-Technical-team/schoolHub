// components/PasswordStrengthBar.tsx
"use client";

interface PasswordStrengthBarProps {
  password: string;
}

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    
    // Length check
    if (pwd.length >= 6) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(pwd)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(pwd)) strength += 1;
    
    // Contains number
    if (/\d/.test(pwd)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    
    const strengthMap = {
      0: { label: "Very Weak", color: "bg-red-500" },
      1: { label: "Weak", color: "bg-red-400" },
      2: { label: "Fair", color: "bg-yellow-500" },
      3: { label: "Good", color: "bg-blue-500" },
      4: { label: "Strong", color: "bg-green-500" },
      5: { label: "Very Strong", color: "bg-green-600" },
    };
    
    return { strength, ...strengthMap[Math.min(strength, 5) as keyof typeof strengthMap] };
  };

  const { strength, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
        <span className={`font-medium ${
          strength <= 1 ? 'text-red-500' : 
          strength <= 2 ? 'text-yellow-500' : 
          strength <= 3 ? 'text-blue-500' : 'text-green-500'
        }`}>
          {label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}