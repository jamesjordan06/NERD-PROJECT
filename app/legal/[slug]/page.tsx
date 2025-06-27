// app/legal/[slug]/page.tsx
import { fetchLegalPage, fetchLegalPageSlugs } from '../../../lib/posts';
import type { Metadata } from 'next';
import type { PageProps } from '@/types/page-props';

// 1) Generate all slugs at build time (fetching the string array)
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const slugs = await fetchLegalPageSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params for legal pages:', error);
    return [];
  }
}

// 2) Per-page metadata
export async function generateMetadata({ params }: PageProps<{ slug: string }>): Promise<Metadata> {
  const { slug } = params;
  const page = await fetchLegalPage(slug);
  return {
    title: page?.title ?? 'Legal Document',
    description: page?.description ?? ''
  };
}

// 3) Page component
export default async function LegalPage({ params }: PageProps<{ slug: string }>): Promise<JSX.Element> {
  const { slug } = params;
  const page = await fetchLegalPage(slug);

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-orbitron text-white mb-4">Page Not Found</h1>
          <p className="text-spacex-gray">The legal page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="prose prose-invert lg:prose-xl mx-auto max-w-4xl">
        <h1 className="text-3xl font-orbitron text-white mb-8">{page.title}</h1>
        <div 
          className="text-spacex-gray leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.body || '' }} 
        />
      </article>
    </div>
  );
}
