import { useEffect } from 'react';

/**
 * Custom hook to set canonical URL for SEO
 *
 * This site is served via Vercel rewrite from https://ninochavez.co/blog
 * All pages must declare the canonical URL to prevent duplicate content penalties
 * and consolidate SEO authority under the ninochavez.co domain.
 *
 * @param path - The path relative to /blog (e.g., "/my-post" becomes ninochavez.co/blog/my-post)
 */
export function useCanonicalUrl(path: string = '') {
  useEffect(() => {
    const CANONICAL_DOMAIN = 'https://ninochavez.co';
    const canonicalPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${CANONICAL_DOMAIN}/blog${canonicalPath}`;

    // Remove existing canonical link if present
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Create and append new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);

    // Also set og:url for social sharing
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      (ogUrl as HTMLMetaElement).setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    (ogUrl as HTMLMetaElement).setAttribute('content', canonicalUrl);

    // Cleanup function
    return () => {
      const linkToRemove = document.querySelector('link[rel="canonical"]');
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [path]);
}
