import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-spacex text-spacex-gray border-t border-white/10 mt-16 font-sans">
      <div className="container mx-auto p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs">&copy; {new Date().getFullYear()} Interstellar Nerd</p>
        <nav className="space-x-6 text-sm">
          <Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/legal/cookie-policy" className="hover:text-primary transition-colors">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
