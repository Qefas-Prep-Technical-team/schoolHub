"use client";

export default function StudentRegisterForm() {
  return (
    <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-8">
          <p className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
            Join SchoolHub as a Student
          </p>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            Access your lessons, assignments, and teachers all in one place.
          </p>
        </div>

        <form className="space-y-4">
          <Input label="Full Name" placeholder="Enter your full name" type="text" />
          <Input label="Email" placeholder="Enter your email" type="email" />
          <PasswordInput label="Password" placeholder="Enter your password" />
          <PasswordInput label="Confirm Password" placeholder="Confirm your password" />
          <Input
            label="Tenant ID (optional)"
            placeholder="Enter your Tenant ID"
            tooltip="Enter the ID provided by your school."
            type="text"
          />
          <Input
            label="Teacher Code (optional)"
            placeholder="Enter your Teacher Code"
            tooltip="Enter the code provided by your teacher to join their section."
            type="text"
          />
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
          >
            Create Student Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a href="#" className="font-medium text-primary hover:text-primary/80">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Input({ label, placeholder, tooltip, type }: any) {
  return (
    <label className="flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
          {label}
        </p>
        {tooltip && (
          <div className="relative group">
            <span className="material-symbols-outlined text-gray-400 text-base cursor-pointer">
              info
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <input
        className="form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/50"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PasswordInput({ label, placeholder }: any) {
  return (
    <label className="flex flex-col">
      <p className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
        {label}
      </p>
      <div className="relative w-full">
        <input
          className="form-input w-full rounded-lg border bg-background-light dark:bg-background-dark h-12 px-4 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/50"
          placeholder={placeholder}
          type="password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
        >
          <span className="material-symbols-outlined">visibility</span>
        </button>
      </div>
    </label>
  );
}
