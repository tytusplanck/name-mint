'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface Credits {
  credits_remaining: number;
  user_id: string;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      if (user) {
        // Initial credits fetch
        const { data: creditsData } = await supabase
          .from('credits')
          .select('credits_remaining')
          .eq('user_id', user.id)
          .single();

        setCredits(creditsData?.credits_remaining ?? 0);
        setIsLoadingCredits(false);

        // Subscribe to credits changes
        const creditsSubscription = supabase
          .channel('credits_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'credits',
              filter: `user_id=eq.${user.id}`,
            },
            (payload: RealtimePostgresChangesPayload<Credits>) => {
              const newCredits = payload.new as Credits | null;
              if (newCredits?.credits_remaining !== undefined) {
                setCredits(newCredits.credits_remaining);
              }
            }
          )
          .subscribe();

        return () => {
          creditsSubscription.unsubscribe();
        };
      }
      setIsLoadingCredits(false);
    }
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        // Initial credits fetch on auth state change
        const { data: creditsData } = await supabase
          .from('credits')
          .select('credits_remaining')
          .eq('user_id', session.user.id)
          .single();

        setCredits(creditsData?.credits_remaining ?? 0);
        setIsLoadingCredits(false);
      } else {
        setCredits(0);
        setIsLoadingCredits(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
        <Link href="/" className="text-xl font-bold text-[#333333]">
          Nametica
        </Link>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {!isLoadingCredits && (
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
              )}
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
        </div>
      </div>
    </header>
  );
}
