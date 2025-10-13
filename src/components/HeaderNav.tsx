import { useState, useEffect, useRef } from 'react';
import { Search, X, ExternalLink, Image } from 'lucide-react';

interface HeaderNavProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function HeaderNav({ onSearch, searchQuery }: HeaderNavProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not already in an input
      if (e.key === '/' && !isSearchOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setLocalQuery('');
        onSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, onSearch]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Sync with parent search query
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalQuery(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    onSearch('');
    setIsSearchOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/98 backdrop-blur-xl border-b border-zinc-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title with inline subtitle */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange bg-clip-text text-transparent">
              Signal Dispatch
            </h1>
            <span className="hidden md:inline text-sm text-zinc-500">
              · Architecture, commerce, and the signals that matter
            </span>
          </div>

          {/* Right Side: Search + Icons */}
          <div className="flex items-center gap-3">
            {/* Search Button/Input */}
            <div className="relative">
              {!isSearchOpen ? (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="group flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                  aria-label="Open search"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded">
                    /
                  </kbd>
                </button>
              ) : (
                <div className="flex items-center gap-2 w-[280px] sm:w-[360px]">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={localQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search posts..."
                      className="w-full pl-10 pr-4 py-1.5 text-sm bg-zinc-900 border border-athletic-brand-violet/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-athletic-brand-violet/50 text-white placeholder-zinc-500"
                    />
                  </div>
                  <button
                    onClick={handleClearSearch}
                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Portfolio Link */}
            <a
              href="https://nino.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-1.5 text-zinc-400 hover:text-athletic-brand-violet transition-colors"
              aria-label="Portfolio"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-zinc-900 border border-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Portfolio
              </span>
            </a>

            {/* Gallery Link */}
            <a
              href="https://gallery.nino.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-1.5 text-zinc-400 hover:text-athletic-brand-violet transition-colors"
              aria-label="Gallery"
            >
              <Image className="w-4 h-4" />
              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-zinc-900 border border-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Gallery
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
