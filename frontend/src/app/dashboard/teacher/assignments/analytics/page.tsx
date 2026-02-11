import ScoreDistribution from "./components/ScoreDistribution";
import StatsCards from "./components/StatsCards";
import StudentList from "./components/StudentList";
import SubmissionTimeline from "./components/SubmissionTimeline";
import Topbar from "./components/Topbar";


export default function AnalyticsPage() {
  const stats = [
    { title: 'Class Average', value: '82%' },
    { title: 'Submission Rate', value: '25/30' },
    { title: 'Avg. Time to Grade', value: '2 Days' },
  ];

  const topPerformers = [
    { id: '1', name: 'Amelia Johnson', score: 98, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR3kp9oFgZD_fJhhNbcc1bdj_z18LZGpo7tAOZ4h5QUmiWlZAE0Xe1f7fv9gqgoPtu8hHA3h4sI9Mgn5eNsGse5R5s0zebESxTN3k0y6dGGIk85X9gbg-jvXS5XDwKRAWEaiPtOaxFQbfv_0UYig15S8COaaSBPgbqOIvEaMiRPYpadzqrI7o9JqFE-vWHs-6xYVViov1TMJlErz81ZO1wWyRgnzfMYH_20jwoCtzPSUg09UpZoIuGd69u5LGvC8CQeTDqOIQwGRA', status: 'submitted' as const },
    { id: '2', name: 'Benjamin Carter', score: 95, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6_W-0-h2mDV6pZx-Bp4XBo-245CMcWw5ANtQZ5NYXjfYvBUE550Dqa3qOcLrHkOQk2NIL6vhdLVMYU60fVi2F8mh10mJ5YGFNE6oKwwqoPlDQ6LLBOPSIpWH4rDm3SgfrwC12PhPdt3yY50mGsbokcx6fY9HpKM-_1lo5jZvvSPvDyVtJYFTYY0Vh2OLhqXAYXAXicOzelYmGion0_3E9h-JO5o8yy6IgBK-QqhCH92eohMPPw5KXNTZXBGjyLp9abkW-nGCGms', status: 'submitted' as const },
    { id: '3', name: 'Olivia Chen', score: 94, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT2vNSDN8MUK8r5DFIOI1H7mXH10PFcoXXi4gnh7v67k98N3hbhJrRgtuw-9ETPnxccouQeyJx93ofXUU3Q_G2s-7P-eRqtlzhJmsH3280bbiJ9GeCGHknlyJ1DCsHa5Fca92-LJk57JDxN0tUqP_yCPzWEDc1m4wRL-mRu5xonvlfeyALme-Xb9Nq5D_vBJUtVZF9rTNBiLrgevoCKWgN3_hc_ct039iyCkcvUVLYZCfPqhh2FqA3rUqbIn02m95Gf0eXl428IEw', status: 'submitted' as const },
  ];

  const pendingStudents = [
    { id: '4', name: 'David Rodriguez', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChG2n05hy7rip-fCM9rFjFT2oDI1iJfG8nUdXW5ymqYT6cnp5OQUu2FYtneVLedGBeCLqfs6zfT5d8Ce-bfZwlDi7viF3g_cXbxlUD-fosBltka8VLO7N3rgPu8e8DKRNNZws2BnAaHaUQN73tqz9HTfZmHry0Iu8Jesp7MDnCj59xx4DyPgi3gEKW6Y69RltSoBq_2tmksfXZBLtB8h2ryRdj9G5oZpDDQXih4A89Uol3fa9CLI8aiogvApeojSakmJcpC6W6n1w', status: 'pending' as const },
    { id: '5', name: 'Sophia Nguyen', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtZVmLVG5JskYme2opPhHdZDIbYCThxIvUR4FxyPutCdHJGupnKq-8dDH5oXBLjiJqCzof8Y-ohTCldDIASrwZbaczQ3L9unT-eltAfodxyAAnbcW6D8DH9j3SEdWJIhPBi1hlkHnEJRhEkpoGrZj13H-0BLuOQg6l5XYNnx5eikDNWVDDpeBe3DpHhIOBVK8ViQTS1IipXRLU9SBS1AxVq_RghUScEmYFoVIvClbYCDNP5eKB1SedddwSJQUssKDWrqdHKqn7SdU', status: 'pending' as const },
    { id: '6', name: 'Michael Williams', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDzftTSxjj1s_FllF76FoWLj2eJHl-TJ8yvjRzkVA-SJ20MD4p55fltdk1d5x60FUyGcwkzWpmi-jx08fNCV-0EBOYVAUMwZcHt0xn8saJkZomG-eC04XQKcBgynWL0SUFRnE57xI9LtoWT1dUsxNnj4Tzoqaj_qKu2kIyqIBM4mzvnT9ioRpKqZGpRrkEtbY49KNrky_1_HY-C0pDUryRnvp97Tj_Icuf1bmgx6qFoaKOZRTAyPYBFEPJGx32U18t8jdSkABQF5M', status: 'pending' as const },
  ];

  const distributionData = [
    { range: '0-59', percentage: 10, count: 2 },
    { range: '60-69', percentage: 40, count: 8 },
    { range: '70-79', percentage: 90, count: 18 },
    { range: '80-89', percentage: 75, count: 15 },
    { range: '90-100', percentage: 25, count: 5 },
  ];

  return (
    <div className="flex min-h-screen w-full">
   
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 lg:p-10">
          <Topbar />
          <StatsCards stats={stats} />
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 mb-8">
            <SubmissionTimeline />
            <ScoreDistribution data={distributionData} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StudentList 
              title="Top Performers" 
              students={topPerformers} 
              showScore 
            />
            <StudentList 
              title="Students Who Didn't Submit" 
              students={pendingStudents} 
              showReminderButton 
            />
          </div>
        </div>
      </main>
    </div>
  );
}