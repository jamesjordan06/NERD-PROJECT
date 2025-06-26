// app/page.tsx
"use client";

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth-options";
import Hero from "../components/Hero";
import Features from "../components/Features";
import PostList from "../components/PostList";
import { fetchPosts } from "../lib/posts";
import CTA from "../components/CTA";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);

  return (
    <div>
      <Hero />
      <Features posts={posts} />
      <CTA />
      
      {/* Debug display */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 p-4 rounded mb-8 text-left">
          <h2 className="text-xl font-bold mb-4 text-white">Debug Info:</h2>
          <p className="text-white"><strong>Status:</strong> {status}</p>
          <p className="text-white"><strong>Session:</strong> {session ? 'Present' : 'Undefined'}</p>
          <p className="text-white"><strong>User:</strong> {session?.user ? 'Present' : 'Undefined'}</p>
          <p className="text-white"><strong>User ID:</strong> {session?.user?.id || 'None'}</p>
          <p className="text-white"><strong>User Email:</strong> {session?.user?.email || 'None'}</p>
          <p className="text-white"><strong>User Name:</strong> {session?.user?.name || 'None'}</p>
        </div>

        {status === "loading" && (
          <p className="text-xl text-white">Loading...</p>
        )}

        {status === "authenticated" && session?.user && (
          <div className="text-xl text-white">
            <p>Welcome back, {session.user.name}!</p>
            <p className="text-lg text-gray-300 mt-2">
              You are logged in with: {session.user.email}
            </p>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="text-xl text-white">
            <p>You are not logged in.</p>
            <p className="text-lg text-gray-300 mt-2">
              Please sign in to access your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
