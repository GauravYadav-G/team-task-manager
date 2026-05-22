import React from 'react';

export default function Logo({ className = 'w-8 h-8', size }) {
  const dimensions = size ? { width: size, height: size } : {};
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...dimensions}
    >
      <defs>
        {/* Premium gold-sand metallic gradient matching the workspace colors */}
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D885" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>
        <linearGradient id="dark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D2D29" />
          <stop offset="100%" stopColor="#111110" />
        </linearGradient>
        <filter id="premium-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Styled outer icon base (nested squircle) */}
      <rect 
        x="4" 
        y="4" 
        width="92" 
        height="92" 
        rx="28" 
        fill="url(#dark-gradient)" 
        stroke="url(#gold-gradient)" 
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Intersecting geometric shapes representing task blocks & pipeline velocity */}
      {/* Left board column */}
      <rect
        x="24"
        y="28"
        width="14"
        height="44"
        rx="6"
        fill="url(#gold-gradient)"
        opacity="0.85"
      />

      {/* Middle board column (offset to represent kanban columns/cards flow) */}
      <rect
        x="43"
        y="20"
        width="14"
        height="48"
        rx="6"
        fill="url(#gold-gradient)"
        filter="url(#premium-shadow)"
      />

      {/* Right board column */}
      <rect
        x="62"
        y="36"
        width="14"
        height="32"
        rx="6"
        fill="url(#gold-gradient)"
        opacity="0.65"
      />

      {/* Connecting speed-flow line that arcs across the board elements */}
      <path
        d="M18 64 C 30 76, 70 76, 82 64"
        stroke="url(#gold-gradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1 6"
        opacity="0.9"
      />
    </svg>
  );
}
