export interface Pricing {
        name:string;
        price: number;
        basis: string;
        description: string;
        features: string[];
        hasTrial: boolean;
        trialDays: number;
        isPopular: boolean;
    
}

export interface PricingData {
  category: CategoryType;
  tabs: PricingTab[];
}

export type CategoryType = 'individuals' | 'schools' | 'teachers';

export interface PricingTab {
  type: string; // e.g. 'student', 'parent1', 'pro'
  name: string;
  pricing: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  hasTrial: boolean;
  trialDays: number;
  isPopular: boolean;
  storage?: string;
  featureAccess?: FeatureAccess[];
}

export interface FeatureAccess {
  tag: string;
  name: string;
  enabled: boolean;
  limitValue?: number;
  meta?: any;
}
