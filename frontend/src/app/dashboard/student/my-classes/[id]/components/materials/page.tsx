'use client';

import { useParams } from 'next/navigation';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import MaterialsLayout from './components/MaterialsLayout';
import LoadingState from './components/LoadingState';

/** Detect file type from a URL string */
function detectFileType(url: string): 'pdf' | 'video' | 'image' | 'document' {
  if (url.match(/\.(mp4|mov|avi|webm|mkv)$/i)) return 'video';
  if (url.match(/\.pdf$/i)) return 'pdf';
  if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return 'image';
  if (url.match(/youtu\.?be/i) || url.match(/vimeo\.com/i)) return 'video';
  return 'document';
}

/**
 * Derive the cleanest possible human-readable name from a URL.
 * Strips common storage prefixes like timestamps (e.g. "1749225348234-") and UUIDs.
 */
function cleanFilename(url: string, fallbackLabel: string): string {
  try {
    const u = new URL(url);
    // For YouTube / external links, use the hostname as label
    if (u.hostname.includes('youtube') || u.hostname.includes('youtu.be')) {
      return `YouTube Video`;
    }
    if (u.hostname.includes('vimeo')) return `Vimeo Video`;

    // Get just the filename from the path
    const raw = decodeURIComponent(u.pathname.split('/').pop() || '');
    if (!raw) return fallbackLabel;

    // Strip common upload prefixes:
    // 1. Long unix timestamp prefix: "1749225348234-"
    // 2. Short base36 timestamp prefix: "lm6v1e-" (new format)
    // 3. UUID prefix: "a3f9b1c2-0000-...-"
    const cleaned = raw
      .replace(/^\d{10,}-/, '')              // unix timestamp prefix
      .replace(/^[a-z0-9]{6,12}-(?=[a-z0-9])/i, '')  // base36 short timestamp prefix
      .replace(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-?/i, '') // UUID prefix
      .replace(/-/g, ' ')                    // hyphens → spaces for readability
      .replace(/_/g, ' ')                    // underscores → spaces
      .trim();

    return cleaned || fallbackLabel;
  } catch {
    // URL parse failed — return fallback
    return fallbackLabel;
  }
}

export default function MaterialsPage() {
  const { id } = useParams() as { id: string };

  const { data: classData, isLoading: classLoading, isError: classError } = useSingleClass(id);
  const { data: profileData, isLoading: profileLoading } = useStudentProfile();
  const { data: assignmentsData, isLoading: assignmentsLoading } = useStudentAssignments({ limit: 200 });

  if (classLoading || profileLoading || assignmentsLoading) {
    return <LoadingState />;
  }

  if (classError || !classData) {
    notFound();
    return null;
  }

  const teacherName = classData.teachers?.[0]?.teacher?.name || 'Class Teacher';

  // Filter only assignments for this class
  const allAssignments: any[] = assignmentsData?.assignments || [];
  const classAssignments = allAssignments.filter((a) => a.classId === id);

  // Explode each assignment into individual material cards — one per resource URL.
  // Each card carries ONLY its own URL so the preview popup shows only that file.
  const materialCards: any[] = [];

  classAssignments.forEach((a: any) => {
    const uploadDate = a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : 'Unknown date';
    const sharedBase = {
      folder: 'Assignments',
      teacher: teacherName,
      uploadDate,
      description: a.instructions || 'No additional instructions provided.',
      assignmentTitle: a.title, // subtitle shown in popup header
    };

    // ── Attachment (PDF / image / document) ─────────────────────────────────
    if (a.attachmentUrl) {
      materialCards.push({
        ...sharedBase,
        id: `assignment-${a.id}-attachment`,
        title: cleanFilename(a.attachmentUrl, a.title),
        type: detectFileType(a.attachmentUrl),
        // Only this card's URL is set; others are null so the popup only shows this file
        attachmentUrl: a.attachmentUrl,
        videoUrl: null,
        referenceUrl: null,
      });
    }

    // ── Video / YouTube link ─────────────────────────────────────────────────
    if (a.videoUrl) {
      materialCards.push({
        ...sharedBase,
        id: `assignment-${a.id}-video`,
        title: cleanFilename(a.videoUrl, `${a.title} — Video`),
        type: 'video' as const,
        // Only video URL set
        attachmentUrl: null,
        videoUrl: a.videoUrl,
        referenceUrl: null,
      });
    }

    // ── External reference link ──────────────────────────────────────────────
    if (a.referenceUrl) {
      materialCards.push({
        ...sharedBase,
        id: `assignment-${a.id}-reference`,
        title: cleanFilename(a.referenceUrl, `${a.title} — Reference`),
        type: 'document' as const,
        // Only reference URL set
        attachmentUrl: null,
        videoUrl: null,
        referenceUrl: a.referenceUrl,
      });
    }
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-4">
      <MaterialsLayout
        materials={materialCards}
        className={classData.name}
        description={`Assignment materials and resources for ${classData.name}.`}
      />
    </div>
  );
}