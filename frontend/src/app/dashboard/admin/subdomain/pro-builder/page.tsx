"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolLandingPage, useUpdateSchoolLandingPage } from "@/lib/api/hooks/useSchool";
import { toast } from "react-toastify";
import {
  LayoutDashboard,
  Layers,
  Plus,
  Settings,
  Eye,
  Save,
  ChevronLeft,
  MousePointer2,
  Trash2,
  MoveUp,
  MoveDown,
  Type,
  Image as ImageIcon,
  LayoutTemplate
} from "lucide-react";
import Link from "next/link";

// Types for the Pro Builder
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

  const { data: landingData, isLoading } = useSchoolLandingPage(schoolId);
  const { mutate: updateLandingPage, isPending: isSaving } = useUpdateSchoolLandingPage();

  const [pages, setPages] = useState<CustomPage[]>([]);
  const [activePageId, setActivePageId] = useState<string>("");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    if (landingData?.landingPage) {
      const savedPages = landingData.landingPage.customPages;
      if (Array.isArray(savedPages) && savedPages.length > 0) {
        setPages(savedPages);
        setActivePageId(savedPages[0].id);
      } else {
        // Default initial state
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
    }
  }, [landingData]);

  const activePage = pages.find((p) => p.id === activePageId);
  const activeBlock = activePage?.blocks.find((b) => b.id === activeBlockId);

  const handleSave = () => {
    if (!schoolId) return;
    updateLandingPage(
      { schoolId, data: { customPages: pages } },
      {
        onSuccess: () => toast.success("Pro Website saved successfully!"),
        onError: () => toast.error("Failed to save website changes.")
      }
    );
  };

  const addPage = () => {
    const newPage: CustomPage = {
      id: `page-${Date.now()}`,
      title: "New Page",
      slug: "/new-page",
      blocks: []
    };
    setPages([...pages, newPage]);
    setActivePageId(newPage.id);
  };

  const updateActivePage = (updates: Partial<CustomPage>) => {
    setPages(pages.map(p => p.id === activePageId ? { ...p, ...updates } : p));
  };

  const addBlock = (type: BlockType) => {
    if (!activePageId) return;
    
    let defaultContent = {};
    if (type === "HERO") defaultContent = { title: "Hero Title", subtitle: "Hero Subtitle", buttons: [{ id: "btn-1", text: "Call to Action", link: "/", variant: "primary" }], bgImage: "" };
    if (type === "TEXT") defaultContent = { heading: "Section Heading", text: "Write your text here...", alignment: "left" };
    
    const newBlock: PageBlock = { id: `block-${Date.now()}`, type, content: defaultContent };
    
    setPages(pages.map(p => {
      if (p.id === activePageId) {
        return { ...p, blocks: [...p.blocks, newBlock] };
      }
      return p;
    }));
    setActiveBlockId(newBlock.id);
  };

  const updateActiveBlock = (contentUpdates: any) => {
    if (!activePageId || !activeBlockId) return;
    setPages(pages.map(p => {
      if (p.id === activePageId) {
        return {
          ...p,
          blocks: p.blocks.map(b => b.id === activeBlockId ? { ...b, content: { ...b.content, ...contentUpdates } } : b)
        };
      }
      return p;
    }));
  };

  const deleteBlock = (blockId: string) => {
    setPages(pages.map(p => {
      if (p.id === activePageId) {
        return { ...p, blocks: p.blocks.filter(b => b.id !== blockId) };
      }
      return p;
    }));
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (!activePageId) return;
    setPages(pages.map(p => {
      if (p.id === activePageId) {
        const newBlocks = [...p.blocks];
        if (direction === "up" && index > 0) {
          [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
        } else if (direction === "down" && index < newBlocks.length - 1) {
          [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
        }
        return { ...p, blocks: newBlocks };
      }
      return p;
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedBlockId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans -m-6 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
      
      {/* HEADER */}
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
        
        <div className="flex items-center gap-3">
          <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" title="Preview">
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-3.5 h-3.5" />}
            Save Website
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Pages Menu */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Pages</h2>
            <button onClick={addPage} className="p-1 hover:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded transition-colors" title="Add Page">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => { setActivePageId(page.id); setActiveBlockId(null); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activePageId === page.id 
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-500" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                <Layers className="w-3.5 h-3.5 opacity-70" />
                {page.title}
              </button>
            ))}
          </div>
          
          {/* Active Page Settings */}
          {activePage && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Page Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Page Title</label>
                  <input 
                    type="text" 
                    value={activePage.title}
                    onChange={e => updateActivePage({ title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">URL Slug</label>
                  <input 
                    type="text" 
                    value={activePage.slug}
                    onChange={e => updateActivePage({ slug: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MAIN CANVAS */}
        <div className="flex-1 flex flex-col relative bg-slate-100/50 dark:bg-slate-950/50 overflow-y-auto">
          {/* Canvas Toolbar */}
          <div className="absolute top-4 inset-x-4 z-10 flex justify-center pointer-events-none">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-1.5 flex items-center gap-1 pointer-events-auto">
              <button onClick={() => addBlock("HERO")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                <LayoutTemplate className="w-3.5 h-3.5" /> Add Hero
              </button>
              <button onClick={() => addBlock("TEXT")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                <Type className="w-3.5 h-3.5" /> Add Text
              </button>
              <button onClick={() => addBlock("GALLERY")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                <ImageIcon className="w-3.5 h-3.5" /> Add Media
              </button>
            </div>
          </div>

          {/* Builder Canvas Area */}
          <div className="p-8 pt-24 max-w-5xl mx-auto w-full space-y-4">
            {activePage?.blocks.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl py-24 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                  <MousePointer2 className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Canvas is empty</h3>
                <p className="text-xs text-slate-500">Click a button above to add a block to this page.</p>
              </div>
            ) : (
              activePage?.blocks.map((block, index) => (
                <div 
                  key={block.id}
                  onClick={() => setActiveBlockId(block.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, block.id)}
                  className={`relative group rounded-3xl overflow-hidden border-2 transition-all cursor-move ${
                    draggedBlockId === block.id ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"
                  } ${
                    activeBlockId === block.id 
                      ? "border-amber-500 ring-4 ring-amber-500/10 shadow-lg" 
                      : "border-transparent hover:border-slate-300 dark:hover:border-slate-700 shadow-sm bg-white dark:bg-slate-900"
                  }`}
                >
                  {/* Block Actions Header (visible on hover or active) */}
                  <div className={`absolute top-2 right-2 flex items-center gap-1 bg-slate-900/80 backdrop-blur-sm rounded-lg p-1 z-20 transition-opacity ${
                    activeBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} className="p-1 hover:bg-white/20 rounded text-white"><MoveUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} className="p-1 hover:bg-white/20 rounded text-white"><MoveDown className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-4 bg-white/20 mx-1"></div>
                    <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1 hover:bg-red-500/80 rounded text-white"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>

                  {/* Visual Render of Block */}
                  {block.type === "HERO" && (
                    <div 
                      className="bg-slate-900 text-white py-20 px-8 text-center relative bg-cover bg-center"
                      style={block.content.bgImage ? { backgroundImage: `url(${block.content.bgImage})` } : {}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/90 opacity-80"></div>
                      <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                        <h2 className="text-3xl font-black tracking-tight drop-shadow-md">{block.content.title || "Hero Title"}</h2>
                        <p className="text-sm opacity-90 drop-shadow">{block.content.subtitle || "Add an engaging subtitle here."}</p>
                        <div className="flex items-center justify-center gap-3 mt-4">
                          {(block.content.buttons || (block.content.ctaText ? [{ id: "btn-legacy", text: block.content.ctaText, link: block.content.ctaLink, variant: "primary" }] : [])).map((btn: any) => (
                            <button key={btn.id} className={`px-6 py-2 font-bold rounded-full text-xs shadow-lg ${btn.variant === 'secondary' ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20' : 'bg-amber-500 hover:bg-amber-400 text-slate-900'}`}>
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === "TEXT" && (
                    <div className="bg-white dark:bg-slate-900 py-12 px-8">
                      <div className={`max-w-3xl mx-auto space-y-4 ${block.content.alignment === 'center' ? 'text-center' : 'text-left'}`}>
                        <h3 className="text-xl font-bold">{block.content.heading || "Section Heading"}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{block.content.text || "Write your detailed paragraph text here..."}</p>
                      </div>
                    </div>
                  )}

                  {block.type === "GALLERY" && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 py-12 px-8">
                      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-300 dark:border-slate-700">
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Block Settings */}
        <div className={`w-72 border-l border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col shrink-0 transition-all ${
          activeBlock ? "translate-x-0" : "translate-x-full absolute right-0 h-full invisible"
        }`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Block Editor</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activeBlock?.type === "HERO" && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Headline</label>
                  <input 
                    type="text" 
                    value={activeBlock.content.title || ""}
                    onChange={e => updateActiveBlock({ title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Subtitle</label>
                  <textarea 
                    rows={3}
                    value={activeBlock.content.subtitle || ""}
                    onChange={e => updateActiveBlock({ subtitle: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Buttons</label>
                    <button 
                      onClick={() => {
                        const currentButtons = activeBlock.content.buttons || (activeBlock.content.ctaText ? [{ id: "btn-legacy", text: activeBlock.content.ctaText, link: activeBlock.content.ctaLink, variant: "primary" }] : []);
                        updateActiveBlock({ ctaText: undefined, ctaLink: undefined, buttons: [...currentButtons, { id: `btn-${Date.now()}`, text: "New Button", link: "/", variant: "secondary" }] });
                      }}
                      className="p-1 hover:bg-amber-500/10 text-amber-600 rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {(activeBlock.content.buttons || (activeBlock.content.ctaText ? [{ id: "btn-legacy", text: activeBlock.content.ctaText, link: activeBlock.content.ctaLink, variant: "primary" }] : [])).map((btn: any, index: number) => (
                    <div key={btn.id} className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl relative">
                      <button 
                        onClick={() => {
                          const currentButtons = activeBlock.content.buttons || (activeBlock.content.ctaText ? [{ id: "btn-legacy", text: activeBlock.content.ctaText, link: activeBlock.content.ctaLink, variant: "primary" }] : []);
                          updateActiveBlock({ ctaText: undefined, ctaLink: undefined, buttons: currentButtons.filter((b: any) => b.id !== btn.id) });
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-1">Text</label>
                          <input type="text" value={btn.text} onChange={(e) => {
                            const newBtns = [...(activeBlock.content.buttons || [{ id: "btn-legacy", text: activeBlock.content.ctaText, link: activeBlock.content.ctaLink, variant: "primary" }])];
                            newBtns[index] = { ...newBtns[index], text: e.target.value };
                            updateActiveBlock({ ctaText: undefined, ctaLink: undefined, buttons: newBtns });
                          }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] px-2 py-1 focus:border-amber-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-1">Link</label>
                          <input type="text" value={btn.link} onChange={(e) => {
                            const newBtns = [...(activeBlock.content.buttons || [{ id: "btn-legacy", text: activeBlock.content.ctaText, link: activeBlock.content.ctaLink, variant: "primary" }])];
                            newBtns[index] = { ...newBtns[index], link: e.target.value };
                            updateActiveBlock({ ctaText: undefined, ctaLink: undefined, buttons: newBtns });
                          }} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] px-2 py-1 focus:border-amber-500 focus:outline-none" />
                        </div>
                      </div>
                      <select 
                        value={btn.variant} 
                        onChange={(e) => {
                          const newBtns = [...(activeBlock.content.buttons || [{ id: "btn-legacy", text: activeBlock.content.ctaText, link: activeBlock.content.ctaLink, variant: "primary" }])];
                          newBtns[index] = { ...newBtns[index], variant: e.target.value };
                          updateActiveBlock({ ctaText: undefined, ctaLink: undefined, buttons: newBtns });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] px-2 py-1 focus:border-amber-500 focus:outline-none"
                      >
                        <option value="primary">Primary Style</option>
                        <option value="secondary">Secondary Style</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Background Image URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg"
                      value={activeBlock.content.bgImage || ""}
                      onChange={e => updateActiveBlock({ bgImage: e.target.value })}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {activeBlock?.type === "TEXT" && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Heading</label>
                  <input 
                    type="text" 
                    value={activeBlock.content.heading || ""}
                    onChange={e => updateActiveBlock({ heading: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Paragraph Text</label>
                  <textarea 
                    rows={6}
                    value={activeBlock.content.text || ""}
                    onChange={e => updateActiveBlock({ text: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Alignment</label>
                  <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                    <button 
                      onClick={() => updateActiveBlock({ alignment: "left" })}
                      className={`flex-1 py-1 text-[10px] font-bold rounded ${activeBlock.content.alignment !== "center" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"}`}
                    >
                      Left
                    </button>
                    <button 
                      onClick={() => updateActiveBlock({ alignment: "center" })}
                      className={`flex-1 py-1 text-[10px] font-bold rounded ${activeBlock.content.alignment === "center" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500"}`}
                    >
                      Center
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {activeBlock?.type === "GALLERY" && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <ImageIcon className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-[10px] text-amber-700 dark:text-amber-500 font-semibold">Image Upload Integration</p>
                <p className="text-[9px] text-slate-500 mt-1">Connects to your school's media gallery (Coming Soon)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
