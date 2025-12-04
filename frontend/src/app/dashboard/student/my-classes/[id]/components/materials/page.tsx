// app/student/classes/[id]/materials/page.tsx
import { notFound } from 'next/navigation'
import MaterialsLayout from './components/MaterialsLayout'
import { materialsData } from './components/materialsData'

interface MaterialsPageProps {
  params: Promise<{ id: string }>
}

export default  function MaterialsPage() {
  // const { id } = await params
  const id = "1"
  const classMaterials = materialsData.find(c => c.id === parseInt(id))
  
  if (!classMaterials) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        <MaterialsLayout classMaterials={classMaterials} />
      </div>
    </div>
  )
}