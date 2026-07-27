import React, { useState } from "react";
import { UserRole } from "../../services/AuthService";
import { ROLE_OPTIONS } from "./RoleSelector";
import { useAuthStore } from "../../store/useAuthStore";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  Key,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Gavel,
  X
} from "lucide-react";
import { AuthHeaderControls } from "./AuthHeaderControls";

interface RegisterFormProps {
  role: UserRole;
  onBack: () => void;
  onSuccess: () => void;
  onSwitchToLogin?: () => void;
}

export const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, message: "" };

  const hasMinLen = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const noSpaces = !/\s/.test(password);

  const meetsStrong =
    hasMinLen && hasLower && hasUpper && hasSpecial && hasNumber && noSpaces;

  const meetsWeak = password.length >= 6 && (hasLower || hasUpper);

  if (meetsStrong) {
    return { strength: 4, message: "Strong" };
  }
  if (meetsWeak) {
    return { strength: 2, message: "Weak" };
  }
  return { strength: 1, message: "Very weak" };
};

import { getRoleTheme } from "../../theme/roleTheme";

export const RegisterForm: React.FC<RegisterFormProps> = ({ role, onBack, onSuccess, onSwitchToLogin }) => {
  const roleOption = ROLE_OPTIONS.find((r) => r.role === role) || ROLE_OPTIONS[0];
  const roleTheme = getRoleTheme(role);

  // Common Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Role-Specific Fields
  const [fullName, setFullName] = useState(""); // Used for Teacher, Student, Parent, and Admin (as Admin Name)
  const [schoolName, setSchoolName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [classCode, setClassCode] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  
  const [validationError, setValidationError] = useState<string | null>(null);

  const { register: registerUser, isLoading, authError } = useAuthStore();

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!acceptTerms) {
      setValidationError("You must accept the terms and conditions.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match. Please verify your entries.");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }

    let payload: any = {
      email: email.trim(),
      password,
      confirmPassword,
      acceptTerms,
    };

    if (role === "ADMIN") {
      if (!schoolName.trim() || !fullName.trim()) {
        setValidationError("Please fill in both School Name and Admin Name.");
        return;
      }
      payload.schoolName = schoolName.trim();
      payload.adminName = fullName.trim();
      if (subdomain.trim()) payload.subdomain = subdomain.trim();
    } else if (role === "TEACHER") {
      if (!fullName.trim()) {
        setValidationError("Please enter your full name.");
        return;
      }
      payload.fullName = fullName.trim();
      if (schoolCode.trim()) payload.schoolCode = schoolCode.trim();
      if (classCode.trim()) payload.classCode = classCode.trim();
    } else if (role === "STUDENT") {
      if (!fullName.trim()) {
        setValidationError("Please enter your full name.");
        return;
      }
      payload.fullName = fullName.trim();
      if (schoolCode.trim()) payload.schoolCode = schoolCode.trim();
      if (teacherCode.trim()) payload.teacherCode = teacherCode.trim();
      if (parentCode.trim()) payload.parentCode = parentCode.trim();
      if (classCode.trim()) payload.classCode = classCode.trim();
    } else if (role === "PARENT") {
      if (!fullName.trim()) {
        setValidationError("Please enter your full name.");
        return;
      }
      payload.fullName = fullName.trim();
      if (studentCode.trim()) payload.studentCode = studentCode.trim();
    }

    const result = await registerUser(role, payload);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header & Back Control */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Choice</span>
        </button>

        <AuthHeaderControls />
      </div>

      {/* Main Registration Card */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/80 p-8 md:p-10 shadow-lg dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] space-y-8 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Create {roleOption.title} Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete the form below to set up your {roleOption.title.toLowerCase()} workspace.
          </p>
        </div>

        {(validationError || authError) && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 p-3.5 text-xs text-rose-700 dark:text-rose-300 shadow-md">
            <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
            <span>{validationError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ---------------------------------
                ROLE-SPECIFIC TOP FIELDS
               --------------------------------- */}
            {role === "ADMIN" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    School Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Springfield High"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Admin Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Principal Skinner"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    School Subdomain (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="springfield-high"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* ---------------------------------
                COMMON AUTH FIELDS
               --------------------------------- */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder={
                    role === "ADMIN"
                      ? "admin@school.edu"
                      : role === "TEACHER"
                      ? "teacher@school.edu"
                      : "user@example.com"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-10 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((level) => {
                      let bgColor = "bg-slate-800";
                      if (level <= passwordStrength.strength) {
                        if (passwordStrength.strength === 4) bgColor = "bg-emerald-500";
                        else if (passwordStrength.strength >= 2) bgColor = "bg-amber-500";
                        else bgColor = "bg-rose-500";
                      }
                      return <div key={level} className={`flex-1 ${bgColor} transition-colors duration-300`} />;
                    })}
                  </div>
                  <div className="text-[10px] text-right font-medium text-slate-400">
                    {passwordStrength.message}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* ---------------------------------
                OPTIONAL RELATIONSHIP CODES
               --------------------------------- */}
            {(role === "TEACHER" || role === "STUDENT") && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  School Code (Optional)
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="sch-123456"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}
            
            {(role === "TEACHER" || role === "STUDENT") && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Class Code (Optional)
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="cls-123456"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {role === "STUDENT" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Teacher Code (Optional)
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="tch-123456"
                      value={teacherCode}
                      onChange={(e) => setTeacherCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Parent Code (Optional)
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="par-123456"
                      value={parentCode}
                      onChange={(e) => setParentCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
              </>
            )}

            {role === "PARENT" && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Student Code (Optional)
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="stu-123456"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Terms and Conditions */}
          <div className="flex items-start gap-3 mt-4">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="acceptTerms" className="text-xs text-slate-400 leading-tight">
              I agree to the QefasHub{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-indigo-400 hover:underline hover:text-indigo-300 transition-colors"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-indigo-400 hover:underline hover:text-indigo-300 transition-colors"
              >
                Privacy Policy
              </button>
              .
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password || !acceptTerms}
            className={`w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${roleOption.badgeColor} py-3.5 text-sm font-bold shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Create {roleOption.title} Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Already have an account link */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-4">
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={onSwitchToLogin || onBack}
            className={`font-bold ${roleTheme.activeNavText} hover:underline transition-colors`}
          >
            Sign In to {roleOption.title} Portal
          </button>
        </div>
      </div>

      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
};

/* Privacy Policy Modal */
const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-800/80 flex justify-between items-center bg-slate-800/20">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            Privacy Policy
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-400 space-y-4 custom-scrollbar">
          <p className="font-semibold text-slate-200">Last Updated: May 9, 2026</p>
          <p>Your privacy is important to us. We collect minimal data required for school management, including your name, email, and institutional details.</p>
          <p>We do not sell your data to third parties. All data is encrypted and stored securely on our servers or your local desktop storage cache.</p>
          <div>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc ml-6 space-y-1 text-slate-300">
              <li>Provide and maintain our native desktop experience</li>
              <li>Ensure secure offline authentication</li>
              <li>Provide customer support</li>
              <li>Gather analysis or valuable information so that we can improve our service</li>
            </ul>
          </div>
          <p>By using QefasHub Desktop, you consent to our data collection practices as outlined in this policy.</p>
        </div>
        <div className="p-6 border-t border-slate-800/80 bg-slate-800/20">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold rounded-xl hover:bg-indigo-600/40 hover:text-white transition-all shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

/* Terms of Service Modal */
const TermsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-800/80 flex justify-between items-center bg-slate-800/20">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Gavel className="h-5 w-5 text-indigo-400" />
            Terms of Service
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-400 space-y-4 custom-scrollbar">
          <p className="font-semibold text-slate-200">Last Updated: May 9, 2026</p>
          <p>Welcome to QefasHub Desktop. By accessing our native application, you agree to these terms and conditions.</p>
          <div>
            <h4 className="font-semibold text-slate-200 mb-1">1. User Accounts</h4>
            <p>You must provide accurate information when creating an account. You are responsible for safeguarding your password and local data.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-1">2. Acceptable Use</h4>
            <p>You agree not to misuse our services. This includes not interfering with our application or trying to access it using a method other than the interface and instructions we provide.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-1">3. Offline Synchronization</h4>
            <p>QefasHub Desktop provides offline capabilities. You agree that offline data is cached locally and will synchronize with the cloud once a network connection is established.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-1">4. Termination</h4>
            <p>We may terminate or suspend access to our service immediately, without prior notice, for any reason whatsoever, including breach of terms.</p>
          </div>
        </div>
        <div className="p-6 border-t border-slate-800/80 bg-slate-800/20">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold rounded-xl hover:bg-indigo-600/40 hover:text-white transition-all shadow-lg"
          >
            I Accept the Terms
          </button>
        </div>
      </div>
    </div>
  );
};
