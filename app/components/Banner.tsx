import Link from "next/link";

export default function Banner() {
  return (
    <header className="bg-[#0B0D17] text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4">
        <Link href="/" aria-label="Interstellar Nerd home" className="shrink-0">
          <img src="/logo.svg" alt="Interstellar Nerd logo" width="160" height="48" loading="eager" />
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-col sm:flex-row items-center gap-4">
            <li><Link href="/articles" className="hover:text-[#FF7E1B]">Articles</Link></li>
            <li><Link href="/forum" className="hover:text-[#FF7E1B]">Forum</Link></li>
            <li><Link href="/about" className="hover:text-[#FF7E1B]">About</Link></li>
          </ul>
        </nav>
        <Link href="/auth" className="px-4 py-2 rounded font-semibold text-[#0B0D17] bg-[#FF7E1B] hover:bg-[#ffa94d]">Sign In</Link>
      </div>
    </header>
  );
}
