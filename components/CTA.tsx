// components/CTA.tsx
import Link from "next/link";


export default function CTA() {
  return (
    <section className="py-16 bg-neon text-black">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-orbitron mb-4">
          Join the Conversation
        </h2>
        <p className="mb-6">
          Sign up to comment on posts, start threads, and connect with fellow nerds.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-midnight text-white font-semibold rounded"
        >
          Create an Account
        </Link>
      </div>
    </section>
  );
}
