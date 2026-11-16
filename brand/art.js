// Sticker art shared by the brand image sources in this folder. Any element
// with a data-art attribute is filled with the matching drawing, so each page
// can place and size the art with plain CSS.
//
// The drawings match src/components/LogoMark.astro and Sticker.astro.
//
// The m-* classes mark the parts brand/motion.css moves in the share video.
// They change nothing in a still image.
const INK = '#5B4636';

const sheep = (stroke = 2.6, detail = true) => `
  <rect x="34" y="54" width="7" height="17" rx="3.5" fill="${INK}"/>
  <rect x="55" y="54" width="7" height="17" rx="3.5" fill="${INK}"/>
  <path d="M26 54 a12 12 0 0 1 -2 -22 a13 13 0 0 1 20 -12 a14 14 0 0 1 24 2 a12 12 0 0 1 8 22 a11 11 0 0 1 -12 12 a12 12 0 0 1 -20 2 a12 12 0 0 1 -18 -4 z" fill="#FDF8EE" stroke="${INK}" stroke-width="${stroke}" stroke-linejoin="round"/>
  ${detail ? `<ellipse cx="63" cy="29" rx="5" ry="3" transform="rotate(-25 63 29)" fill="#D9A98B" stroke="${INK}" stroke-width="2.2"/>` : ''}
  <ellipse cx="74" cy="39" rx="10.5" ry="11.5" fill="#EBC4A8" stroke="${INK}" stroke-width="${stroke}"/>
  ${detail ? `<circle cx="73" cy="27.5" r="5.5" fill="#FDF8EE" stroke="${INK}" stroke-width="2.2"/>` : ''}
  <path d="M68 38 q2.2 -2.8 4.4 0" fill="none" stroke="${INK}" stroke-width="${detail ? 2 : 2.6}" stroke-linecap="round"/>
  <path d="M76 38 q2.2 -2.8 4.4 0" fill="none" stroke="${INK}" stroke-width="${detail ? 2 : 2.6}" stroke-linecap="round"/>
  ${detail ? `<circle cx="67.5" cy="43" r="2.2" fill="#E39A8A" opacity="0.8"/>
  <circle cx="80.5" cy="43" r="2.2" fill="#E39A8A" opacity="0.8"/>
  <path d="M72 44.5 q2 1.8 4 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>` : ''}`;

const sprig = (leaf, stem) => `
  <svg class="m-sprig" viewBox="0 0 64 72">
    <path d="M32 70 C32 50 30 30 34 6" fill="none" stroke="${stem}" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="22" cy="52" rx="10" ry="5" transform="rotate(35 22 52)" fill="${leaf}"/>
    <ellipse cx="43" cy="44" rx="10" ry="5" transform="rotate(-35 43 44)" fill="${leaf}"/>
    <ellipse cx="22" cy="32" rx="9" ry="4.5" transform="rotate(35 22 32)" fill="${leaf}"/>
    <ellipse cx="43" cy="24" rx="9" ry="4.5" transform="rotate(-35 43 24)" fill="${leaf}"/>
    <ellipse cx="34" cy="9" rx="4.5" ry="8" fill="${leaf}"/>
  </svg>`;

const HAIR = '#8B6247';
const SKIN = '#E2B594';
const ROBE = '#FDF8EE';
const ROSE = '#E8B3A0';
const WOOD = '#C99A6B';
const BLUSH = '#E39A8A';

