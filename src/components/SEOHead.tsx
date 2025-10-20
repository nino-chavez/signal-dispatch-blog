import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export default function SEOHead({
  title,
  description = 'Architecture, commerce, and the signals that matter. Exploring AI workflows, systems thinking, and leadership through practical experience.',
  image = '/og_image.png',
  url = 'https://blog.ninochavez.co',
  type = 'website',
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} - Signal Dispatch`;

    // Helper to update or create meta tag
    const setMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Ensure image is absolute URL
    const absoluteImage = image.startsWith('http') ? image : `https://blog.ninochavez.co${image}`;
    const absoluteUrl = url.startsWith('http') ? url : `https://blog.ninochavez.co${url}`;

    // Update meta tags
    setMetaTag('description', description, true);
    
    // Open Graph
    setMetaTag('og:type', type);
    setMetaTag('og:url', absoluteUrl);
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:image', absoluteImage);
    
    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:url', absoluteUrl);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', absoluteImage);
  }, [title, description, image, url, type]);

  return null;
}