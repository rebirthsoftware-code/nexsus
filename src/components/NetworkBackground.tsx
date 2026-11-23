/**
 * "Nexus = bağlantı" fikrini görselleştiren, saf SVG ile çizilmiş ağ animasyonu.
 * JS çalıştırmaz; CSS animasyonlarıyla hafif ve performanslıdır.
 */
const nodes = [
  { x: 8, y: 22, r: 3 },
  { x: 22, y: 68, r: 2.5 },
  { x: 30, y: 30, r: 4 },
  { x: 48, y: 52, r: 5 },
  { x: 62, y: 20, r: 3 },
  { x: 70, y: 74, r: 3.5 },
  { x: 86, y: 40, r: 4 },
  { x: 92, y: 80, r: 2.5 },
  { x: 40, y: 84, r: 2.5 },
  { x: 78, y: 10, r: 2 },
];

const links: Array<[number, number]> = [
  [0, 2], [2, 3], [1, 3], [3, 4], [3, 5], [4, 6], [5, 6], [6, 7], [1, 8], [8, 5], [4, 9], [9, 6], [0, 1],
];

export function NetworkBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-600/30 blur-[120px] animate-float-slow" />
      <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-accent-500/20 blur-[120px] animate-float" />
      <div className="absolute inset-0 grid-bg" />

      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-70">
        <defs>
          <linearGradient id="net-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="net-node">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="45%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
        </defs>
        {links.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="url(#net-line)"
            strokeWidth="0.18"
            strokeDasharray="1.5 2"
            className="animate-dash"
            style={{ animationDuration: `${8 + (i % 5) * 2}s` }}
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
            <circle cx={n.x} cy={n.y} r={n.r * 1.6} fill="url(#net-node)" opacity="0.35">
              <animate attributeName="r" values={`${n.r * 1.3};${n.r * 2.1};${n.r * 1.3}`} dur={`${4 + (i % 4)}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={n.x} cy={n.y} r={n.r * 0.45} fill="#fff" />
          </g>
        ))}
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night-950" />
    </div>
  );
}
