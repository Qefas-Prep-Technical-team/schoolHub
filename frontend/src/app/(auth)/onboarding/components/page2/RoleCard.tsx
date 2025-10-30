interface RoleCardProps {
  label: string;
  image: string;
  selected?: boolean;
}

export default function RoleCard({ label, image, selected }: RoleCardProps) {
  return (
    <div className="relative group cursor-pointer">
      <div
        className={`absolute -inset-0.5 bg-primary rounded-xl blur-sm transition duration-1000 ${
          selected ? "opacity-75" : "opacity-0 group-hover:opacity-75 group-hover:duration-200"
        }`}
      ></div>
      <div
        className={`relative bg-cover bg-center flex flex-col gap-3 rounded-xl justify-end p-4 aspect-square ${
          selected
            ? "ring-4 ring-primary"
            : "ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-300"
        }`}
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%), url(${image})`,
        }}
      >
        <p className="text-white text-base font-bold leading-tight">{label}</p>
      </div>
    </div>
  );
}
