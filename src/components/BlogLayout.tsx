import { type ReactNode } from 'react';
import BlogFooter from './BlogFooter';

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/90 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <a
              href="/"
              className="text-2xl font-bold text-white hover:text-athletic-court-orange transition-all duration-reaction"
            >
              Signal Dispatch
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <BlogFooter />
    </div>
  );
}
