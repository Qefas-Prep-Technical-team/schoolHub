// src/types/index.ts
export interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface StatCardData {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  trend?: {
    value: string;
    color: string;
    isPositive: boolean;
  };
  description?: string;
}

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface ChartDataPoint {
  week: string;
  present: number;
  late?: number;
  absent?: number;
}

export interface ChartLegendItem {
  label: string;
  color: string;
}
