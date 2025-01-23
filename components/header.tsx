'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    }
    checkAuth();
  }, [supabase]);

  // Hide header on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl p-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold font-montserrat bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-transparent bg-clip-text"
        >
          NameMint
        </Link>

        {isLoggedIn && (
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
