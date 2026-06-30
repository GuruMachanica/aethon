// FloatingLines.tsx
// Flowing gradient "data-stream" lines with glowing particles travelling along them.
// Pure SVG + CSS (SMIL animateMotion for particles). No dependencies.

export function FloatingLines({ idPrefix = 'fl' }) {
  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <div className="floating-lines" aria-hidden="true">
      <style>{`
        .floating-lines {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.6;
        }
        .floating-lines svg { width: 100%; height: 100%; display: block; }

        .fl-line {
          fill: none;
          stroke-width: 1.4;
          stroke-linecap: round;
          stroke-dasharray: 16 30;
          opacity: 0.22;
          animation: flFlow 10s linear infinite, flPulse 8s ease-in-out infinite;
        }
        .fl-line.fl-l2 { animation-duration: 13s, 9s;   animation-delay: 0s, 1.5s; }
        .fl-line.fl-l3 { animation-duration: 11s, 10s;  animation-delay: 0s, 3s;   }
        .fl-line.fl-l4 { animation-duration: 14s, 8.5s; animation-delay: 0s, 2.2s; }
        .fl-line.fl-l5 { animation-duration: 12s, 9.5s; animation-delay: 0s, 4s;   }

        @keyframes flFlow  { to { stroke-dashoffset: -460; } }
        @keyframes flPulse { 0%, 100% { opacity: 0.14; } 50% { opacity: 0.32; } }

        .fl-dot {
          fill: #36e9d2; /* tealGlow */
          opacity: 0.75;
          filter: drop-shadow(0 0 0.375rem rgba(54, 233, 210, 0.8));
        }
        .fl-dot.fl-d2 {
          fill: #f4d488; /* goldGlow */
          filter: drop-shadow(0 0 0.375rem rgba(244, 212, 136, 0.8));
        }

        @media (max-width: 47.9375rem) { .floating-lines { display: none; } } /* keep mobile light */
        @media (prefers-reduced-motion: reduce) {
          .fl-line, .fl-dot { animation: none !important; }
          .floating-lines { opacity: 0.25; }
        }
      `}</style>

      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={id('grad1')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(54,233,210,0)" />
            <stop offset="35%"  stopColor="rgba(54,233,210,0.55)" />
            <stop offset="65%"  stopColor="rgba(244,212,136,0.55)" />
            <stop offset="100%" stopColor="rgba(244,212,136,0)" />
          </linearGradient>
          <linearGradient id={id('grad2')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(244,212,136,0)" />
            <stop offset="40%"  stopColor="rgba(217,177,94,0.5)" />
            <stop offset="70%"  stopColor="rgba(54,233,210,0.5)" />
            <stop offset="100%" stopColor="rgba(54,233,210,0)" />
          </linearGradient>
        </defs>

        {/* energy pathways — long organic curves that cross each other */}
        <path id={id('p1')} className="fl-line"        stroke={`url(#${id('grad1')})`} d="M-60 180 C 280 80, 560 300, 880 190 S 1340 70, 1500 170" />
        <path id={id('p2')} className="fl-line fl-l2"  stroke={`url(#${id('grad2')})`} d="M-60 460 C 240 380, 540 580, 860 470 S 1280 360, 1500 470" />
        <path id={id('p3')} className="fl-line fl-l3"  stroke={`url(#${id('grad1')})`} d="M-60 720 C 320 650, 640 830, 980 710 S 1340 610, 1500 690" />
        <path id={id('p4')} className="fl-line fl-l4"  stroke={`url(#${id('grad2')})`} d="M260 -60 C 360 220, 160 480, 420 690 S 640 880, 700 960" />
        <path id={id('p5')} className="fl-line fl-l5"  stroke={`url(#${id('grad1')})`} d="M1180 -60 C 1080 200, 1300 430, 1040 640 S 880 840, 840 960" />

        {/* glowing particles travelling along the pathways */}
        <circle className="fl-dot"        r="3">   <animateMotion dur="13s" repeatCount="indefinite">          <mpath href={`#${id('p1')}`} /></animateMotion></circle>
        <circle className="fl-dot fl-d2"  r="2.4"> <animateMotion dur="17s" repeatCount="indefinite" begin="2s"><mpath href={`#${id('p2')}`} /></animateMotion></circle>
        <circle className="fl-dot"        r="2.8"> <animateMotion dur="15s" repeatCount="indefinite" begin="5s"><mpath href={`#${id('p3')}`} /></animateMotion></circle>
        <circle className="fl-dot fl-d2"  r="2.2"> <animateMotion dur="19s" repeatCount="indefinite" begin="1s"><mpath href={`#${id('p4')}`} /></animateMotion></circle>
        <circle className="fl-dot"        r="2.6"> <animateMotion dur="16s" repeatCount="indefinite" begin="7s"><mpath href={`#${id('p5')}`} /></animateMotion></circle>
        <circle className="fl-dot fl-d2"  r="2">   <animateMotion dur="21s" repeatCount="indefinite" begin="9s"><mpath href={`#${id('p1')}`} /></animateMotion></circle>
      </svg>
    </div>
  );
}
