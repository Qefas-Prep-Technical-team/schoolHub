export default function LeftPanel() {
  return (
    <div className="relative w-full h-full min-h-screen">
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: 'url("/images/messimo_style_3d_student_rose.png")',
        }}
        data-alt="3D Student Illustration"
      />
      <div className="absolute inset-0 bg-rose-900/5 dark:bg-black/40 mix-blend-multiply pointer-events-none transition-colors duration-500" />
    </div>
  );
}