let personCount = 0;
// A small robed figure. `who` picks the details that tell the two apart.
const person = (who) => {
  const id = `robe-${personCount++}`;
  const jesus = who === 'shepherd';
  const hair = jesus ? HAIR : '#7A7069';
  const staff = jesus
    ? 'M11 95 V25 a6 6 0 0 1 12 0 v2'
    : 'M11 95 V20';
  return `
    <path d="${staff}" fill="none" stroke="${INK}" stroke-width="7.4" stroke-linecap="round"/>
    <path d="${staff}" fill="none" stroke="${WOOD}" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="31" y="88" width="7" height="8" rx="3.5" fill="${INK}"/>
    <rect x="42" y="88" width="7" height="8" rx="3.5" fill="${INK}"/>
    <clipPath id="${id}"><path d="M28 54 C25 68 23 81 22 92 q18 3 36 0 C57 81 55 68 52 54 z"/></clipPath>
    <path d="M28 54 C25 68 23 81 22 92 q18 3 36 0 C57 81 55 68 52 54 z" fill="${ROBE}"/>
    <g clip-path="url(#${id})">
      ${jesus
        ? `<path d="M26 50 L38 50 L62 90 L52 98 Z" fill="${ROSE}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
        : `<path d="M20 74 h40 v8 h-40z" fill="#9DB08A" stroke="${INK}" stroke-width="2.2"/>`}
    </g>
    <path d="M28 54 C25 68 23 81 22 92 q18 3 36 0 C57 81 55 68 52 54 z" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M31 56 q-11 1 -18 9 l4 7 q7 -6 14 -5 z" fill="${ROBE}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="12" cy="69" r="4" fill="${SKIN}" stroke="${INK}" stroke-width="2.2"/>
    ${jesus
      ? `<path d="M49 56 q8 5 10 19 l-7 1.5 q-1 -8 -6 -12 z" fill="${ROBE}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
         <circle cx="55.5" cy="77.5" r="3.8" fill="${SKIN}" stroke="${INK}" stroke-width="2.2"/>`
      : `<g transform="rotate(8 56 70)">
           <path d="M46 78 v-14 a5.5 5.5 0 0 1 11 0 a5.5 5.5 0 0 1 11 0 v14z" fill="#DCD3C4" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
           <path d="M57 64 v14 M49.5 66 h4 M49.5 70 h4 M49.5 74 h4 M60.5 66 h4 M60.5 70 h4 M60.5 74 h4" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
         </g>
         <circle cx="50" cy="76" r="3.8" fill="${SKIN}" stroke="${INK}" stroke-width="2.2"/>`}
    <path d="M23 38 a17 17 0 0 1 34 0 v14 q0 5 -5 5 h-24 q-5 0 -5 -5 z" fill="${hair}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="40" cy="36" r="14.5" fill="${SKIN}" stroke="${INK}" stroke-width="2.4"/>
    <path d="M25.6 33 a14.5 14.5 0 0 1 28.8 0 q-7 -7 -14.4 -2 q-7.4 -5 -14.4 2z" fill="${hair}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    ${jesus ? '' : `<path d="M25.4 30.5 q14.6 -6 29.2 0 l0.6 4.6 q-15.2 -6 -30.4 0z" fill="#C8644A" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`}
    <circle cx="30.5" cy="40.5" r="2.2" fill="${BLUSH}" opacity="0.85"/>
    <circle cx="49.5" cy="40.5" r="2.2" fill="${BLUSH}" opacity="0.85"/>
    <path d="${jesus
      ? 'M27.5 43.5 q2 12.5 12.5 12.5 q10.5 0 12.5 -12.5 q-3.5 3 -7 1.5 q-5.5 -2.5 -11 0 q-3.5 1.5 -7 -1.5z'
      : 'M26.5 43 q0 21 13.5 21 q13.5 0 13.5 -21 q-3.5 3.5 -8 2 q-5.5 -2.5 -11 0 q-4.5 1.5 -8 -2z'}" fill="${hair}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <ellipse cx="40" cy="48.2" rx="4.2" ry="2.8" fill="${SKIN}"/>
    <path d="M37.9 47.6 q2.1 1.9 4.2 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M32.2 38 q2.3 -2.9 4.6 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    <path d="M43.2 38 q2.3 -2.9 4.6 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
};

