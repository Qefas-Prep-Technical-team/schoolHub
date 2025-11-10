export interface ISchool {
  name: string;           // School Name
  subdomain?: string;     // Custom subdomain (optional)
  adminName: string;      // Name of the admin creating the school
  email: string;          // Admin email (login)
  password: string;       // Hashed password
  createdAt?: Date;       // Timestamp
  updatedAt?: Date;       // Timestamp
}
