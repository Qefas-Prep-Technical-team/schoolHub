export interface SchoolEditData {
  id: string;
  name: string;
  motto: string;
  description: string;
  logo: string;
  contact: {
    email: string;
    phone: string;
    website: string;
    address: string;
  };
  academic: {
    currentSession: string;
    currentTerm: string;
    sessions: string[];
    terms: string[];
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoPreview: string;
  };
  metadata: {
    lastUpdated: string;
    updatedBy: string;
  };
}

export interface PreviewMode {
  id: 'dashboard' | 'portal';
  label: string;
}

export interface FormField {
  id: keyof SchoolEditData | `contact.${keyof SchoolEditData['contact']}` | `academic.${keyof SchoolEditData['academic']}`;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select';
  placeholder: string;
  required?: boolean;
  options?: string[];
  rows?: number;
}