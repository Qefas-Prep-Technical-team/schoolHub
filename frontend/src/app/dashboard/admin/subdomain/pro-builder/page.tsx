"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolProfile, useSchoolLandingPage, useUpdateSchoolLandingPage } from "@/lib/api/hooks/useSchool";
import { toast } from "react-toastify";
import Link from "next/link";
import ImageUpload from "@/components/reusable/ImageUpload";
import {
  LayoutDashboard, Layers, Plus, Settings, Eye, Save, ChevronLeft,
  MousePointer2, Trash2, MoveUp, MoveDown, Type, Image as ImageIcon,
  LayoutTemplate, Check, Copy, ExternalLink, Award, BookOpen, Users, Palette, FileText, Globe
} from "lucide-react";

type BlockType = "HERO" | "TEXT" | "GALLERY" | "FEATURE_GRID";

interface PageBlock {
  id: string;
  type: BlockType;
  content: any;
}

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  blocks: PageBlock[];
}

export default function ProBuilderPage() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const { data: landingData, isLoading } = useSchoolLandingPage(schoolId);
  const { mutate: updateLandingPage, isPending: isSaving } = useUpdateSchoolLandingPage();

  const [pages, setPages] = useState<CustomPage[]>([]);
  const [activePageId, setActivePageId] = useState<string>("");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = React.useState<"hero" | "about" | "highlights" | "testimonials" | "settings">("hero");
  const [previewDarkMode, setPreviewDarkMode] = React.useState(true);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const [heroTitle, setHeroTitle] = React.useState("");
  const [heroSubtitle, setHeroSubtitle] = React.useState("");
  const [aboutTitle, setAboutTitle] = React.useState("");
  const [aboutText, setAboutText] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [features, setFeatures] = React.useState<any[]>([]);
  const [testimonials, setTestimonials] = React.useState<any[]>([]);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "draft" | "">("");
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialized = useRef(false);
  const skipAutoSave = useRef(true);

  useEffect(() => {
    if (landingData?.landingPage && !initialized.current) {
      initialized.current = true;
      const sourceData = landingData.landingPage.draftData || landingData.landingPage;

      const savedPages = sourceData.customPages;
      if (Array.isArray(savedPages) && savedPages.length > 0) {
        setPages(savedPages);
        setActivePageId(savedPages[0].id);
      } else {
        const defaultPage = {
          id: "page-1",
          title: "Home",
          slug: "/",
          blocks: [
            { id: "block-1", type: "HERO" as BlockType, content: { title: "Welcome to Our School", subtitle: "A place to learn and grow." } }
          ]
        };
        setPages([defaultPage]);
        setActivePageId(defaultPage.id);
      }

      setHeroTitle(sourceData.heroTitle || "");
      setHeroSubtitle(sourceData.heroSubtitle || "");
      setAboutTitle(sourceData.aboutTitle || "");
      setAboutText(sourceData.aboutText || "");
      setPrimaryColor(sourceData.primaryColor || "#3b82f6");
      setFeatures(sourceData.features || []);
      setTestimonials(sourceData.testimonials || []);

      setTimeout(() => {
        skipAutoSave.current = false;
      }, 1000);
    }
  }, [landingData]);

  useEffect(() => {
    if (skipAutoSave.current || !schoolId) return;

    setSaveStatus("saving");
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

    autoSaveTimeoutRef.current = setTimeout(() => {
      const payload = {
        heroTitle, heroSubtitle, aboutTitle, aboutText, primaryColor, features, testimonials,
        gallery: landingData?.landingPage?.gallery || [],
        customPages: pages,
        isDraft: true,
      };

      updateLandingPage({ schoolId, data: payload }, {
        onSuccess: () => setSaveStatus("draft")
      });
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [heroTitle, heroSubtitle, aboutTitle, aboutText, primaryColor, features, testimonials, pages, schoolId, landingData]);

  const activePage = pages.find((p) => p.id === activePageId);
  const activeBlock = activePage?.blocks.find((b) => b.id === activeBlockId);
  const isHomePageActive = activePage?.slug === "/";

  const subdomain = schoolProfile?.subdomain;
  const subdomainUrl = useMemo(() => {
    if (!subdomain) return "";
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    try {
      const url = new URL(baseUrl);
      if (url.hostname === "localhost") return `${url.protocol}//${subdomain}.localhost:${url.port || "3000"}`;
      return `${url.protocol}//${subdomain}.${url.hostname}`;
    } catch (e) {
      return `http://${subdomain}.localhost:3000`;
    }
  }, [subdomain]);

  const handleSave = () => {
    if (!schoolId) return;
    const payload = {
      heroTitle, heroSubtitle, aboutTitle, aboutText, primaryColor, features, testimonials,
      gallery: landingData?.landingPage?.gallery || [],
      customPages: pages,
      isDraft: false,
    };
    updateLandingPage(
      { schoolId, data: payload },
      {
        onSuccess: () => {
          setSaveStatus("saved");
          toast.success("Pro Website published successfully!");
        },
        onError: () => toast.error("Failed to publish website.")
      }
    );
  };

  const handleRevertToDefault = () => {
    if (!schoolId) return;
    if (window.confirm("Are you sure? This will delete all custom pages and blocks, returning your site to the standard layout. Your custom colors, texts, and contact info will be kept.")) {
      const payload = {
        heroTitle, heroSubtitle, aboutTitle, aboutText, primaryColor, features, testimonials,
        gallery: landingData?.landingPage?.gallery || [],
        customPages: [],
        isDraft: false,
      };
      updateLandingPage(
        { schoolId, data: payload },
        {
          onSuccess: () => {
            setPages([{ id: "home", title: "Home", slug: "/", blocks: [] }]);
            setActivePageId("home");
            setSaveStatus("saved");
            toast.success("Site reverted to default layout successfully!");
          },
          onError: () => toast.error("Failed to revert website.")
        }
      );
    }
  };

  const addPage = () => {
    const newPage: CustomPage = {
      id: `page-${Date.now()}`,
      title: "New Page",
      slug: `/new-page-${Date.now()}`,
      blocks: [
        { id: `block-${Date.now()}-1`, type: "HERO", content: { title: "Welcome to New Page", subtitle: "Customize this hero section to match your needs.", buttons: [{ id: `btn-${Date.now()}`, text: "Learn More", link: "/", variant: "primary" }], bgImage: "" } },
        { id: `block-${Date.now()}-2`, type: "TEXT", content: { heading: "About This Page", text: "This is a pre-built section. You can edit this text, add new blocks, or drag them around to create the perfect layout.", alignment: "center" } },
        { id: `block-${Date.now()}-3`, type: "GALLERY", content: {} }
      ]
    };
    setPages([...pages, newPage]);
    setActivePageId(newPage.id);
  };

  const addBlock = (type: BlockType) => {
    if (!activePageId) return;
    let defaultContent = {};
    if (type === "HERO") defaultContent = { title: "Hero Title", subtitle: "Hero Subtitle", buttons: [{ id: "btn-1", text: "Call to Action", link: "/", variant: "primary" }], bgImage: "" };
    if (type === "TEXT") defaultContent = { heading: "Section Heading", text: "Write your text here...", alignment: "left" };
    const newBlock: PageBlock = { id: `block-${Date.now()}`, type, content: defaultContent };
    setPages(pages.map(p => p.id === activePageId ? { ...p, blocks: [...p.blocks, newBlock] } : p));
    setActiveBlockId(newBlock.id);
  };

  const updateActiveBlock = (contentUpdates: any) => {
    if (!activePageId || !activeBlockId) return;
    setPages(pages.map(p => p.id === activePageId ? { ...p, blocks: p.blocks.map(b => b.id === activeBlockId ? { ...b, content: { ...b.content, ...contentUpdates } } : b) } : p));
  };

  const deleteBlock = (blockId: string) => {
    setPages(pages.map(p => p.id === activePageId ? { ...p, blocks: p.blocks.filter(b => b.id !== blockId) } : p));
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (!activePageId) return;
    setPages(pages.map(p => {
      if (p.id === activePageId) {
        const newBlocks = [...p.blocks];
        if (direction === "up" && index > 0) [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
        else if (direction === "down" && index < newBlocks.length - 1) [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
        return { ...p, blocks: newBlocks };
      }
      return p;
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedBlockId(id); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetId || !activePageId) return;
    setPages(pages.map(p => {
      if (p.id === activePageId) {
        const currentBlocks = p.blocks;
        const draggedIndex = currentBlocks.findIndex(b => b.id === draggedBlockId);
        const targetIndex = currentBlocks.findIndex(b => b.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return p;
        const newBlocks = [...currentBlocks];
        const [removed] = newBlocks.splice(draggedIndex, 1);
        newBlocks.splice(targetIndex, 0, removed);
        return { ...p, blocks: newBlocks };
      }
      return p;
    }));
    setDraggedBlockId(null);
  };

  const addFeature = () => { if (features.length < 6) setFeatures([...features, { title: "New Highlight", description: "Desc", icon: "Award" }]); else toast.warn("Max 6 highlights."); };
  const updateFeature = (index: number, key: string, value: string) => { const updated = [...features]; updated[index][key] = value; setFeatures(updated); };
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  const addTestimonial = () => { if (testimonials.length < 4) setTestimonials([...testimonials, { name: "Name", role: "Role", text: "Quote" }]); else toast.warn("Max 4 testimonials."); };
  const updateTestimonial = (index: number, key: string, value: string) => { const updated = [...testimonials]; updated[index][key] = value; setTestimonials(updated); };
  const removeTestimonial = (index: number) => setTestimonials(testimonials.filter((_, i) => i !== index));

  if (isLoading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans -m-6 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <header className="h-14 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/subdomain" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Pro Website Builder</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">Advanced Block Editor</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {saveStatus === "saving" && <span className="text-sm text-gray-500 animate-pulse">Saving to draft...</span>}
          {saveStatus === "draft" && <span className="text-sm text-gray-500">Draft saved</span>}
          {saveStatus === "saved" && <span className="text-sm text-green-600 font-medium">Published!</span>}

          {subdomain && (
            <button onClick={() => { setCopiedLink(true); navigator.clipboard.writeText(subdomainUrl); setTimeout(() => setCopiedLink(false), 2000); }} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200">
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <ExternalLink className="w-4 h-4" />}
            </button>
          )}

          <button onClick={handleRevertToDefault} disabled={isSaving} className="border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50">
            <span>Revert to Default Layout</span>
          </button>

          <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm shadow-blue-500/20 disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{isSaving && saveStatus !== "saving" ? "Publishing..." : "Publish Website"}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT PANEL: PAGES */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col shrink-0 min-h-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Layers className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Pages</h2>
            </div>
            <button onClick={addPage} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {pages.map((p) => (
              <button key={p.id} onClick={() => setActivePageId(p.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${p.id === activePageId ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                <LayoutTemplate className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{p.title}</span>
                {p.slug === "/" && <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Home</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* MIDDLE PANEL: CANVAS PREVIEW */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative min-h-0">
            <div className="absolute top-4 right-4 flex gap-2 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-center px-2">Add Block:</span>
              <button onClick={() => addBlock("HERO")} className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-medium shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"><ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Hero</button>
              <button onClick={() => addBlock("TEXT")} className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-medium shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"><Type className="w-3.5 h-3.5 text-emerald-500" /> Text</button>
              <button onClick={() => addBlock("GALLERY")} className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-medium shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"><LayoutTemplate className="w-3.5 h-3.5 text-amber-500" /> Gallery</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto space-y-4 pb-32">
                {activePage?.blocks.map((block, index) => (
                  <div key={block.id} draggable onDragStart={(e) => handleDragStart(e, block.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, block.id)} onClick={() => setActiveBlockId(block.id)} className={`group relative border-2 rounded-2xl p-6 transition-all cursor-pointer ${activeBlockId === block.id ? "border-amber-500 bg-white dark:bg-slate-950 shadow-md" : "border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900/50"}`}>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(index, "up"); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><MoveUp className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(index, "down"); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 border-l border-slate-200 dark:border-slate-700"><MoveDown className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 border-l border-slate-200 dark:border-slate-700"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="opacity-50 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4" />
                      {block.type} BLOCK
                    </div>

                    <div className="pointer-events-none">
                      {block.type === "HERO" && (
                        <div className="relative text-center py-20 px-4 rounded-xl overflow-hidden" style={{ backgroundColor: primaryColor + "10" }}>
                          {block.content.bgImage && (
                            <div className="absolute inset-0">
                              <img src={block.content.bgImage} alt="Hero Background" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-950" style={{ opacity: (block.content.overlayOpacity || 50) / 100 }}></div>
                            </div>
                          )}
                          <div className="relative z-10 text-white">
                            <h2 className="text-4xl font-black mb-4 drop-shadow-md">{block.content.title}</h2>
                            <p className="text-lg opacity-90 drop-shadow-md">{block.content.subtitle}</p>
                          </div>
                        </div>
                      )}
                      {block.type === "TEXT" && (
                        <div 
                          className={`${block.content.padding || 'py-8'} ${block.content.alignment === "center" ? "text-center" : "text-left"} rounded-xl px-6`}
                          style={{ backgroundColor: block.content.backgroundColor || 'transparent', color: block.content.textColor || 'inherit' }}
                        >
                          <h3 className="text-2xl font-bold mb-4">{block.content.heading}</h3>
                          <p className="opacity-80 leading-relaxed">{block.content.text}</p>
                        </div>
                      )}
                      {block.type === "GALLERY" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-8">
                          {block.content.images && block.content.images.length > 0 ? (
                            block.content.images.map((img: string, i: number) => (
                              <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))
                          ) : (
                            [1,2,3].map(i => <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center"><ImageIcon className="w-8 h-8 opacity-20" /></div>)
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {activePage?.blocks.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                    <MousePointer2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No blocks yet. Add a block to start building.</p>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* RIGHT PANEL: SETTINGS */}
        <aside className="w-80 border-l border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col shrink-0 min-h-0 z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
            {activeBlock ? (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Block Settings</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {activeBlock.type === "HERO" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Title</label>
                        <input type="text" value={activeBlock.content.title || ""} onChange={(e) => updateActiveBlock({ title: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 dark:border-slate-800" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subtitle</label>
                        <textarea rows={3} value={activeBlock.content.subtitle || ""} onChange={(e) => updateActiveBlock({ subtitle: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 dark:border-slate-800 resize-none" />
                      </div>
                      <div>
                        <ImageUpload
                          label="Background Image"
                          description="Upload a high-quality background image for your hero section."
                          value={activeBlock.content.bgImage || ""}
                          onChange={(url) => updateActiveBlock({ bgImage: url })}
                          aspectRatio="video"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Overlay Opacity: {activeBlock.content.overlayOpacity || 50}%</label>
                        <input type="range" min="0" max="100" value={activeBlock.content.overlayOpacity || 50} onChange={(e) => updateActiveBlock({ overlayOpacity: parseInt(e.target.value) })} className="w-full" />
                      </div>
                    </div>
                  )}

                  {activeBlock.type === "TEXT" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Heading</label>
                        <input type="text" value={activeBlock.content.heading || ""} onChange={(e) => updateActiveBlock({ heading: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 dark:border-slate-800" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Text Content</label>
                        <textarea rows={6} value={activeBlock.content.text || ""} onChange={(e) => updateActiveBlock({ text: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 dark:border-slate-800 resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Background Color</label>
                          <input type="color" value={activeBlock.content.backgroundColor || "#ffffff"} onChange={(e) => updateActiveBlock({ backgroundColor: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Text Color</label>
                          <input type="color" value={activeBlock.content.textColor || "#000000"} onChange={(e) => updateActiveBlock({ textColor: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Alignment</label>
                          <select value={activeBlock.content.alignment || "left"} onChange={(e) => updateActiveBlock({ alignment: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                            <option value="left">Left Aligned</option>
                            <option value="center">Center Aligned</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Padding</label>
                          <select value={activeBlock.content.padding || "py-8"} onChange={(e) => updateActiveBlock({ padding: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                            <option value="py-4">Small</option>
                            <option value="py-8">Medium</option>
                            <option value="py-16">Large</option>
                            <option value="py-24">Extra Large</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeBlock.type === "GALLERY" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gallery Images</label>
                        <button onClick={() => updateActiveBlock({ images: [...(activeBlock.content.images || []), ""] })} className="text-xs text-blue-600 font-medium">+ Add Image</button>
                      </div>
                      {(activeBlock.content.images || []).map((img: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex-1">
                            <ImageUpload
                              label={`Image ${i + 1}`}
                              description="Upload an image for your gallery"
                              value={img}
                              onChange={(url) => {
                                const newImages = [...(activeBlock.content.images || [])];
                                newImages[i] = url;
                                updateActiveBlock({ images: newImages });
                              }}
                              aspectRatio="square"
                            />
                          </div>
                          <button onClick={() => {
                            const newImages = [...(activeBlock.content.images || [])];
                            newImages.splice(i, 1);
                            updateActiveBlock({ images: newImages });
                          }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400 p-8 text-center">
                <div>
                  <MousePointer2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Select a block to edit its properties.</p>
                </div>
              </div>
            )}
          </aside>
      </div>
    </div>
  );
}
