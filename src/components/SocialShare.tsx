import { Share2, Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  excerpt?: string;
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-zinc-400">
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">Share this post</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Twitter/X */}
        <button
          onClick={() => handleShare('twitter')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4 text-zinc-400 group-hover:text-[#1DA1F2] transition-colors" />
          <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Twitter</span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => handleShare('linkedin')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4 text-zinc-400 group-hover:text-[#0A66C2] transition-colors" />
          <span className="text-sm text-zinc-400 group-hover:text-zinc-300">LinkedIn</span>
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleShare('facebook')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4 text-zinc-400 group-hover:text-[#1877F2] transition-colors" />
          <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Facebook</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
          aria-label="Copy link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 text-zinc-400 group-hover:text-athletic-brand-violet transition-colors" />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
