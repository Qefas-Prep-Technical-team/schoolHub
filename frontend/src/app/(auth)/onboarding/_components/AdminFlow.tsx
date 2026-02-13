/* eslint-disable @typescript-eslint/no-explicit-any */
// app/onboarding/_components/AdminFlow.tsx

export default function AdminFlow({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
        <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">!</div>
        <p className="text-sm text-amber-800 font-medium">You are setting up the main administrative account for your institution.</p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">School Subdomain</label>
        <div className="flex items-center">
          <input className="flex-1 p-4 rounded-l-2xl border-2 border-r-0 border-slate-100" placeholder="my-school" />
          <div className="p-4 bg-slate-100 border-2 border-slate-100 rounded-r-2xl font-medium text-slate-500">.school.com</div>
        </div>
      </div>

      <button className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold">
        Complete Institution Setup
      </button>
    </div>
  );
}