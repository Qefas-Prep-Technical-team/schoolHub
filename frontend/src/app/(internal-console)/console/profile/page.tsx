"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  ShieldCheck,
  Key,
  Globe,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Github,
  Twitter,
  Linkedin,
  Save,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Unlink,
  Link2,
  Upload,
  Trash2,
  MessageCircle,
  Headphones,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  usePlatformStaffProfile,
  useUpdatePlatformStaffProfile,
  useChangePlatformStaffPassword,
  useLinkPlatformSocial,
} from "@/lib/api/hooks/usePlatformAdminProfile";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";
import { toast } from "react-toastify";

export default function ConsoleProfilePage() {
  const { data: profile, isLoading, refetch } = usePlatformStaffProfile();
  const updateProfileMutation = useUpdatePlatformStaffProfile();
  const changePasswordMutation = useChangePlatformStaffPassword();
  const linkSocialMutation = useLinkPlatformSocial();

  const { staff, updateStaff } = usePlatformStaffStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<"SUPPORT_AGENT" | "GENERAL" | "SECURITY" | "SOCIALS">("SUPPORT_AGENT");

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Social Connect Modal/Input state
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [socialHandleInput, setSocialHandleInput] = useState("");

  // Sync profile state when data arrives
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setDisplayName(profile.displayName || profile.agentDisplayName || staff?.displayName || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setProfileImage(profile.profileImage || "");
    }
  }, [profile, staff]);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setProfileImage(res);
        toast.info("Image loaded! Click 'Save Profile Details' to apply.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.warning("Full name is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.warning("Please provide a valid official email address.");
      return;
    }

    await updateProfileMutation.mutateAsync({
      fullName: fullName.trim(),
      displayName: displayName.trim() || null,
      agentDisplayName: displayName.trim() || null,
      email: email.trim(),
      phone: phone.trim() || null,
      bio: bio.trim() || null,
      profileImage: profileImage.trim() || null,
    });

    if (staff) {
      updateStaff({
        fullName: fullName.trim(),
        displayName: displayName.trim() || null,
        email: email.trim(),
        profileImage: profileImage.trim() || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.warning("Please provide your current and new password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.warning("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    await changePasswordMutation.mutateAsync({
      currentPassword,
      newPassword,
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggleSocial = async (provider: "google" | "facebook", isConnected: boolean) => {
    if (isConnected) {
      if (window.confirm(`Disconnect your ${provider} account from console login?`)) {
        await linkSocialMutation.mutateAsync({
          provider,
          action: "unlink",
        });
      }
    } else {
      setConnectingProvider(provider);
      setSocialHandleInput("");
    }
  };

  const handleConfirmSocialConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingProvider) return;

    await linkSocialMutation.mutateAsync({
      provider: connectingProvider as any,
      action: "link",
      identifier: socialHandleInput.trim() || `${connectingProvider}_${profile?.email || "admin"}`,
    });

    setConnectingProvider(null);
    setSocialHandleInput("");
  };

  const socialPlatforms = [
    {
      id: "google" as const,
      name: "Google Workspace & Identity",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
          />
        </svg>
      ),
      description: "One-click OAuth authentication using your official corporate Google account.",
      connected: !!profile?.googleId || (profile?.socialLinks && !!profile.socialLinks["google"]),
      identifier: profile?.googleId || profile?.socialLinks?.["google"],
    },
    {
      id: "facebook" as const,
      name: "Facebook & Meta Login",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#1877F2"
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
      ),
      description: "Authenticate into the platform console using your verified Facebook / Meta account.",
      connected: !!profile?.facebookId || (profile?.socialLinks && !!profile.socialLinks["facebook"]),
      identifier: profile?.facebookId || profile?.socialLinks?.["facebook"],
    },
  ];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* ── TOP HERO HEADER ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-blue-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center border-4 border-white/10 shadow-2xl overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName ? fullName.slice(0, 2).toUpperCase() : "AD"}</span>
                )}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Console Administrator Credentials</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {profile?.fullName || "Platform Staff Administrator"}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                <span className="flex items-center gap-1 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {profile?.email}
                </span>
                <Badge className="bg-blue-600 text-[10px] font-bold py-0.5">
                  Role: {profile?.role || "OWNER"}
                </Badge>
                {displayName && (
                  <Badge variant="outline" className="border-blue-400/40 bg-blue-500/20 text-blue-300 text-[10px] font-bold py-0.5">
                    Agent Chat Name: {displayName}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold h-10 px-3.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("SUPPORT_AGENT")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "SUPPORT_AGENT"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Support Agent</span>
          <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 font-bold">
            Live Chat
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("GENERAL")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "GENERAL"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile &amp; Biography</span>
        </button>

        <button
          onClick={() => setActiveTab("SOCIALS")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "SOCIALS"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Social Login &amp; SSO</span>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] px-1.5 py-0">
            {socialPlatforms.filter((p) => p.connected).length} Linked
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("SECURITY")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === "SECURITY"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Security &amp; Credentials</span>
        </button>
      </div>

      {/* ── TAB: SUPPORT AGENT CONFIGURATION ─────────────────────────── */}
      {activeTab === "SUPPORT_AGENT" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Edit Form (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6">
              <CardHeader className="p-0 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Headphones className="w-4 h-4" />
                  <span>Public Support Persona</span>
                </div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Support Agent Persona &amp; Photo
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-1">
                  Configure the official agent persona name and photo displayed to educators, students, parents, and administrators in real-time technical chats and discussion threads.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Photo Upload Area */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Support Agent Profile Photo</span>
                      <span className="text-[11px] font-normal text-slate-400 lowercase">png, jpg, webp (max 5MB)</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-blue-400/50 overflow-hidden">
                          {profileImage ? (
                            <img src={profileImage} alt={displayName || fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(displayName || fullName || "AG").slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-sm" />
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageFileUpload}
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            size="sm"
                            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Agent Photo</span>
                          </Button>
                          {profileImage && (
                            <Button
                              type="button"
                              onClick={() => {
                                setProfileImage("");
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 rounded-xl border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-bold gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </Button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          This image appears in the header and message bubbles during live chats with teachers, students, parents, and school principals.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Display Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Display Agent Name</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-bold">
                        Public Chat Name
                      </Badge>
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Agent Alex, Sarah (Qefas Support)"
                        className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      The official agent persona name shown to users instead of your full legal name.
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                          Active Live Chat Operator
                        </p>
                        <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80">
                          Your profile photo and agent name are synced in real-time across support desks.
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 text-white text-[10px] font-bold">
                      Online
                    </Badge>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all h-11"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Support Agent Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Chat Simulator Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  Live Chat View Preview
                </h3>
                <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold">
                  Interactive View
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                How users across the platform see your photo and agent identity in real time:
              </p>

              {/* Mock Chat Header */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-blue-400/40 overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt={displayName || fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(displayName || fullName || "AD").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {displayName || fullName || "Qefas Support Agent"}
                      </p>
                      <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1 py-0 rounded border border-blue-500/30">
                        Support Agent
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      Console Agent: {displayName || fullName || "Active Support Agent"} • Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Mock Chat Conversation */}
              <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                {/* User Inquiry */}
                <div className="flex items-end justify-end gap-2 max-w-[90%] ml-auto">
                  <div className="bg-blue-600 text-white p-2.5 rounded-2xl rounded-br-none text-xs leading-relaxed shadow-sm">
                    <p>Hello! I need assistance with our grade sheet upload.</p>
                    <span className="text-[9px] opacity-75 mt-1 block text-right">10:42 AM</span>
                  </div>
                </div>

                {/* Agent Reply */}
                <div className="flex items-end gap-2 max-w-[90%] mr-auto">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden shadow-xs border border-blue-400/30">
                    {profileImage ? (
                      <img src={profileImage} alt={displayName || fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(displayName || fullName || "SA").slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-2.5 rounded-2xl rounded-bl-none text-xs leading-relaxed shadow-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                        {displayName || fullName || "Support Agent"}
                      </span>
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                    </div>
                    <p>I would be delighted to assist! Please confirm your assigned class code.</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">10:43 AM</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 1: GENERAL PROFILE INFORMATION ─────────────────────────── */}
      {activeTab === "GENERAL" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Edit Form (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6">
              <CardHeader className="p-0 pb-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Administrative Identity
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-1">
                  Update your official staff details, title, and contact methods used across platform communications.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Full Name (Legal)
                      </label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alexander Vance"
                        required
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Display Agent Name</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-bold">
                            Live Support Chat
                          </Badge>
                        </label>
                      </div>
                      <div className="relative">
                        <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Agent Alex, Sarah (Qefas Support)"
                          className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        The agent name shown to educators in live chat and discussions (<span className="text-blue-500 font-medium">/dashboard/teacher/support</span>) instead of your legal name.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Official Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@qefas.com"
                          required
                          className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 816 524 6864"
                          className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Assigned Platform Role
                    </label>
                    <Input
                      value={`Platform ${profile?.role || "OWNER"}`}
                      disabled
                      className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-sm font-bold text-blue-600 dark:text-blue-400 cursor-not-allowed"
                    />
                  </div>

                  {/* ── IMAGE UPLOAD AREA ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Profile Avatar / Photo
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      {/* Avatar Preview with Camera Overlay */}
                      <div className="relative group shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
                          {profileImage ? (
                            <img src={profileImage} alt={fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{fullName ? fullName.slice(0, 2).toUpperCase() : "AD"}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                        >
                          <Camera className="w-4 h-4 mb-0.5" />
                          <span>Change</span>
                        </button>
                      </div>

                      {/* File Input & Controls */}
                      <div className="space-y-2 flex-1 text-center sm:text-left">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs h-9 px-3.5 cursor-pointer shadow-xs"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                            Upload Photo
                          </Button>

                          {profileImage && (
                            <Button
                              type="button"
                              onClick={() => setProfileImage("")}
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold h-9 px-2.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400">
                          Upload PNG, JPG, or WebP (max 5MB). Photo is saved and displayed across support desks and identity tags.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Administrative Bio / Responsibility Scope
                    </label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Lead Technical Engineer overseeing institutional synchronizations, database integrity, and high-priority educator support desks."
                      rows={4}
                      className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-medium leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all h-11"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Profile Details"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Side Info & Metadata (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Chat Agent Preview */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-pink-500" />
                  Teacher Support Preview
                </h3>
                <Badge variant="outline" className="text-[9px] border-pink-500/30 text-pink-600 dark:text-pink-400 font-bold">
                  Live View
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                How educators view your identity in the live support chat (<span className="text-pink-600 dark:text-pink-400 font-semibold">/dashboard/teacher/support</span>):
              </p>

              {/* Mock Chat Header */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-pink-400/40 overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt={displayName || fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(displayName || fullName || "AD").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {displayName || fullName || "Qefas Technical Support"}
                      </p>
                      <span className="text-[8px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-1 py-0 rounded border border-pink-500/30">
                        Support Agent
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      Console Agent: {displayName || fullName || "Active Support Agent"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mock Chat Bubble */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-end gap-2 max-w-[95%]">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-100" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {displayName || fullName || "Platform Engineer"}
                      </span>
                      <span className="text-[8px] bg-blue-600 text-white px-1 py-0 rounded font-bold">
                        Staff Engineer
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs">
                      Hello! I&apos;m here to assist you with your portal inquiry.
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-blue-500" />
                Administrative Privileges
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">Full System Authority</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Authorized to treat support inquiries, configure global school quotas, and manage database FAQs.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">Active Since</p>
                  <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Active Session"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 2: SOCIAL LOGIN & SSO INTEGRATION ──────────────────────── */}
      {activeTab === "SOCIALS" && (
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6">
            <CardHeader className="p-0 pb-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Linked Social Logins &amp; Single Sign-On (SSO)
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-1">
                Link external provider accounts for seamless one-click sign-in to the Qefas Platform Console.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-6">
              <div className="space-y-4">
                {socialPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
                        {platform.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {platform.name}
                          </h4>
                          {platform.connected ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 text-[10px]">
                              Not Linked
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                          {platform.description}
                        </p>
                        {platform.connected && platform.identifier && (
                          <p className="text-[11px] font-mono font-medium text-blue-600 dark:text-blue-400">
                            Identifier: {platform.identifier}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {platform.connected ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={linkSocialMutation.isPending}
                          onClick={() => handleToggleSocial(platform.id, true)}
                          className="rounded-xl border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold h-9"
                        >
                          <Unlink className="w-3.5 h-3.5 mr-1.5" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={linkSocialMutation.isPending}
                          onClick={() => handleToggleSocial(platform.id, false)}
                          className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold h-9 px-4"
                        >
                          <Link2 className="w-3.5 h-3.5 mr-1.5" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modal / Dialog for connecting a provider */}
          {connectingProvider && (
            <Card className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-500/40 shadow-lg animate-in fade-in-50">
              <form onSubmit={handleConfirmSocialConnect} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Connect {connectingProvider.toUpperCase()} SSO
                  </h4>
                  <button
                    type="button"
                    onClick={() => setConnectingProvider(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter your {connectingProvider} user ID, username, or verified corporate email to authorize sign-in:
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`e.g. admin@${connectingProvider}.com or handle`}
                    value={socialHandleInput}
                    onChange={(e) => setSocialHandleInput(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                  <Button
                    type="submit"
                    disabled={linkSocialMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-10 px-4 shrink-0"
                  >
                    {linkSocialMutation.isPending ? "Linking..." : "Authorize SSO"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB 3: SECURITY & PASSWORD CHANGE ──────────────────────────── */}
      {activeTab === "SECURITY" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6">
              <CardHeader className="p-0 pb-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  Update Security Password
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-1">
                  Rotate your master console authorization password. Minimum 6 characters required.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-6">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create strong new password"
                        required
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all h-11"
                    >
                      {changePasswordMutation.isPending ? "Updating Password..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Password Hygiene Standards
              </h3>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  At least 6 characters (12+ recommended).
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Combination of uppercase, lowercase, numbers, and symbols.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Never reuse previous credentials across platform domains.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
