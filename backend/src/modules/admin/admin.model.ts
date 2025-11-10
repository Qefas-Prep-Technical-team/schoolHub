import { Schema, model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin {
  name: string;                      // Admin full name
  email: string;                     // Login email
  password: string;                  // Hashed password
  role: "superadmin" | "admin";      // Admin type
  tenantIds: string[];               // Array of tenant IDs (schools this admin belongs to)
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
  tenantIds: [{ type: String, required: true }], // link to multiple schools
}, { timestamps: true });

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
AdminSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const AdminModel = model<IAdmin>("Admin", AdminSchema);
