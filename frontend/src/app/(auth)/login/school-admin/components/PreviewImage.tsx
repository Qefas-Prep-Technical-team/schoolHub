import Image from "next/image";

export default function PreviewImage() {
  return (
    <div className="relative w-full h-full min-h-screen">
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: 'url("/images/3d_admin_blue.png")',
        }}
        data-alt="3D Admin Illustration"
      />
      {/* Optional: Add a subtle overlay if needed to match the design */}
      <div className="absolute inset-0 bg-blue-900/5 dark:bg-black/40 mix-blend-multiply pointer-events-none transition-colors duration-500" />
    </div>
  );
}
