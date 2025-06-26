// app/forum/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import Link from "next/link";

export default async function ForumPage() {

  const session = await getServerSession({
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET, // ensure secret is always provided
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">
          You must be signed in to post a new thread.{" "}
          <Link href="/login" className="underline text-blue-400 ml-1">
            Sign In
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Start a New Thread</h1>
      <form className="space-y-4 max-w-xl">
        <input
          type="text"
          placeholder="Thread Title"
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          required
        />
        <textarea
          placeholder="Write your post..."
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white h-40"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
        >
          Post Thread
        </button>
      </form>
    </div>
  );
}
