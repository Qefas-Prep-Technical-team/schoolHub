import RoleCard from "./RoleCard";

export default function RoleGrid() {
  const roles = [
    {
      href: "/login/school-admin",
      icon: "shield_person",
      color: "orange",
      title: "school",
      description: "Login for management",
    },
    {
      href: "/login/teacher",
      icon: "school",
      color: "green",
      title: "Teacher",
      description: "Login for teachers",
    },
    {
      href: "/login/student",
      icon: "person",
      color: "blue",
      title: "Student",
      description: "Login for students",
    },
    {
      href: "/login/parent",
      icon: "family_restroom",
      color: "red",
      title: "Parent",
      description: "Login for parents",
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {roles.map((role) => (
        <RoleCard key={role.href} {...role} />
      ))}
    </div>
  );
}
