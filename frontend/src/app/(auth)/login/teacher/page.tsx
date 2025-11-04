import Header from "./components/Header";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
export default function TeacherLoginPage() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col group/design-root"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <Header />
      <main className="flex min-h-screen w-full flex-col items-center justify-center lg:flex-row">
        <LeftPanel />
        <RightPanel />
      </main>
    </div>
  );
}
