import { Schema, model, Types } from "mongoose";

export interface ISchool {
  name: string;                 // School name
  subdomain?: string;           // Optional custom subdomain
  schoolEmail?: string;           // Optional custom subdomain
  tenantId: string;             // Unique tenant ID
  admins: Types.ObjectId[];     // Array of admin user IDs
  createdAt?: Date;
  updatedAt?: Date;
//   logoUrl?: string;
//   themeColor?: string;
//   isActive?: boolean;
}

const SchoolSchema = new Schema<ISchool>({
  name: { type: String, required: true },
  subdomain: { type: String, unique: true, sparse: true },
  schoolEmail: { type: String, unique: true, sparse: true },
  tenantId: { type: String, required: true, unique: true },
  admins: [{ type: Schema.Types.ObjectId, ref: "User" }], // Multiple admins
//   logoUrl: { type: String },
// themeColor: { type: String },
// isActive: { type: Boolean, default: true }, 
}, { timestamps: true });

export const SchoolModel = model<ISchool>("School", SchoolSchema);
