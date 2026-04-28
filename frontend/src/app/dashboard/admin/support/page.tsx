import SharedSupportCenter from "@/components/shared/SupportCenter";

export default function AdminSupportPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Support & Help</h1>
                    <p className="text-slate-500 font-medium mt-1">Get assistance from the SchoolHub platform support team.</p>
                </div>
            </div>
            
            <SharedSupportCenter />
        </div>
    );
}
