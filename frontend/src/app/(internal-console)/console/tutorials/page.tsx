"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Video,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  Sparkles,
  BookmarkCheck,
  Search,
  RotateCcw,
  ExternalLink,
  Sigma,
  ListOrdered,
  List,
  Quote,
  Bold,
  Italic,
  Heading,
  Code,
  Split,
  Play,
  Save,
  X,
  Building2,
  BookOpen,
  GraduationCap,
  Users,
  Compass,
  Clock,
  Layers,
  HelpCircle,
  FileText,
  AlertCircle,
  AlertTriangle,
  Camera,
  Film,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import VideoPlayer from "@/components/ui/VideoPlayer";
import {
  TutorialItem,
  TutorialStep,
  UserRoleCategory,
  INITIAL_TUTORIALS,
  getStoredTutorials,
  fetchTutorialsFromDatabase,
  upsertSingleTutorialToDatabase,
  deleteTutorialFromDatabase,
  resetStoredTutorials
} from "@/lib/tutorials/tutorialData";

const THUMBNAIL_PRESETS = [
  "/image/backgroundSchool.jpg",
  "/image/backgroundSchool2.jpg",
  "/image/Student Management.png",
  "/image/Automated Reporting.png",
  "/image/Attendance Tracking.png",
  "/image/attendanceTracking.jpg",
  "/image/videoThumbnail.jpg"
];

// Helper to capture a frame from an HTML5 video source and render it to a high-res JPEG data URL
const captureVideoFrame = (videoUrl: string, seekTime: number = 1.5): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    let resolved = false;

    const cleanup = () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    video.onloadedmetadata = () => {
      const targetTime = Math.min(seekTime, (video.duration || 5) * 0.5);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      if (resolved) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          reject(new Error("Canvas context initialization failed"));
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        resolved = true;
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error("Unable to decode video frame"));
      }
    };

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error("Video frame seek timeout"));
      }
    }, 6000);
  });
};

const DEFAULT_LATEX_TEMPLATE = `# Comprehensive Module Guide

Enter rich educational instructions, mathematical formulations, and step-by-step documentation below.

---

### 1. Mathematical Formulas (LaTeX)
Inline equation: Let continuous assessment score be $S_i$ where $S_i \\in [0, 100]$.
Quadratic solution: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Display equation:
$$\\text{Term Aggregate} = \\sum_{i=1}^{n} (w_i \\cdot s_i) \\quad \\text{where } \\sum w_i = 1.0$$

---

### 2. Numbered Implementation Steps
1. Navigate to the appropriate academic or administrative module from your sidebar.
2. Review the class eligibility roster before activating exam windows.
3. Commit final scores to generate certified terminal transcripts.

---

### 3. Key Bullet Points & Requirements
- All continuous assessment records must be verified by the departmental head.
- Ensure minimum attendance threshold ($>75\\%$) is satisfied.
- Offline exam sheets must be synchronized within 48 hours.

---

### 4. Indented Notes & Guidelines
> **Statutory Policy Warning**:
> Marks entered after the term closing date require explicit Dean or Principal override permission. Double-check all entered numerical fields before final submission.`;

