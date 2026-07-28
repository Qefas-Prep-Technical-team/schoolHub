import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { SelectUserTypeScreen } from "../components/auth/SelectUserTypeScreen";
import { AuthChoiceScreen } from "../components/auth/AuthChoiceScreen";
import { AuthLoginForm } from "../components/auth/AuthLoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { DesktopVerificationScreen } from "../components/auth/DesktopVerificationScreen";
import { UserRole } from "../services/AuthService";
import { ArrowLeft } from "lucide-react";

type AuthStep = "CHOICE" | "LOGIN" | "REGISTER";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedUserType, selectUserType, clearSelectedUserType, verificationPending, clearVerificationPending } = useAuthStore();
  const [activeStep, setActiveStep] = useState<AuthStep>("CHOICE");

  const handleSelectRole = async (role: UserRole) => {
    await selectUserType(role);
    setActiveStep("CHOICE");
  };

  const handleSuccess = () => {
    navigate("/", { replace: true });
  };

  // Step 0: Verification Pending (6-digit OTP code input)
  if (verificationPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 relative z-10">
        <DesktopVerificationScreen onBack={clearVerificationPending} onSuccess={handleSuccess} />
      </div>
    );
  }

  // Step 1: No role selected yet
  if (!selectedUserType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 relative z-10">
        <SelectUserTypeScreen onSelectRole={handleSelectRole} />
      </div>
    );
  }

  // Step 2 & 3: Role selected
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 relative z-10">
      <div className="w-full max-w-2xl">
        {activeStep === "CHOICE" && (
          <AuthChoiceScreen
            role={selectedUserType}
            onChangeRole={clearSelectedUserType}
            onChooseSignIn={() => setActiveStep("LOGIN")}
            onChooseRegister={() => setActiveStep("REGISTER")}
          />
        )}

        {activeStep === "LOGIN" && (
          <div className="w-full space-y-4 animate-in fade-in duration-300">
            <button
              onClick={() => setActiveStep("CHOICE")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Choice</span>
            </button>
            <AuthLoginForm
              role={selectedUserType}
              onSuccess={handleSuccess}
              onSwitchToRegister={() => setActiveStep("REGISTER")}
            />
          </div>
        )}

        {activeStep === "REGISTER" && (
          <RegisterForm
            role={selectedUserType}
            onBack={() => setActiveStep("CHOICE")}
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setActiveStep("LOGIN")}
          />
        )}
      </div>
    </div>
  );
};
