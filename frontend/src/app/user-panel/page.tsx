'use client';

import UsersList from '@/components/reuseables/UsersList';
import { useUserStore } from '../../store/useUserStore';
import { useState, useEffect } from 'react';

export default function UserPanel() {
  const { username, setUsername, clearUsername } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (username) setInputValue(username);
  }, [username]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">User Panel</h1>

      <input
        type="text"
        placeholder="Enter username"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="border p-2 rounded mb-4 w-64"
      />

      <div className="flex gap-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => setUsername(inputValue)}
        >
          Save
        </button>

        {username && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={clearUsername}
          >
            Clear
          </button>
        )}
      </div>

      {username && (
        <p className="mt-6">
          Current saved username: <strong>{username}</strong>
        </p>
      )}
      <UsersList/>
    </div>
  );
}
