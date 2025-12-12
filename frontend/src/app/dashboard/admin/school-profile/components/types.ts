export interface SchoolProfile {
  id: string;
  name: string;
  motto: string;
  logo: string;
  foundedYear: number;
  principal: string;
  schoolType: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  location: {
    latitude: number;
    longitude: number;
    mapImage?: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoVariants: string[];
    brandGuidelinesUrl?: string;
  };
  academicStructure: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    academicLevels: string[];
    activeSession: string;
    grades: string[];
  };
  compliance: {
    ministryOfEducationNumber: string;
    regulatoryBody: string;
    accreditationStatus: 'accredited' | 'pending' | 'provisional';
    accreditationExpiry: string;
    certificates: Array<{
      name: string;
      url: string;
      issuedDate: string;
      expiryDate?: string;
    }>;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastUpdatedBy: string;
  };
}

export interface AccreditationBadgeProps {
  status: SchoolProfile['compliance']['accreditationStatus'];
}