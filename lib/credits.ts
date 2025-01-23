import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const FREE_CREDITS = 3;
const LOCAL_STORAGE_KEY = 'name_generator_usage';

interface Credits {
  id: string;
  user_id: string;
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

export async function getUserCredits(): Promise<{
  credits: number;
  isAuthenticated: boolean;
}> {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // For unauthenticated users, use localStorage
    if (typeof window === 'undefined')
      return { credits: FREE_CREDITS, isAuthenticated: false };

    // Initialize credits if they don't exist
    const storedUsage = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUsage === null) {
      localStorage.setItem(LOCAL_STORAGE_KEY, '0');
    }

    const usedCredits = parseInt(
      localStorage.getItem(LOCAL_STORAGE_KEY) || '0'
    );
    return {
      credits: Math.max(0, FREE_CREDITS - usedCredits),
      isAuthenticated: false,
    };
  }

  // For authenticated users, use Supabase
  const { data: credits, error } = await supabase
    .from('credits')
    .select<'*', Credits>('*')
    .single();

  if (error) {
    console.error('Error fetching credits:', error);
    return { credits: 0, isAuthenticated: true };
  }

  return {
    credits: credits?.credits_remaining ?? 0,
    isAuthenticated: true,
  };
}

export async function decrementCredits(): Promise<boolean> {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // For unauthenticated users, use localStorage
    if (typeof window === 'undefined') return false;
    const currentUsage = parseInt(
      localStorage.getItem(LOCAL_STORAGE_KEY) || '0'
    );
    if (currentUsage >= FREE_CREDITS) return false;
    localStorage.setItem(LOCAL_STORAGE_KEY, (currentUsage + 1).toString());
    return true;
  }

  // For authenticated users, use Supabase
  const { error } = await supabase.rpc('decrement_credits');

  if (error) {
    console.error('Error decrementing credits:', error);
    return false;
  }

  return true;
}

export async function hasAvailableCredits(): Promise<boolean> {
  const { credits } = await getUserCredits();
  return credits > 0;
}

export function clearLocalCredits(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}