export default function ConsoleTutorialsPage() {
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRoleCategory>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewModalTutorial, setPreviewModalTutorial] = useState<TutorialItem | null>(null);
  const [deleteConfirmTutorial, setDeleteConfirmTutorial] = useState<{ id: string; title: string; role: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formRole, setFormRole] = useState<"ALL" | "ADMIN" | "TEACHER" | "STUDENT" | "PARENT">("ADMIN");
  const [formCategory, setFormCategory] = useState<"Setup" | "Academics" | "Assessments" | "Billing" | "Communication" | "General">("Setup");
  const [formDuration, setFormDuration] = useState("5:00");
  const [formDifficulty, setFormDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formVideoUrl, setFormVideoUrl] = useState("/videos/hero video.mp4");
  const [formThumbnail, setFormThumbnail] = useState("/image/backgroundSchool.jpg");
  const [formRichText, setFormRichText] = useState(DEFAULT_LATEX_TEMPLATE);
  const [formSteps, setFormSteps] = useState<TutorialStep[]>([
    {
      title: "Initial Configuration",
      description: "Log into the portal and navigate to the module dashboard.",
      tips: "Ensure proper administrative privileges before changing school settings."
    }
  ]);
  const [stepsInputMode, setStepsInputMode] = useState<"form" | "json">("form");
  const [stepsJsonRaw, setStepsJsonRaw] = useState<string>("");
  const [stepsJsonError, setStepsJsonError] = useState<string | null>(null);
  const [formTakeaways, setFormTakeaways] = useState<string[]>([
    "Mastering core portal navigation",
    "Understanding mathematical and grading formulas"
  ]);
  const [takeawaysInputMode, setTakeawaysInputMode] = useState<"form" | "json">("form");
  const [takeawaysJsonRaw, setTakeawaysJsonRaw] = useState<string>("");
  const [takeawaysJsonError, setTakeawaysJsonError] = useState<string | null>(null);
  const takeawaysFileInputRef = useRef<HTMLInputElement>(null);
  const stepsFileInputRef = useRef<HTMLInputElement>(null);

  // Video upload handler state
  const [videoUploadName, setVideoUploadName] = useState<string | null>(null);
  const [videoInputMode, setVideoInputMode] = useState<"url" | "upload">("url");
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState(false);
  const [extractedThumbnails, setExtractedThumbnails] = useState<string[]>([]);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load real tutorials from database on client mount
  useEffect(() => {
    const local = getStoredTutorials();
    setTutorials(local);
    setIsLoaded(true);

    // Fetch authoritative data from database
    fetchTutorialsFromDatabase()
      .then((dbData) => {
        if (dbData && dbData.length > 0) {
          setTutorials(dbData);
        }
      })
      .catch((err) => {
        console.warn("Could not sync tutorials from database, using cached catalog:", err);
      });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TutorialItem[]>;
      if (customEvent.detail) {
        setTutorials(customEvent.detail);
      }
    };
    window.addEventListener("qefas_tutorials_updated", handleUpdate);
    return () => window.removeEventListener("qefas_tutorials_updated", handleUpdate);
  }, []);

  // Filtered tutorials list
  const filteredTutorials = useMemo(() => {
    return tutorials.filter((item) => {
      const matchesRole = selectedRole === "ALL" || item.role === "ALL" || item.role === selectedRole;
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.keyTakeaways.some((k) => k.toLowerCase().includes(query));

      return matchesRole && matchesCategory && matchesSearch;
    });
  }, [tutorials, selectedRole, selectedCategory, searchQuery]);

  // Handle Video File Upload with automatic thumbnail extraction
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file (MP4, WebM, etc.)");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFormVideoUrl(objectUrl);
    setVideoUploadName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    toast.success(`Video file loaded: ${file.name}`);

    // Auto-capture initial thumbnail frame from the newly uploaded video file
    try {
      const captured = await captureVideoFrame(objectUrl, 1.5);
      setFormThumbnail(captured);
      setExtractedThumbnails([captured]);
      toast.info("Auto-extracted initial thumbnail frame from video!");
    } catch {
      // Optional fallback if browser restricts immediate decoding
    }
  };

  // Extract thumbnail from current video URL or uploaded file
  const handleExtractThumbnailFromVideo = async () => {
    if (!formVideoUrl) {
      toast.warning("Please enter a video URL or upload a video file first");
      return;
    }

    setIsExtractingThumbnail(true);

    try {
      // 1. YouTube Detection (Instant HD Thumbnail API)
      const ytMatch = formVideoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/#\s]{11})/i
      );

      if (ytMatch && ytMatch[1]) {
        const ytId = ytMatch[1];
        const maxResUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        const hqUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

        const testImg = new window.Image();
        testImg.onload = () => {
          const chosenUrl = testImg.width > 120 ? maxResUrl : hqUrl;
          setFormThumbnail(chosenUrl);
          setExtractedThumbnails((prev) => [chosenUrl, ...prev.filter((u) => u !== chosenUrl)]);
          setIsExtractingThumbnail(false);
          toast.success("HD Thumbnail extracted from YouTube!");
        };
        testImg.onerror = () => {
          setFormThumbnail(hqUrl);
          setExtractedThumbnails((prev) => [hqUrl, ...prev.filter((u) => u !== hqUrl)]);
          setIsExtractingThumbnail(false);
          toast.success("Thumbnail extracted from YouTube!");
        };
        testImg.src = maxResUrl;
        return;
      }

      // 2. Direct Video Files, Blob URLs, or HTML5-compatible video paths
      const frames: string[] = [];
      const firstFrame = await captureVideoFrame(formVideoUrl, 1.5);
      frames.push(firstFrame);
      setFormThumbnail(firstFrame);

      // Attempt to capture 2 alternative candidate frames
      try {
        const frame2 = await captureVideoFrame(formVideoUrl, 4.0);
        frames.push(frame2);
        const frame3 = await captureVideoFrame(formVideoUrl, 7.5);
        frames.push(frame3);
      } catch {
        // Fallback to first frame if video duration is short
      }

      setExtractedThumbnails(frames);
      setIsExtractingThumbnail(false);
      toast.success("Thumbnail successfully extracted from video frame!");
    } catch (err) {
      console.error("Thumbnail extraction error:", err);
      setIsExtractingThumbnail(false);
      toast.error(
        "Could not capture frame from this video source. (Tip: For external URLs blocked by CORS, upload the file directly or choose a preset)."
      );
    }
  };

  // Open Editor for New Tutorial
  const handleStartCreate = () => {
    setEditingId(null);
    setFormTitle("");
    setFormSummary("");
    setFormRole("ADMIN");
    setFormCategory("Setup");
    setFormDuration("5:00");
    setFormDifficulty("Beginner");
    setFormFeatured(false);
    setFormVideoUrl("/videos/hero video.mp4");
    setFormThumbnail("/image/backgroundSchool.jpg");
    setExtractedThumbnails([]);
    setVideoUploadName(null);
    setVideoInputMode("url");
    setFormSteps([
      {
        title: "Step 1: Get Started",
        description: "Open the relevant dashboard section from the main navigation menu.",
        tips: "Keep your login credentials securely backed up."
      }
    ]);
    setFormTakeaways([
      "Clear understanding of this workflow",
      "Actionable step-by-step execution"
    ]);
    setFormRichText(DEFAULT_LATEX_TEMPLATE);
    setIsEditing(true);
  };

  // Open Editor for Existing Tutorial
  const handleStartEdit = (item: TutorialItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormSummary(item.summary);
    setFormRole(item.role);
    setFormCategory(item.category);
    setFormDuration(item.duration);
    setFormDifficulty(item.difficulty);
    setFormFeatured(!!item.featured);
    setFormVideoUrl(item.videoUrl);
    setFormThumbnail(item.thumbnail);
    setExtractedThumbnails(item.thumbnail ? [item.thumbnail] : []);
    setVideoUploadName(null);
    setVideoInputMode("url");
    setFormSteps(
      item.steps && item.steps.length > 0
        ? [...item.steps]
        : [{ title: "Step 1", description: "Follow the screen instructions." }]
    );
    setFormTakeaways(
      item.keyTakeaways && item.keyTakeaways.length > 0
        ? [...item.keyTakeaways]
        : ["Master this essential feature"]
    );
    setFormRichText(item.richTextGuide || DEFAULT_LATEX_TEMPLATE);
    setIsEditing(true);
  };

  // Save Tutorial
  const handleSaveTutorial = async (e: React.FormEvent) => {
    e.preventDefault();

    // If currently editing steps in JSON mode, parse and validate before saving
    let finalSteps = formSteps;
    if (stepsInputMode === "json") {
      try {
        const parsed = JSON.parse(stepsJsonRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          finalSteps = parsed.map((s, idx) => ({
            title: String(s.title || `Step ${idx + 1}`),
            description: String(s.description || ""),
            tips: s.tips ? String(s.tips) : undefined
          }));
          setFormSteps(finalSteps);
        }
      } catch (err: any) {
        toast.error("Invalid Step JSON format: " + (err?.message || "Please fix errors before saving"));
        return;
      }
    }

    // If currently editing takeaways in JSON mode, parse and validate before saving
    let finalTakeaways = formTakeaways;
    if (takeawaysInputMode === "json") {
      try {
        const parsed = JSON.parse(takeawaysJsonRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          finalTakeaways = parsed.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
          setFormTakeaways(finalTakeaways);
        }
      } catch (err: any) {
        toast.error("Invalid Takeaways JSON format: " + (err?.message || "Please fix errors before saving"));
        return;
      }
    }

    if (!formTitle.trim()) {
      toast.error("Please enter a title for the tutorial");
      return;
    }
    if (!formSummary.trim()) {
      toast.error("Please provide a brief summary");
      return;
    }
    if (!formVideoUrl.trim()) {
      toast.error("Please provide a video URL or upload a video file");
      return;
    }

    const newId = editingId || `tutorial-${Date.now()}`;
    const tutorialPayload: TutorialItem = {
      id: newId,
      title: formTitle.trim(),
      summary: formSummary.trim(),
      role: formRole,
      category: formCategory,
      duration: formDuration.trim() || "5:00",
      difficulty: formDifficulty,
      featured: formFeatured,
      videoUrl: formVideoUrl.trim(),
      thumbnail: formThumbnail.trim() || "/image/backgroundSchool.jpg",
      steps: finalSteps.filter((s) => s.title.trim() && s.description.trim()),
      keyTakeaways: finalTakeaways.filter((k) => k.trim()),
      richTextGuide: formRichText.trim()
    };

    setIsSaving(true);
    try {
      const updated = await upsertSingleTutorialToDatabase(tutorialPayload);
      setTutorials(updated);
      toast.success(editingId ? "Tutorial updated in database!" : "New tutorial saved to database!");
      setIsEditing(false);
      setEditingId(null);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.response?.data?.message || "Failed to persist tutorial to database.");
    } finally {
      setIsSaving(false);
    }
  };

  // Open Delete Confirmation Modal
  const handlePromptDelete = (id: string, title: string, role: string) => {
    setDeleteConfirmTutorial({ id, title, role });
  };

  // Confirm Delete Tutorial with live loading indicator
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTutorial || isDeleting) return;
    const { id, title } = deleteConfirmTutorial;
    setIsDeleting(true);
    try {
      const updated = await deleteTutorialFromDatabase(id);
      setTutorials(updated);
      setDeleteConfirmTutorial(null);
      toast.success(`Tutorial "${title}" deleted from database`);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete tutorial from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm Reset to Defaults with live loading indicator
  const handleConfirmResetDefaults = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const defaults = await resetStoredTutorials();
      setTutorials(defaults);
      setShowResetConfirm(false);
      toast.info("Tutorials reset to default institutional catalog in database");
    } catch (err: any) {
      console.error("Reset error:", err);
      toast.error("Failed to reset tutorials in database.");
    } finally {
      setIsResetting(false);
    }
  };

  // Helper to insert markdown or LaTeX at cursor
  const insertTextAtCursor = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formRichText;
    const selectedText = text.substring(start, end);

    const replacement = `${prefix}${selectedText || ""}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFormRichText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  // Step item handlers
  const handleSwitchStepsMode = (mode: "form" | "json") => {
    if (mode === "json") {
      setStepsJsonRaw(JSON.stringify(formSteps, null, 2));
      setStepsJsonError(null);
    } else {
      // Parse JSON back to form
      try {
        const parsed = JSON.parse(stepsJsonRaw);
        if (!Array.isArray(parsed)) {
          setStepsJsonError("JSON must be an array of step objects: [{ title, description, tips }]");
          return;
        }
        const validatedSteps: TutorialStep[] = parsed.map((s, idx) => ({
          title: String(s.title || `Step ${idx + 1}`),
          description: String(s.description || ""),
          tips: s.tips ? String(s.tips) : undefined
        }));
        setFormSteps(validatedSteps);
        setStepsJsonError(null);
      } catch (err: any) {
        setStepsJsonError("Invalid JSON syntax: " + (err?.message || "Check brackets and quotes"));
        return;
      }
    }
    setStepsInputMode(mode);
  };

  const handleApplyStepsJson = () => {
    try {
      const parsed = JSON.parse(stepsJsonRaw);
      if (!Array.isArray(parsed)) {
        setStepsJsonError("JSON must be an array of step objects");
        return;
      }
      const validatedSteps: TutorialStep[] = parsed.map((s, idx) => ({
        title: String(s.title || `Step ${idx + 1}`),
        description: String(s.description || ""),
        tips: s.tips ? String(s.tips) : undefined
      }));
      setFormSteps(validatedSteps);
      setStepsJsonError(null);
      setStepsInputMode("form");
      toast.success(`Loaded ${validatedSteps.length} action steps from JSON!`);
    } catch (err: any) {
      setStepsJsonError("Invalid JSON syntax: " + (err?.message || "Check format"));
    }
  };

  const handleLoadSampleStepsJson = () => {
    const sample = [
      {
        "title": "Access School Profile & Settings",
        "description": "Log into your portal, navigate to Settings from the sidebar, and confirm institutional details.",
        "tips": "Double check all contact details and accreditation registration numbers."
      },
      {
        "title": "Review Class & Roster Allocations",
        "description": "Open Classes and verify form tutors and enrolled students for the current term.",
        "tips": "Each class has a unique joining token or QR code for easy student linking."
      },
      {
        "title": "Verify Assessment & Continuous Assessment Marks",
        "description": "Ensure teachers have submitted all test, assignment, and quiz marks before closing the term.",
        "tips": "Download offline Excel marksheets if working without stable internet access."
      },
      {
        "title": "Publish & Export Terminal Broadsheet",
        "description": "Review final cumulative rankings and export certified PDF report cards with QR seals.",
        "tips": "Principal or exam officer digital signature is cryptographically embedded."
      }
    ];
    const raw = JSON.stringify(sample, null, 2);
    setStepsJsonRaw(raw);
    setStepsJsonError(null);
    toast.info("Sample step-by-step checklist JSON loaded!");
  };

  const handleAddStep = () => {
    setFormSteps([
      ...formSteps,
      {
        title: `Step ${formSteps.length + 1}`,
        description: "",
        tips: ""
      }
    ]);
  };

  const handleUpdateStep = (index: number, field: keyof TutorialStep, value: string) => {
    const updated = [...formSteps];
    updated[index] = { ...updated[index], [field]: value };
    setFormSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (formSteps.length <= 1) {
      toast.warning("A tutorial should have at least one step");
      return;
    }
    setFormSteps(formSteps.filter((_, idx) => idx !== index));
  };

  // Takeaway handlers (Visual Form + JSON Mode + JSON File Upload)
  const handleAddTakeaway = () => {
    setFormTakeaways([...formTakeaways, ""]);
  };

  const handleUpdateTakeaway = (index: number, val: string) => {
    const updated = [...formTakeaways];
    updated[index] = val;
    setFormTakeaways(updated);
  };

  const handleRemoveTakeaway = (index: number) => {
    setFormTakeaways(formTakeaways.filter((_, idx) => idx !== index));
  };

  const handleSwitchTakeawaysMode = (mode: "form" | "json") => {
    if (mode === "json") {
      setTakeawaysJsonRaw(JSON.stringify(formTakeaways, null, 2));
      setTakeawaysJsonError(null);
    } else {
      try {
        const parsed = JSON.parse(takeawaysJsonRaw);
        if (!Array.isArray(parsed)) {
          setTakeawaysJsonError("JSON must be an array of strings: [\"takeaway 1\", \"takeaway 2\"]");
          return;
        }
        const validated = parsed.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
        setFormTakeaways(validated);
        setTakeawaysJsonError(null);
      } catch (err: any) {
        setTakeawaysJsonError("Invalid JSON syntax: " + (err?.message || "Check format"));
        return;
      }
    }
    setTakeawaysInputMode(mode);
  };

  const handleApplyTakeawaysJson = () => {
    try {
      const parsed = JSON.parse(takeawaysJsonRaw);
      if (!Array.isArray(parsed)) {
        setTakeawaysJsonError("JSON must be an array of strings");
        return;
      }
      const validated = parsed.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
      setFormTakeaways(validated);
      setTakeawaysJsonError(null);
      setTakeawaysInputMode("form");
      toast.success(`Loaded ${validated.length} learning takeaways from JSON!`);
    } catch (err: any) {
      setTakeawaysJsonError("Invalid JSON syntax: " + (err?.message || "Check format"));
    }
  };

  const handleLoadSampleTakeawaysJson = () => {
    const sample = [
      "Overview of role-based dashboards for admins, teachers, students, and parents",
      "Real-time continuous assessment scoring and attendance roll call",
      "Instant tuition fee payments with official digital PDF receipts",
      "Self-service official transcript ordering with cryptographic QR verification"
    ];
    setTakeawaysJsonRaw(JSON.stringify(sample, null, 2));
    setTakeawaysJsonError(null);
    toast.info("Sample learning takeaways JSON loaded!");
  };

  // Upload JSON file handler for steps
  const handleUploadStepsJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          toast.error("File JSON must be an array of step objects");
          return;
        }
        const validatedSteps: TutorialStep[] = parsed.map((s, idx) => ({
          title: String(s.title || `Step ${idx + 1}`),
          description: String(s.description || ""),
          tips: s.tips ? String(s.tips) : undefined
        }));
        setFormSteps(validatedSteps);
        setStepsJsonRaw(JSON.stringify(validatedSteps, null, 2));
        setStepsInputMode("form");
        toast.success(`Imported ${validatedSteps.length} steps from ${file.name}!`);
      } catch (err: any) {
        toast.error("Failed to parse JSON file: " + (err?.message || "Invalid file format"));
      } finally {
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Upload JSON file handler for takeaways
  const handleUploadTakeawaysJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          toast.error("File JSON must be an array of strings");
          return;
        }
        const validated = parsed.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
        setFormTakeaways(validated);
        setTakeawaysJsonRaw(JSON.stringify(validated, null, 2));
        setTakeawaysInputMode("form");
        toast.success(`Imported ${validated.length} takeaways from ${file.name}!`);
      } catch (err: any) {
        toast.error("Failed to parse JSON file: " + (err?.message || "Invalid file format"));
      } finally {
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ALL":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "ADMIN":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      case "TEACHER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "STUDENT":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "PARENT":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Video size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Tutorials & Academy Setup
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage video walkthroughs, LaTeX mathematical documentation, numbering, bullet points, and guides.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <Link
            href="/tutorials"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm flex-1 sm:flex-initial"
          >
            <ExternalLink size={14} />
            <span>View Public Page</span>
          </Link>

          <button
            onClick={() => setShowResetConfirm(true)}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors flex-1 sm:flex-initial"
            title="Reset tutorials catalog to platform defaults"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          {!isEditing ? (
            <button
              onClick={handleStartCreate}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Create Tutorial</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <X size={16} />
              <span>Exit Editor</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Counter Bar — Mobile Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {[
          { label: "Total Guides", count: tutorials.length, icon: Layers, color: "text-indigo-600 dark:text-indigo-400", isPrimary: true },
          { label: "School Admins", count: tutorials.filter((t) => t.role === "ADMIN").length, icon: Building2, color: "text-indigo-500", isPrimary: false },
          { label: "Teachers", count: tutorials.filter((t) => t.role === "TEACHER").length, icon: BookOpen, color: "text-emerald-500", isPrimary: false },
          { label: "Students", count: tutorials.filter((t) => t.role === "STUDENT").length, icon: GraduationCap, color: "text-rose-500", isPrimary: false },
          { label: "Parents", count: tutorials.filter((t) => t.role === "PARENT").length, icon: Users, color: "text-amber-500", isPrimary: false }
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between ${
              stat.isPrimary ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{stat.count}</p>
            </div>
            <stat.icon className={`size-4 sm:size-5 ${stat.color} opacity-80`} />
          </div>
        ))}
      </div>

      {/* MAIN VIEW: EITHER EDITOR OR TUTORIALS DIRECTORY */}
      {isEditing ? (
        /* --- RICH TUTORIAL & LATEX STUDIO EDITOR --- */
        <form onSubmit={handleSaveTutorial} className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Edit3 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingId ? `Editing: ${formTitle || "Tutorial"}` : "Create New Tutorial"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure video media, step-by-step points, and mathematical LaTeX documentation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{editingId ? "Update Tutorial" : "Save Tutorial"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 1: Basic Metadata */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              <span>1. Basic Information & Classification</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tutorial Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Master Terminal Exams & Continuous Assessment Setup"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Summary / Short Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Summarize what users will achieve with this guide..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target User Role *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Roles (Universal / Everyone)</option>
                  <option value="ADMIN">School Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Setup">Setup</option>
                  <option value="Academics">Academics</option>
                  <option value="Assessments">Assessments</option>
                  <option value="Billing">Billing</option>
                  <option value="Communication">Communication</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Estimated Duration (mm:ss)
                </label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="e.g. 5:20"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Difficulty Level
                </label>
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="size-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="featuredToggle" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                  Highlight as Featured Tutorial on top of the role section
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Video Media Upload & Configuration */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Video size={16} className="text-indigo-500" />
              <span>2. Video Walkthrough Setup</span>
            </h4>

            {/* Video Input Mode Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-fit">
              <button
                type="button"
                onClick={() => setVideoInputMode("url")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  videoInputMode === "url"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <LinkIcon size={14} />
                <span>Video Link / Path</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoInputMode("upload")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  videoInputMode === "upload"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Upload size={14} />
                <span>Upload Video File</span>
              </button>
            </div>

            {videoInputMode === "url" ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Video URL (Direct MP4, public link, or /videos/... path)
                </label>
                <input
                  type="text"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="e.g. /videos/hero video.mp4 or https://cdn.example.com/tutorials/demo.mp4"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Default sample video: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-500">/videos/hero video.mp4</code>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="video/*"
                  ref={videoFileInputRef}
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => videoFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50 group"
                >
                  <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={22} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {videoUploadName ? "Change Uploaded Video File" : "Click to select a video file"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports MP4, WebM, OGG up to high definition</p>
                  {videoUploadName && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      <CheckCircle2 size={13} />
                      <span>{videoUploadName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thumbnail Selection & Video Extraction */}
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Camera size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Tutorial Thumbnail Image</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Extract a high-resolution poster directly from the video or select a preset.
                  </p>
                </div>

                {/* Extract from video button */}
                <button
                  type="button"
                  onClick={handleExtractThumbnailFromVideo}
                  disabled={isExtractingThumbnail || !formVideoUrl}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                >
                  {isExtractingThumbnail ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-indigo-600" />
                      <span>Extracting Frame...</span>
                    </>
                  ) : (
                    <>
                      <Camera size={13} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Extract Thumbnail from Video</span>
                    </>
                  )}
                </button>
              </div>

              {/* Current Active Thumbnail Preview Card */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 shadow-inner group">
                  {formThumbnail ? (
                    <img
                      src={formThumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Film size={20} />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active Poster
                    </span>
                    {formThumbnail.startsWith("data:") && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        (Extracted Video Snapshot)
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formThumbnail.startsWith("data:") ? "[Extracted Video Frame Snapshot]" : formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    placeholder="/image/backgroundSchool.jpg or image URL"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 truncate">
                    Displayed on tutorial lists, social cards, and player preview.
                  </p>
                </div>
              </div>

              {/* Extracted Video Snapshots (if captured) */}
              {extractedThumbnails.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles size={12} className="text-indigo-500" />
                    <span>Captured Video Frames (Click to Apply):</span>
                  </span>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {extractedThumbnails.map((snap, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormThumbnail(snap);
                          toast.info(`Selected frame #${idx + 1}`);
                        }}
                        className={`relative aspect-video h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          formThumbnail === snap
                            ? "border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-500/30"
                            : "border-slate-300 dark:border-slate-700 opacity-75 hover:opacity-100 hover:border-indigo-400"
                        }`}
                      >
                        <img src={snap} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/70 text-white px-1 rounded">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Presets Row */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Library Presets:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {THUMBNAIL_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormThumbnail(preset)}
                      className={`relative size-12 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                        formThumbnail === preset
                          ? "border-indigo-600 scale-105 shadow-md"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={preset} alt="preset" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Preview Box */}
            {formVideoUrl && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Video size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Live Video Preview:</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Auto-formatted 16:9 cinema display
                  </span>
                </div>
                <div className="max-w-2xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                  <VideoPlayer
                    videoUrl={formVideoUrl}
                    title={formTitle || "Video Preview"}
                    poster={formThumbnail}
                    variant="cinema"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Rich Text LaTeX Documentation Editor */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Sigma size={16} className="text-indigo-500" />
                  <span>3. Rich Text Guide (LaTeX Formulas, Numbering, Bullets, Indentation & Spacing)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Write detailed academic manuals supporting mathematical formulas, numbered lists, bullet points, blockquotes, and spacing.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/40 w-fit">
                <Split size={14} />
                <span>Split Live Preview</span>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">Insert:</span>

              {/* LaTeX Inline */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("$", "$")}
                title="Inline LaTeX Formula ($...$)"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              >
                <Sigma size={13} />
                <span>Inline Math</span>
              </button>

              {/* LaTeX Display */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("$$\n", "\n$$")}
                title="Display LaTeX Equation ($$...$$)"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              >
                <span className="font-mono text-xs">$$</span>
                <span>Block Math</span>
              </button>

              {/* Numbered List */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("\n1. First item\n2. Second item\n3. Third item\n")}
                title="Numbered List"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              >
                <ListOrdered size={13} />
                <span>Numbered List</span>
              </button>

              {/* Bullet Points */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("\n- Point A\n- Point B\n- Point C\n")}
                title="Bullet Points"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              >
                <List size={13} />
                <span>Bullet Points</span>
              </button>

              {/* Indentation / Blockquote */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("\n> **Important Note:**\n> Indented note and continuous observation details.\n")}
                title="Indentation / Blockquote"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              >
                <Quote size={13} />
                <span>Indentation (Quote)</span>
              </button>

              {/* Spacing / Divider */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("\n\n---\n\n")}
                title="Divider & Spacing"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <span>Spacing Divider</span>
              </button>

              {/* Header */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("\n### Section Header\n")}
                title="Heading"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              >
                <Heading size={13} />
                <span>Heading</span>
              </button>

              {/* Bold */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("**", "**")}
                title="Bold Text"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              >
                <Bold size={13} />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("*", "*")}
                title="Italic Text"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm"
              >
                <Italic size={13} />
              </button>
            </div>

            {/* Split Screen Editor and Live LaTeX Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left Pane: Code/Source Input */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                  <span>Markdown & LaTeX Source:</span>
                  <span>{formRichText.length} characters</span>
                </div>
                <textarea
                  ref={textareaRef}
                  rows={18}
                  value={formRichText}
                  onChange={(e) => setFormRichText(e.target.value)}
                  placeholder="Type your markdown guide with LaTeX math formulas ($x^2$), lists (1., -), and quotes (>)..."
                  className="w-full flex-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>

              {/* Right Pane: Live Rendered Output */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 px-1">
                  <span>Live Rendered Preview (Katex + Markdown):</span>
                  <span className="text-[10px] uppercase font-black bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live
                  </span>
                </div>
                <div className="flex-1 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto max-h-[460px] shadow-sm">
                  {formRichText.trim() ? (
                    <LaTeXRenderer content={formRichText} forceMarkdown={true} />
                  ) : (
                    <p className="text-xs text-slate-400 italic">No content typed yet. Type in the left box to preview.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Quick Action Steps (Interactive Form + JSON Editor) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <ListOrdered size={16} className="text-indigo-500" />
                  <span>4. Quick Step-by-Step Checklist</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Structured action steps displayed in the quick-action tab on the public tutorials portal.
                </p>
              </div>

              {/* Mode Toggle & Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSwitchStepsMode("form")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      stepsInputMode === "form"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Visual Form
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchStepsMode("json")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      stepsInputMode === "json"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Code size={13} />
                    <span>JSON Mode</span>
                  </button>
                </div>

                {stepsInputMode === "form" ? (
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Step</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleLoadSampleStepsJson}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-colors"
                    >
                      <Sparkles size={13} />
                      <span>Load Sample JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => stepsFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <Upload size={13} />
                      <span>Upload JSON File</span>
                    </button>
                    <input
                      ref={stepsFileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleUploadStepsJsonFile}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* VISUAL FORM MODE */}
            {stepsInputMode === "form" ? (
              <div className="space-y-4">
                {formSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Step #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Step"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleUpdateStep(idx, "title", e.target.value)}
                      placeholder="Step Title (e.g. Access School Profile in Settings)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => handleUpdateStep(idx, "description", e.target.value)}
                      placeholder="Detailed explanation of what the user needs to do in this step..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                      type="text"
                      value={step.tips || ""}
                      onChange={(e) => handleUpdateStep(idx, "tips", e.target.value)}
                      placeholder="Optional Pro Tip (e.g. Upload high-res PNG for crisp report cards)"
                      className="w-full px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* JSON CODE EDITOR MODE */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Enter JSON array of objects with <code className="text-indigo-500 font-mono">title</code>, <code className="text-indigo-500 font-mono">description</code>, and optional <code className="text-amber-500 font-mono">tips</code>:</span>
                  <button
                    type="button"
                    onClick={handleApplyStepsJson}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Apply JSON to Form &rarr;
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={stepsJsonRaw}
                  onChange={(e) => {
                    setStepsJsonRaw(e.target.value);
                    setStepsJsonError(null);
                  }}
                  placeholder='[
  {
    "title": "Step 1: Onboard School",
    "description": "Configure academic calendar and grading scales.",
    "tips": "Upload transparent logo for crisp report cards."
  }
]'
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  spellCheck={false}
                />

                {stepsJsonError ? (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{stepsJsonError}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Valid JSON format supported. Changes are automatically validated when saving.</span>
                    <button
                      type="button"
                      onClick={handleApplyStepsJson}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm"
                    >
                      Validate & Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Key Takeaways (Visual Form + JSON Mode + JSON File Upload) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <BookmarkCheck size={16} className="text-indigo-500" />
                  <span>5. Core Learning Takeaways</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bullet points summarized under the video player.
                </p>
              </div>

              {/* Takeaways Mode Toggle & Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSwitchTakeawaysMode("form")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      takeawaysInputMode === "form"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Visual Form
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchTakeawaysMode("json")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      takeawaysInputMode === "json"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Code size={13} />
                    <span>JSON Mode</span>
                  </button>
                </div>

                {takeawaysInputMode === "form" ? (
                  <button
                    type="button"
                    onClick={handleAddTakeaway}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Takeaway</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleLoadSampleTakeawaysJson}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-colors"
                    >
                      <Sparkles size={13} />
                      <span>Load Sample JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => takeawaysFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <Upload size={13} />
                      <span>Upload JSON File</span>
                    </button>
                    <input
                      ref={takeawaysFileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleUploadTakeawaysJsonFile}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* VISUAL FORM MODE */}
            {takeawaysInputMode === "form" ? (
              <div className="space-y-2">
                {formTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <input
                      type="text"
                      value={takeaway}
                      onChange={(e) => handleUpdateTakeaway(idx, e.target.value)}
                      placeholder="e.g. Overview of role-based dashboards"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTakeaway(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* JSON CODE EDITOR MODE */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Enter JSON array of strings:</span>
                  <button
                    type="button"
                    onClick={handleApplyTakeawaysJson}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Apply JSON to Form &rarr;
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={takeawaysJsonRaw}
                  onChange={(e) => {
                    setTakeawaysJsonRaw(e.target.value);
                    setTakeawaysJsonError(null);
                  }}
                  placeholder='[
  "Role-based overview for school admins, teachers, students, and parents",
  "Real-time continuous assessment scoring and attendance roll call"
]'
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  spellCheck={false}
                />

                {takeawaysJsonError ? (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{takeawaysJsonError}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Valid JSON array format: <code className="text-indigo-400">[&quot;item 1&quot;, &quot;item 2&quot;]</code>. Changes are automatically validated when saving.</span>
                    <button
                      type="button"
                      onClick={handleApplyTakeawaysJson}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm"
                    >
                      Validate & Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingId ? "Updating Tutorial..." : "Publishing Tutorial..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{editingId ? "Update Tutorial" : "Save & Publish Tutorial"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* --- DIRECTORY OF ALL TUTORIALS --- */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials by title, content or keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(["ALL", "ADMIN", "TEACHER", "STUDENT", "PARENT"] as UserRoleCategory[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedRole === role
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {role === "ALL" ? "All Roles" : role}
                </button>
              ))}
            </div>
          </div>

          {/* Tutorials Cards Grid */}
          {filteredTutorials.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <AlertCircle size={36} className="mx-auto text-slate-400 mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">No Tutorials Found</h4>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query, or create a new tutorial.</p>
              <button
                type="button"
                onClick={handleStartCreate}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
              >
                <Plus size={14} />
                <span>Create Tutorial</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutorials.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                >
                  {/* Thumbnail / Video Banner */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <Image
                      src={item.thumbnail || "/image/backgroundSchool.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Role & Category Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${getRoleBadgeColor(item.role)}`}>
                        {item.role === "ALL" ? "ALL ROLES" : item.role}
                      </span>
                      {item.featured && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 backdrop-blur-md">
                          <Sparkles size={10} />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 text-[11px] font-bold text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={12} />
                      <span>{item.duration}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewModalTutorial(item)}
                      className="absolute inset-0 m-auto size-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-indigo-600/40"
                    >
                      <Play size={20} className="fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.difficulty}</span>
                        {item.richTextGuide && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-500 font-bold flex items-center gap-1">
                              <Sigma size={11} /> LaTeX Guide
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewModalTutorial(item)}
                          className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          <Eye size={14} />
                          <span>Preview</span>
                        </button>
                        <Link
                          href={`/tutorials/${item.id}`}
                          target="_blank"
                          title="Open Live Dedicated Page"
                          className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-0.5 transition-colors"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="size-8 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center justify-center transition-colors"
                          title="Edit Tutorial"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromptDelete(item.id, item.title, item.role)}
                          className="size-8 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 flex items-center justify-center transition-colors"
                          title="Delete Tutorial"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal for Selected Tutorial */}
      {previewModalTutorial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(previewModalTutorial.role)}`}>
                  {previewModalTutorial.role}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {previewModalTutorial.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalTutorial(null)}
                className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Video Player */}
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                <VideoPlayer
                  videoUrl={previewModalTutorial.videoUrl}
                  title={previewModalTutorial.title}
                  poster={previewModalTutorial.thumbnail}
                  variant="cinema"
                />
              </div>

              {/* Rich LaTeX Guide */}
              {previewModalTutorial.richTextGuide && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sigma size={14} />
                    <span>Academic & Mathematical Guide</span>
                  </h4>
                  <LaTeXRenderer content={previewModalTutorial.richTextGuide} forceMarkdown={true} />
                </div>
              )}

              {/* Steps */}
              {previewModalTutorial.steps && previewModalTutorial.steps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Step-by-step checklist:
                  </h4>
                  <div className="space-y-2.5">
                    {previewModalTutorial.steps.map((st, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-3">
                        <div className="size-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">{st.title}</p>
                          <p className="text-slate-500 dark:text-slate-400">{st.description}</p>
                          {st.tips && (
                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                              <strong>Pro Tip:</strong> {st.tips}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <Link
                href={`/tutorials/${previewModalTutorial.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ExternalLink size={14} />
                <span>Open Dedicated Page</span>
              </Link>
              <button
                type="button"
                onClick={() => setPreviewModalTutorial(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROPERLY DESIGNED DELETE CONFIRMATION POP-UP MODAL */}
      {deleteConfirmTutorial && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-red-200/90 dark:border-red-500/30 p-6 sm:p-7 shadow-2xl shadow-red-950/30 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Top close button */}
            <button
              type="button"
              onClick={() => setDeleteConfirmTutorial(null)}
              className="absolute top-4 right-4 size-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            {/* Danger Icon & Heading */}
            <div className="text-center space-y-3 pt-1">
              <div className="size-16 rounded-3xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner shadow-red-500/10">
                <Trash2 className="size-8 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                  Permanent Deletion
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                  Delete Tutorial?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-1">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  &ldquo;{deleteConfirmTutorial.title}&rdquo;
                </span>
                ?
              </p>
            </div>

            {/* Warning Details Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200/90 flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                This will immediately remove this video lesson, LaTeX academic manual, and step checklist from the platform catalog.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  if (!isDeleting) setDeleteConfirmTutorial(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Tutorial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROPERLY DESIGNED RESET CATALOG POP-UP MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="absolute top-4 right-4 size-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-3 pt-1">
              <div className="size-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner shadow-indigo-500/10">
                <RotateCcw className="size-8 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Institutional Catalog
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                  Reset to Defaults?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-1">
                This will reload the official platform video walkthroughs, LaTeX mathematical formulations, and step-by-step guides for all roles.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => {
                  if (!isResetting) setShowResetConfirm(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmResetDefaults}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
              >
                {isResetting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    <span>Confirm Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
