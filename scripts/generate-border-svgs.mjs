#!/usr/bin/env node
/**
 * Generates 20 avatar border SVGs (Magnific-style decorative frames).
 * Center ~72% is transparent for profile photo overlay in UserAvatar.
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const OUT = path.join(process.cwd(), "public", "borders");

const borders = [
  {
    file: "border-neon-cyan.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs><filter id="g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <circle cx="100" cy="100" r="92" stroke="#22d3ee" stroke-width="6" filter="url(#g)"/>
  <circle cx="100" cy="100" r="86" stroke="#06b6d4" stroke-width="2"/>
  <rect x="94" y="4" width="12" height="12" rx="2" fill="#67e8f9" transform="rotate(45 100 10)"/>
  <rect x="94" y="184" width="12" height="12" rx="2" fill="#67e8f9" transform="rotate(45 100 190)"/>
  <rect x="4" y="94" width="12" height="12" rx="2" fill="#67e8f9" transform="rotate(45 10 100)"/>
  <rect x="184" y="94" width="12" height="12" rx="2" fill="#67e8f9" transform="rotate(45 190 100)"/>
</svg>`,
  },
  {
    file: "border-neon-pink.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs><filter id="g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <circle cx="100" cy="100" r="90" stroke="#f472b6" stroke-width="8" filter="url(#g)"/>
  <circle cx="100" cy="100" r="82" stroke="#ec4899" stroke-width="2" stroke-dasharray="8 6"/>
  <circle cx="100" cy="14" r="6" fill="#fbcfe8"/><circle cx="100" cy="186" r="6" fill="#fbcfe8"/>
  <circle cx="14" cy="100" r="6" fill="#fbcfe8"/><circle cx="186" cy="100" r="6" fill="#fbcfe8"/>
</svg>`,
  },
  {
    file: "border-neon-lime.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <polygon points="100,6 112,22 100,18 88,22" fill="#84cc16"/>
  <polygon points="100,194 112,178 100,182 88,178" fill="#84cc16"/>
  <polygon points="6,100 22,88 18,100 22,112" fill="#84cc16"/>
  <polygon points="194,100 178,112 182,100 178,88" fill="#84cc16"/>
  <circle cx="100" cy="100" r="91" stroke="#a3e635" stroke-width="7"/>
  <circle cx="100" cy="100" r="84" stroke="#65a30d" stroke-width="2"/>
  <circle cx="62" cy="62" r="4" fill="#bef264"/><circle cx="138" cy="62" r="4" fill="#bef264"/>
  <circle cx="62" cy="138" r="4" fill="#bef264"/><circle cx="138" cy="138" r="4" fill="#bef264"/>
</svg>`,
  },
  {
    file: "border-rainbow.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" stroke="#ef4444" stroke-width="8" stroke-dasharray="47 235" stroke-linecap="round" transform="rotate(-90 100 100)"/>
  <circle cx="100" cy="100" r="90" stroke="#f97316" stroke-width="8" stroke-dasharray="47 235" stroke-linecap="round" transform="rotate(-54 100 100)"/>
  <circle cx="100" cy="100" r="90" stroke="#eab308" stroke-width="8" stroke-dasharray="47 235" stroke-linecap="round" transform="rotate(-18 100 100)"/>
  <circle cx="100" cy="100" r="90" stroke="#22c55e" stroke-width="8" stroke-dasharray="47 235" stroke-linecap="round" transform="rotate(18 100 100)"/>
  <circle cx="100" cy="100" r="90" stroke="#3b82f6" stroke-width="8" stroke-dasharray="47 235" stroke-linecap="round" transform="rotate(54 100 100)"/>
  <circle cx="100" cy="100" r="90" stroke="#a855f7" stroke-width="8" stroke-dasharray="47 235" stroke-linecap="round" transform="rotate(90 100 100)"/>
  <circle cx="100" cy="100" r="83" stroke="#e5e7eb" stroke-width="2"/>
</svg>`,
  },
  {
    file: "border-floral.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="88" stroke="#16a34a" stroke-width="4"/>
  <ellipse cx="100" cy="18" rx="10" ry="14" fill="#4ade80" transform="rotate(0 100 18)"/>
  <ellipse cx="162" cy="50" rx="10" ry="14" fill="#86efac" transform="rotate(60 162 50)"/>
  <ellipse cx="162" cy="150" rx="10" ry="14" fill="#4ade80" transform="rotate(120 162 150)"/>
  <ellipse cx="100" cy="182" rx="10" ry="14" fill="#86efac" transform="rotate(180 100 182)"/>
  <ellipse cx="38" cy="150" rx="10" ry="14" fill="#4ade80" transform="rotate(240 38 150)"/>
  <ellipse cx="38" cy="50" rx="10" ry="14" fill="#86efac" transform="rotate(300 38 50)"/>
  <circle cx="100" cy="18" r="5" fill="#f472b6"/><circle cx="162" cy="150" r="5" fill="#f472b6"/>
  <circle cx="38" cy="50" r="5" fill="#f472b6"/>
</svg>`,
  },
  {
    file: "border-crown.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="102" r="86" stroke="#ca8a04" stroke-width="6"/>
  <circle cx="100" cy="102" r="79" stroke="#fde047" stroke-width="2"/>
  <path d="M55 42 L68 28 L82 42 L100 22 L118 42 L132 28 L145 42 L138 58 L62 58 Z" fill="#eab308" stroke="#a16207" stroke-width="2"/>
  <circle cx="68" cy="38" r="4" fill="#fef08a"/><circle cx="100" cy="30" r="5" fill="#fef08a"/><circle cx="132" cy="38" r="4" fill="#fef08a"/>
  <circle cx="100" cy="178" r="6" fill="#eab308"/>
</svg>`,
  },
  {
    file: "border-diamond.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" stroke="#94a3b8" stroke-width="4"/>
  <polygon points="100,8 108,20 100,16 92,20" fill="#38bdf8"/>
  <polygon points="192,100 180,108 184,100 180,92" fill="#38bdf8"/>
  <polygon points="100,192 108,180 100,184 92,180" fill="#38bdf8"/>
  <polygon points="8,100 20,108 16,100 20,92" fill="#38bdf8"/>
  <polygon points="55,35 65,45 55,55 45,45" fill="#7dd3fc" stroke="#0ea5e9"/>
  <polygon points="145,35 155,45 145,55 135,45" fill="#7dd3fc" stroke="#0ea5e9"/>
  <polygon points="55,145 65,155 55,165 45,155" fill="#7dd3fc" stroke="#0ea5e9"/>
  <polygon points="145,145 155,155 145,165 135,155" fill="#7dd3fc" stroke="#0ea5e9"/>
</svg>`,
  },
  {
    file: "border-fire.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="87" stroke="#ea580c" stroke-width="5"/>
  <path d="M100 6 C108 20 95 28 100 38 C105 28 92 20 100 6Z" fill="#f97316"/>
  <path d="M170 55 C158 62 160 72 152 78 C162 70 168 62 170 55Z" fill="#fb923c"/>
  <path d="M194 100 C180 98 176 108 168 112 C178 104 186 100 194 100Z" fill="#f97316"/>
  <path d="M170 145 C168 158 156 160 152 168 C162 158 168 150 170 145Z" fill="#fb923c"/>
  <path d="M100 194 C92 180 105 172 100 162 C95 172 108 180 100 194Z" fill="#f97316"/>
  <path d="M30 145 C32 158 44 160 48 168 C38 158 32 150 30 145Z" fill="#fb923c"/>
  <path d="M6 100 C20 102 24 92 32 88 C22 96 14 100 6 100Z" fill="#f97316"/>
  <path d="M30 55 C32 42 44 40 48 32 C38 42 32 50 30 55Z" fill="#fb923c"/>
</svg>`,
  },
  {
    file: "border-ice.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="89" stroke="#7dd3fc" stroke-width="6"/>
  <circle cx="100" cy="100" r="82" stroke="#e0f2fe" stroke-width="2"/>
  <path d="M100 10 L104 26 L100 20 L96 26 Z" fill="#38bdf8"/>
  <path d="M100 190 L104 174 L100 180 L96 174 Z" fill="#38bdf8"/>
  <path d="M10 100 L26 96 L20 100 L26 104 Z" fill="#38bdf8"/>
  <path d="M190 100 L174 104 L180 100 L174 96 Z" fill="#38bdf8"/>
  <path d="M48 48 L58 58 M152 48 L142 58 M48 152 L58 142 M152 152 L142 142" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
  <circle cx="62" cy="62" r="4" fill="#bae6fd"/><circle cx="138" cy="138" r="4" fill="#bae6fd"/>
</svg>`,
  },
  {
    file: "border-stars.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="88" stroke="#6366f1" stroke-width="4"/>
  <polygon points="100,6 103,16 100,12 97,16" fill="#fbbf24"/>
  <polygon points="170,45 173,55 170,51 167,55" fill="#fbbf24"/>
  <polygon points="194,100 184,103 188,100 184,97" fill="#fbbf24"/>
  <polygon points="170,155 173,145 170,149 167,145" fill="#fbbf24"/>
  <polygon points="100,194 103,184 100,188 97,184" fill="#fbbf24"/>
  <polygon points="30,155 33,145 30,149 27,145" fill="#fbbf24"/>
  <polygon points="6,100 16,103 12,100 16,97" fill="#fbbf24"/>
  <polygon points="30,45 33,55 30,51 27,55" fill="#fbbf24"/>
  <circle cx="100" cy="100" r="80" stroke="#a5b4fc" stroke-width="2" stroke-dasharray="4 8"/>
</svg>`,
  },
  {
    file: "border-pixel.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect x="36" y="36" width="128" height="128" rx="64" stroke="#1e293b" stroke-width="8" fill="none"/>
  <rect x="44" y="44" width="112" height="112" rx="56" stroke="#64748b" stroke-width="4" fill="none" stroke-dasharray="8 8"/>
  <rect x="88" y="28" width="24" height="12" fill="#22c55e"/>
  <rect x="88" y="160" width="24" height="12" fill="#22c55e"/>
  <rect x="28" y="88" width="12" height="24" fill="#22c55e"/>
  <rect x="160" y="88" width="12" height="24" fill="#22c55e"/>
  <rect x="52" y="52" width="10" height="10" fill="#4ade80"/><rect x="138" y="138" width="10" height="10" fill="#4ade80"/>
</svg>`,
  },
  {
    file: "border-heart.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="88" stroke="#f43f5e" stroke-width="5"/>
  <path d="M100 14 C94 8 84 10 84 20 C84 28 100 36 100 36 C100 36 116 28 116 20 C116 10 106 8 100 14Z" fill="#fb7185"/>
  <path d="M168 72 C162 66 152 68 152 78 C152 86 168 94 168 94 C168 94 184 86 184 78 C184 68 174 66 168 72Z" fill="#fda4af"/>
  <path d="M168 128 C162 134 152 132 152 122 C152 114 168 106 168 106 C168 106 184 114 184 122 C184 132 174 134 168 128Z" fill="#fb7185"/>
  <path d="M100 186 C94 192 84 190 84 180 C84 172 100 164 100 164 C100 164 116 172 116 180 C116 190 106 192 100 186Z" fill="#fda4af"/>
  <path d="M32 128 C26 134 16 132 16 122 C16 114 32 106 32 106 C32 106 48 114 48 122 C48 132 38 134 32 128Z" fill="#fb7185"/>
  <path d="M32 72 C26 66 16 68 16 78 C16 86 32 94 32 94 C32 94 48 86 48 78 C48 68 38 66 32 72Z" fill="#fda4af"/>
</svg>`,
  },
  {
    file: "border-ocean.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" stroke="#0369a1" stroke-width="5"/>
  <path d="M30 55 Q45 45 60 55 T90 55 T120 55 T150 55" stroke="#0ea5e9" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M50 145 Q65 135 80 145 T110 145 T140 145 T170 145" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="45" cy="100" r="5" fill="#7dd3fc"/><circle cx="155" cy="100" r="5" fill="#7dd3fc"/>
  <path d="M100 12 L105 22 L100 18 L95 22 Z" fill="#0284c7"/>
  <path d="M100 188 L105 178 L100 182 L95 178 Z" fill="#0284c7"/>
</svg>`,
  },
  {
    file: "border-sunburst.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <g stroke="#f59e0b" stroke-width="4" stroke-linecap="round">
    <line x1="100" y1="8" x2="100" y2="24"/><line x1="100" y1="176" x2="100" y2="192"/>
    <line x1="8" y1="100" x2="24" y2="100"/><line x1="176" y1="100" x2="192" y2="100"/>
    <line x1="35" y1="35" x2="47" y2="47"/><line x1="153" y1="153" x2="165" y2="165"/>
    <line x1="153" y1="47" x2="165" y2="35"/><line x1="35" y1="165" x2="47" y2="153"/>
  </g>
  <circle cx="100" cy="100" r="78" stroke="#fbbf24" stroke-width="8"/>
  <circle cx="100" cy="100" r="70" stroke="#fde68a" stroke-width="2"/>
</svg>`,
  },
  {
    file: "border-moon.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="88" stroke="#312e81" stroke-width="5"/>
  <path d="M100 16 A20 20 0 1 1 100 56 A14 14 0 1 0 100 16Z" fill="#c4b5fd"/>
  <path d="M168 72 A16 16 0 1 1 168 104 A12 12 0 1 0 168 72Z" fill="#a78bfa"/>
  <path d="M32 96 A16 16 0 1 1 32 128 A12 12 0 1 0 32 96Z" fill="#a78bfa"/>
  <path d="M100 144 A20 20 0 1 1 100 184 A14 14 0 1 0 100 144Z" fill="#c4b5fd"/>
  <circle cx="130" cy="40" r="2" fill="#fef08a"/><circle cx="60" cy="170" r="2" fill="#fef08a"/>
  <circle cx="170" cy="130" r="1.5" fill="#fef08a"/>
</svg>`,
  },
  {
    file: "border-lightning.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="89" stroke="#4f46e5" stroke-width="5"/>
  <path d="M108 10 L92 50 L108 50 L88 90 L120 48 L102 48 L118 10Z" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
  <path d="M112 190 L96 150 L112 150 L92 110 L124 152 L106 152 L122 190Z" fill="#fde047"/>
  <path d="M10 108 L50 92 L50 108 L90 88 L48 120 L48 102 L10 118Z" fill="#facc15"/>
  <path d="M190 92 L150 108 L150 92 L110 112 L152 80 L152 98 L190 82Z" fill="#fde047"/>
</svg>`,
  },
  {
    file: "border-rosegold.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="92" stroke="#be185d" stroke-width="7"/>
  <circle cx="100" cy="100" r="84" stroke="#fda4af" stroke-width="3"/>
  <circle cx="100" cy="100" r="77" stroke="#fecdd3" stroke-width="1"/>
  <circle cx="100" cy="14" r="6" fill="#f9a8d4"/><circle cx="186" cy="100" r="6" fill="#f9a8d4"/>
  <circle cx="100" cy="186" r="6" fill="#f9a8d4"/><circle cx="14" cy="100" r="6" fill="#f9a8d4"/>
</svg>`,
  },
  {
    file: "border-chrome.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs><linearGradient id="c" x1="0" y1="0" x2="200" y2="200"><stop offset="0%" stop-color="#f8fafc"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient></defs>
  <circle cx="100" cy="100" r="91" stroke="url(#c)" stroke-width="9"/>
  <circle cx="100" cy="100" r="82" stroke="#64748b" stroke-width="2"/>
  <rect x="92" y="6" width="16" height="8" rx="2" fill="#cbd5e1"/><rect x="92" y="186" width="16" height="8" rx="2" fill="#cbd5e1"/>
  <rect x="6" y="92" width="8" height="16" rx="2" fill="#cbd5e1"/><rect x="186" y="92" width="8" height="16" rx="2" fill="#cbd5e1"/>
</svg>`,
  },
  {
    file: "border-cosmic.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" stroke="#4c1d95" stroke-width="6"/>
  <circle cx="100" cy="100" r="83" stroke="#7c3aed" stroke-width="2" stroke-dasharray="3 9"/>
  <circle cx="55" cy="45" r="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2"/>
  <circle cx="150" cy="70" r="5" fill="#312e81"/><circle cx="140" cy="150" r="6" fill="#1e1b4b" stroke="#c4b5fd"/>
  <circle cx="50" cy="140" r="4" fill="#fef08a"/><circle cx="165" cy="120" r="2" fill="#fef08a"/>
  <circle cx="35" cy="85" r="2" fill="#fef08a"/><circle cx="100" cy="12" r="3" fill="#fde047"/>
</svg>`,
  },
  {
    file: "border-jungle.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="87" stroke="#15803d" stroke-width="5"/>
  <path d="M100 10 C90 18 95 28 100 34 C105 28 110 18 100 10Z" fill="#22c55e"/>
  <path d="M175 65 C165 72 168 82 175 88 C182 80 180 70 175 65Z" fill="#4ade80"/>
  <path d="M175 135 C182 142 180 152 175 158 C168 150 165 140 175 135Z" fill="#22c55e"/>
  <path d="M100 190 C110 182 105 172 100 166 C95 172 90 182 100 190Z" fill="#4ade80"/>
  <path d="M25 135 C18 142 20 152 25 158 C32 150 35 140 25 135Z" fill="#22c55e"/>
  <path d="M25 65 C32 58 35 48 25 42 C18 50 20 60 25 65Z" fill="#4ade80"/>
  <circle cx="62" cy="62" r="5" fill="#f97316"/><circle cx="138" cy="138" r="5" fill="#f97316"/>
</svg>`,
  },
];

await mkdir(OUT, { recursive: true });

for (const { file, svg } of borders) {
  await writeFile(path.join(OUT, file), svg.trim() + "\n", "utf8");
  console.log(`  ✓ ${file}`);
}

console.log(`\nGenerated ${borders.length} border SVGs in public/borders/`);