
import { Container } from "@mui/material";
import SchoolCard from "./components/SchoolCard";
import SchoolHeader from "./components/SchoolHeader";


export default function SchoolPage() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* <SchoolSidebar /> */}
      <div className="flex-1 flex flex-col">
        {/* <SchoolNavBar /> */}
        <main className="p-8">
          <SchoolHeader/>
          <Container maxWidth="lg" >
          <SchoolCard />
          </Container>
        </main>
      </div>
    </div>
  );
}
