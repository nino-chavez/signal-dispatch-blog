import { Rss } from 'lucide-react';

export default function BlogFooter() {
  return (
    <footer className="border-t border-zinc-800/50 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-2">Signal Dispatch</h3>
            <p className="text-zinc-500 text-sm">
              Architecture, commerce, and the signals that matter.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-sm inline-flex items-center gap-2"
                >
                  <Rss className="w-4 h-4" />
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Connect
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://linkedin.com/in/nino-chavez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-sm"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/nino-chavez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-sm"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@nino.photos"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-sm"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          {/* Work */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Work
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://nino.photos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-sm"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="https://gallery.nino.photos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-sm"
                >
                  Photography
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Nino Chavez. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Built with{' '}
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-athletic-brand-violet hover:text-athletic-court-orange transition-colors"
            >
              React
            </a>
            {' & '}
            <a
              href="https://mdxjs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-athletic-brand-violet hover:text-athletic-court-orange transition-colors"
            >
              MDX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
