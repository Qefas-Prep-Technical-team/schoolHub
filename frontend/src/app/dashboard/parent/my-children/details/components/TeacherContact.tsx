import Image from 'next/image'
import { Card } from './ui/Card'
import { Users, MessageCircle } from 'lucide-react'
import { Button } from './ui/Button'

interface Teacher {
  id: string
  name: string
  subject: string
  role?: string
  imageUrl: string
  alt: string
}

const teachers: Teacher[] = [
  {
    id: '1',
    name: 'Mrs. Roberts',
    subject: 'Science',
    role: 'Class Teacher',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtIGQpZGTJ1G-PI_LxUWwnZa8-QltH_Z3joz_xrdHTxTHMUxSoTO-osyyc0_QbJMpeP0PrMuqQx9ALDH0e_zJhnxo1wBp7g0zBdr6JdEV_XWCFCqKz45MGVtlpRDaXOmTWZXTDadfnQrJe8HtOP-jNMNdl_Bh3ySAd0FQmOu1-X_8mRUgg_X62r67GZq2JRmp9X8SirFIkLEVJFwbEVgZjyWqWxPcYgeLjuI5m4pWSaT7YqWOQ6gXF1vcX3Z4pn4bh_aYL2MG3Wx4',
    alt: 'Profile picture of Mrs. Roberts, Science teacher',
  },
  {
    id: '2',
    name: 'Mr. Anderson',
    subject: 'Mathematics',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeFuBLwaZ4qIsHKhNz_A517wIMCW1OjfI7h81znfEp7mPLD67pKn_AJaPa1s_9WntnufmLNwRoTSHILXgfgwDAVEBDXslju19QYCGTGpz68My8MJFzFHPjhLOwWWewFA4WL125jWe7llelYbInpF7TqorhHz5C2wJnVH73e46klqwB9mu7E0HZPJOIGJq2KbkmFribJhB14Dxy4zrlY2Jby99-yiqu-CHre5e8rc2sibZdWTqTJiIt4pqxqf1_RQ4TzzSIga66pPQ',
    alt: 'Profile picture of Mr. Anderson, Math teacher',
  },
  {
    id: '3',
    name: 'Ms. Lee',
    subject: 'English Literature',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdhogKYKIGf7OnLWiRwcks0K8pbbblIVcNK_7PDIJwPdTc2Snz4oAm6td6NbupD0yuigQL_i4-w2A_U5QdgKsrRbMlI-6hVBIDl2eJ_ytQyTXgsk1vcA4JgylIVJKE0Czc7dG-O1kR97a85YGpPj1F5Mpb_7W5UN1xgoOdtzwoie3J9BSxUYxyxiBQRURo2hBQIdbgFcV3yJKHJy3F905GW8aPziwt98kaRdO0FvURCYRj2mf27rL_I4xUz1XhrWoIPRojBPBrD-Y',
    alt: 'Profile picture of Ms. Lee, English teacher',
  },
]

export default function TeacherContact() {
  return (
    <Card>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Users className="text-primary" />
        Teachers
      </h3>

      <div className="space-y-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex items-center gap-3">
            <div className="relative size-10">
              <Image
                src={teacher.imageUrl}
                alt={teacher.alt}
                fill
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {teacher.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {teacher.subject}
                {teacher.role && ` • ${teacher.role}`}
              </p>
            </div>

            <Button
              variant="ghost"
              className="size-8 !p-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <MessageCircle className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}