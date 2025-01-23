'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  // Hide header on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/auth/login');
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl p-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold font-montserrat bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-transparent bg-clip-text"
        >
          NameMint
        </Link>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-gray-600 hover:text-gray-900"
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
