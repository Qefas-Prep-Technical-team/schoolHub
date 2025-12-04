// app/student/classes/[id]/materials/data/materialsData.ts
export interface StudyMaterial {
  id: number
  title: string
  type: 'pdf' | 'video' | 'document' | 'slideshow' | 'audio' | 'image'
  teacher: string
  uploadDate: string
  size?: string
  folder: string
}

export interface ClassMaterials {
  id: number
  className: string
  classCode: string
  description: string
  folders: string[]
  materials: StudyMaterial[]
}

export const materialsData: ClassMaterials[] = [
  {
    id: 1,
    className: 'Quantum Physics',
    classCode: 'PHYS 401',
    description: 'Access all your lecture notes, past questions, and resources here.',
    folders: ['All Materials', 'Lectures', 'Notes', 'Past Questions', 'Resources'],
    materials: [
      {
        id: 1,
        title: 'Intro to Quantum Physics - Lecture 1.pdf',
        type: 'pdf',
        teacher: 'Dr. Evelyn Reed',
        uploadDate: 'Oct 26, 2023',
        size: '2.4 MB',
        folder: 'Lectures'
      },
      {
        id: 2,
        title: 'Lab Safety Demonstration.mp4',
        type: 'video',
        teacher: 'Prof. Alistair Finch',
        uploadDate: 'Oct 24, 2023',
        size: '156 MB',
        folder: 'Lectures'
      },
      {
        id: 3,
        title: 'Wave-Particle Duality Reading.docx',
        type: 'document',
        teacher: 'Dr. Evelyn Reed',
        uploadDate: 'Oct 22, 2023',
        size: '1.8 MB',
        folder: 'Notes'
      },
      {
        id: 4,
        title: 'Lecture 2 - Superposition.pptx',
        type: 'slideshow',
        teacher: 'Dr. Evelyn Reed',
        uploadDate: 'Oct 19, 2023',
        size: '5.2 MB',
        folder: 'Lectures'
      }
    ]
  }
]