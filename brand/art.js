// Sticker art shared by the brand image sources in this folder. Any element
// with a data-art attribute is filled with the matching drawing, so each page
// can place and size the art with plain CSS.
//
// The drawings match src/components/LogoMark.astro and Sticker.astro.
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
  <svg viewBox="0 0 64 72">
    <path d="M32 70 C32 50 30 30 34 6" fill="none" stroke="${stem}" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="22" cy="52" rx="10" ry="5" transform="rotate(35 22 52)" fill="${leaf}"/>
    <ellipse cx="43" cy="44" rx="10" ry="5" transform="rotate(-35 43 44)" fill="${leaf}"/>
    <ellipse cx="22" cy="32" rx="9" ry="4.5" transform="rotate(35 22 32)" fill="${leaf}"/>
    <ellipse cx="43" cy="24" rx="9" ry="4.5" transform="rotate(-35 43 24)" fill="${leaf}"/>
    <ellipse cx="34" cy="9" rx="4.5" ry="8" fill="${leaf}"/>
  </svg>`;

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
  sheep: () => `<svg viewBox="0 0 96 78">${sheep()}</svg>`,
  meadow: () => `
    <svg viewBox="0 0 220 200">
      <path d="M26 150 C4 88 40 28 110 26 C182 24 216 84 196 150 z" fill="#CFE3EC"/>
      <circle cx="160" cy="68" r="20" fill="#E8C277" stroke="${INK}" stroke-width="2.6"/>
      <path d="M52 74 a11 11 0 0 1 18 -9 a13 13 0 0 1 24 3 a9 9 0 0 1 2 18 h-40 a8 8 0 0 1 -4 -12z" fill="#FFFFFF"/>
      <path d="M12 152 C60 100 152 98 208 152 C200 184 28 186 12 152z" fill="#9DB08A" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <g transform="translate(58 84)">${sheep()}</g>
      <g transform="translate(18 108) scale(0.62)">${sheep(3.4, false)}</g>
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
      <path d="M30 4v6M30 50v6M4 30h6M50 30h6M11.6 11.6l4.2 4.2M44.2 44.2l4.2 4.2M11.6 48.4l4.2-4.2M44.2 15.8l4.2-4.2" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="30" cy="30" r="15.5" fill="#E8C277" stroke="${INK}" stroke-width="2.6"/>
      <path d="M23 28.5 q2.5 -3 5 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 28.5 q2.5 -3 5 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="22" cy="34" r="2.4" fill="#E39A8A" opacity="0.85"/>
      <circle cx="38" cy="34" r="2.4" fill="#E39A8A" opacity="0.85"/>
      <path d="M27.8 34.5 q2.2 2 4.4 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  'sprig-sage': () => sprig('#9DB08A', '#9DB08A'),
  'sprig-rose': () => sprig('#E8B3A0', '#C9A98F'),
  star: () => `
    <svg viewBox="0 0 20 20">
      <path d="M10 1 Q10 10 19 10 Q10 10 10 19 Q10 10 1 10 Q10 10 10 1z" fill="currentColor"/>
    </svg>`,
};

function drawArt(root = document) {
  root.querySelectorAll('[data-art]').forEach((el) => {
    const draw = ART[el.dataset.art];
    if (draw && !el.firstElementChild) el.innerHTML = draw();
  });
}

drawArt();
