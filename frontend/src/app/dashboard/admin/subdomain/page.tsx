"use client";

import React from "react";
import {
  useSchoolProfile,
  useSchoolLandingPage,
  useUpdateSchoolLandingPage
} from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { toast } from "react-toastify";
import ImageUpload from "@/components/reusable/ImageUpload";
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
  Blocks,
  MapPin,
  Phone,
  Mail,
  X,
  LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";

const TEMPLATE_CONFIGS = [
  {
    id: "modern-academic",
    name: "Modern Academic",
    description: "A professional, multi-page layout ideal for modern schools and universities. Includes Home, About Us, and Admissions pages.",
    isPro: true,
    thumbnailType: "modern",
    customPages: [
      {
        id: "home",
        title: "Home",
        slug: "/",
        blocks: [
          {
            id: "b1",
            type: "HERO",
            content: { title: "Welcome to Excellence", subtitle: "Empowering the next generation with modern education.", bgImage: "/image/backgroundSchool.jpg", overlayOpacity: 50 }
          },
          {
            id: "b2",
            type: "TEXT",
            content: { heading: "Our Mission", text: "We strive to provide a world-class education that fosters critical thinking and innovation.", alignment: "center", padding: "py-16" }
          },
          {
            id: "b3",
            type: "GALLERY",
            content: { images: ["/image/backgroundSchool.jpg", "/image/backgroundSchool.jpg", "/image/backgroundSchool.jpg"] }
          }
        ]
      },
      {
        id: "about-us",
        title: "About Us",
        slug: "/about",
        blocks: [
          {
            id: "b4",
            type: "TEXT",
            content: { heading: "Our History", text: "Founded in 1990, our institution has a long legacy of academic excellence and community leadership.", alignment: "left", padding: "py-24" }
          }
        ]
      },
      {
        id: "admissions",
        title: "Admissions",
        slug: "/admissions",
        blocks: [
          {
            id: "b5",
            type: "TEXT",
            content: { heading: "Join Our Community", text: "We welcome passionate learners. Applications are open for the upcoming academic year. Contact our admissions office to schedule a campus tour.", alignment: "center", padding: "py-24", backgroundColor: "#f8fafc" }
          }
        ]
      }
    ]
  },
  {
    id: "creative-school",
    name: "Creative School",
    description: "A visually striking layout with an emphasis on imagery and portfolios. Perfect for art schools or design academies.",
    isPro: true,
    thumbnailType: "sidebar",
    customPages: [
      {
        id: "home",
        title: "Home",
        slug: "/",
        blocks: [
          {
            id: "c1",
            type: "HERO",
            content: { title: "Unleash Your Creativity", subtitle: "Where imagination meets education.", bgImage: "/image/backgroundSchool.jpg", overlayOpacity: 60 }
          },
          {
            id: "c2",
            type: "GALLERY",
            content: { images: ["/image/backgroundSchool.jpg", "/image/backgroundSchool.jpg", "/image/backgroundSchool.jpg", "/image/backgroundSchool.jpg", "/image/backgroundSchool.jpg", "/image/backgroundSchool.jpg"] }
          }
        ]
      },
      {
        id: "programs",
        title: "Programs",
        slug: "/programs",
        blocks: [
          {
            id: "c3",
            type: "TEXT",
            content: { heading: "Our Programs", text: "We offer diverse programs in visual arts, digital media, and performance.", alignment: "left", padding: "py-20" }
          }
        ]
      }
    ]
  }
];

