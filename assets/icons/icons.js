/*
  Custom line-icon set for Acrylic Signage.
  Simple, single-weight (1.5px) line icons drawn on a 48x48 grid.
  Each entry returns an inline SVG string. Stroke uses currentColor so
  the icon inherits text colour. Designed to feel hand-drawn-precise,
  matching the editorial/minimal aesthetic of the site.
*/
window.AS_ICONS = {
  /* ---- Sign / material types ---- */

  // Clear acrylic panel with standoff fixings (the hero product)
  acrylic: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="9" y="11" width="30" height="22" rx="1.5"/>
    <line x1="13.5" y1="15.5" x2="34.5" y2="15.5" opacity="0.45"/>
    <circle cx="13" cy="15" r="2.4" fill="currentColor" stroke="none"/>
    <circle cx="35" cy="15" r="2.4" fill="currentColor" stroke="none"/>
    <circle cx="13" cy="29" r="2.4" fill="currentColor" stroke="none"/>
    <circle cx="35" cy="29" r="2.4" fill="currentColor" stroke="none"/>
    <path d="M22 21h4M22 24.5h8" opacity="0.55"/>
  </svg>`,

  // Dibond / aluminium composite — layered edge
  dibond: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M8 18 L40 14 L40 30 L8 34 Z"/>
    <path d="M8 18 L8 22 L40 18 L40 14" opacity="0.5"/>
    <path d="M8 30 L8 34" opacity="0.5"/>
    <line x1="40" y1="26" x2="40" y2="30" opacity="0.5"/>
    <path d="M14 24.5l3 .4M14 27l8 1" opacity="0.55"/>
  </svg>`,

  // Corex / fluted board — corrugated flutes
  corex: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="9" y="14" width="30" height="20" rx="1.5"/>
    <line x1="15" y1="14" x2="15" y2="34" opacity="0.45"/>
    <line x1="21" y1="14" x2="21" y2="34" opacity="0.45"/>
    <line x1="27" y1="14" x2="27" y2="34" opacity="0.45"/>
    <line x1="33" y1="14" x2="33" y2="34" opacity="0.45"/>
  </svg>`,

  // Foamex / PVC — solid flat panel with bevel
  foamex: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="10" y="13" width="28" height="22" rx="1.5"/>
    <rect x="14" y="17" width="20" height="14" rx="1" opacity="0.5"/>
  </svg>`,

  /* ---- Features / process ---- */

  // Free artwork check — magnifier over a layout
  artwork: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="10" y="12" width="20" height="24" rx="1.5"/>
    <path d="M14 18h8M14 22h12M14 26h6" opacity="0.55"/>
    <circle cx="30" cy="30" r="6.5"/>
    <line x1="34.6" y1="34.6" x2="39" y2="39"/>
  </svg>`,

  // Proof before print — document with tick
  proof: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M13 9h15l7 7v23a1 1 0 0 1-1 1H13a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1Z"/>
    <path d="M28 9v7h7" opacity="0.55"/>
    <path d="M18 28l4 4 8-9"/>
  </svg>`,

  // Made & shipped fast — box with motion lines
  shipping: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M18 14l13 4v14l-13 4-13-4V18z" transform="translate(2 1)"/>
    <path d="M20 19v14M7 20l13 4 13-4" transform="translate(2 1)" opacity="0.5"/>
    <path d="M38 20h6M40 26h6M42 32h5" opacity="0.7"/>
  </svg>`,

  // UV / weatherproof — sun over wave
  weather: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="24" cy="19" r="6"/>
    <path d="M24 8v3M24 27v3M13 19h3M32 19h3M16 11l2 2M30 11l-2 2" opacity="0.7"/>
    <path d="M9 36c3-3 5-3 7.5 0S21 39 24 36s5-3 7.5 0S37 39 39 36" opacity="0.55"/>
  </svg>`,

  // Precision cut — crosshair / cut path
  precision: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="24" cy="24" r="13"/>
    <path d="M24 7v8M24 33v8M7 24h8M33 24h8" opacity="0.7"/>
    <circle cx="24" cy="24" r="3.2" fill="currentColor" stroke="none"/>
  </svg>`,

  /* ---- Applications ---- */

  // Office reception / business
  reception: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M8 38h32"/>
    <path d="M12 38V16h11v22"/>
    <path d="M23 38V22h13v16"/>
    <path d="M16 21h3M16 26h3M16 31h3M28 27h4M28 32h4" opacity="0.55"/>
  </svg>`,

  // Door / wayfinding plaque
  wayfinding: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="12" y="9" width="24" height="30" rx="2"/>
    <line x1="17" y1="16" x2="31" y2="16" opacity="0.55"/>
    <line x1="17" y1="21" x2="27" y2="21" opacity="0.55"/>
    <path d="M28 28l5 4-5 4z" opacity="0.7"/>
  </svg>`,

  // House number / home
  home: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10 22 24 11l14 11"/>
    <path d="M13 21v16h22V21"/>
    <path d="M21 37v-8h6v8" opacity="0.55"/>
  </svg>`,

  // Wall logo / lobby brand
  logo: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="7" y="13" width="34" height="22" rx="2"/>
    <circle cx="18" cy="24" r="4.5"/>
    <path d="M27 20h8M27 24h8M27 28h5" opacity="0.6"/>
  </svg>`,

  // Menu / hospitality board
  menu: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="13" y="8" width="22" height="32" rx="2"/>
    <path d="M19 16h10M19 21h10M19 26h7M19 31h10" opacity="0.6"/>
  </svg>`,

  // Safety / notice
  safety: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M24 8l14 6v9c0 9-6 14-14 17-8-3-14-8-14-17v-9z"/>
    <path d="M24 18v8M24 30v.5" opacity="0.7"/>
  </svg>`,

  /* ---- UI ---- */
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>`,
  arrowUpRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5 12 10 17 19 7"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" y1="12" x2="18" y2="12"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`
};
