'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const pathname = usePathname();

  // Hide header on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
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
      </div>
    </header>
  );
}
