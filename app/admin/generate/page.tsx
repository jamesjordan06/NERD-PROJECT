"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, Eye, Edit, Save, RotateCcw } from "lucide-react";

const CATEGORIES = [
  "Space News",
  "Astronomy",
  "Astrophysics",
  "Cosmology",
  "Planetary Science",
  "Space Technology",
  "Space Exploration",
  "Exoplanets",
  "Black Holes",
  "Galaxies",
  "Solar System",
  "Space Missions",
];

interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  tags?: string[];
}

export default function GenerateContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [category, setCategory] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [highlightCategory, setHighlightCategory] = useState(false);

  // Consider persisting `category` and `customPrompt` across reloads using
  // localStorage or URL search params.

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(`/login?callbackUrl=${pathname}`);
      return;
    }

    if (status === "authenticated") {
      checkAdminStatus();
    }
  }, [session, status, router]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/check-admin");
      if (!response.ok) {
        router.push("/unauthorized");
      }
    } catch (error) {
      console.error("Admin check failed:", error);
      router.push("/unauthorized");
    }
  };

  const generateContent = async () => {
    if (!category) {
      setHighlightCategory(true);
      setTimeout(() => setHighlightCategory(false), 2000);
      return;
    }

    setGenerationError(null);
    setGenerating(true);
    try {
      const response = await fetch("/api/admin/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          customPrompt: customPrompt || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent({
          ...data.post.generatedContent,
          tags: data.post.generatedContent.tags || [],
        });
      } else {
        const error = await response.json();
        setGenerationError(error.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setGenerationError("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const saveAsDraft = async () => {
    if (!generatedContent) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: generatedContent.title,
          content: generatedContent.content,
          excerpt: generatedContent.excerpt,
          meta_title: generatedContent.meta_title,
          meta_description: generatedContent.meta_description,
          tags: generatedContent.tags || [],
          category,
          published: false,
        }),
      });

      if (response.ok) {
        alert("Content saved as draft!");
        router.push("/admin");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save content");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const regenerateContent = async () => {
    setGeneratedContent(null);
    await generateContent();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Generate Content
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Content Generation Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="category-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3 py-2 border ${highlightCategory ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="prompt-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Custom Prompt (Optional)
                </label>
                <textarea
                  id="prompt-input"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter a custom prompt to override the default generation..."
                />
              </div>

              <button
                onClick={generateContent}
                disabled={generating || !category}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </button>
              {generationError && (
                <div className="mt-4" role="alert">
                  <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md flex items-center justify-between">
                    <span>{generationError}</span>
                    <button
                      onClick={generateContent}
                      className="ml-4 underline text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generated Content Preview */}
          {generatedContent && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Generated Content
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    {showPreview ? "Hide" : "Preview"}
                  </button>
                  <button
                    onClick={regenerateContent}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Regenerate
                  </button>
                </div>
              </div>

              {showPreview ? (
                <article className="prose max-w-none">
                  <h1>{generatedContent.title}</h1>
                  {/* TODO: sanitize HTML content here if the API doesn't already */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: generatedContent.content,
                    }}
                  />
                </article>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Title</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {generatedContent.title}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Excerpt
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {generatedContent.excerpt}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Meta Title
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {generatedContent.meta_title}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Meta Description
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {generatedContent.meta_description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(generatedContent.tags || []).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={saveAsDraft}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push("/admin")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
