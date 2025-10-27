import ParentForm from "./components/ParentForm";
import ParentHeader from "./components/ParentHeader";
import ParentImage from "./components/ParentImage";

export default function ParentRegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* <ParentHeader /> */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
            <ParentForm />
            <ParentImage />
          </div>
        </div>
      </main>
    </div>
  );
}
