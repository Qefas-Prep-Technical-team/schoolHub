export interface SchoolEditData {
  id: string;
  name: string;
  motto: string;
  description: string;
  logo: string;
  bannerImage: string;
  favicon: string;
  schoolEmail: string;
  phone: string;
  website: string;
  address: string;
  foundedYear: number;
  principal: string;
  schoolType: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  operatingHours: string;
  mapLocation: string;
}

export interface PreviewMode {
  id: 'dashboard' | 'portal';
  label: string;
}

export type SchoolDataField = keyof SchoolEditData | `socialLinks.${keyof SchoolEditData['socialLinks']}`;