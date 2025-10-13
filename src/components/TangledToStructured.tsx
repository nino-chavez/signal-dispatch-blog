/**
 * TangledToStructured - SVG animation showing tangled chaos untangling into organized lines
 * Concept: A scribbled ball on the left progressively untangles into clean radiating lines on the right
 */

export default function TangledToStructured() {
  // Generate tangled path data (chaotic scribble)
  const tangledPaths = [
    'M 30 40 Q 25 25 35 30 Q 45 35 30 45 Q 20 50 28 38 Q 38 28 32 42',
    'M 40 35 Q 38 48 32 38 Q 28 30 42 32 Q 50 38 38 45 Q 30 52 35 40',
    'M 35 42 Q 42 30 30 35 Q 22 42 35 48 Q 45 52 40 38 Q 32 28 36 40',
    'M 28 38 Q 35 25 42 35 Q 48 45 32 48 Q 25 50 30 40 Q 40 32 34 42',
  ];

  // Generate structured line paths (radiating from center)
  const structuredPaths = [
    'M 100 40 L 550 20',
    'M 100 40 L 550 32',
    'M 100 40 L 550 40',
    'M 100 40 L 550 48',
    'M 100 40 L 550 60',
  ];

  return (
    <div className="w-full max-w-2xl">
      <svg
        viewBox="0 0 600 80"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient from violet to orange */}
          <linearGradient id="untangle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
          </linearGradient>

          {/* Glow effect for structured lines */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tangled ball (left side) - morphing into lines */}
        <g>
          {tangledPaths.map((path, i) => (
            <path
              key={`tangled-${i}`}
              d={path}
              stroke="url(#untangle-gradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-tangle"
              style={{
                animation: `tangle-pulse 3s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                transformOrigin: '35px 40px',
              }}
            >
              <animate
                attributeName="d"
                dur="6s"
                repeatCount="indefinite"
                values={`${path}; M 35 40 L ${180 + i * 15} ${28 + i * 6}; ${path}`}
              />
              <animate
                attributeName="opacity"
                dur="6s"
                repeatCount="indefinite"
                values="0.8; 0.3; 0.8"
              />
            </path>
          ))}
        </g>

        {/* Structured lines (right side) - emerging from chaos */}
        <g filter="url(#glow)">
          {structuredPaths.map((path, i) => (
            <path
              key={`structured-${i}`}
              d={path}
              stroke="url(#untangle-gradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              className="animate-emerge"
              style={{
                strokeDasharray: '450',
                strokeDashoffset: '450',
                animation: `emerge 6s ease-out infinite`,
                animationDelay: `${1 + i * 0.3}s`,
              }}
            />
          ))}
        </g>

        {/* Connecting arc showing the transformation */}
        <path
          d="M 80 40 Q 200 35 300 40"
          stroke="#a78bfa"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
          strokeDasharray="5 10"
          style={{
            animation: 'connection-flow 4s ease-in-out infinite',
          }}
        />

        {/* Particle effect showing untangling motion */}
        {[...Array(3)].map((_, i) => (
          <circle
            key={`particle-${i}`}
            r="2"
            fill="#f97316"
            opacity="0.6"
          >
            <animateMotion
              dur={`${4 + i}s`}
              repeatCount="indefinite"
              path="M 35 40 Q 150 30 300 38 Q 400 42 500 40"
              begin={`${i * 1.2}s`}
            />
            <animate
              attributeName="opacity"
              dur={`${4 + i}s`}
              repeatCount="indefinite"
              values="0; 0.8; 0"
              begin={`${i * 1.2}s`}
            />
          </circle>
        ))}

        {/* CSS animations */}
        <style>{`
          @keyframes tangle-pulse {
            0%, 100% {
              stroke-width: 2;
              opacity: 0.8;
            }
            50% {
              stroke-width: 2.5;
              opacity: 1;
            }
          }

          @keyframes emerge {
            0% {
              stroke-dashoffset: 450;
              opacity: 0;
            }
            50% {
              opacity: 0.8;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 1;
            }
          }

          @keyframes connection-flow {
            0%, 100% {
              stroke-dashoffset: 0;
              opacity: 0.2;
            }
            50% {
              stroke-dashoffset: -30;
              opacity: 0.6;
            }
          }
        `}</style>
      </svg>
    </div>
  );
}
