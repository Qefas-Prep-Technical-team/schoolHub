import { Metadata } from "next";
import ClassDetails from "./components/ClassDetails";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Class Details | Teacher Dashboard",
  };
}

export default function ClassOverview() {
  return <ClassDetails />;
}