let markCount = 0;
const ART = {
  // The book-and-cross mark, in the current text colour
  mark: () => {
    const id = `mark-${markCount++}`;
    return `
    <svg viewBox="4 2.5 16 19">
      <mask id="${id}">
        <rect x="0" y="0" width="24" height="24" fill="#fff"/>
        <rect x="10.8" y="5.2" width="2.4" height="9" rx="0.6" fill="#000"/>
        <rect x="8" y="7.8" width="8" height="2.4" rx="0.6" fill="#000"/>
        <rect x="7" y="16.6" width="10.5" height="2.4" rx="1.2" fill="#000"/>
      </mask>
      <rect x="4" y="2.5" width="16" height="19" rx="3.5" fill="currentColor" mask="url(#${id})"/>
    </svg>`;
  },
  sheep: () => `<svg viewBox="0 0 96 78"><g class="m-sheep">${sheep()}</g></svg>`,
  cloud: () => `
    <svg viewBox="0 0 64 40">
      <path d="M14 34 a10 10 0 0 1 -2 -19.8 a13 13 0 0 1 24 -5 a11 11 0 0 1 17 9 a8 8 0 0 1 -2 15.8z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    </svg>`,
  // The shepherd with the flock
  meadow: () => `
    <svg viewBox="0 0 220 200">
      <path d="M26 150 C4 88 40 28 110 26 C182 24 216 84 196 150 z" fill="#CFE3EC"/>
      <circle class="m-sun" cx="150" cy="56" r="17" fill="#E8C277" stroke="${INK}" stroke-width="2.6"/>
      <path class="m-cloud" d="M52 72 a11 11 0 0 1 18 -9 a13 13 0 0 1 24 3 a9 9 0 0 1 2 18 h-40 a8 8 0 0 1 -4 -12z" fill="#FFFFFF"/>
      <path d="M12 152 C60 100 152 98 208 152 C200 184 28 186 12 152z" fill="#9DB08A" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <g transform="translate(134 68.4) scale(0.85)"><g class="m-shepherd">${person('shepherd')}</g></g>
      <g transform="translate(48 84)"><g class="m-sheep">${sheep()}</g></g>
      <g transform="translate(14 108) scale(0.62)"><g class="m-lamb">${sheep(3.4, false)}</g></g>
    </svg>`,
  moon: () => `
    <svg viewBox="0 0 60 60">
      <path d="M40 6 A25 25 0 1 0 54 40 A20 20 0 0 1 40 6z" fill="#F6E3A6" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M19 30 q2.5 -3 5 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M29 33 q2.5 -3 5 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="18" cy="36" r="2.4" fill="#E39A8A" opacity="0.85"/>
      <circle cx="33" cy="39.5" r="2.4" fill="#E39A8A" opacity="0.85"/>
      <path d="M23 38 q2.2 2 4.4 0.6" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  sun: () => `
    <svg viewBox="0 0 60 60">
      <path class="m-rays" d="M30 4v6M30 50v6M4 30h6M50 30h6M11.6 11.6l4.2 4.2M44.2 44.2l4.2 4.2M11.6 48.4l4.2-4.2M44.2 15.8l4.2-4.2" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="30" cy="30" r="15.5" fill="#E8C277" stroke="${INK}" stroke-width="2.6"/>
      <path d="M23 28.5 q2.5 -3 5 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 28.5 q2.5 -3 5 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="22" cy="34" r="2.4" fill="#E39A8A" opacity="0.85"/>
      <circle cx="38" cy="34" r="2.4" fill="#E39A8A" opacity="0.85"/>
      <path d="M27.8 34.5 q2.2 2 4.4 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  'sprig-sage': () => sprig('#9DB08A', '#9DB08A'),
  'sprig-rose': () => sprig('#E8B3A0', '#C9A98F'),
  shepherd: () => `<svg viewBox="0 0 66 100"><g class="m-shepherd">${person('shepherd')}</g></svg>`,
  moses: () => `<svg viewBox="0 0 72 100">${person('moses')}</svg>`,
  bible: () => `
    <svg viewBox="0 0 76 60">
      <path d="M4 15 h68 v33 q0 4 -4 4 h-60 q-4 0 -4 -4z" fill="#A4573E" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M35 44 h6 v13 l-3 -3.4 l-3 3.4z" fill="${ROSE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M8 12 q15 -7 30 2 v34 q-15 -9 -30 -2z" fill="#FDF8EE" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M68 12 q-15 -7 -30 2 v34 q15 -9 30 -2z" fill="#FDF8EE" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M14 20 q9 -3 18 1 M14 27 q9 -3 18 1 M14 34 q9 -3 18 1" fill="none" stroke="#C9A98F" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M53 17.5 v17 M46.8 23.5 h12.4" fill="none" stroke="#A4573E" stroke-width="3.4" stroke-linecap="round"/>
    </svg>`,
  cross: () => `
    <svg viewBox="0 0 52 68">
      <path d="M22 4 h8 a3 3 0 0 1 3 3 v13 h12 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h-12 v29 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3 v-29 h-12 a3 3 0 0 1 -3 -3 v-6 a3 3 0 0 1 3 -3 h12 v-13 a3 3 0 0 1 3 -3z" fill="#D9A98B" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M26 30.5 c-5 -3.4 -6 -6 -4.8 -8 a2.7 2.7 0 0 1 4.8 0 a2.7 2.7 0 0 1 4.8 0 c1.2 2 0.2 4.6 -4.8 8z" fill="${ROSE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M26 40 v16" fill="none" stroke="#C08F6E" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  dove: () => `
    <svg viewBox="0 0 80 60">
      <path d="M8 26 q-2 12 10 16 l10 -6z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M16 38 q4 -18 24 -18 q8 0 13 5 a9.5 9.5 0 0 1 17 3 q0 6 -5 8 q-3 14 -22 14 q-16 0 -27 -12z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M30 34 q0 -20 16 -30 q6 14 0 26 q-6 10 -16 4z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M69.5 26.5 l7.5 2.5 l-7 3.5z" fill="#E8C277" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M58.5 26.5 q2 -2.6 4 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="58" cy="32" r="2.2" fill="${BLUSH}" opacity="0.85"/>
      <path d="M75 30 q2 6 -2 12" fill="none" stroke="#9DB08A" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="76.5" cy="35" rx="4.5" ry="2.3" transform="rotate(-30 76.5 35)" fill="#9DB08A"/>
      <ellipse cx="70.5" cy="39.5" rx="4.5" ry="2.3" transform="rotate(20 70.5 39.5)" fill="#9DB08A"/>
    </svg>`,
  lamp: () => `
    <svg viewBox="0 0 80 60">
      <path d="M67 4 q7 8 0 15 q-7 -7 0 -15z" fill="#E8C277" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M67 11 q2.6 3.4 0 6 q-2.6 -2.6 0 -6z" fill="${ROSE}"/>
      <circle cx="13" cy="33" r="8" fill="none" stroke="${INK}" stroke-width="7"/>
      <circle cx="13" cy="33" r="8" fill="none" stroke="#D9A98B" stroke-width="2"/>
      <path d="M18 34 q0 -11 18 -11 h8 q10 0 16 -5 l11 3 q-7 4 -9 13 q-3 14 -22 14 h-6 q-16 0 -16 -14z" fill="#D9A98B" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M26 30 q8 -3 20 -2" fill="none" stroke="#F1D2BC" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M28 48 h22 l3 7 h-28z" fill="#C08F6E" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    </svg>`,
  fish: () => `
    <svg viewBox="0 0 80 44">
      <path d="M56 22 L74 6 q-5 16 0 32z" fill="#BCD9E6" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M5 22 C18 3 44 3 60 22 C44 41 18 41 5 22z" fill="#BCD9E6" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M16 19 q2.3 -2.9 4.6 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="19" cy="25.5" r="2.3" fill="${BLUSH}" opacity="0.85"/>
      <path d="M32 13 q5 9 0 18" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  heart: () => `
    <svg viewBox="0 0 52 48">
      <path d="M26 43 C7 31 2 20 6 11 a10.5 10.5 0 0 1 20 0 a10.5 10.5 0 0 1 20 0 c4 9 -1 20 -20 32z" fill="${ROSE}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M12 15 q2 -5 7 -5" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
  star: () => `
    <svg viewBox="0 0 20 20">
      <path d="M10 1 Q10 10 19 10 Q10 10 10 19 Q10 10 1 10 Q10 10 10 1z" fill="currentColor"/>
    </svg>`,
};

