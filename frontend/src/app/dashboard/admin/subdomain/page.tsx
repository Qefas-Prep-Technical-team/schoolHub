"use client";

import React from "react";
import {
  useSchoolProfile,
  useSchoolLandingPage,
  useUpdateSchoolLandingPage
} from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  Layout,
  Globe,
  Settings,
  Sparkles,
  Award,
  BookOpen,
  Users,
  Eye,
  Save,
  Plus,
  Trash2,
  Moon,
  Sun,
  Palette,
  ExternalLink,
  Copy,
  Check,
  CheckCircle,
  HelpCircle,
  FileText,
  RotateCcw,
  Crown,
  LayoutTemplate,
  Layers,
  Blocks
} from "lucide-react";

export default function SubdomainBuilderPage() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const { data: landingData, isLoading } = useSchoolLandingPage(schoolId);
  const { mutate: updateLandingPage, isPending: isSaving } = useUpdateSchoolLandingPage();

  const [activeTab, setActiveTab] = React.useState<"hero" | "about" | "highlights" | "testimonials" | "settings" | "templates">("hero");
  const [previewDarkMode, setPreviewDarkMode] = React.useState(true);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Form states matching public landing config structure
  const [heroTitle, setHeroTitle] = React.useState("");
  const [heroSubtitle, setHeroSubtitle] = React.useState("");
  const [aboutTitle, setAboutTitle] = React.useState("");
  const [aboutText, setAboutText] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [features, setFeatures] = React.useState<any[]>([]);
  const [testimonials, setTestimonials] = React.useState<any[]>([]);

  // Synchronize when landing data loads
  React.useEffect(() => {
    if (landingData?.landingPage) {
      setHeroTitle(landingData.landingPage.heroTitle || "");
      setHeroSubtitle(landingData.landingPage.heroSubtitle || "");
      setAboutTitle(landingData.landingPage.aboutTitle || "");
      setAboutText(landingData.landingPage.aboutText || "");
      setPrimaryColor(landingData.landingPage.primaryColor || "#3b82f6");
      setFeatures(landingData.landingPage.features || []);
      setTestimonials(landingData.landingPage.testimonials || []);
    } else if (schoolProfile) {
      // If no landing page exists yet, populate with default school data
      setHeroTitle(schoolProfile.name ? `Welcome to ${schoolProfile.name}` : "Welcome to Our School");
      setHeroSubtitle("Empowering the next generation of leaders through quality education and innovative learning.");
      setAboutTitle("About Us");
      setAboutText(schoolProfile.description || "We are dedicated to providing an exceptional educational experience that fosters academic excellence, character development, and a passion for lifelong learning.");
      setPrimaryColor("#3b82f6");
      setFeatures([
        {
          title: "Expert Faculty",
          description: "Learn from highly qualified educators dedicated to student success.",
          icon: "Award"
        },
        {
          title: "Modern Facilities",
          description: "State-of-the-art classrooms and laboratories for interactive learning.",
          icon: "Sparkles"
        },
        {
          title: "Holistic Education",
          description: "Focusing on academic, social, and emotional development.",
          icon: "Users"
        }
      ]);
      setTestimonials([
        {
          name: "Parent Name",
          role: "Parent",
          text: "This school has transformed my child's learning experience."
        }
      ]);
    }
  }, [landingData, schoolProfile]);

  const subdomain = schoolProfile?.subdomain;
  const subdomainUrl = React.useMemo(() => {
    if (!subdomain) return "";
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
    
    if (!baseUrl) {
      return `https://${subdomain}.qefashub.com`;
    }

    try {
      const url = new URL(baseUrl);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        // Windows and some browsers don't resolve *.localhost correctly, use lvh.me instead
        return `${url.protocol}//${subdomain}.lvh.me:${url.port || "3000"}`;
      } else {
        return `${url.protocol}//${subdomain}.${url.hostname}`;
      }
    } catch (e) {
      return `https://${subdomain}.qefashub.com`;
    }
  }, [subdomain]);

  const handleSave = () => {
    if (!schoolId) {
      toast.error("School ID not found. Please log in again.");
      return;
    }

    const payload = {
      heroTitle,
      heroSubtitle,
      aboutTitle,
      aboutText,
      primaryColor,
      features,
      testimonials,
      // Carry forward existing gallery if any
      gallery: landingData?.landingPage?.gallery || []
    };

    updateLandingPage(
      { schoolId, data: payload },
      {
        onSuccess: () => {
          toast.success("School Landing Page updated successfully!");
        },
        onError: (err: any) => {
          console.error(err);
          toast.error("Failed to save. Please try again.");
        }
      }
    );
  };

  const addFeature = () => {
    if (features.length >= 6) {
      toast.warn("You can add a maximum of 6 core highlights.");
      return;
    }
    setFeatures([
      ...features,
      {
        title: "New Highlight",
        description: "Describe this amazing feature or facility of your school.",
        icon: "Award"
      }
    ]);
  };

  const updateFeature = (index: number, key: string, value: string) => {
    const updated = [...features];
    updated[index][key] = value;
    setFeatures(updated);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addTestimonial = () => {
    if (testimonials.length >= 4) {
      toast.warn("You can add a maximum of 4 testimonials.");
      return;
    }
    setTestimonials([
      ...testimonials,
      {
        name: "Parent Name",
        role: "Parent / Alumni / Student",
        text: "Add a quote reflecting their positive experience at your school."
      }
    ]);
  };

  const updateTestimonial = (index: number, key: string, value: string) => {
    const updated = [...testimonials];
    updated[index][key] = value;
    setTestimonials(updated);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-semibold animate-pulse">Loading Visual Page Builder...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Visual Builder Sub-Header */}
      <div className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">Visual Page Builder</h1>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the look, branding, and copy of your public landing page.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {subdomain && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(subdomainUrl);
                  setCopiedLink(true);
                  toast.success("Public landing page URL copied!");
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                title="Copy live link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={subdomainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex items-center justify-center"
                title="Visit live page"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          <Link
            href="/dashboard/admin/subdomain/pro-builder"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            Switch to Pro
          </Link>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* Main Split Screen Interface */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-80px)]">
        {/* Left Hand: Controls Panel (Elementor Style) */}
        <div className="w-full lg:w-[480px] border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto shrink-0 pb-16">
          {/* Tab Selection */}
          <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 sticky top-0 z-10 backdrop-blur-sm">
            {[
              { id: "templates", label: "Templates" },
              { id: "hero", label: "Hero" },
              { id: "about", label: "About" },
              { id: "highlights", label: "Highlights" },
              { id: "testimonials", label: "Quotes" },
              { id: "settings", label: "Style" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all duration-200 ${
                  activeTab === t.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-500 bg-blue-500/5"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* TEMPLATES & PRO UPSELL SECTION */}
            {activeTab === "templates" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-900">
                  <LayoutTemplate className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">Website Templates</h3>
                </div>

                <div className="space-y-4">
                  {/* Free Default Template */}
                  <div className="relative p-1 rounded-2xl border-2 border-blue-500 bg-blue-500/5">
                    <div className="absolute -top-3 right-4 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg">
                      Current
                    </div>
                    <div className="w-full h-32 rounded-xl bg-slate-200 dark:bg-slate-900 overflow-hidden relative">
                      {/* Simple mock layout representation */}
                      <div className="absolute inset-x-0 top-0 h-10 bg-slate-300 dark:bg-slate-800"></div>
                      <div className="absolute inset-x-0 top-12 bottom-0 flex gap-2 p-2">
                        <div className="w-1/2 h-full bg-slate-300 dark:bg-slate-800 rounded"></div>
                        <div className="w-1/2 h-full bg-slate-300 dark:bg-slate-800 rounded"></div>
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Classic Single Page</h4>
                      <p className="text-[10px] text-slate-500">Included in Free Tier</p>
                    </div>
                  </div>

                  {/* Pro Templates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative p-1 rounded-2xl border border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed group">
                      <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" /> Pro
                      </div>
                      <div className="w-full h-24 rounded-xl bg-slate-200 dark:bg-slate-900 overflow-hidden group-hover:blur-sm transition-all relative">
                        <div className="absolute inset-x-2 top-2 h-4 bg-slate-300 dark:bg-slate-800 rounded-sm"></div>
                        <div className="absolute inset-x-2 top-8 bottom-2 bg-slate-300 dark:bg-slate-800 rounded-sm"></div>
                      </div>
                      <div className="p-2 text-center">
                        <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">Modern Multi-Page</h4>
                      </div>
                    </div>
                    
                    <div className="relative p-1 rounded-2xl border border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed group">
                      <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" /> Pro
                      </div>
                      <div className="w-full h-24 rounded-xl bg-slate-200 dark:bg-slate-900 overflow-hidden group-hover:blur-sm transition-all relative">
                        <div className="absolute left-2 w-8 top-2 bottom-2 bg-slate-300 dark:bg-slate-800 rounded-sm"></div>
                        <div className="absolute left-12 right-2 top-2 bottom-2 bg-slate-300 dark:bg-slate-800 rounded-sm"></div>
                      </div>
                      <div className="p-2 text-center">
                        <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">Sidebar Layout</h4>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
                  <h4 className="text-sm font-black text-amber-600 dark:text-amber-500 flex items-center gap-1.5 mb-3 uppercase tracking-tight">
                    <Crown className="w-4 h-4" /> Unlock Pro Features
                  </h4>
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      Add multiple pages (Admissions, Gallery, Staff, etc.)
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <Blocks className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      Custom UI components (Carousels, Video Backgrounds, Buttons)
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <Palette className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      Advanced layout designs and complete font control
                    </li>
                  </ul>
                  <Link
                    href="/dashboard/admin/subdomain/pro-builder"
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-[11px] font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 text-center inline-block"
                  >
                    Upgrade to Pro Now
                  </Link>
                </div>
              </div>
            )}

            {/* HERO SECTION CONTROLS */}
            {activeTab === "hero" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-900">
                  <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">Hero Banner Section</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hero Section Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder={`Welcome to ${schoolProfile?.schoolName || "Our School"}`}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hero Section Subtitle / Motto</label>
                  <textarea
                    rows={4}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Empowering young minds through academic excellence, innovation, and character building."
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none"
                  ></textarea>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-2xl flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Random Hero Backgrounds</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Your landing page will automatically cycle between dynamic campus background images randomly on page mount to maximize visual aesthetic and engagement!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT SECTION CONTROLS */}
            {activeTab === "about" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-900">
                  <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">Vision & Mission Section</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">About Title</label>
                  <input
                    type="text"
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                    placeholder="Our Vision & Mission"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">About Copy Description</label>
                  <textarea
                    rows={6}
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    placeholder="Describe your school's history, core educational values, and what makes the learning experience unique."
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* CORE HIGHLIGHTS CONTROLS */}
            {activeTab === "highlights" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-900">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">Core Highlights</h3>
                  </div>
                  <button
                    onClick={addFeature}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {features.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-500 font-medium">No custom highlights. Default values will be displayed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {features.map((feature, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/30 rounded-2xl space-y-3 relative group">
                        <button
                          onClick={() => removeFeature(idx)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Highlight {idx + 1} Title</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => updateFeature(idx, "title", e.target.value)}
                            placeholder="Expert Faculty"
                            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Description</label>
                          <input
                            type="text"
                            value={feature.description}
                            onChange={(e) => updateFeature(idx, "description", e.target.value)}
                            placeholder="Describe what makes this notable."
                            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Select Icon Category</label>
                          <select
                            value={feature.icon}
                            onChange={(e) => updateFeature(idx, "icon", e.target.value)}
                            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200 cursor-pointer"
                          >
                            <option value="Award">Award / Ribbon</option>
                            <option value="BookOpen">Book / Curriculum</option>
                            <option value="Users">Users / Faculty</option>
                            <option value="Calendar">Calendar / Schedule</option>
                            <option value="MessageSquare">Message / Feedback</option>
                            <option value="ShieldCheck">Shield / Safety</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TESTIMONIALS / QUOTES CONTROLS */}
            {activeTab === "testimonials" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-900">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">Parent & Student Reviews</h3>
                  </div>
                  <button
                    onClick={addTestimonial}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {testimonials.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-500 font-medium">No testimonials. Default reviews will be shown.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((t, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/30 rounded-2xl space-y-3 relative group">
                        <button
                          onClick={() => removeTestimonial(idx)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                          title="Remove testimonial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Reviewer Name</label>
                          <input
                            type="text"
                            value={t.name}
                            onChange={(e) => updateTestimonial(idx, "name", e.target.value)}
                            placeholder="Sarah Jenkins"
                            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Reviewer Role / Relationship</label>
                          <input
                            type="text"
                            value={t.role}
                            onChange={(e) => updateTestimonial(idx, "role", e.target.value)}
                            placeholder="Parent of Grade 5 Student"
                            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Review Content</label>
                          <textarea
                            rows={3}
                            value={t.text}
                            onChange={(e) => updateTestimonial(idx, "text", e.target.value)}
                            placeholder="Enter their feedback quote."
                            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none"
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BRANDING STYLE CONTROLS */}
            {activeTab === "settings" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-900">
                  <Palette className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">Branding Aesthetics</h3>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Primary Brand Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 cursor-pointer overflow-hidden p-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200 uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-pulse" /> Custom Presets
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">Click below to quickly set professional palettes:</p>
                  <div className="flex gap-2">
                    {[
                      { hex: "#3b82f6", name: "Classic Blue" },
                      { hex: "#10b981", name: "Emerald Green" },
                      { hex: "#6366f1", name: "Indigo Purple" },
                      { hex: "#f59e0b", name: "Gold Amber" },
                      { hex: "#ef4444", name: "Ruby Red" }
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setPrimaryColor(col.hex)}
                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 transition-all active:scale-90 relative"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {primaryColor === col.hex && (
                          <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow font-bold text-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Interactive Visual Live Preview Frame */}
        <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/20 p-6 flex flex-col items-center overflow-y-auto">
          {/* Frame Header */}
          <div className="w-full max-w-4xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-t-2xl py-3 px-6 flex items-center justify-between shrink-0 shadow-xl">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">LIVE PREVIEW SCREEN</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Selector */}
              <button
                onClick={() => setPreviewDarkMode(!previewDarkMode)}
                className={`p-1.5 border rounded-lg text-xs font-bold transition-all duration-200 ${
                  previewDarkMode
                    ? "bg-slate-900 border-slate-800 text-yellow-500 hover:text-yellow-400"
                    : "bg-white border-slate-200 text-amber-500 hover:text-amber-600 shadow-sm"
                }`}
                title="Toggle preview theme"
              >
                {previewDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Actual Visual Frame Content mimicking public page layout */}
          <div
            className={`w-full max-w-4xl border-x border-b border-slate-900 shadow-2xl transition-colors duration-300 min-h-[500px] flex flex-col relative rounded-b-2xl overflow-hidden ${
              previewDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
            }`}
          >
            {/* Header Mimic */}
            <div className={`h-14 border-b px-4 flex items-center justify-between shrink-0 transition-colors ${
              previewDarkMode ? "bg-slate-950/80 border-slate-900" : "bg-white/80 border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
                  {schoolProfile?.schoolName?.substring(0, 2).toUpperCase() || "QH"}
                </div>
                <span className="text-xs font-bold">{schoolProfile?.schoolName || "Your School"}</span>
              </div>
              <div className="flex gap-3 text-[10px] font-medium text-slate-400">
                <span>Home</span>
                <span>About</span>
                <span>Features</span>
              </div>
            </div>

            {/* Hero Mimic */}
            <div className="relative py-16 px-6 text-center flex flex-col items-center justify-center min-h-[300px] group overflow-hidden">
              {/* Default Mock Background Image inside preview */}
              <div className="absolute inset-0 z-0 opacity-40">
                <img
                  src="/image/backgroundSchool.jpg"
                  alt="Hero Background"
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${previewDarkMode ? "bg-slate-950" : "bg-slate-50"}`}></div>
              </div>

              <div className="relative z-10 space-y-4 max-w-xl">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[9px] font-bold ${
                    previewDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}
                  style={{ color: primaryColor, borderColor: `${primaryColor}20` }}
                >
                  <Sparkles className="w-3 h-3" /> Empowering Modern Education
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {heroTitle || `Welcome to ${schoolProfile?.schoolName || "Our School"}`}
                </h1>

                <p className="text-xs leading-relaxed opacity-80 max-w-md mx-auto">
                  {heroSubtitle || "Nurturing Minds, Shaping the Future of Education."}
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    className="px-4 py-2 text-[10px] font-bold text-white rounded-lg shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Access Portal
                  </button>
                  <button
                    className={`px-4 py-2 text-[10px] font-bold border rounded-lg ${
                      previewDarkMode ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Discover More
                  </button>
                </div>
              </div>
            </div>

            {/* About Mimic */}
            <div className={`py-12 px-6 border-t transition-colors ${
              previewDarkMode ? "border-slate-900" : "border-slate-200"
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900">
                  <img
                    src="/image/backgroundSchool2.jpg"
                    alt="Campus building"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-4 flex flex-col justify-end">
                    <p className="text-[10px] italic text-slate-100 font-bold mb-1">
                      "Education is the passport to the future..."
                    </p>
                    <span className="text-[8px] font-bold text-slate-400">Malcolm X</span>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">About Our School</span>
                  <h2 className="text-lg font-bold tracking-tight">
                    {aboutTitle || "Our Vision & Mission"}
                  </h2>
                  <p className="text-xs leading-relaxed opacity-80">
                    {aboutText ||
                      "We are dedicated to fostering academic excellence, integrity, and personal growth in every student. We offer a modern learning environment designed to empower future leaders."}
                  </p>
                </div>
              </div>
            </div>

            {/* Highlights Mimic */}
            <div className={`py-12 px-6 border-t transition-colors ${
              previewDarkMode ? "bg-slate-900/20 border-slate-900" : "bg-slate-100/50 border-slate-200"
            }`}>
              <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
                Why Choose {schoolProfile?.schoolName || "Our School"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {(features.length > 0 ? features : [
                  { title: "Expert Faculty", description: "Learn from highly qualified educators.", icon: "Users" },
                  { title: "Modern Curriculum", description: "Innovative curriculum tailored to meet global standards.", icon: "BookOpen" },
                  { title: "Holistic Development", description: "Strong focus on sports, arts, and character.", icon: "Award" }
                ]).map((f, i) => (
                  <div
                    key={i}
                    className={`p-5 border rounded-2xl text-left transition-all ${
                      previewDarkMode ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 border"
                      style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
                    >
                      {f.icon === "BookOpen" ? (
                        <BookOpen className="w-4 h-4" />
                      ) : f.icon === "Users" ? (
                        <Users className="w-4 h-4" />
                      ) : (
                        <Award className="w-4 h-4" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold mb-1.5">{f.title}</h4>
                    <p className="text-[10px] leading-relaxed opacity-70">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
