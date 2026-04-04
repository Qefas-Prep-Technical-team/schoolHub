export type Student = {
  id: string;
  name: string;
  profileImage?: string;
  className: string;
  gender: "Male" | "Female";
  status: "Active" | "Inactive";
};