export default function SubdomainBuilderPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const { data: landingData, isLoading } = useSchoolLandingPage(schoolId);
  const { mutate: updateLandingPage, isPending: isSaving } = useUpdateSchoolLandingPage();

  const [activeTab, setActiveTab] = React.useState<"hero" | "about" | "highlights" | "testimonials" | "settings" | "templates" | "contact">("hero");
  const [previewDarkMode, setPreviewDarkMode] = React.useState(true);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Basic Text states
  const [heroTitle, setHeroTitle] = React.useState("");
  const [heroSubtitle, setHeroSubtitle] = React.useState("");
  const [heroImage, setHeroImage] = React.useState("");
  const [aboutTitle, setAboutTitle] = React.useState("");
  const [aboutText, setAboutText] = React.useState("");
  const [aboutImage, setAboutImage] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [features, setFeatures] = React.useState<any[]>([]);
  const [testimonials, setTestimonials] = React.useState<any[]>([]);
  
  // Contact Info states
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [contactAddress, setContactAddress] = React.useState("");
  
  // Footer state
  const [footerText, setFooterText] = React.useState("");

  // Template Modal State
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);

  // Synchronize when landing data loads
  React.useEffect(() => {
    if (landingData && landingData.id) {
      setHeroTitle(landingData.heroTitle || "");
      setHeroSubtitle(landingData.heroSubtitle || "Empowering students to achieve their full potential.");
      setHeroImage(landingData.heroImage || "");
      setAboutTitle(landingData.aboutTitle || "About Us");
      setAboutText(landingData.aboutText || "We provide a supportive and challenging learning environment that fosters academic excellence, critical thinking, and character development.");
      setAboutImage(landingData.aboutImage || "");
      setPrimaryColor(landingData.primaryColor || "#3b82f6");
      setFeatures(landingData.features || []);
      setTestimonials(landingData.testimonials || []);
      
      const contactData = landingData.contactInfo || {};
      setContactEmail(contactData.email || schoolProfile?.schoolEmail || "");
      setContactPhone(contactData.phone || schoolProfile?.phone || "");
      setContactAddress(contactData.address || schoolProfile?.address || "");
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
      
      setContactEmail(schoolProfile.schoolEmail || "");
      setContactPhone(schoolProfile.phone || "");
      setContactAddress(schoolProfile.address || "");
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
      heroImage,
      aboutTitle,
      aboutText,
      aboutImage,
      primaryColor,
      features,
      testimonials,
      contactInfo: {
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress,
      },
      // Carry forward existing gallery if any
      gallery: landingData?.gallery || [],
      footerText: footerText
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

  const handleApplyTemplate = () => {
    if (!selectedTemplate || !schoolId) return;
    
    // We update the landing page with the predefined customPages,
    // merging them with existing texts/colors so we don't wipe out basic data unless intended.
    const payload = {
      heroTitle, heroSubtitle, aboutTitle, aboutText, primaryColor, features, testimonials,
      contactInfo: {
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress
      },
      footerConfig: {
        copyrightText: footerText
      },
      gallery: landingData?.gallery || [],
      customPages: selectedTemplate.customPages,
      isDraft: false,
    };

    updateLandingPage(
      { schoolId, data: payload },
      {
        onSuccess: () => {
          toast.success("Template applied successfully!");
          router.push("/dashboard/admin/subdomain/pro-builder");
        },
        onError: (err: any) => {
          console.error(err);
          toast.error("Failed to apply template. Please try again.");
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
              { id: "contact", label: "Contact" },
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
                    {TEMPLATE_CONFIGS.map((template) => (
                      <div 
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className="relative p-1 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-slate-900"
                      >
                        {template.isPro && (
                          <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" /> Pro
                          </div>
                        )}
                        <div className="w-full h-24 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden relative border border-slate-100 dark:border-slate-800">
                          {template.thumbnailType === "modern" ? (
                            <>
                              <div className="absolute inset-x-2 top-2 h-4 bg-blue-500/20 rounded-sm"></div>
                              <div className="absolute inset-x-2 top-8 bottom-2 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
                            </>
                          ) : (
                            <>
                              <div className="absolute left-2 w-8 top-2 bottom-2 bg-blue-500/20 rounded-sm"></div>
                              <div className="absolute left-12 right-2 top-2 bottom-2 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
                            </>
                          )}
                        </div>
                        <div className="p-2 text-center">
                          <h4 className="text-[10px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{template.name}</h4>
                        </div>
                      </div>
                    ))}
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
                  {process.env.NEXT_PUBLIC_PRO_COMING_SOON === 'true' ? (
                    <button
                      disabled
                      className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[11px] font-bold cursor-not-allowed transition-all text-center inline-block"
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <Link
                      href="/dashboard/admin/subdomain/pro-builder"
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-[11px] font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 text-center inline-block"
                    >
                      Upgrade to Pro Now
                    </Link>
                  )}
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
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Dynamic Hero Background</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Upload a custom image below to serve as your hero background. If no image is uploaded, your landing page will automatically cycle between random dynamic campus images to maximize visual aesthetic!
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <ImageUpload
                    label="Hero Background Image"
                    description="Upload an image to display in the header (16:9 recommended)"
                    value={heroImage}
                    onChange={(url) => setHeroImage(url)}
                    aspectRatio="video"
                  />
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

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <ImageUpload
                    label="About Section Image"
                    description="Upload an image for the about section (4:3 recommended)"
                    value={aboutImage}
                    onChange={(url) => setAboutImage(url)}
                    aspectRatio="video"
                  />
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

            {/* CONTACT SECTION CONTROLS */}
            {activeTab === "contact" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-900">
                  <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">Contact & Location</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="admissions@school.edu"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Physical Address / Location</label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="Greenwood Campus, Main Boulevard"
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>
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

                <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-900">
                  <div className="flex items-center gap-2 pb-2">
                    <LayoutDashboard className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase">Global Footer</h3>
                  </div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Footer Copyright Text</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="© 2026 Your School Name. All rights reserved."
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
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
              <div className="absolute inset-0 z-0">
                <img
                  src={heroImage || "/image/backgroundSchool.jpg"}
                  alt="Hero Background"
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${
                  previewDarkMode 
                    ? "bg-gradient-to-b from-slate-950/65 via-slate-950/50 to-slate-950/75" 
                    : "bg-gradient-to-b from-slate-900/55 via-slate-800/40 to-slate-900/65"
                }`}></div>
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
                    src={aboutImage || "/image/backgroundSchool2.jpg"}
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

            {/* Testimonials Mimic */}
            <div className={`py-12 px-6 border-t transition-colors ${
              previewDarkMode ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200"
            }`}>
              <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
                What People Say
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {(testimonials.length > 0 ? testimonials : [
                  { name: "Sarah Jenkins", role: "Parent", text: "This school has transformed my child's learning experience." },
                  { name: "Michael Chang", role: "Alumni", text: "The foundation I received here prepared me for university and beyond." }
                ]).map((t, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    previewDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <p className="text-[10px] italic opacity-80 mb-3">"{t.text}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold">
                        {t.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold">{t.name}</p>
                        <p className="text-[8px] opacity-60 uppercase">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Mimic */}
            <div className={`py-12 px-6 border-t transition-colors ${
              previewDarkMode ? "bg-slate-900/20 border-slate-900" : "bg-slate-100/50 border-slate-200"
            }`}>
              <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2" style={{ color: primaryColor }}>Contact Us</h3>
                  <h2 className="text-lg font-bold tracking-tight mb-4">Get in Touch</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded flex items-center justify-center border" style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor, borderColor: `${primaryColor}33` }}>
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold">Location</p>
                        <p className="text-[8px] opacity-70">{contactAddress || schoolProfile?.address || "Greenwood Campus, Main Boulevard"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded flex items-center justify-center border" style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor, borderColor: `${primaryColor}33` }}>
                        <Phone className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold">Phone</p>
                        <p className="text-[8px] opacity-70">{contactPhone || schoolProfile?.phone || "+234 801 234 5678"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded flex items-center justify-center border" style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor, borderColor: `${primaryColor}33` }}>
                        <Mail className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold">Email</p>
                        <p className="text-[8px] opacity-70">{contactEmail || schoolProfile?.schoolEmail || "admissions@school.edu"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex-1 p-5 rounded-xl border ${
                  previewDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <h4 className="text-[10px] font-bold mb-3">Send an Inquiry</h4>
                  <div className="space-y-2">
                    <div className="h-6 w-full rounded bg-slate-200 dark:bg-slate-800 opacity-50"></div>
                    <div className="h-6 w-full rounded bg-slate-200 dark:bg-slate-800 opacity-50"></div>
                    <div className="h-12 w-full rounded bg-slate-200 dark:bg-slate-800 opacity-50"></div>
                    <div className="h-6 w-full rounded text-center flex items-center justify-center text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: primaryColor }}>Submit</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-blue-500" />
                Template Preview
              </h3>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-32 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <Layout className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedTemplate.name}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex gap-2">
                    {selectedTemplate.isPro && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-1 rounded">
                        <Crown className="w-3 h-3" /> Pro Template
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-500 px-2 py-1 rounded">
                      <Layers className="w-3 h-3" /> {selectedTemplate.customPages.length} Pages
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Included Pages & Blocks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedTemplate.customPages.map((page: any) => (
                    <div key={page.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{page.title}</h5>
                      <ul className="space-y-1.5">
                        {page.blocks.map((block: any, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Blocks className="w-3.5 h-3.5 text-slate-400" />
                            {block.type} Block
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if(window.confirm("Applying this template will replace any Pro Builder pages you currently have. Do you want to continue?")) {
                    handleApplyTemplate();
                  }
                }}
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isSaving ? "Applying..." : "Apply Template & Edit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
