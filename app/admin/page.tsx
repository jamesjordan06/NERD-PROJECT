"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Settings,
  Moon,
  Sun,
  Search,
  Filter,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published: boolean;
  published_at: string | null;
  publish_at: string | null;
  created_at: string;
  views: number;
  likes: number;
  tags: string[];
  image_urls: string[];
}

interface AdminStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalViews: number;
  totalLikes: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(`/login?callbackUrl=${pathname}`);
      return;
    }

    const verifyAndFetch = async () => {
      const isAdmin = await checkAdminStatus();
      if (isAdmin) {
        fetchPosts();
        fetchStats();
      }
    };

    verifyAndFetch();
  }, [session, status, router]);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      setDarkMode(stored === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/check-admin");
      if (response.status === 200) {
        return true;
      }
      router.push("/unauthorized");
      return false;
    } catch (error) {
      console.error("Admin check failed:", error);
      router.push("/unauthorized");
      return false;
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts");
      if (!response.ok) return;
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) return;
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || post.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && post.published) ||
      (filterStatus === "draft" && !post.published && !post.publish_at) ||
      (filterStatus === "scheduled" && post.publish_at);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    "all",
    ...Array.from(new Set(posts.map((post) => post.category))),
  ];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Interstellar Nerd Admin
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => router.push("/admin/generate")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Content
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        {stats && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Posts
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.totalPosts}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Published
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.publishedPosts}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Drafts
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.draftPosts}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Settings className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Views
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.totalViews.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPosts.map((post) => (
                <li key={post.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                            {post.category}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.published
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : post.publish_at
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {post.published
                              ? "Published"
                              : post.publish_at
                                ? "Scheduled"
                                : "Draft"}
                          </span>
                        </div>
                        <div className="mt-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {post.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          <span>{post.views} views</span>
                          <span>{post.likes} likes</span>
                          <div className="flex space-x-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/posts/${post.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/admin/posts/${post.id}/edit`)
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No posts found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by generating some content.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push("/admin/generate")}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Content
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  async function handleDeletePost(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId));
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  }
}
