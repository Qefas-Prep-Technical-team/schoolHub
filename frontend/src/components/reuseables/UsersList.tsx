'use client'

import { useQuery } from '@tanstack/react-query'

async function fetchUsers() {
  const res = await fetch('/api/users')
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export default function UsersList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {(error as Error).message}</p>

  return (
    <ul>
      {data && data.map((user: { id: number; name: string }) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
