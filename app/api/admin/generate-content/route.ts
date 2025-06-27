import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

function getSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]/g)?.map((s) => s.trim()) || [];
}

function createExcerpt(content: string): string {
  const sentences = getSentences(stripHtml(content));
  if (sentences.length === 0) return content.slice(0, 200) + "...";
  return sentences.slice(0, 2).join(" ");
}

function createMetaDescription(content: string): string {
  const sentences = getSentences(stripHtml(content));
  if (sentences.length === 0) return content.slice(0, 160) + "...";
  let description = "";
  for (const sentence of sentences) {
    const next = description ? description + " " + sentence : sentence;
    if (next.length > 157) break;
    description = next;
  }
  return description.length > 160
    ? description.slice(0, 157).trim() + "..."
    : description;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Categories for content generation
const CATEGORIES = [
  "Space News",
  "Astronomy",
  "Astrophysics",
  "Cosmology",
  "Planetary Science",
  "Space Technology",
  "Space Exploration"
];

// Check for duplicate topics
async function checkDuplicateTopics(title: string): Promise<boolean> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("title")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .eq("published", true);

  if (!recentPosts) return false;

  // Simple similarity check - can be improved with more sophisticated algorithms
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  
  return recentPosts.some(post => {
    const normalizedPostTitle = post.title.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    const similarity = calculateSimilarity(normalizedTitle, normalizedPostTitle);
    return similarity > 0.7; // 70% similarity threshold
  });
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(" ");
  const words2 = str2.split(" ");
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

// Generate images using Unsplash API (free tier)
async function generateImages(keywords: string[]): Promise<string[]> {
  try {
    const query = keywords.join(" ");
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      {
        headers: {
          "Authorization": `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.warn("Unsplash API failed, using placeholder images");
      return [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506318137071-a8e063a4d0ea?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop"
      ];
    }

    const data = await response.json();
    return data.results.map((photo: any) => photo.urls.regular);
  } catch (error) {
    console.error("Error fetching images:", error);
    return [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506318137071-a8e063a4d0ea?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop"
    ];
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", session.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { category, customPrompt } = await request.json();

    if (!category || !CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Check for duplicate topics if title is provided
    if (customPrompt) {
      const isDuplicate = await checkDuplicateTopics(customPrompt);
      if (isDuplicate) {
        return NextResponse.json({ 
          error: "A similar article was published recently. Please choose a different topic." 
        }, { status: 409 });
      }
    }

    // Generate content with OpenAI
    const prompt = customPrompt || `Generate a thorough, scientifically accurate HTML article about "${category}".
    Requirements:
    - Use clear language with depth and precision.
    - Structure sections with <h2> tags and write 3-5 paragraphs each.
    - Highlight key concepts using <strong> tags.
    - Cite NASA or peer-reviewed sources with links when relevant.
    - Conclude succinctly.
    - Provide 5-7 relevant SEO tags.
    - Return meta_title and meta_description (160 characters max).
    - Supply a 2-3 sentence excerpt for previews.

    Respond only with JSON in the form:
    {
      "title": "...",
      "content": "...",
      "excerpt": "...",
      "meta_title": "...",
      "meta_description": "...",
      "tags": ["...", "..."]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: "You are a space journalist writing for a science magazine. Include links to credible sources when possible. Format your answer as JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }

    let articleData;
    try {
      articleData = JSON.parse(content);
    } catch (error) {
      articleData = {
        title: `Latest in ${category}`,
        content: content,
        excerpt: createExcerpt(content),
        meta_title: `Latest in ${category}`,
        meta_description: createMetaDescription(content),
        tags: [category.toLowerCase().replace(" ", "-")]
      };
    }

    // Generate images based on keywords
    const keywords = articleData.keywords || [category.toLowerCase()];
    const imageUrls = await generateImages(keywords);

    // Create slug from title
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Save to database
    const { data: post, error: dbError } = await supabase
      .from("posts")
      .insert({
        title: articleData.title,
        slug,
        content: articleData.content,
        excerpt: articleData.excerpt,
        image_urls: imageUrls,
        author_id: session.user.id,
        category,
        meta_title: articleData.meta_title,
        meta_description: articleData.meta_description,
        tags: articleData.tags,
        published: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to save article" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        imageUrls,
        generatedContent: articleData
      }
    });

  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 