import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // default styles
import StatsGrid from './StatsGrid';
import ChartsGrid from './ChartsGrid';
import AcademicsTabStandalone from './Academics/components/AcademicsTabStandalone';
import AttendanceTabStandalone from './StudentAttendancePage/page';
import BehaviourTabStandalone from './BehaviourTab/page';
import DocumentsPage from './Documents/page';

const TabsNavigation = () => (
  <Tabs className={"mt-10"}>
    <TabList>
      <Tab>Overview</Tab>
      <Tab>Academics</Tab>
      <Tab>Attendance</Tab>
      <Tab>Behaviour</Tab>
      <Tab>Assignments</Tab>
      <Tab>Exams & Quizzes</Tab>
      <Tab>Documents</Tab>
      <Tab>Parent Contact</Tab>
    </TabList>

    <TabPanel>
       <StatsGrid />
            <ChartsGrid />
    </TabPanel>
    <TabPanel>
      <AcademicsTabStandalone/>
    </TabPanel>
    <TabPanel>
      <AttendanceTabStandalone/>
    </TabPanel>
    <TabPanel>
      <BehaviourTabStandalone/>
    </TabPanel>
    <TabPanel>
      <DocumentsPage/>
    </TabPanel>
    {/* Add remaining panels */}
  </Tabs>
);


export default TabsNavigation;