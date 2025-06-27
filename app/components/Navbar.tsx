"use client";

import Link from "next/link";
import Image from "next/image";
import { LOGO_URL } from "@/lib/assets";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  const linkClasses = (path: string) =>
    pathname === path
      ? "text-neon font-semibold"
      : "hover:text-primary transition-colors";

  return (
    <header className="bg-spacex text-white sticky top-0 z-50 border-b border-white/10">
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
        <button
          aria-label="Menu"
          onClick={() => setOpen(!open)}
          className="sm:hidden ml-2"
        >
          <Menu />
        </button>
        <ul className="hidden sm:flex items-center space-x-8 font-sans text-base font-medium">
          <li>
            <Link href="/" className={linkClasses("/")}>
              Launchpad
            </Link>
          </li>
          <li>
            <Link href="/forum" className={linkClasses("/forum")}>
              Mission Control
            </Link>
          </li>
          {!user && (
            <>
              <li>
                <Link href="/login" className={linkClasses("/login")}>
                  Crew Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className={linkClasses("/signup")}>
                  Join the Crew
                </Link>
              </li>
            </>
          )}
          {user && (
            <>
              <li>
                <Link
                  href={user.id ? `/profile/${user.id}` : "/profile/me"}
                  className={
                    pathname.startsWith("/profile")
                      ? "text-neon font-semibold"
                      : "hover:text-primary"
                  }
                >
                  Crew Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:text-primary"
                >
                  Sign Out
                </button>
              </li>
            </>
          )}
          {status === "loading" && (
            <li>
              <span className="text-spacex-gray">Loading...</span>
            </li>
          )}
        </ul>
      </nav>
      <motion.ul
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : -10 }}
        transition={{ duration: 0.2 }}
        className={`${open ? "block" : "hidden"} sm:hidden bg-spacex p-4 space-y-2 font-sans text-base font-medium border-t border-white/10`}
      >
        <li>
          <Link href="/" className={linkClasses("/")}>
            Launchpad
          </Link>
        </li>
        <li>
          <Link href="/forum" className={linkClasses("/forum")}>
            Mission Control
          </Link>
        </li>
        {!user && (
          <>
            <li>
              <Link href="/login" className={linkClasses("/login")}>
                Crew Login
              </Link>
            </li>
            <li>
              <Link href="/signup" className={linkClasses("/signup")}>
                Join the Crew
              </Link>
            </li>
          </>
        )}
        {user && (
          <>
            <li>
              <Link
                href={user.id ? `/profile/${user.id}` : "/profile/me"}
                className={
                  pathname.startsWith("/profile")
                    ? "text-neon font-semibold"
                    : "hover:text-primary"
                }
              >
                Crew Profile
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:text-primary"
              >
                Sign Out
              </button>
            </li>
          </>
        )}
        {status === "loading" && (
          <li>
            <span className="text-spacex-gray">Loading...</span>
          </li>
        )}
      </motion.ul>
    </header>
  );
}
