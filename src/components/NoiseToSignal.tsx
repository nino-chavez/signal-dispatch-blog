/**
 * NoiseToSignal - SVG animation showing chaos (left) becoming signal (right)
 * Concept: Multiple paths start as noisy scribbles and progressively straighten into a clean throughline
 */

export default function NoiseToSignal() {
  return (
    <div className="w-full max-w-2xl">
      <svg
        viewBox="0 0 600 80"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient from violet to orange */}
          <linearGradient id="signal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
          </linearGradient>

          {/* Noise pattern for chaos effect */}
          <filter id="noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feDisplacementMap in="SourceGraphic" scale="8" />
          </filter>
        </defs>

        {/* Layer 1: Chaotic noise (left side, fades out) */}
        <g className="opacity-60">
          {[...Array(8)].map((_, i) => (
            <path
              key={`chaos-${i}`}
              d={`M 0 ${20 + i * 5} Q 50 ${15 + Math.random() * 50} 100 ${30 + Math.random() * 20} T 200 ${35 + Math.random() * 15}`}
              stroke="url(#signal-gradient)"
              strokeWidth="1"
              fill="none"
              opacity={0.3 - i * 0.03}
              className="animate-chaos"
              style={{
                strokeDasharray: '5 10',
                animation: `chaos 3s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </g>

        {/* Layer 2: Transition zone (middle, organizing) */}
        <g className="opacity-80">
          {[...Array(5)].map((_, i) => (
            <path
              key={`transition-${i}`}
              d={`M 200 ${35 + i * 3} Q 300 ${38 + Math.sin(i) * 8} 400 ${40 + i * 2}`}
              stroke="url(#signal-gradient)"
              strokeWidth="1.5"
              fill="none"
              opacity={0.5}
              className="animate-organize"
              style={{
                animation: `organize 4s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </g>

        {/* Layer 3: Clean signal (right side, emerges strong) */}
        <path
          d="M 400 40 L 600 40"
          stroke="url(#signal-gradient)"
          strokeWidth="3"
          fill="none"
          className="opacity-100"
          style={{
            animation: 'signal-pulse 2s ease-in-out infinite',
          }}
        />

        {/* Accent dot traveling from chaos to signal */}
        <circle
          r="3"
          fill="#f97316"
          className="opacity-80"
          style={{
            animation: 'travel 5s ease-in-out infinite',
          }}
        >
          <animateMotion
            dur="5s"
            repeatCount="indefinite"
            path="M 0 40 Q 100 30 200 38 Q 300 42 400 40 L 600 40"
          />
        </circle>

        {/* CSS animations in style tag */}
        <style>{`
          @keyframes chaos {
            0%, 100% {
              stroke-dashoffset: 0;
              opacity: 0.3;
            }
            50% {
              stroke-dashoffset: 20;
              opacity: 0.5;
            }
          }

          @keyframes organize {
            0%, 100% {
              transform: translateY(0px);
              opacity: 0.5;
            }
            50% {
              transform: translateY(-2px);
              opacity: 0.7;
            }
          }

          @keyframes signal-pulse {
            0%, 100% {
              stroke-width: 3;
              opacity: 1;
            }
            50% {
              stroke-width: 4;
              opacity: 0.8;
            }
          }
        `}</style>
      </svg>
    </div>
  );
}
