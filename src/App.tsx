import { useState } from 'react';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';

function App() {
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {currentSlug ? (
        <BlogPostPage
          slug={currentSlug}
          onBack={() => setCurrentSlug(null)}
          onSelectPost={(slug) => setCurrentSlug(slug)}
        />
      ) : (
        <BlogListPage onSelectPost={(slug) => setCurrentSlug(slug)} />
      )}
    </div>
  );
}

export default App;
