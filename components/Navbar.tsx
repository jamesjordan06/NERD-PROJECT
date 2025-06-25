// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { LOGO_URL } from "../lib/assets";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Debug logging
  console.log('Navbar - Session status:', status);
  console.log('Navbar - Session:', session);
  console.log('Navbar - User:', user);

  // Only show search bar on homepage
  const showSearch = pathname === "/";

  // Handle search submit (client-side navigation to /?q=...)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  // simple helper to highlight the current path
  const linkClasses = (path: string) =>
    pathname === path ? "text-neon font-semibold" : "";

  return (
    <header className="bg-spacex text-white shadow-none border-b border-white/10 sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between p-2 min-h-14">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={LOGO_URL}
            alt="Interstellar Nerd logo"
            width={120}
            height={36}
            priority
          />
          <span className="sr-only">Interstellar Nerd</span>
        </Link>

        {showSearch && (
          <form action="/search" method="GET" className="flex-1 flex justify-center mx-4">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                name="q"
                placeholder="Search Orbital Insights..."
                className="w-full px-3 py-1 pr-10 rounded bg-spacex border border-white/10 text-spacex-gray focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow"
                aria-label="Search Orbital Insights"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-spacex-gray hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Hamburger for mobile */}
        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden ml-2"
        >
          <Menu />
        </button>

        {/* Desktop menu */}
        <ul className="hidden sm:flex items-center space-x-8 font-sans text-base font-medium">
          <li>
            <Link href="/" className={pathname === "/" ? "text-primary" : "hover:text-primary transition-colors"}>
              Launchpad
            </Link>
          </li>
          <li>
            <Link href="/insights" className={pathname.startsWith("/insights") ? "text-primary" : "hover:text-primary transition-colors"}>
              Orbital Insights
            </Link>
          </li>
          <li>
            <Link href="/forum" className={pathname === "/forum" ? "text-primary" : "hover:text-primary transition-colors"}>
              Mission Control
            </Link>
          </li>

          {!user && (
            <>
              <li>
                <Link href="/login" className={pathname === "/login" ? "text-primary" : "hover:text-primary transition-colors"}>
                  Crew Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className={pathname === "/signup" ? "text-primary" : "hover:text-primary transition-colors"}>
                  Join the Crew
                </Link>
              </li>
            </>
          )}

          {user && (
            <>
              <li>
                <Link
                  href={user.id ? `/profile/${user.id}` : '/profile/me'}
                  className={pathname.startsWith('/profile') ? "text-primary" : "hover:text-primary transition-colors"}
                >
                  Crew Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:text-primary transition-colors"
                >
                  Sign Out
                </button>
              </li>
            </>
          )}

          {status === 'loading' && (
            <li>
              <span className="text-spacex-gray">Loading...</span>
            </li>
          )}
        </ul>
      </nav>

      {/* Mobile menu */}
      <motion.ul
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : -10 }}
        transition={{ duration: 0.2 }}
        className={`${open ? "block" : "hidden"} sm:hidden bg-spacex p-4 space-y-2 font-sans text-base font-medium border-t border-white/10`}
      >
        <li>
          <Link href="/" className={pathname === "/" ? "text-primary" : "hover:text-primary transition-colors"}>
            Launchpad
          </Link>
        </li>
        <li>
          <Link href="/insights" className={pathname.startsWith("/insights") ? "text-primary" : "hover:text-primary transition-colors"}>
            Orbital Insights
          </Link>
        </li>
        <li>
          <Link href="/forum" className={pathname === "/forum" ? "text-primary" : "hover:text-primary transition-colors"}>
            Mission Control
          </Link>
        </li>

        {!user && (
          <>
            <li>
              <Link href="/login" className={pathname === "/login" ? "text-primary" : "hover:text-primary transition-colors"}>
                Crew Login
              </Link>
            </li>
            <li>
              <Link href="/signup" className={pathname === "/signup" ? "text-primary" : "hover:text-primary transition-colors"}>
                Join the Crew
              </Link>
            </li>
          </>
        )}

        {user && (
          <>
            <li>
              <Link
                href={user.id ? `/profile/${user.id}` : '/profile/me'}
                className={pathname.startsWith('/profile') ? "text-primary" : "hover:text-primary transition-colors"}
              >
                Crew Profile
              </Link>
            </li>
            <li>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="hover:text-primary transition-colors">
                Sign Out
              </button>
            </li>
          </>
        )}

        {status === 'loading' && (
          <li>
            <span className="text-spacex-gray">Loading...</span>
          </li>
        )}
      </motion.ul>
    </header>
  );
}
