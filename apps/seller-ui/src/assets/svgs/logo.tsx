// components/common/CommerzaLogo.tsx
"use client";
import React, { useEffect, useRef } from "react";

type Variant = "primary" | "stacked" | "minimal" | "dark";
type Size    = "xs" | "sm" | "md" | "lg";

interface CommerzaLogoProps {
  variant?:    Variant;
  size?:       Size;
  showTagline?: boolean;
  animated?:   boolean;
  className?:  string;
}

const SCALE: Record<Size, number> = {
  xs: 0.45, sm: 0.65, md: 1, lg: 1.4,
};

const VARIANTS = {
  primary: {
    primary:   "#1E3A8A",
    accent:    "#2563EB",
    light:     "#60A5FA",
    wordFill:  "#1E3A8A",
    tagFill:   "#6B7280",
    bg:        "transparent",
    tagline:   "COMMERCE · EVOLVED",
  },
  stacked: {
    primary:   "#4338CA",
    accent:    "#818CF8",
    light:     "#A5B4FC",
    wordFill:  "#4338CA",
    tagFill:   "#9CA3AF",
    bg:        "transparent",
    tagline:   "MULTI-VENDOR MARKETPLACE",
  },
  minimal: {
    primary:   "#0F172A",
    accent:    "#E2E8F0",
    light:     "#94A3B8",
    wordFill:  "#0F172A",
    tagFill:   "#94A3B8",
    bg:        "transparent",
    tagline:   "COMMERCE · PLATFORM",
  },
  dark: {
    primary:   "#60A5FA",
    accent:    "#1D4ED8",
    light:     "#93C5FD",
    wordFill:  "#FFFFFF",
    tagFill:   "#475569",
    bg:        "#0F172A",
    tagline:   "COMMERCE · EVOLVED",
  },
};

const KEYFRAMES = `
  @keyframes czDash {
    from { stroke-dashoffset: 600; }
    to   { stroke-dashoffset: 0;   }
  }
  @keyframes czScale {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  @keyframes czFadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes czPulse {
    0%,100% { opacity: .4; transform: scale(.85); }
    50%     { opacity: 1;  transform: scale(1);   }
  }
  @keyframes czBlink {
    0%,100% { opacity: 1; }
    50%     { opacity: .25; }
  }
  @keyframes czSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .cz-root     { animation: czFadeUp .6s ease both; }
  .cz-dash     { stroke-dasharray: 600; animation: czDash 1.8s .2s ease both; }
  .cz-scale    { animation: czScale .6s .4s cubic-bezier(.34,1.56,.64,1) both; }
  .cz-scale2   { animation: czScale .6s .6s cubic-bezier(.34,1.56,.64,1) both; }
  .cz-pulse    { animation: czPulse 2.5s ease-in-out infinite; }
  .cz-blink    { animation: czBlink 3s   ease-in-out infinite; }
  .cz-spin     { animation: czSpin  20s  linear     infinite;  }
  .cz-spin-rev { animation: czSpin  14s  linear     infinite reverse; }
`;