// Feature icons for brand/og-features.html, one per sticker on that image.
const icon = (body) => `<svg viewBox="0 0 48 48" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICONS = {
  'icon-search': () =>
    icon(`
      <circle cx="19" cy="23" r="12.5" fill="#CFE3EC"/>
      <path d="M13.5 20.5 q2 -4.5 6.5 -5" stroke="#FFFFFF" stroke-width="2.4"/>
      <path d="M28.5 32.5 L39 43" stroke-width="5"/>
      <path d="M38 3 l2.1 4.6 5 .6 -3.7 3.4 1 4.9 -4.4 -2.5 -4.4 2.5 1 -4.9 -3.7 -3.4 5 -.6z" fill="#E8C277" stroke-width="2"/>`),
  'icon-notes': () =>
    icon(`
      <rect x="9" y="5" width="30" height="38" rx="5" fill="#FDF8EE"/>
      <path d="M9 15 v-5 a5 5 0 0 1 5 -5 h20 a5 5 0 0 1 5 5 v5z" fill="#E8C277"/>
      <path d="M16 23 h16 M16 29.5 h16 M16 36 h10" stroke-width="2.4"/>`),
  'icon-chat': () =>
    icon(`
      <path d="M14 7 h20 a10 10 0 0 1 10 10 v6 a10 10 0 0 1 -10 10 h-12 l-9 8 v-8.6 a10 10 0 0 1 -9 -9.4 v-6 a10 10 0 0 1 10 -10z" fill="#E8B3A0"/>
      <circle cx="16" cy="20" r="2.3" fill="${INK}" stroke="none"/>
      <circle cx="24" cy="20" r="2.3" fill="${INK}" stroke="none"/>
      <circle cx="32" cy="20" r="2.3" fill="${INK}" stroke="none"/>`),
  'icon-art': () =>
    icon(`
      <clipPath id="icon-art-frame"><rect x="5" y="8" width="38" height="32" rx="6"/></clipPath>
      <rect x="5" y="8" width="38" height="32" rx="6" fill="#CFE3EC" stroke="none"/>
      <g clip-path="url(#icon-art-frame)">
        <circle cx="33" cy="18" r="4.5" fill="#E8C277" stroke-width="2.2"/>
        <path d="M2 42 L17 23 L26 33 L31 28 L46 42z" fill="#9DB08A" stroke-width="2.4"/>
      </g>
      <rect x="5" y="8" width="38" height="32" rx="6"/>`),
  'icon-translations': () =>
    icon(`
      <rect x="8" y="30" width="32" height="10" rx="3" fill="#9DB08A"/>
      <rect x="11" y="20" width="28" height="10" rx="3" fill="#E8C277"/>
      <rect x="7" y="10" width="30" height="10" rx="3" fill="#E8B3A0"/>
      <path d="M13 35 h6 M16 25 h6 M12 15 h6" stroke-width="2"/>`),
  'icon-widget': () =>
    icon(`
      <rect x="12" y="3" width="24" height="42" rx="6" fill="#FDF8EE"/>
      <rect x="16.5" y="10" width="15" height="12" rx="3" fill="#E8C277" stroke-width="2"/>
      <path d="M19.5 14.5 h9 M19.5 18 h5.5" stroke-width="1.8"/>
      <rect x="16.5" y="26" width="6" height="6" rx="2" fill="#BCD9E6" stroke="none"/>
      <rect x="25.5" y="26" width="6" height="6" rx="2" fill="#E8B3A0" stroke="none"/>
      <rect x="16.5" y="35" width="6" height="6" rx="2" fill="#9DB08A" stroke="none"/>
      <rect x="25.5" y="35" width="6" height="6" rx="2" fill="#BCD9E6" stroke="none"/>`),
};

function drawArt(root = document) {
  root.querySelectorAll('[data-art]').forEach((el) => {
    const draw = ART[el.dataset.art] ?? ICONS[el.dataset.art];
    if (draw && !el.firstElementChild) el.innerHTML = draw();
  });
}

drawArt();
