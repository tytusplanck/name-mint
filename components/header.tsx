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
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    isLoading: boolean;
    credits: number | null;
    userId: string | null;
  }>({
    isLoggedIn: false,
    isLoading: true,
    credits: null,
    userId: null,
  });

  useEffect(() => {
    let creditsSubscription: ReturnType<typeof supabase.channel> | null = null;
    let isSubscribed = true;
    let initTimeout: NodeJS.Timeout;

    async function setupCreditsSubscription(userId: string) {
      try {
        // Unsubscribe from any existing subscription
        if (creditsSubscription) {
          await creditsSubscription.unsubscribe();
          creditsSubscription = null;
        }

        creditsSubscription = supabase
          .channel(`credits_changes_${userId}`) // Add userId to make channel name unique
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'credits',
              filter: `user_id=eq.${userId}`,
            },
            (payload: RealtimePostgresChangesPayload<Credits>) => {
              const newCredits = payload.new as Credits | null;
              if (newCredits?.credits_remaining !== undefined && isSubscribed) {
                setAuthState((prev) => ({
                  ...prev,
                  credits: newCredits.credits_remaining,
                }));
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up credits subscription:', error);
      }
    }

    async function fetchCredits(userId: string) {
      try {
        const { data: creditsData, error } = await supabase
          .from('credits')
          .select('credits_remaining')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        return creditsData?.credits_remaining ?? 0;
      } catch (error) {
        console.error('Error fetching credits:', error);
        return 0;
      }
    }

    async function initializeAuthState() {
      // Clear any existing timeout
      if (initTimeout) {
        clearTimeout(initTimeout);
      }

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        // Set a timeout to ensure we eventually clear loading state
        initTimeout = setTimeout(() => {
          if (isSubscribed) {
            setAuthState((prev) => ({
              ...prev,
              isLoading: false,
            }));
          }
        }, 5000); // 5 second maximum loading time

        if (user && isSubscribed) {
          const credits = await fetchCredits(user.id);
          setAuthState({
            isLoggedIn: true,
            isLoading: false,
            credits,
            userId: user.id,
          });
          await setupCreditsSubscription(user.id);
        } else if (isSubscribed) {
          setAuthState({
            isLoggedIn: false,
            isLoading: false,
            credits: null,
            userId: null,
          });
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        if (isSubscribed) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }

    // Initial auth check
    initializeAuthState();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isSubscribed) return;

      try {
        // Clear any existing timeout when auth state changes
        if (initTimeout) {
          clearTimeout(initTimeout);
        }

        if (session?.user) {
          setAuthState((prev) => ({ ...prev, isLoading: true }));
          const credits = await fetchCredits(session.user.id);
          if (isSubscribed) {
            setAuthState({
              isLoggedIn: true,
              isLoading: false,
              credits,
              userId: session.user.id,
            });
            await setupCreditsSubscription(session.user.id);
          }
        } else {
          setAuthState({
            isLoggedIn: false,
            isLoading: false,
            credits: null,
            userId: null,
          });
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (isSubscribed) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    });

    return () => {
      isSubscribed = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      subscription.unsubscribe();
      if (creditsSubscription) {
        creditsSubscription.unsubscribe();
      }
    };
  }, [supabase]);

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
          {authState.isLoading ? (
            <div className="h-9 w-[200px] bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              {authState.isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {authState.credits} credits
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
