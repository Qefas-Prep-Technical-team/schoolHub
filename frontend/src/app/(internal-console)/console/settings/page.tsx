"use client"

import { usePlatformSettings, useUpdatePlatformSettings } from "@/lib/api/hooks/usePlatformGovernance"
import { 
    Settings, 
    Globe, 
    Bell, 
    Cpu, 
    Save, 
    ShieldCheck, 
    Layout, 
    Cloud 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlatformSettingsPage() {
    const { data: settings, isLoading } = usePlatformSettings()
    const update = useUpdatePlatformSettings()

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Sovereignty</h1>
                    <p className="text-slate-500 font-medium mt-1">Configure global platform constants and operational parameters.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-10 h-14 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20 gap-2">
                    <Save size={18} /> Commit Configuration
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Column */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Platform Identity</h3>
                                <p className="text-sm text-slate-500 font-medium">Manage global branding and landing page credentials.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Platform Name</label>
                                    <Input 
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-slate-900 dark:text-white font-bold placeholder:text-slate-400"
                                        placeholder="School Hub"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Domain</label>
                                    <Input 
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-slate-900 dark:text-white font-bold placeholder:text-slate-400"
                                        placeholder="core-ops@schoolhub.io"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Support Email</label>
                                <Input 
                                    className="bg-slate-950 border-slate-800 rounded-xl h-12 text-white font-bold"
                                    placeholder="core-ops@schoolhub.io"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900/80">
                         <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Operational Logic</h3>
                                <p className="text-sm text-slate-500 font-medium">Control system-wide automation and feature flags.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { 
                                    key: "google_auth_enabled", 
                                    title: "Google Authentication", 
                                    desc: "Enable/Disable Google Login and Sign Up platform-wide.", 
                                    enabled: settings?.google_auth_enabled !== "false" 
                                },
                                { 
                                    key: "global_registration", 
                                    title: "Global Registration", 
                                    desc: "Enable/Disable new school signups globally.", 
                                    enabled: settings?.global_registration !== "false" 
                                },
                                { 
                                    key: "maintenance_mode", 
                                    title: "Maintenance Mode", 
                                    desc: "Activate platform-wide technical lockdown.", 
                                    enabled: settings?.maintenance_mode === "true" 
                                },
                            ].map((opt, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt.title}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{opt.desc}</p>
                                    </div>
                                    <Switch 
                                        checked={opt.enabled} 
                                        onCheckedChange={(checked) => {
                                            update.mutate({ key: opt.key, value: String(checked) })
                                        }}
                                        className="data-[state=checked]:bg-emerald-500" 
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Info Panel Column */}
                <div className="space-y-6">
                    <Card className="bg-indigo-600 p-8 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none rotate-12 group-hover:scale-110 transition-transform duration-700">
                            <Cloud size={200} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-2xl font-black text-white tracking-tighter leading-none">Security <br/> Consensus</h3>
                            <p className="text-sm font-medium text-indigo-100 opacity-80 leading-relaxed">
                                All global configuration changes require OWNER consensus and are logged to the immutable audit trail.
                            </p>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={14} className="text-white" />
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Authorization Active</span>
                                </div>
                                <p className="text-[10px] text-white/70 font-medium leading-relaxed">TLS 1.3 / AES-256 Encryption active for all CMS updates.</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] space-y-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Bell size={20} className="text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Version Logs</h4>
                        </div>
                        <div className="space-y-4">
                            {[1].map((i) => (
                                <div key={i} className="flex gap-4 pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                                    <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                                        <Layout size={14} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">v1.2.0-stable</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Core engine updated on March 24, 2026</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
