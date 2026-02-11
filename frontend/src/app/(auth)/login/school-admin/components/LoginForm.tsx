"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// Assuming you have this component
import { useLoginMutation } from "../../services/use-auth-mutations";
import { LoginFormData, loginSchema } from "../../services/auth-schema";
import PasswordField from "../../student/components/PasswordField";
// import { adminRoleOptions } from "@/lib/constants/adminOptions"; // Commented out

export default function LoginForm() {
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const [selectedRole, setSelectedRole] = useState(''); // Commented out

  const { mutate: login, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit = (data: LoginFormData) => {
    setServerError("");
    console.log("Admin form submitted with:", data);
    login(
      { 
        email: data.email, 
        password: data.password,
        userType: "ADMIN" // Hardcoded as ADMIN for admin login
      },
      {
        onError: (error) => {
          setServerError(error.message);
        },
      }
    );
  };

  const handleInputChange = (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValue(field, value, { shouldValidate: true, shouldDirty: true });

      // Clear server error when user starts typing again
      if (serverError) {
        setServerError("");
      }
    };

  const handleBlur = (field: keyof LoginFormData) => async () => {
    await trigger(field);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('password', value, { shouldValidate: true, shouldDirty: true });

    if (serverError) {
      setServerError("");
    }
  };

  const handlePasswordBlur = async () => {
    await trigger('password');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Commented out role badge function
  // const getBadgeColor = (roleValue: string) => {
  //   const role = adminRoleOptions.find(r => r.value === roleValue);
  //   return role?.badgeColor || 'gray';
  // };

  // Disable button when form is invalid or during submission
  const isSubmitDisabled = isPending || !isValid || !isDirty;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div>
        <label className="flex flex-col">
          <p className="text-sm font-medium text-[#525F7F] dark:text-gray-300 pb-2">
            Email Address
          </p>
          <input
            type="email"
            placeholder="Enter your email address"
            value={emailValue || ""}
            onChange={handleInputChange('email')}
            onBlur={handleBlur('email')}
            className="flex w-full rounded-lg border border-[#CFD8E3] dark:border-gray-600 bg-white dark:bg-[#101622] text-[#0A2540] dark:text-white h-12 px-4 focus:border-[#6B7FD7] focus:ring-2 focus:ring-[#6B7FD7]/30 outline-none transition-colors duration-200"
          />
        </label>
        {errors.email && (
          <p className="text-red-500 text-xs mt-1 ml-1 animate-fadeIn">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Role Selector - Commented Out */}
      {/* <div>
        <label className="flex flex-col">
          <p className="text-sm font-medium text-[#525F7F] dark:text-gray-300 pb-2">
            Role Type
          </p>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex w-full rounded-lg border border-[#CFD8E3] dark:border-gray-600 bg-white dark:bg-[#101622] text-[#0A2540] dark:text-white h-12 px-4 focus:border-[#6B7FD7] focus:ring-2 focus:ring-[#6B7FD7]/30 outline-none transition-colors duration-200"
          >
            <option value="">Select a role</option>
            {adminRoleOptions.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>

        {selectedRole && (
          <div className="mt-3 flex items-center space-x-2 animate-fade-in">
            <div className={`w-3 h-3 rounded-full bg-${getBadgeColor(selectedRole)}-500 animate-pulse`}></div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getBadgeColor(selectedRole)}-100 text-${getBadgeColor(selectedRole)}-800 dark:bg-${getBadgeColor(selectedRole)}-900 dark:text-${getBadgeColor(selectedRole)}-300 border border-${getBadgeColor(selectedRole)}-200 dark:border-${getBadgeColor(selectedRole)}-700`}>
              {adminRoleOptions.find(role => role.value === selectedRole)?.label}
            </span>
          </div>
        )}
      </div> */}

      <div>
        <label className="flex flex-col">
          <div className="flex justify-between items-baseline">
            <p className="text-sm font-medium text-[#525F7F] dark:text-gray-300 pb-2">
              Password
            </p>
            <a
              href="#"
              className="text-sm font-medium text-[#6B7FD7] hover:text-[#0A2540] dark:hover:text-blue-400 transition-colors duration-200"
            >
              Forgot Password?
            </a>
          </div>

          {/* Using your PasswordField component */}
          <PasswordField
            value={passwordValue || ""}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            showPassword={showPassword}
            onTogglePassword={togglePasswordVisibility}
            placeholder="Enter your password"
          />
        </label>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1 ml-1 animate-fadeIn">
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400 animate-fadeIn">
          {serverError}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-[#0A2540] text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] dark:focus:ring-offset-[#1C2431] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            "Login as Admin"
          )}
        </button>
      </div>
    </form>
  );
}