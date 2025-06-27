import { fetchPosts } from "../../lib/posts";
import PostList from "../../components/PostList";
import { Search } from "lucide-react";
import type { PageProps } from "next";

// Export an empty `generateStaticParams` so Next.js does not treat the
// `searchParams` prop as a Promise. This keeps the `PageProps` helper type
// usable without build errors.
export async function generateStaticParams(): Promise<Record<string, never>[]> {
  return [];
}

export default async function SearchPage({
  searchParams,
}: PageProps<{}, { q?: string }>) {
  const { q: queryParam } = searchParams;
  const query = queryParam || "";
  const allPosts = (await fetchPosts(0, 100)) ?? [];
  
  // Filter posts based on search query
  const filteredPosts = query
    ? allPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query.toLowerCase())) ||
        (post.body && post.body.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-white mb-4">
          Search Results
        </h1>
        
        {/* Search form */}
        <form action="/search" method="GET" className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search Orbital Insights..."
              className="w-full px-4 py-2 pr-12 rounded bg-spacex border border-white/10 text-spacex-gray focus:outline-none focus:ring-2 focus:ring-primary shadow"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-spacex-gray hover:text-primary transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Search results info */}
        {query && (
          <p className="text-spacex-gray">
            {filteredPosts.length === 0 
              ? `No results found for "${query}"`
              : `Found ${filteredPosts.length} result${filteredPosts.length === 1 ? '' : 's'} for "${query}"`
            }
          </p>
        )}
      </div>

      {/* Results */}
      {query && filteredPosts.length > 0 && (
        <PostList posts={filteredPosts} />
      )}

      {/* No search performed */}
      {!query && (
        <div className="text-center py-12">
          <p className="text-spacex-gray text-lg">
            Enter a search term above to find Orbital Insights
          </p>
        </div>
      )}
    </div>
  );
} 