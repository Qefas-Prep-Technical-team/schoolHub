export interface ParentT {
    id: number;
    name: string;
    avatarUrl: string;
    studentName: string;
    studentGrade: string;
    studentClass: string;
    contactEmail?: string;
    contactPhone?: string;
}

export interface NavigationItem {
    label: string;
    href: string;
    isActive?: boolean;
}