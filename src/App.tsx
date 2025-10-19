import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';

function App() {
  // App is always served from /blog path
  // - ninochavez.co/blog (via Vercel rewrite)
  // - signal-dispatch-blog.vercel.app/blog (standalone)
  return (
    <BrowserRouter basename="/blog">
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <Routes>
          <Route path="/" element={<BlogListPage />} />
          <Route path="/:slug" element={<BlogPostPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
