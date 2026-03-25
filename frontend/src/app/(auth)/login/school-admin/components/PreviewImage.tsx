export default function PreviewImage() {
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/80 via-transparent to-transparent z-10 pointer-events-none" />
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLhM2B-YEAg-fyl3s_xQz4PMhrg8TjoqVgZKQO7OpTDLTRl97qTtKCGtlfgofTg23athNCoUEW9qmpw5Zy656dUXV-z9deP1zPHzRt_w_gZXucxHQWYuUjdrSDXJEesI1dVADbyekbzLe7ItRNRpKKruPygN7QgUYjltg54xM9EWS8d0wRCspPc-FgO1_MhIBXDzv9Cz-ktgYyG2Kb3HZGaZKgB6JxsrRVg16bLs-YHJhVlsNlmygvmYH_b6hNamwEqSvN1raTPOg")',
        }}
        data-alt="Abstract dashboard illustration"
      />
      <div className="absolute bottom-8 left-6 right-6 z-20 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl">
        <h3 className="text-white font-bold text-lg leading-tight mb-1">Empowering Leadership</h3>
        <p className="text-white/90 text-sm font-light">
          "Manage your entire institution seamlessly from one unified futuristic dashboard."
        </p>
      </div>
    </div>
  );
}
