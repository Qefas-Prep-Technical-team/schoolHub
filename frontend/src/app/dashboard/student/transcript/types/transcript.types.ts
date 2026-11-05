import {
  getGradeEvaluation,
  getGradeColorAndBg,
  getEffectiveGradingSystem,
  GradingRule,
} from "@/utils/gradingSystem";

export interface SubjectResultItem {
  id?: string;
  scoresRevealed?: boolean;
  totalScore?: number | null;
  caScore?: number | null;
  examScore?: number | null;
  assignmentScore?: number | null;
  quizScore?: number | null;
  grade?: string | null;
  subject?: {
    id?: string;
    name?: string;
    code?: string;
  };
}

export interface PublishedResultGroup {
  sessionId: string;
  term: string;
  subjectCount: number;
  revealedCount: number;
  class?: {
    id?: string;
    name?: string;
  };
  session?: {
    id?: string;
    name?: string;
  };
  subjectResults?: SubjectResultItem[];
}

export interface SignatureSlotInfo {
  roleTitle: string;
  subtitle: string;
  signatureUrl?: string;
  adminName: string;
  isImage: boolean;
}

export interface DirectAccessPassState {
  token: string;
  expiresAt: string;
  accessUrl?: string;
  sessionId?: string;
  term?: string;
}

export interface GraduatedSchoolBadge {
  id: string;
  name: string;
  logo?: string | null;
  motto?: string | null;
  graduationYear?: string | number | null;
}

export interface TranscriptStatsSummary {
  cgpa: string;
  cgpaGrade: string;
  cumulativeAverage: number;
  totalSubjectsOverall: number;
  scoredSubjectCount: number;
  academicStanding: string;
  totalSessions: number;
  totalTerms: number;
}

export type StudentTranscriptAccessTier =
  | "GRADUATED_ALUMNI"
  | "PAID_SCHOOL_ACTIVE"
  | "FREE_TIER_SCHOOL";

export function getTermLabel(term: string): string {
  const map: Record<string, string> = {
    FIRST: "1st Term",
    SECOND: "2nd Term",
    THIRD: "3rd Term",
  };
  return map[term] || term;
}

export function getGradeLetter(
  total: number | null,
  customGradingSystem?: GradingRule[] | null,
): string {
  if (total == null) return "—";
  return getGradeEvaluation(total, customGradingSystem).grade;
}

export function getGradePoint(
  total: number | null,
  customGradingSystem?: GradingRule[] | null,
): number {
  if (total == null || isNaN(total)) return 0;
  const evaluation = getGradeEvaluation(total, customGradingSystem);
  const grade = evaluation.grade.toUpperCase().trim();

  if (grade === "A+" || grade === "A1") return 5.0;
  if (grade === "A" || grade === "B2" || grade === "A2") return 4.5;
  if (grade === "B+" || grade === "B3") return 4.0;
  if (grade === "B" || grade === "C4" || grade === "B4") return 3.5;
  if (grade === "C+" || grade === "C5") return 3.0;
  if (grade === "C" || grade === "C6") return 2.5;
  if (grade === "D" || grade === "D7") return 1.5;
  if (grade === "E" || grade === "E8") return 1.0;
  if (grade === "F") return 0.5;
  if (grade === "F9") return 0.0;

  // Fallback if custom grade string didn't match standard letters
  const tiers = getEffectiveGradingSystem(customGradingSystem);
  const tierIndex = tiers.findIndex((t) => t.grade.toUpperCase().trim() === grade);
  if (tierIndex !== -1 && tiers.length > 1) {
    const fraction = 1 - tierIndex / (tiers.length - 1);
    return Math.round(fraction * 5.0 * 10) / 10;
  }

  if (total >= 90) return 5.0;
  if (total >= 70) return 4.5;
  if (total >= 65) return 4.0;
  if (total >= 60) return 3.5;
  if (total >= 55) return 3.0;
  if (total >= 50) return 2.5;
  if (total >= 40) return 1.5;
  if (total >= 30) return 0.5;
  return 0.0;
}

export function getRemark(
  total: number | null,
  customGradingSystem?: GradingRule[] | null,
): string {
  if (total == null) return "Pending";
  return getGradeEvaluation(total, customGradingSystem).remark;
}

export function getGradeBadgeClass(grade: string): string {
  const styling = getGradeColorAndBg(grade);
  return `${styling.color} ${styling.bg}`;
}

export function getCgpaGrade(
  cgpaNum: number,
  averageScore: number,
  customGradingSystem?: GradingRule[] | null,
): string {
  if (customGradingSystem && customGradingSystem.length > 0) {
    return getGradeEvaluation(averageScore, customGradingSystem).grade;
  }
  if (averageScore >= 85 || cgpaNum >= 4.5) return "A";
  if (averageScore >= 75 || cgpaNum >= 3.75) return "A-";
  if (averageScore >= 70 || cgpaNum >= 3.5) return "B+";
  if (averageScore >= 65 || cgpaNum >= 3.0) return "B";
  if (averageScore >= 60 || cgpaNum >= 2.5) return "B-";
  if (averageScore >= 55 || cgpaNum >= 2.0) return "C+";
  if (averageScore >= 50 || cgpaNum >= 1.5) return "C";
  if (averageScore >= 45 || cgpaNum >= 1.0) return "D";
  return "F";
}

export const AFFECTIVE_TRAITS = [
  {
    key: "attentiveness",
    label: "Attentiveness & Focus",
    desc: "Sustained attention in academic activities",
  },
  {
    key: "honesty",
    label: "Honesty & Integrity",
    desc: "Truthfulness in conduct and assignments",
  },
  {
    key: "neatness",
    label: "Neatness & Presentation",
    desc: "Personal grooming, books and workspace",
  },
  {
    key: "politeness",
    label: "Politeness & Courtesy",
    desc: "Respectful demeanor towards peers and staff",
  },
  {
    key: "punctuality",
    label: "Punctuality & Regularity",
    desc: "Timely arrival for classes and assemblies",
  },
  {
    key: "selfControl",
    label: "Self-Control & Temperament",
    desc: "Calmness and composure in social situations",
  },
  {
    key: "obedience",
    label: "Obedience & Compliance",
    desc: "Adherence to institutional rules and directives",
  },
  {
    key: "reliability",
    label: "Reliability & Dependability",
    desc: "Trustworthiness in carrying out assigned duties",
  },
  {
    key: "responsibility",
    label: "Sense of Responsibility",
    desc: "Accountability for personal actions and assets",
  },
  {
    key: "relationship",
    label: "Peer & Staff Relations",
    desc: "Harmonious interaction with school community",
  },
] as const;

export const PSYCHOMOTOR_SKILLS = [
  {
    key: "handwriting",
    label: "Handwriting & Scripting",
    desc: "Legibility, neatness and style of handwriting",
  },
  {
    key: "handlingTools",
    label: "Handling Tools & Apparatus",
    desc: "Safe handling of laboratory and workshop equipment",
  },
  {
    key: "drawingPainting",
    label: "Drawing, Painting & Crafts",
    desc: "Creativity, artistic representation and design",
  },
  {
    key: "publicSpeaking",
    label: "Public Speaking & Oratory",
    desc: "Confidence, tone and poise in presentations",
  },
  {
    key: "speechFluency",
    label: "Speech Fluency & Diction",
    desc: "Clarity, articulation and vocabulary in communication",
  },
  {
    key: "sportsGames",
    label: "Sports, Games & Athletics",
    desc: "Physical dexterity, team play and sportsmanship",
  },
] as const;

