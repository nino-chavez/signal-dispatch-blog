import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BlogLayout from '../components/BlogLayout';
import HeaderNav from '../components/HeaderNav';
import ReadingProgress from '../components/ReadingProgress';
import RelatedPosts from '../components/RelatedPosts';
import { getPostBySlug } from '../utils/mdx-loader';
import type { BlogPost } from '../utils/mdx-loader';
import { getCategoryColors } from '../utils/category-colors';

interface BlogPostPageProps {
  slug: string;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
}

export default function BlogPostPage({ slug, onBack, onSelectPost }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Scroll to top when slug changes (new post loaded)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadPost() {
      try {
        const loadedPost = await getPostBySlug(slug);
        setPost(loadedPost);
      } catch (error) {
        console.error(`Failed to load post: ${slug}`, error);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);
  
  if (loading) {
    return (
      <>
        <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
        <BlogLayout>
          <div className="max-w-4xl mx-auto space-y-8 pt-24">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-zinc-400 hover:text-athletic-court-orange transition-all duration-reaction font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-reaction" />
            Back to all posts
          </button>
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-athletic-brand-violet border-r-transparent" />
            <p className="text-zinc-400 mt-4">Loading post...</p>
          </div>
          </div>
        </BlogLayout>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
        <BlogLayout>
          <div className="max-w-4xl mx-auto space-y-8 pt-24">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-zinc-400 hover:text-athletic-court-orange transition-all duration-reaction font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-reaction" />
            Back to all posts
          </button>
          <div className="text-center py-20">
            <p className="text-zinc-400 text-xl">Post not found.</p>
          </div>
          </div>
        </BlogLayout>
      </>
    );
  }

  const Content = post.content as React.ComponentType;

  return (
    <>
      <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
      <BlogLayout>
        <ReadingProgress />

        <div className="max-w-4xl mx-auto pt-24">
        <div className="space-y-6">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-zinc-400 hover:text-athletic-court-orange transition-all duration-reaction font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-reaction" />
              Back to all posts
            </button>

            <article className="space-y-6">
              {/* Featured Image Hero */}
              {post.featureImage && (
                <div className="relative -mx-4 md:-mx-8 lg:mx-0 aspect-[21/9] overflow-hidden rounded-2xl border border-zinc-800">
                  <img
                    src={post.featureImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                </div>
              )}

              <header className="space-y-3 pb-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-3 text-sm">
              {post.category && (
                <span
                  className={`font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${getCategoryColors(post.category).bg} ${getCategoryColors(post.category).border} ${getCategoryColors(post.category).text}`}
                >
                  {post.category}
                </span>
              )}
              {post.category && <span className="text-zinc-700">•</span>}
              <time className="text-zinc-500">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-zinc-400 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-athletic-brand-violet/50 hover:text-athletic-brand-violet transition-all duration-reaction cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

              {/* Article Content with Enhanced Typography */}
              <div className="prose max-w-none text-lg">
                <Content />
              </div>

              {/* Related Posts */}
              <RelatedPosts
                currentSlug={post.slug}
                category={post.category}
                tags={post.tags}
                onSelectPost={onSelectPost}
              />
            </article>
        </div>
      </div>
    </BlogLayout>
    </>
  );
}
