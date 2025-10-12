import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      // Get scroll position
      const scrollTop = window.scrollY;

      // Get total scrollable height (document height - viewport height)
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      // Calculate progress percentage
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(scrollPercent);
    };

    // Initial calculation
    updateProgress();

    // Update on scroll
    window.addEventListener('scroll', updateProgress, { passive: true });

    // Update on resize (in case content height changes)
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-900/50">
      <div
        className="h-full bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange transition-all duration-quick-snap"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />
    </div>
  );
}
