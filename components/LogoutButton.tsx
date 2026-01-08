/**
 * Componente Logout Button
 * Client component per gestire il logout
 */

'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
    >
      Logout
    </button>
  );
}

