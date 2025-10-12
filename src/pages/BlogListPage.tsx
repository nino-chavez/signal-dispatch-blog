import { useEffect, useState, useMemo } from 'react';
import BlogLayout from '../components/BlogLayout';
import SearchBar from '../components/SearchBar';
import FadeIn from '../components/FadeIn';
import BackToTop from '../components/BackToTop';
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
  const [visiblePostCount, setVisiblePostCount] = useState(18);

  const POSTS_PER_PAGE = 18;

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
  const { categories, postCounts } = useMemo(() => {
    const categorySet = new Set<string>();
    const counts: Record<string, number> = {};

    posts.forEach((post) => {
      if (post.category) {
        categorySet.add(post.category);
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    });

    return {
      categories: Array.from(categorySet).sort(),
      postCounts: counts,
    };
  }, [posts]);

  // Filter posts by selected category and search query
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category === selectedCategory);
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
  }, [posts, selectedCategory, searchQuery]);

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
        {/* Hero Section - Visual brand mark with tagline */}
        <section className="relative py-6">
          <div className="relative space-y-6 max-w-4xl">
            {/* Animated signal bars - visual signature */}
            <div className="flex gap-1">
              {[24, 40, 18, 48, 32, 20, 44].map((height, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-athletic-brand-violet to-athletic-court-orange rounded-full transition-all duration-reaction hover:scale-y-125 cursor-pointer"
                  style={{
                    height: `${height}px`,
                    animation: `pulse 3s ease-in-out infinite`,
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              ))}
            </div>
            <p className="text-xl md:text-2xl text-zinc-300 font-medium leading-relaxed">
              Architecture, commerce, and the signals that matter in the age of AI.
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <a href="https://nino.photos" className="hover:text-athletic-brand-violet transition-colors">Portfolio</a>
              <span>•</span>
              <a href="https://gallery.nino.photos" className="hover:text-athletic-brand-violet transition-colors">Gallery</a>
            </div>
          </div>
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
            <section className="space-y-6">
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
                      All Posts <span className="ml-1.5 opacity-70">({Object.values(postCounts).reduce((a, b) => a + b, 0)})</span>
                    </button>
                    {categories.slice(0, 6).map((category) => {
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
                  </div>

                  {/* Results count */}
                  {(searchQuery || selectedCategory) && (
                    <div className="text-center text-sm text-zinc-400">
                      Found <span className="text-athletic-brand-violet font-semibold">{filteredPosts.length}</span> post
                      {filteredPosts.length !== 1 && 's'}
                      {searchQuery && <span> matching <span className="text-white">"{searchQuery}"</span></span>}
                      {selectedCategory && <span> in <span className="text-white">{selectedCategory}</span></span>}
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
