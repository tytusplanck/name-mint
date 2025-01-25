'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const { user, credits, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Hide header on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#333333]">
          Nametica
        </Link>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-9 w-[200px] bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {credits} credits
                    </span>
                    <Button
                      className="bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white hover:opacity-90 transition-opacity font-semibold"
                      onClick={() => router.push('/credits')}
                    >
                      Buy Credits
                    </Button>
                  </div>
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
                </>
              ) : (
                <>
                  <Button
                    className="bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white hover:opacity-90 transition-opacity font-semibold"
                    onClick={() => router.push('/auth/signup')}
                  >
                    Get Credits
                  </Button>
                  <Link
                    href="/auth/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