export const CommerzaLogo: React.FC<CommerzaLogoProps> = ({
  variant    = "primary",
  size       = "md",
  showTagline = false,
  animated   = true,
  className  = "",
}) => {
  const v   = VARIANTS[variant];
  const sc  = SCALE[size];

  // ── PRIMARY variant ──────────────────────────────────────
  if (variant === "primary") {
    const W = 560, H = showTagline ? 145 : 118;
    return (
      <svg width={W * sc} height={H * sc} viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Commerza" role="img"
        className={`${animated ? "cz-root" : ""} ${className}`}>
        {animated && <style>{KEYFRAMES}</style>}

        {/* C-ring mark */}
        <path d="M90,14 A62,62 0 1,0 90,110"
          fill="none" stroke={v.primary} strokeWidth="11" strokeLinecap="round"
          className={animated ? "cz-dash" : ""} />
        <path d="M84,28 A48,48 0 1,0 84,96"
          fill="none" stroke={v.accent} strokeWidth="7" strokeLinecap="round"
          opacity=".55" className={animated ? "cz-dash" : ""} />

        {/* Inner filled circle */}
        <circle cx="52" cy="62" r="20" fill={v.primary}
          className={animated ? "cz-scale" : ""} />
        {/* Arrow up */}
        <polyline points="44,70 52,50 60,70"
          fill="none" stroke="white" strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round"
          className={animated ? "cz-scale" : ""} />
        <line x1="52" y1="50" x2="52" y2="74"
          stroke="white" strokeWidth="3.5" strokeLinecap="round"
          className={animated ? "cz-scale" : ""} />

        {/* Orbit accent dots */}
        <circle cx="104" cy="62" r="5" fill={v.accent}
          className={animated ? "cz-scale2" : ""} />
        <circle cx="95"  cy="30" r="3.5" fill={v.light}
          className={animated ? "cz-scale2" : ""} />
        <circle cx="95"  cy="94" r="3.5" fill={v.light}
          className={animated ? "cz-scale2" : ""} />

        {/* Wordmark */}
        <text x="136" y="88"
          fontFamily="var(--font-sans),system-ui,sans-serif"
          fontSize="72" fontWeight={500} letterSpacing="-2"
          fill={v.wordFill}>
          commerza
        </text>

        {/* Pulse dot on Z */}
        <circle cx="483" cy="64" r="5.5" fill={v.accent}
          className={animated ? "cz-pulse" : ""} />

        {/* Tagline */}
        {showTagline && (
          <text x="136" y="112"
            fontFamily="var(--font-sans),system-ui,sans-serif"
            fontSize="11" fontWeight={400} letterSpacing="3.5"
            fill={v.tagFill}>
            {v.tagline}
          </text>
        )}
      </svg>
    );
  }

  // ── STACKED variant ──────────────────────────────────────
  if (variant === "stacked") {
    const W = 248, H = showTagline ? 190 : 170;
    const hx = [104,138,138,104,70,70];
    const hy = [28, 48, 92, 112,92,48];
    const hexPts = hx.map((x,i)=>`${x},${hy[i]}`).join(" ");
    const hex2 = "104,38 128,53 128,87 104,102 80,87 80,53";

    return (
      <svg width={W * sc} height={H * sc} viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Commerza" role="img"
        className={`${animated ? "cz-root" : ""} ${className}`}>
        {animated && <style>{KEYFRAMES}</style>}

        {/* Spinning outline rings */}
        <g style={{ transformOrigin: "124px 70px" }}
          className={animated ? "cz-spin" : ""}>
          <polygon points="124,14 168,42 168,98 124,126 80,98 80,42"
            fill="none" stroke={v.primary} strokeWidth="1" opacity=".2" />
        </g>
        <g style={{ transformOrigin: "124px 70px" }}
          className={animated ? "cz-spin-rev" : ""}>
          <polygon points="124,22 160,46 160,94 124,118 88,94 88,46"
            fill="none" stroke={v.primary} strokeWidth=".8" opacity=".15" />
        </g>

        {/* Solid hex */}
        <polygon points={hexPts} fill={v.primary}
          className={animated ? "cz-scale" : ""} />
        <polygon points={hex2}
          fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.2" />

        {/* C inside hex */}
        <path d="M138,52 A22,22 0 1,0 138,88"
          fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"
          className={animated ? "cz-dash" : ""} />

        {/* Corner bracket accents */}
        <polyline points="138,52 144,52 144,46"
          fill="none" stroke={v.light} strokeWidth="2.5" strokeLinecap="round"
          className={animated ? "cz-scale2" : ""} />
        <polyline points="138,88 144,88 144,94"
          fill="none" stroke={v.light} strokeWidth="2.5" strokeLinecap="round"
          className={animated ? "cz-scale2" : ""} />

        {/* Hex corner blink dots */}
        {hx.map((x,i) => (
          <circle key={i} cx={x} cy={hy[i]} r="3.5" fill={v.accent}
            className={animated ? "cz-blink" : ""}
            style={animated ? { animationDelay: `${i*0.8}s` } : {}} />
        ))}

        {/* Wordmark */}
        <text x="124" y="154"
          fontFamily="var(--font-sans),system-ui,sans-serif"
          fontSize="22" fontWeight={500} letterSpacing="-0.6"
          fill={v.wordFill} textAnchor="middle">
          commerza
        </text>

        {/* Tagline */}
        {showTagline && (
          <text x="124" y="174"
            fontFamily="var(--font-sans),system-ui,sans-serif"
            fontSize="8" fontWeight={400} letterSpacing="2.5"
            fill={v.tagFill} textAnchor="middle">
            {v.tagline}
          </text>
        )}
      </svg>
    );
  }

  // ── MINIMAL variant ──────────────────────────────────────
  if (variant === "minimal") {
    const W = 520, H = showTagline ? 130 : 110;
    return (
      <svg width={W * sc} height={H * sc} viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Commerza" role="img"
        className={`${animated ? "cz-root" : ""} ${className}`}>
        {animated && <style>{KEYFRAMES}</style>}

        {/* Concentric C arcs */}
        <path d="M82,18 A52,52 0 1,0 82,102"
          fill="none" stroke={v.primary} strokeWidth="14" strokeLinecap="round"
          className={animated ? "cz-dash" : ""} />
        <path d="M82,31 A39,39 0 1,0 82,89"
          fill="none" stroke={v.accent} strokeWidth="8" strokeLinecap="round"
          className={animated ? "cz-dash" : ""} />
        <path d="M82,44 A26,26 0 1,0 82,76"
          fill="none" stroke={v.primary} strokeWidth="5" strokeLinecap="round"
          className={animated ? "cz-dash" : ""} />

        {/* Bold end caps */}
        <circle cx="82" cy="18" r="7" fill={v.primary}
          className={animated ? "cz-scale" : ""} />
        <circle cx="82" cy="102" r="7" fill={v.primary}
          className={animated ? "cz-scale" : ""} />

        {/* Center dot */}
        <circle cx="36" cy="60" r="10" fill={v.primary}
          className={animated ? "cz-scale2" : ""} />
        <circle cx="36" cy="60" r="4" fill="white"
          className={animated ? "cz-scale2" : ""} />

        {/* Wordmark */}
        <text x="134" y="84"
          fontFamily="var(--font-sans),system-ui,sans-serif"
          fontSize="64" fontWeight={500} letterSpacing="-2.5"
          fill={v.wordFill}>
          commerza
        </text>

        {showTagline && (
          <text x="134" y="108"
            fontFamily="var(--font-sans),system-ui,sans-serif"
            fontSize="11" fontWeight={400} letterSpacing="4"
            fill={v.tagFill}>
            {v.tagline}
          </text>
        )}
      </svg>
    );
  }

  // ── DARK variant ─────────────────────────────────────────
  const W = 560, H = showTagline ? 148 : 126;
  return (
    <svg width={W * sc} height={H * sc} viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Commerza" role="img"
      className={`${animated ? "cz-root" : ""} ${className}`}>
      {animated && <style>{KEYFRAMES}</style>}

      {/* Dark bg */}
      <rect x="0" y="0" width={W} height={H} rx="12" fill={v.bg} />

      {/* Ring marks */}
      <circle cx="68" cy="63" r="46" fill="none" stroke="#334155" strokeWidth="1.5"
        className={animated ? "cz-dash" : ""} />
      <circle cx="68" cy="63" r="34" fill="none" stroke="#475569" strokeWidth="1"
        className={animated ? "cz-dash" : ""} />

      {/* Bright C arc */}
      <path d="M100,31 A42,42 0 1,0 100,95"
        fill="none" stroke={v.primary} strokeWidth="6" strokeLinecap="round"
        className={animated ? "cz-dash" : ""} />

      {/* Center circle */}
      <circle cx="68" cy="63" r="16" fill={v.accent}
        className={animated ? "cz-scale" : ""} />

      {/* Z-mark inside */}
      <polyline points="60,55 76,55 60,71 76,71"
        fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
        strokeLinejoin="round" className={animated ? "cz-scale" : ""} />

      {/* Orbit pulse dots */}
      <circle cx="68" cy="17" r="4" fill={v.light}
        className={animated ? "cz-pulse" : ""} />
      <circle cx="68" cy="109" r="4" fill={v.light}
        className={animated ? "cz-pulse" : ""}
        style={animated ? { animationDelay: "1.2s" } : {}} />
      <circle cx="114" cy="63" r="3" fill={v.accent}
        className={animated ? "cz-blink" : ""} />

      {/* Wordmark */}
      <text x="152" y="86"
        fontFamily="var(--font-sans),system-ui,sans-serif"
        fontSize="62" fontWeight={500} letterSpacing="-1.8"
        fill={v.wordFill}>
        commerza
      </text>

      {showTagline && (
        <text x="152" y="112"
          fontFamily="var(--font-sans),system-ui,sans-serif"
          fontSize="11" fontWeight={400} letterSpacing="3.5"
          fill={v.tagFill}>
          {v.tagline}
        </text>
      )}
    </svg>
  );
};

export default CommerzaLogo;