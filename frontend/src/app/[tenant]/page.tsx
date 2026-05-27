"use client";

import React, { use } from "react";
import { useSchoolLandingPageBySubdomain } from "@/lib/api/hooks/useSchool";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Menu,
  X,
  LogIn,
  Sparkles,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Sun,
  Moon
} from "lucide-react";

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default function TenantLandingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tenant = resolvedParams.tenant;

  const { data: schoolData, isLoading, error } = useSchoolLandingPageBySubdomain(tenant);
  // console.log("Fetched landing page data for tenant:", tenant, schoolData);
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(true);

  // Safely pick a random background image on client mount to avoid hydration mismatch
  const [heroBgImage, setHeroBgImage] = React.useState("/image/backgroundSchool.jpg");
  React.useEffect(() => {
    const images = ["/image/backgroundSchool.jpg", "/image/backgroundSchool2.jpg"];
    setHeroBgImage(images[Math.floor(Math.random() * images.length)]);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col overflow-hidden animate-pulse">
        {/* Shimmering Navbar */}
        <div className="h-20 border-b border-slate-900 flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl"></div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-28 bg-slate-900 rounded-md"></div>
              <div className="h-2 w-16 bg-slate-900 rounded-md"></div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <div className="h-3 w-12 bg-slate-900 rounded-md"></div>
            <div className="h-3 w-12 bg-slate-900 rounded-md"></div>
            <div className="h-3 w-12 bg-slate-900 rounded-md"></div>
            <div className="h-3 w-12 bg-slate-900 rounded-md"></div>
          </div>
          <div className="h-10 w-24 bg-slate-900 rounded-xl"></div>
        </div>

        {/* Shimmering Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 max-w-5xl mx-auto w-full text-center">
          <div className="h-6 w-48 bg-slate-900 rounded-full mb-8"></div>
          <div className="h-16 w-3/4 bg-slate-900 rounded-2xl mb-6 mx-auto"></div>
          <div className="h-10 w-1/2 bg-slate-900 rounded-xl mb-10 mx-auto"></div>
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-slate-900 rounded-xl"></div>
            <div className="h-12 w-32 bg-slate-900 rounded-xl"></div>
          </div>
        </div>

        {/* Shimmering Highlights Grid */}
        <div className="h-60 border-t border-slate-900 py-12 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-36 bg-slate-900/50 rounded-3xl border border-slate-900 p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl"></div>
            <div className="h-4 w-24 bg-slate-900 rounded-md"></div>
            <div className="h-2 w-full bg-slate-900 rounded-md"></div>
          </div>
          <div className="h-36 bg-slate-900/50 rounded-3xl border border-slate-900 p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl"></div>
            <div className="h-4 w-24 bg-slate-900 rounded-md"></div>
            <div className="h-2 w-full bg-slate-900 rounded-md"></div>
          </div>
          <div className="h-36 bg-slate-900/50 rounded-3xl border border-slate-900 p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl"></div>
            <div className="h-4 w-24 bg-slate-900 rounded-md"></div>
            <div className="h-2 w-full bg-slate-900 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !schoolData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
          <X className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">School Not Found</h1>
        <p className="text-slate-400 max-w-md mb-8">
          The school with subdomain <span className="text-red-400 font-semibold">{tenant}</span> could not be found. Please check the spelling or contact support.
        </p>
        <Link
          href={process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}
          style={{ backgroundColor: "#3b82f6" }}
          className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5"
        >
          Go to Qefas Hub Home
        </Link>
      </div>
    );
  }

  const { landingPage, schoolName, schoolLogo, schoolMotto } = schoolData;

  const config = {
    heroTitle: landingPage?.heroTitle || `Welcome to ${schoolName}`,
    heroSubtitle: landingPage?.heroSubtitle || schoolMotto || "Nurturing Minds, Shaping the Future of Education.",
    aboutTitle: landingPage?.aboutTitle || "Our Vision & Mission",
    aboutText: landingPage?.aboutText || `${schoolName} is dedicated to fostering academic excellence, integrity, and personal growth in every student. We offer a modern learning environment designed to empower future leaders.`,
    primaryColor: landingPage?.primaryColor || "#3b82f6",
    features: Array.isArray(landingPage?.features) && landingPage.features.length > 0
      ? landingPage.features
      : [
        {
          title: "Expert Faculty",
          description: "Learn from highly qualified educators who are passionate about teaching and mentoring.",
          icon: "Users"
        },
        {
          title: "Modern Curriculum",
          description: "An innovative, dynamic curriculum tailored to meet global standards and future challenges.",
          icon: "BookOpen"
        },
        {
          title: "Holistic Development",
          description: "Strong focus on co-curricular activities, sports, arts, and character building.",
          icon: "Award"
        }
      ],
    testimonials: Array.isArray(landingPage?.testimonials) && landingPage.testimonials.length > 0
      ? landingPage.testimonials
      : [
        {
          name: "Sarah Jenkins",
          role: "Parent",
          text: "Choosing this school was the best decision for my son. The individual attention and academic standards are exceptional."
        },
        {
          name: "David Cole",
          role: "Alumni",
          text: "The skills and values I gained here laid the foundation for my university success and future career."
        }
      ],
    gallery: Array.isArray(landingPage?.gallery) ? landingPage.gallery : []
  };

  const primaryColor = config.primaryColor;

  const getIcon = (name: string) => {
    const iconClass = "w-6 h-6 transition-colors duration-300";
    switch (name) {
      case "BookOpen": return <BookOpen className={iconClass} style={{ color: primaryColor }} />;
      case "Users": return <Users className={iconClass} style={{ color: primaryColor }} />;
      case "Award": return <Award className={iconClass} style={{ color: primaryColor }} />;
      case "Calendar": return <Calendar className={iconClass} style={{ color: primaryColor }} />;
      case "MessageSquare": return <MessageSquare className={iconClass} style={{ color: primaryColor }} />;
      case "ShieldCheck": return <ShieldCheck className={iconClass} style={{ color: primaryColor }} />;
      default: return <GraduationCap className={iconClass} style={{ color: primaryColor }} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Header / Navbar */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b backdrop-blur-md ${
        darkMode ? "bg-slate-950/80 border-slate-900 text-slate-100" : "bg-white/85 border-slate-200 text-slate-900"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {schoolLogo ? (
              <div className={`relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}>
                <Image src={schoolLogo} alt={schoolName} fill className="object-cover" />
              </div>
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {schoolName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                darkMode ? "from-white to-slate-300" : "from-slate-900 to-slate-700"
              }`}>
                {schoolName}
              </span>
              {schoolMotto && (
                <p className={`text-[10px] font-medium hidden sm:block ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}>{schoolMotto}</p>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${
            darkMode ? "text-slate-300" : "text-slate-600"
          }`}>
            <a href="#home" className={`transition-colors duration-200 ${darkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Home</a>
            <a href="#about" className={`transition-colors duration-200 ${darkMode ? "hover:text-white" : "hover:text-slate-900"}`}>About</a>
            <a href="#features" className={`transition-colors duration-200 ${darkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Features</a>
            <a href="#testimonials" className={`transition-colors duration-200 ${darkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Testimonials</a>
            <a href="#contact" className={`transition-colors duration-200 ${darkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Contact</a>
          </nav>

          {/* Controls & Login CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                darkMode
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-yellow-500 hover:text-yellow-400"
                  : "bg-white hover:bg-slate-100 border-slate-200 text-amber-500 hover:text-amber-600 shadow-sm"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/login"
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${
                darkMode
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-white"
                  : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Portal Login
            </Link>
          </div>

          {/* Mobile Menu & Theme Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                darkMode
                  ? "bg-slate-900 border-slate-800 text-yellow-500"
                  : "bg-white border-slate-200 text-amber-500 shadow-sm"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 transition-colors duration-200 ${
                darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden absolute top-20 left-0 w-full py-6 px-6 flex flex-col gap-5 shadow-2xl border-b transition-all duration-300 ${
            darkMode ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200"
          }`}>
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              Home
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              About
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              Features
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              Testimonials
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              Contact
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:brightness-110"
              style={{ backgroundColor: primaryColor }}
            >
              <LogIn className="w-4 h-4" />
              Portal Login
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-6 overflow-hidden group">
        {/* Random Campus Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroBgImage} 
            alt="School Campus Background" 
            fill 
            priority
            className="object-cover transition-transform duration-[2000ms] scale-105 group-hover:scale-100 animate-fade-in" 
          />
          {/* Stunning glassmorphic overlay for extreme high-contrast readability in both light & dark modes */}
          <div className={`absolute inset-0 transition-colors duration-300 ${
            darkMode 
              ? "bg-gradient-to-b from-slate-950/65 via-slate-950/50 to-slate-950/75" 
              : "bg-gradient-to-b from-slate-900/55 via-slate-800/40 to-slate-900/65"
          }`}></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-semibold mb-8 animate-fade-in shadow-sm bg-white/10 backdrop-blur-md border-white/20"
            style={{ color: primaryColor }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Modern Education
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-lg">
              {config.heroTitle}
            </span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium text-slate-200 drop-shadow">
            {config.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group hover:brightness-110 hover:-translate-y-0.5"
              style={{ backgroundColor: primaryColor }}
            >
              Access Portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="#about"
              className="w-full sm:w-auto px-8 py-4 border font-semibold rounded-xl transition-all duration-200 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/25 text-white hover:text-white shadow-sm"
            >
              Discover More
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-24 border-t relative transition-colors duration-300 ${
        darkMode ? "border-slate-900" : "border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Default Image Display Container */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 group">
            <Image 
              src="/image/backgroundSchool.jpg" 
              alt="Qefas Prep School campus building" 
              fill 
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            {/* Rich gradient contrasting overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div 
                  className="w-12 h-12 backdrop-blur-md rounded-2xl flex items-center justify-center border"
                  style={{ backgroundColor: `${primaryColor}33`, color: primaryColor, borderColor: `${primaryColor}33` }}
                >
                  <GraduationCap className="w-6 h-6 animate-pulse" />
                </div>
                <span 
                  className="text-[10px] uppercase font-black tracking-widest bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-lg"
                  style={{ color: primaryColor, borderColor: `${primaryColor}33` }}
                >
                  Academic Vision
                </span>
              </div>
              <div>
                <p className="text-lg italic text-slate-100 font-bold mb-3 drop-shadow-md">
                  "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-[2px] w-6" style={{ backgroundColor: primaryColor }}></div>
                  <span className="text-xs font-bold text-slate-300 tracking-wide uppercase drop-shadow">Malcolm X</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm uppercase font-bold tracking-widest mb-3" style={{ color: primaryColor }}>About Our School</h2>
            <h3 className={`text-3xl sm:text-4xl font-bold mb-6 tracking-tight transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              {config.aboutTitle}
            </h3>
            <p className={`leading-relaxed text-lg mb-8 transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              {config.aboutText}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className={`p-5 border rounded-2xl shadow-sm transition-all duration-300 ${
                darkMode ? "bg-slate-900/50 border-slate-900" : "bg-white border-slate-200"
              }`}>
                <p className={`text-3xl font-bold mb-1 transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>100%</p>
                <p className={`text-sm font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Dedication to Quality</p>
              </div>
              <div className={`p-5 border rounded-2xl shadow-sm transition-all duration-300 ${
                darkMode ? "bg-slate-900/50 border-slate-900" : "bg-white border-slate-200"
              }`}>
                <p className={`text-3xl font-bold mb-1 transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>Modern</p>
                <p className={`text-sm font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Interactive Learning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 border-t transition-all duration-300 ${
        darkMode ? "bg-slate-900/30 border-slate-900" : "bg-slate-100/50 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-sm uppercase font-bold tracking-widest mb-3" style={{ color: primaryColor }}>Our Core Highlights</h2>
          <h3 className={`text-3xl sm:text-4xl font-bold tracking-tight transition-colors duration-300 ${
            darkMode ? "text-white" : "text-slate-900"
          }`}>
            Why Choose {schoolName}
          </h3>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {config.features.map((feature: any, idx: number) => (
            <div
              key={idx}
              className={`p-8 border rounded-3xl transition-all duration-300 shadow-xl group hover:-translate-y-1 ${
                darkMode
                  ? "bg-slate-900/60 hover:bg-slate-900 border-slate-900 hover:border-slate-800"
                  : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border"
                style={{ backgroundColor: `${primaryColor}1A`, borderColor: `${primaryColor}33` }}
              >
                {getIcon(feature.icon)}
              </div>
              <h4 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>{feature.title}</h4>
              <p className={`leading-relaxed text-sm transition-colors duration-300 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-24 border-t transition-colors duration-300 ${
        darkMode ? "border-slate-900" : "border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-sm uppercase font-bold tracking-widest mb-3" style={{ color: primaryColor }}>Testimonials</h2>
          <h3 className={`text-3xl sm:text-4xl font-bold tracking-tight transition-colors duration-300 ${
            darkMode ? "text-white" : "text-slate-900"
          }`}>
            What Parents & Students Say
          </h3>
        </div>

        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {config.testimonials.map((t: any, idx: number) => (
            <div
              key={idx}
              className={`p-8 border rounded-3xl relative flex flex-col justify-between transition-all duration-300 shadow-sm ${
                darkMode ? "bg-slate-900/40 border-slate-900 text-slate-300" : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              <p className={`leading-relaxed italic mb-6 transition-colors duration-300 ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}>
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  darkMode ? "bg-slate-800" : "bg-slate-100"
                }`}
                style={{ color: primaryColor }}
              >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h5 className={`font-bold text-sm transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}>{t.name}</h5>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-24 border-t transition-all duration-300 ${
        darkMode ? "bg-slate-900/30 border-slate-900" : "bg-slate-100/50 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-sm uppercase font-bold tracking-widest mb-3" style={{ color: primaryColor }}>Contact Us</h2>
            <h3 className={`text-3xl sm:text-4xl font-bold mb-6 tracking-tight transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              Get in Touch
            </h3>
            <p className={`leading-relaxed text-base mb-10 max-w-md transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              Have questions about admissions, academic programs, or campus life? We'd love to hear from you.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor, borderColor: `${primaryColor}33` }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className={`font-bold text-sm transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>Location</h5>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>Greenwood Campus, Main Boulevard</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor, borderColor: `${primaryColor}33` }}
                >
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h5 className={`font-bold text-sm transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>Phone</h5>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>+1 (555) 019-2834</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor, borderColor: `${primaryColor}33` }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className={`font-bold text-sm transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>Email</h5>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>admissions@{tenant}.edu</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`border p-8 rounded-3xl shadow-2xl transition-all duration-300 ${
            darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <h4 className={`text-xl font-bold mb-6 transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>Send a Message</h4>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}>Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}>Message</label>
                <textarea
                  rows={4}
                  placeholder="How can we help you?"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:brightness-110 hover:-translate-y-0.5"
                style={{ backgroundColor: primaryColor }}
              >
                Submit Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t transition-colors duration-300 ${
        darkMode ? "bg-slate-950 border-slate-900 text-slate-500" : "bg-white border-slate-200 text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500">
            © 2026 {schoolName}. All rights reserved. Powered by <span className="text-slate-400 font-semibold">Qefas Hub</span>
          </p>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#" className={`transition-colors duration-200 ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>Privacy Policy</a>
            <a href="#" className={`transition-colors duration-200 ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
