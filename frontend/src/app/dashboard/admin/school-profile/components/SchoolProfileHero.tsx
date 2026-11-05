'use client';

import React from 'react';
import Image from 'next/image';
import {
  Building2,
  MapPin,
  Edit3,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchoolStats } from '@/lib/api/services/schoolService';

export interface SchoolProfileAdminRecord {
  id?: string;
  role?: string;
  active?: boolean;
  admin?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    profileImage?: string;
    bannerImage?: string;
    verified?: boolean;
  };
}

export interface SchoolProfileGradeBoundary {
  grade: string;
  min: number;
  max: number;
}

export interface SchoolProfileData {
  id: string;
  name?: string;
  motto?: string;
  description?: string;
  logo?: string;
  bannerImage?: string;
  favicon?: string;
  schoolCode?: string;
  subdomain?: string;
  schoolEmail?: string;
  phone?: string;
  website?: string;
  address?: string;
  mapLocation?: string;
  operatingHours?: string;
  principal?: string;
  foundedYear?: number | string;
  schoolType?: string;
  socialLinks?: string | Record<string, string>;
  levels?: string[];
  gradingSystem?: SchoolProfileGradeBoundary[];
  admins?: SchoolProfileAdminRecord[];
  subscriptionPlan?: {
    features?: string[];
  };
}

interface SchoolProfileHeroProps {
  school?: SchoolProfileData | null;
  stats?: SchoolStats | null;
  primaryColor: string;
  canEditProfile: boolean;
  isEditingProfile: boolean;
  onEditProfile: () => void;
}

export default function SchoolProfileHero({
  school,
  stats,
  primaryColor,
  canEditProfile,
  isEditingProfile,
  onEditProfile,
}: SchoolProfileHeroProps) {
  return (
    <section className="relative p-4 md:p-6 lg:p-8 pb-0">
      <div className="w-[95%] max-w-[1600px] mx-auto">
        <div className="h-44 sm:h-56 md:h-72 w-full relative overflow-hidden rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 bg-slate-900">
          {school?.bannerImage ? (
            <Image
              src={school.bannerImage}
              alt={school.name ? `${school.name} Banner` : 'School Banner'}
              fill
              sizes="(max-width: 768px) 100vw, 1600px"
              className="object-cover object-center"
              priority
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-slate-900 relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `linear-gradient(45deg, ${primaryColor}, transparent)`,
                }}
              />
            </div>
          )}
          {canEditProfile && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex gap-2">
              <Button
                onClick={onEditProfile}
                disabled={isEditingProfile}
                variant="secondary"
                className="bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md rounded-xl h-9 sm:h-10 px-3 sm:px-4 font-semibold text-xs tracking-wide shadow-sm"
              >
                {isEditingProfile ? (
                  <Loader2 size={14} className="mr-1.5 sm:mr-2 animate-spin" />
                ) : (
                  <Edit3 size={14} className="mr-1.5 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Edit Cover</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 relative">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 -mt-12 md:-mt-16 relative z-20">
            {/* Logo Container */}
            <div className="size-28 md:size-36 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
              {school?.logo ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src={school.logo}
                    alt={school.name || 'School Logo'}
                    fill
                    sizes="144px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <Building2 size={40} className="text-slate-300" />
              )}
            </div>

            {/* Profile Header Info */}
            <div className="flex-1 pt-2 md:pt-20 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {school?.name}
                  </h1>
                  <p className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-400">
                    {school?.motto || 'Empowering minds for a better tomorrow.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium mt-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} style={{ color: primaryColor }} />
                      {school?.mapLocation ? (
                        <a
                          href={school.mapLocation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline transition-all"
                        >
                          {school?.address ? school.address : 'View on Map'}
                        </a>
                      ) : school?.address ? (
                        school.address
                      ) : (
                        'Location Pending'
                      )}
                    </span>

                    {(school?.schoolEmail || school?.phone) && (
                      <>
                        <span className="hidden md:block h-1 w-1 rounded-full bg-slate-300" />
                        <a
                          href={
                            school?.schoolEmail
                              ? `mailto:${school.schoolEmail}`
                              : `tel:${school?.phone}`
                          }
                          className="flex items-center gap-1.5 hover:underline cursor-pointer transition-all"
                          style={{ color: primaryColor }}
                        >
                          <LinkIcon size={14} />
                          {school?.schoolEmail || school?.phone}
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {canEditProfile && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-0">
                    <Button
                      onClick={onEditProfile}
                      disabled={isEditingProfile}
                      className="h-10 w-full sm:w-auto px-6 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {isEditingProfile && (
                        <Loader2 size={14} className="mr-2 animate-spin" />
                      )}
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <p className="text-sm font-medium text-slate-500">
                  <span className="text-slate-800 dark:text-white font-bold">
                    {stats?.students || 0}
                  </span>{' '}
                  Students
                </p>
                <p className="text-sm font-medium text-slate-500">
                  <span className="text-slate-800 dark:text-white font-bold">
                    {stats?.teachers || 0}
                  </span>{' '}
                  Teachers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

