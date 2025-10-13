import { useEffect, useState, useMemo } from 'react';
import BlogLayout from '../components/BlogLayout';
import SearchBar from '../components/SearchBar';
import FadeIn from '../components/FadeIn';
import BackToTop from '../components/BackToTop';
import ScatterToSignal from '../components/ScatterToSignal';
import { getAllPosts } from '../utils/mdx-loader';
import type { BlogPost } from '../utils/mdx-loader';
import { getCategoryColors, getCategoryButtonClass } from '../utils/category-colors';

interface BlogListPageProps {
  onSelectPost: (slug: string) => void;
}

export default function BlogListPage({ onSelectPost }: BlogListPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePostCount, setVisiblePostCount] = useState(6);

  const POSTS_PER_PAGE = 6;

  useEffect(() => {
    async function loadPosts() {
      try {
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  // Get unique categories and count posts per category
  // Sort by count descending, group categories with <10 posts into "Other"
  const { categories, postCounts, topCategories } = useMemo(() => {
    const counts: Record<string, number> = {};

    posts.forEach((post) => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    });

    // Sort categories by count (descending)
    const sortedCategories = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    // Separate top categories (>=10 posts) from others (<10 posts)
    const topCats = sortedCategories.filter(cat => counts[cat] >= 10);
    const otherCats = sortedCategories.filter(cat => counts[cat] < 10);
    const otherCount = otherCats.reduce((sum, cat) => sum + counts[cat], 0);

    // Add "Other" category if there are small categories
    const finalCounts = { ...counts };
    if (otherCats.length > 0) {
      finalCounts['Other'] = otherCount;
    }

    return {
      categories: sortedCategories,
      postCounts: finalCounts,
      topCategories: topCats,
    };
  }, [posts]);

  // Get list of "Other" categories (those with <10 posts)
  const otherCategories = useMemo(() => {
    return categories.filter(cat => postCounts[cat] < 10);
  }, [categories, postCounts]);

  // Filter posts by selected category and search query
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory) {
      if (selectedCategory === 'Other') {
        // Show all posts from categories with <10 posts
        filtered = filtered.filter((post) =>
          post.category && otherCategories.includes(post.category)
        );
      } else {
        filtered = filtered.filter((post) => post.category === selectedCategory);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.category?.toLowerCase().includes(query) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [posts, selectedCategory, searchQuery, otherCategories]);

  const featuredPosts = filteredPosts.filter((post) => post.featured).slice(0, 2);
  const allRegularPosts = filteredPosts.filter((post) => !post.featured);
  const regularPosts = allRegularPosts.slice(0, visiblePostCount);
  const hasMorePosts = visiblePostCount < allRegularPosts.length;

  const handleLoadMore = () => {
    setVisiblePostCount((prev) => prev + POSTS_PER_PAGE);
  };

  return (
    <BlogLayout>
      <BackToTop />
      <div className="space-y-8">
        {/* Hero Section - Brand statement with visual signature */}
        <section className="relative py-8 overflow-hidden">
          <div className="relative">
            {/* Title and subtitle grouped with graphic as background wordmark */}
            <div className="relative mb-8">
              {/* Animation as background wordmark - positioned behind both title and subtitle */}
              <div className="absolute left-0 top-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none">
                <ScatterToSignal />
              </div>

              {/* Text content with z-index layering */}
              <div className="relative z-10 space-y-3">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight animate-gradient-flow">
                  Signal Dispatch
                </h1>
                <p className="text-xl md:text-2xl text-zinc-300 font-medium leading-snug w-full">
                  Architecture, commerce, and the signals that matter in the age of AI.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <a href="https://nino.photos" className="hover:text-athletic-brand-violet transition-colors">Portfolio</a>
              <span>•</span>
              <a href="https://gallery.nino.photos" className="hover:text-athletic-brand-violet transition-colors">Gallery</a>
            </div>
          </div>

          {/* Animated gradient flow CSS */}
          <style>{`
            @keyframes gradient-flow {
              0%, 100% {
                background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 50%, #f97316 100%);
                background-size: 200% 100%;
                background-position: 0% 50%;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              50% {
                background-position: 100% 50%;
              }
            }

            .animate-gradient-flow {
              animation: gradient-flow 6s ease-in-out infinite;
              background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 50%, #f97316 100%);
              background-size: 200% 100%;
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
            }
          `}</style>
        </section>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-athletic-brand-violet border-r-transparent" />
            <p className="text-zinc-400 mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-xl">No posts found.</p>
          </div>
        ) : (
          <>
            {/* Search and Filter Section - Redesigned for better space usage */}
            <section className="space-y-10">
              {/* Search Bar - Full width */}
              <div className="max-w-3xl mx-auto">
                <SearchBar onSearch={setSearchQuery} placeholder="Search by title, content, category, or tags..." />
              </div>

              {/* Category Pills - Centered with better spacing */}
              {categories.length > 0 && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-wrap items-center justify-center gap-3 max-w-5xl">
                    <span className="text-sm font-medium text-zinc-500 mr-2">Filter:</span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-reaction ${
                        selectedCategory === null
                          ? 'bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange text-white shadow-lg shadow-athletic-brand-violet/25'
                          : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-athletic-court-orange/50 hover:text-white hover:scale-105'
                      }`}
                    >
                      All Posts <span className="ml-1.5 opacity-70">({posts.length})</span>
                    </button>
                    {topCategories.map((category) => {
                      const isSelected = selectedCategory === category;
                      const buttonClasses = getCategoryButtonClass(category, isSelected);
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-reaction border hover:scale-105 ${buttonClasses} ${isSelected ? 'shadow-lg scale-105' : ''}`}
                        >
                          {category} <span className="ml-1.5 opacity-70">({postCounts[category] || 0})</span>
                        </button>
                      );
                    })}
                    {otherCategories.length > 0 && (
                      <button
                        key="Other"
                        onClick={() => setSelectedCategory('Other')}
                        className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-reaction border hover:scale-105 ${
                          selectedCategory === 'Other'
                            ? 'bg-athletic-brand-violet/10 border-athletic-brand-violet/30 text-athletic-brand-violet shadow-lg scale-105'
                            : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-athletic-brand-violet/50 hover:text-white'
                        }`}
                      >
                        Other <span className="ml-1.5 opacity-70">({postCounts['Other'] || 0})</span>
                      </button>
                    )}
                  </div>

                  {/* Results count */}
                  {(searchQuery || selectedCategory) && (
                    <div className="text-center text-sm text-zinc-400">
                      Found <span className="text-athletic-brand-violet font-semibold">{filteredPosts.length}</span> post
                      {filteredPosts.length !== 1 && 's'}
                      {searchQuery && <span> matching <span className="text-white">"{searchQuery}"</span></span>}
                      {selectedCategory && selectedCategory !== 'Other' && <span> in <span className="text-white">{selectedCategory}</span></span>}
                      {selectedCategory === 'Other' && <span> in <span className="text-white">smaller categories</span></span>}
                    </div>
                  )}
                </div>
              )}
            </section>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <p className="text-zinc-400 text-xl">
                  {searchQuery && selectedCategory
                    ? `No posts found matching "${searchQuery}" in ${selectedCategory} category`
                    : searchQuery
                      ? `No posts found matching "${searchQuery}"`
                      : `No posts found in ${selectedCategory} category`}
                </p>
                <div className="flex gap-3 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 rounded-lg bg-zinc-900 text-athletic-brand-violet hover:bg-zinc-800 transition-colors duration-reaction"
                    >
                      Clear search
                    </button>
                  )}
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="px-4 py-2 rounded-lg bg-zinc-900 text-athletic-brand-violet hover:bg-zinc-800 transition-colors duration-reaction"
                    >
                      Clear category
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Featured Posts */}
                {featuredPosts.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange rounded-full" />
                  <h2 className="text-3xl font-bold text-white">Featured</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredPosts.map((post, index) => (
                    <FadeIn key={post.slug} delay={index * 100}>
                      <article
                      key={post.slug}
                      data-slug={post.slug}
                      className="group cursor-pointer relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 hover:border-athletic-court-orange/50 transition-all duration-reaction hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-athletic-brand-violet/10"
                      onClick={() => onSelectPost(post.slug)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-athletic-brand-violet/5 to-athletic-court-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-reaction" />
                      {/* Corner accent - signal marker */}
                      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-athletic-court-orange/40 group-hover:border-athletic-court-orange/80 rounded-tr-lg transition-all duration-reaction" />
                      <div className="relative space-y-4">
                        <div className="flex items-center gap-2 text-xs">
                          {post.category && (
                            <span
                              className={`font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-colors ${getCategoryColors(post.category).bg} ${getCategoryColors(post.category).border} ${getCategoryColors(post.category).text}`}
                            >
                              {post.category}
                            </span>
                          )}
                          {post.category && <span className="text-zinc-700">•</span>}
                          <time className="text-zinc-500">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>

                        <h3 className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-athletic-brand-violet group-hover:to-athletic-court-orange group-hover:bg-clip-text transition-all duration-reaction leading-tight">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-zinc-400 text-lg leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                    </FadeIn>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange rounded-full" />
                  <h2 className="text-3xl font-bold text-white">Latest</h2>
                  {allRegularPosts.length > 0 && (
                    <span className="text-sm text-zinc-500">
                      Showing {regularPosts.length} of {allRegularPosts.length}
                    </span>
                  )}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  {regularPosts.map((post, index) => (
                    <FadeIn key={post.slug} delay={index * 50}>
                      <article
                      data-slug={post.slug}
                      className="group cursor-pointer relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 hover:border-zinc-700 transition-all duration-reaction hover:bg-zinc-900/50 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20"
                      onClick={() => onSelectPost(post.slug)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs">
                          {post.category && (
                            <span
                              className={`font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${getCategoryColors(post.category).bg} ${getCategoryColors(post.category).border} ${getCategoryColors(post.category).text}`}
                            >
                              {post.category}
                            </span>
                          )}
                          {post.category && <span className="text-zinc-700">•</span>}
                          <time className="text-zinc-500">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>

                        <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-athletic-brand-violet group-hover:to-athletic-court-orange group-hover:bg-clip-text transition-all duration-reaction leading-tight">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-zinc-400 leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-1 rounded bg-zinc-900/50 text-zinc-500 border border-zinc-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                    </FadeIn>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMorePosts && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-4 min-h-[44px] rounded-xl bg-zinc-900/50 text-athletic-brand-violet border border-zinc-800 hover:border-athletic-brand-violet/50 hover:bg-athletic-brand-violet/5 transition-all duration-reaction font-medium hover:scale-105"
                    >
                      Load More Posts
                      <span className="ml-2 text-zinc-500">
                        ({allRegularPosts.length - visiblePostCount} remaining)
                      </span>
                    </button>
                  </div>
                )}
              </section>
            )}
              </>
            )}
          </>
        )}
      </div>
    </BlogLayout>
  );
}
