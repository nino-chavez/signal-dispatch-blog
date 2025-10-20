import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';

function App() {
  // App is served from subdomain blog.ninochavez.co
  return (
    <BrowserRouter>
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
