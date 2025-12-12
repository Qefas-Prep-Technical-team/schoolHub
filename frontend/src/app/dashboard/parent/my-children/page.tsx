import Header from './components//Header'
import ChildDetailsDrawer from './components/ChildDetailsDrawer/ChildDetailsDrawer'
import { useChildDetailsDrawer } from './components/ChildDetailsDrawer/components/useChildDetailsDrawer'
import ChildrenGrid from './components/ChildrenGrid'
import PageHeading from './components/PageHeading'


export default function ChildrenPage() {

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-200">      
      <main className="flex-1 w-full px-4 md:px-10 py-8">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
          <PageHeading />
          <ChildrenGrid />
        </div>
          {/* Child Details Drawer */}
    
      </main>
    </div>
  )
}