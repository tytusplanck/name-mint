'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { user, credits, isLoading, isInitialized } = useAuthStore();

  // Hide header on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <header className="w-full border-b bg-white">
        <div className="mx-auto max-w-6xl p-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#333333]">
            Nametica
          </Link>
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </header>
    );
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

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <div className="flex items-center space-x-4">
                {isLoading ? (
                  <>
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                    <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-600 min-w-[80px]">
                      {credits} credits
                    </span>
                    <Button
                      className="bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white hover:opacity-90 transition-opacity font-semibold px-6"
                      onClick={() => router.push('/credits')}
                    >
                      Buy Credits
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-6 text-sm">
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
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
