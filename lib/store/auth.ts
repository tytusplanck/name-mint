import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, RealtimeChannel } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  credits: number;
  isLoading: boolean;
  isInitialized: boolean;
  creditsSubscription: RealtimeChannel | null;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setCredits: (credits: number) => void;
  subscribeToCredits: (userId: string) => Promise<void>;
  unsubscribeFromCredits: () => void;
}

const supabase = createClientComponentClient();

type AuthStore = ReturnType<typeof create<AuthState>>['getState' | 'setState'];

export const useAuthStore = create<AuthState>(
  (set, get): AuthState => ({
    user: null,
    credits: 0,
    isLoading: true,
    isInitialized: false,
    creditsSubscription: null,

    initialize: async () => {
      if (get().isInitialized) return;

      try {
        // Get initial auth state
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;

        // Get initial credits if user exists
        let credits = 0;
        if (user) {
          const { data: creditsData } = await supabase
            .from('credits')
            .select('credits_remaining')
            .eq('user_id', user.id)
            .single();
          credits = creditsData?.credits_remaining ?? 0;
        }

        set({
          user,
          credits,
          isLoading: false,
          isInitialized: true,
        });

        // Setup credits subscription if user exists
        if (user) {
          await get().subscribeToCredits(user.id);
        }

        // Setup auth state change listener
        supabase.auth.onAuthStateChange(async (_, session) => {
          const currentUser = session?.user ?? null;
          set({ user: currentUser });

          if (currentUser) {
            const { data: creditsData } = await supabase
              .from('credits')
              .select('credits_remaining')
              .eq('user_id', currentUser.id)
              .single();
            set({ credits: creditsData?.credits_remaining ?? 0 });
            await get().subscribeToCredits(currentUser.id);
          } else {
            set({ credits: 0 });
            get().unsubscribeFromCredits();
          }
        });
      } catch (error) {
        console.error('Error initializing auth store:', error);
        set({ isLoading: false, isInitialized: true });
      }
    },

    setUser: (user: User | null) => set({ user }),

    setCredits: (credits: number) => set({ credits }),

    subscribeToCredits: async (userId: string) => {
      get().unsubscribeFromCredits();

      const subscription = supabase
        .channel(`credits_changes_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'credits',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newCredits = payload.new as {
              credits_remaining: number;
            } | null;
            if (newCredits?.credits_remaining !== undefined) {
              set({ credits: newCredits.credits_remaining });
            }
          }
        )
        .subscribe();

      set({ creditsSubscription: subscription });
    },

    unsubscribeFromCredits: () => {
      const { creditsSubscription } = get();
      if (creditsSubscription) {
        creditsSubscription.unsubscribe();
        set({ creditsSubscription: null });
      }
    },
  })
);
