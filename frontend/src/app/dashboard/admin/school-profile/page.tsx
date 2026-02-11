'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SchoolProfileHeader from './components/SchoolProfileHeader';
import InfoCard from './components/InfoCard';
import ColorSwatch from './components/ColorSwatch';
import FileDownloadButton from './components/FileDownloadButton';
import InfoGrid from './components/InfoGrid';
import { SchoolProfile } from './components/types';

// Mock data
const mockSchoolProfile: SchoolProfile = {
  id: 'springfield-elementary',
  name: 'Springfield Elementary',
  motto: 'A Noble Spirit Embiggens the Smallest Man',
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCIAZFKndJGd_s68G9hOO3NzBUbj7hRDljQlyNlHxJIbeFk9UXL6e4aqoSqsGEqLQnUpzVYZmkXEBNyAF-I9nHzPC83HgbiZJoEmB0pdUVVxDSAfGHn_cT1WVJQttf7bDz7lEjAqdaOzWXQTt7zDBVzd-Egj2tL7m7nVKt-2QcBIwr-qx0HfWoJoE20p-BumA_sLE7AJRWATBYLnTK20JVUXQbIVL6Ff_2pI5k71FUY3CSPKIGxFDBLvqFHSD_znurSAs4aidVgNs',
  foundedYear: 1989,
  principal: 'Seymour Skinner',
  schoolType: 'Public K-12',
  contactEmail: 'contact@springfieldelementary.edu',
  contactPhone: '+1-555-123-4567',
  website: 'springfieldelementary.edu',
  address: {
    street: '123 Plympton Street',
    city: 'Springfield',
    state: 'USA',
    country: 'United States',
    postalCode: '12345'
  },
  location: {
    latitude: 39.7817,
    longitude: -89.6501,
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUBo0RvdiMUOz-nazRZxx4xZQSpJ30Qve5Tr9aIoFpNDUpzH4UiyBw5l8aWc2diJkERFCPYzNV5OXPXR_oqj1Lfj-nmRPl2MImmYeVx1_klicqwP6Ba7laEk8kNUL2pHQ-IL388bwPzA9yilXudjwiMioeR_DXdgycBNDXGzFMN7DYDWe9aXm4gclxMMqBpSf74ceo1Qsel0ApmYdn_PmzRyfDqkHapJCTNUB0fDO-oE3m1C5W3lYkL_RURB_U_USj17XI7dMmvko'
  },
  branding: {
    primaryColor: '#3670e2',
    secondaryColor: '#f59e0b',
    logoVariants: [],
    brandGuidelinesUrl: '/brand_guidelines.pdf'
  },
  academicStructure: {
    totalStudents: 852,
    totalTeachers: 45,
    totalClasses: 32,
    academicLevels: ['K-12'],
    activeSession: '2024-2025',
    grades: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  compliance: {
    ministryOfEducationNumber: 'MOE-SPR-1989-12A',
    regulatoryBody: 'State Board of Education',
    accreditationStatus: 'accredited',
    accreditationExpiry: '2026-12-31',
    certificates: [
      {
        name: 'accreditation_certificate_2024.pdf',
        url: '/certificates/accreditation_2024.pdf',
        issuedDate: '2024-01-15',
        expiryDate: '2026-12-31'
      },
      {
        name: 'health_and_safety_compliance.pdf',
        url: '/certificates/health_safety_2024.pdf',
        issuedDate: '2024-03-20',
        expiryDate: '2025-03-20'
      }
    ]
  },
  metadata: {
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    lastUpdatedBy: 'Alicia Keys'
  }
};

export default function SchoolProfilePage() {
  const router = useRouter();
  const [school, setSchool] = useState<SchoolProfile>(mockSchoolProfile);

  const handleEditProfile = () => {
    router.push('/school/profile/edit');
  };

  const handleDownloadFile = (fileName: string) => {
    console.log('Downloading file:', fileName);
    // Implement file download logic
  };

  const generalInfoItems = [
    { label: 'School Name', value: school.name },
    { label: 'Founded Year', value: school.foundedYear.toString() },
    { label: 'Principal/Head', value: school.principal },
    { label: 'School Type', value: school.schoolType },
    { label: 'Contact Email', value: school.contactEmail, isLink: true, href: `mailto:${school.contactEmail}` },
    { label: 'Contact Phone', value: school.contactPhone, isLink: true, href: `tel:${school.contactPhone}` },
    { label: 'Website URL', value: school.website, isLink: true, href: `https://${school.website}` }
  ];

  const complianceItems = [
    { label: 'Ministry of Education No.', value: school.compliance.ministryOfEducationNumber },
    { label: 'Regulatory Approvals', value: school.compliance.regulatoryBody }
  ];

  const academicStructureItems = [
    { label: 'Total Students', value: school.academicStructure.totalStudents.toString(), highlight: true },
    { label: 'Total Teachers', value: school.academicStructure.totalTeachers.toString(), highlight: true },
    { label: 'Total Classes', value: school.academicStructure.totalClasses.toString(), highlight: true },
    { label: 'Academic Levels', value: school.academicStructure.academicLevels.join(', ') },
    { label: 'Active Session', value: school.academicStructure.activeSession }
  ];

  return (
    <div className="relative flex min-h-screen w-full">
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <SchoolProfileHeader 
            school={school} 
            onEdit={handleEditProfile} 
          />
          
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* General Information Card */}
              <InfoCard title="General Information">
                <InfoGrid items={generalInfoItems} />
              </InfoCard>

              {/* Branding & Identity Card */}
              <InfoCard title="Branding & Identity">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">School Colors</p>
                    <div className="flex items-center gap-4">
                      <ColorSwatch 
                        color={school.branding.primaryColor} 
                        label="Primary" 
                      />
                      <ColorSwatch 
                        color={school.branding.secondaryColor} 
                        label="Secondary" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Brand Guidelines</p>
                    {school.branding.brandGuidelinesUrl && (
                      <FileDownloadButton
                        fileName="brand_guidelines.pdf"
                        fileUrl={school.branding.brandGuidelinesUrl}
                        onClick={handleDownloadFile}
                      />
                    )}
                  </div>
                  
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Certificate Signature</p>
                    <div className="w-40 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <div className="text-slate-500 dark:text-slate-400 italic text-sm">
                        Signature Preview
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>

              {/* Compliance & Accreditations Card */}
              <InfoCard title="Compliance & Accreditations">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoGrid items={complianceItems} columns={1} />
                  
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Certificate Uploads</p>
                    <div className="flex flex-col gap-2">
                      {school.compliance.certificates.map((certificate, index) => (
                        <FileDownloadButton
                          key={index}
                          fileName={certificate.name}
                          fileUrl={certificate.url}
                          onClick={handleDownloadFile}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              {/* Academic Structure Card */}
              <InfoCard title="Academic Structure">
                <div className="flex flex-col gap-4">
                  {academicStructureItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {item.label}
                      </p>
                      <p className={`text-sm ${item.highlight ? 'font-bold' : 'font-medium'} text-slate-800 dark:text-slate-200`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </InfoCard>

              {/* Address & Location Card */}
              <InfoCard title="Address & Location">
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                      {school.address.street}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {`${school.address.city}, ${school.address.state}`}
                    </p>
                  </div>
                  
                  <div className="h-48 w-full rounded-lg bg-center bg-cover bg-gray-100 dark:bg-gray-800">
                    {school.location.mapImage ? (
                      <div 
                        className="h-full w-full rounded-lg bg-center bg-cover"
                        style={{ backgroundImage: `url(${school.location.mapImage})` }}
                      />
                    ) : (
                      <div className="h-full w-full rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-slate-500 dark:text-slate-400 mb-2">
                            Map Location
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            Coordinates: {school.location.latitude}, {school.location.longitude}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}