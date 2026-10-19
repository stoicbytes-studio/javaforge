import type { PictogramName } from '@/types/curriculum';

/**
 * Hand-drawn pictogram library for "Make it stick" illustrations. Each icon is a
 * list of shapes on a 48 x 48 grid. `fill: 'tone'` uses the item's tone colour,
 * 'paper' the surface colour, 'ink' the outline colour and 'none' leaves it open;
 * every shape is outlined in the tone's stroke colour.
 */
export interface Shape {
  d: string;
  fill?: 'tone' | 'paper' | 'ink' | 'none';
  width?: number;
}

// Small path builders keep the definitions readable.
const rect = (x: number, y: number, w: number, h: number, r = 2) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0z`;
const line = (...pts: number[]) => `M${pts[0]} ${pts[1]}` + pts.slice(2).reduce((acc, v, i) => acc + (i % 2 === 0 ? `L${v}` : ` ${v}`), '');
const T = (d: string): Shape => ({ d, fill: 'tone' });
const P = (d: string): Shape => ({ d, fill: 'paper' });
const O = (d: string): Shape => ({ d, fill: 'none' });
const I = (d: string): Shape => ({ d, fill: 'ink' });

const head = (cx: number, cy: number, r = 5) => T(circle(cx, cy, r));
const body = (cx: number, top: number, w = 16, h = 14) => T(`M${cx - w / 2} ${top + h}v-${h / 2}a${w / 2} ${h / 2} 0 0 1 ${w} 0v${h / 2}z`);

export const PICTOGRAMS: Record<PictogramName, Shape[]> = {
  person: [head(24, 14, 7), body(24, 24, 22, 18)],
  people: [head(16, 15, 6), body(16, 24, 18, 16), head(32, 15, 6), body(32, 24, 18, 16)],
  chef: [P(`M14 14a6 6 0 0 1 6-6a5 5 0 0 1 8 0a6 6 0 0 1 6 6v4h-20z`), head(24, 24, 6), body(24, 31, 20, 14)],
  robot: [T(rect(12, 10, 24, 18, 4)), I(circle(19, 19, 2.5)), I(circle(29, 19, 2.5)), O(line(24, 10, 24, 5)), T(circle(24, 4, 2)), T(rect(15, 30, 18, 13, 3))],
  teacher: [head(16, 16, 6), body(16, 25, 18, 16), P(rect(26, 8, 18, 14, 1)), O(line(29, 13, 41, 13)), O(line(29, 17, 37, 17))],
  house: [T('M8 22L24 9l16 13v18H8z'), P(rect(20, 28, 8, 12, 1))],
  factory: [T('M6 40V20l9 6v-6l9 6v-6l9 6V10h7v30z'), P(rect(12, 32, 5, 5, 0.5)), P(rect(22, 32, 5, 5, 0.5)), P(rect(32, 32, 5, 5, 0.5))],
  shop: [T(rect(9, 20, 30, 20, 1)), P('M7 12h34l-3 8H10z'), P(rect(20, 28, 8, 12, 0.5))],
  bank: [T('M6 16L24 7l18 9z'), T(rect(8, 36, 32, 5, 0.5)), P(rect(11, 18, 4, 17, 0.5)), P(rect(22, 18, 4, 17, 0.5)), P(rect(33, 18, 4, 17, 0.5))],
  library: [T(rect(8, 12, 7, 28, 1)), P(rect(17, 16, 7, 24, 1)), T(rect(26, 10, 7, 30, 1)), P('M35 15l6 -2l5 25l-6 2z')],
  kitchen: [P(rect(6, 26, 36, 16, 2)), I(circle(14, 34, 2.5)), I(circle(24, 34, 2.5)), T('M12 14h22v8a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z'), O('M34 17h6'), O('M18 10c0-3 2-3 2-6M26 10c0-3 2-3 2-6')],
  box: [T('M8 16l16-7l16 7v18l-16 7l-16-7z'), O('M8 16l16 7l16-7M24 23v18')],
  gift: [T(rect(9, 18, 30, 22, 2)), P(rect(7, 13, 34, 7, 1.5)), O('M24 13v27'), O('M24 13c-4-7-12-5-8 0M24 13c4-7 12-5 8 0')],
  boxes: [T(rect(6, 26, 16, 14, 1)), P(rect(26, 26, 16, 14, 1)), T(rect(16, 10, 16, 14, 1))],
  shelf: [O(line(6, 18, 42, 18)), O(line(6, 32, 42, 32)), T(rect(10, 8, 6, 10, 1)), P(rect(18, 10, 6, 8, 1)), T(rect(28, 22, 8, 10, 1)), P(rect(12, 24, 6, 8, 1))],
  drawer: [T(rect(8, 8, 32, 32, 2)), P(rect(11, 11, 26, 12, 1)), P(rect(11, 26, 26, 11, 1)), I(rect(21, 16, 6, 2, 1)), I(rect(21, 30, 6, 2, 1))],
  bucket: [T('M11 16h26l-3 24H14z'), O('M11 16c0-8 26-8 26 0')],
  trash: [T('M13 15h22l-2 26H15z'), P(rect(10, 10, 28, 5, 1)), O('M20 20v16M28 20v16'), O('M20 10v-3h8v3')],
  recycle: [T('M24 6l8 13h-5l-3 5l-6-10z'), T('M40 30l-7 13l-3-5h-6l6-10z'), T('M8 30l7-12l3 5h6l-6 10H11z'), P(circle(24, 28, 4))],
  key: [T(circle(15, 24, 8)), P(circle(15, 24, 3)), T('M22 22h20v4h-3v5h-4v-5h-4v4h-4v-4h-5z')],
  lock: [O('M15 21v-6a9 9 0 0 1 18 0v6'), T(rect(11, 21, 26, 20, 3)), I(circle(24, 30, 3)), I(rect(23, 31, 2, 5, 1))],
  door: [T(rect(13, 6, 22, 36, 2)), I(circle(30, 25, 2)), O(line(6, 42, 42, 42))],
  shield: [T('M24 6l15 6v10c0 10-7 17-15 20c-8-3-15-10-15-20V12z'), O('M18 24l5 5l8-10')],
  fence: [T('M8 14l3-4l3 4v26H8z'), T('M18 14l3-4l3 4v26h-6z'), T('M28 14l3-4l3 4v26h-6z'), T('M38 14l3-4l3 4v26h-6z'), P(rect(5, 20, 40, 4, 1)), P(rect(5, 30, 40, 4, 1))],
  'id-card': [P(rect(6, 12, 36, 24, 3)), T(circle(16, 22, 4)), T('M10 32a6 5 0 0 1 12 0z'), O('M26 20h11M26 26h11M26 31h7')],
  book: [T('M8 10h14a2 2 0 0 1 2 2v28a2 2 0 0 0-2-2H8z'), P('M40 10H26a2 2 0 0 0-2 2v28a2 2 0 0 1 2-2h14z')],
  recipe: [P(rect(10, 6, 28, 36, 2)), T(rect(14, 10, 20, 6, 1)), O('M15 22h18M15 27h18M15 32h12')],
  blueprint: [T(rect(6, 10, 36, 28, 2)), O('M12 32V18h12v8h12v6z'), O('M12 18l6-5l6 5')],
  note: [P('M10 8h20l8 8v24H10z'), O('M30 8v8h8'), O('M15 22h18M15 28h18M15 34h12')],
  envelope: [T(rect(6, 12, 36, 24, 2)), P('M6 14l18 13l18-13')],
  mailbox: [T('M10 22a8 8 0 0 1 16 0v12H10z'), P('M18 14h16a8 8 0 0 1 8 8v12H26V22a8 8 0 0 0-8-8z'), O('M18 34v8'), T('M32 10v8h6v-4h-4')],
  stamp: [T(rect(16, 8, 16, 14, 3)), P(rect(10, 22, 28, 8, 2)), T(rect(8, 32, 32, 6, 1))],
  tag: [T('M8 10h16l16 16l-14 14L10 24z'), P(circle(16, 17, 3))],
  label: [P(rect(6, 16, 36, 16, 3)), T(rect(6, 16, 10, 16, 3)), O('M20 22h16M20 27h10')],
  truck: [T(rect(5, 14, 24, 18, 2)), P('M29 20h8l6 7v5H29z'), I(circle(13, 35, 4)), I(circle(36, 35, 4))],
  conveyor: [P(rect(5, 30, 38, 7, 3.5)), I(circle(10, 33.5, 2)), I(circle(38, 33.5, 2)), T(rect(9, 18, 10, 11, 1)), T(rect(27, 18, 10, 11, 1))],
  road: [T('M16 6h16l8 36H8z'), O('M24 9v6M24 20v6M24 31v7')],
  'traffic-light': [I(rect(17, 6, 14, 32, 4)), T(circle(24, 13, 3.5)), P(circle(24, 22, 3.5)), P(circle(24, 31, 3.5)), O('M24 38v6')],
  signpost: [O('M24 8v34'), T('M10 12h22l5 5l-5 5H10z'), P('M38 25H16l-5 5l5 5h22z')],
  map: [P('M6 12l12-4l12 4l12-4v28l-12 4l-12-4l-12 4z'), O('M18 8v28M30 12v28'), T(circle(34, 20, 3))],
  ladder: [O('M15 6v36M33 6v36'), T(rect(15, 10, 18, 3, 1)), T(rect(15, 19, 18, 3, 1)), T(rect(15, 28, 18, 3, 1)), T(rect(15, 37, 18, 3, 1))],
  bridge: [T('M4 26h40v5H4z'), O('M8 26a16 14 0 0 1 32 0'), O('M12 31v10M36 31v10'), O(line(4, 41, 44, 41))],
  plates: [P(rect(10, 34, 28, 5, 2.5)), T(rect(10, 27, 28, 5, 2.5)), P(rect(10, 20, 28, 5, 2.5)), T(rect(10, 13, 28, 5, 2.5)), O('M24 6v5m-3-3l3 3l3-3')],
  queue: [head(8, 18, 4), body(8, 24, 12, 12), head(20, 18, 4), body(20, 24, 12, 12), head(32, 18, 4), body(32, 24, 12, 12), O('M38 30h7m-3-3l3 3l-3 3')],
  tree: [T(circle(24, 18, 11)), I(rect(22, 28, 4, 13, 1))],
  family: [P(rect(19, 6, 10, 8, 2)), T(rect(7, 30, 10, 8, 2)), T(rect(31, 30, 10, 8, 2)), P(rect(19, 30, 10, 8, 2)), O('M24 14v8M12 30v-8h24v8M24 22v8')],
  puzzle: [T('M8 14h10a4 4 0 1 1 8 0h10v10a4 4 0 1 0 0 8v10H26a4 4 0 1 0-8 0H8z')],
  gear: [T('M21 6h6l1 5l4 2l4-3l4 4l-3 4l2 4l5 1v6l-5 1l-2 4l3 4l-4 4l-4-3l-4 2l-1 5h-6l-1-5l-4-2l-4 3l-4-4l3-4l-2-4l-5-1v-6l5-1l2-4l-3-4l4-4l4 3l4-2z'), P(circle(24, 24, 6))],
  gears: [T('M14 10h4l1 3l3 1l2-2l3 3l-2 2l1 3l3 1v4l-3 1l-1 3l2 2l-3 3l-2-2l-3 1l-1 3h-4l-1-3l-3-1l-2 2l-3-3l2-2l-1-3l-3-1v-4l3-1l1-3l-2-2l3-3l2 2l3-1z'), P(circle(16, 22, 4)), P(circle(35, 33, 8)), T(circle(35, 33, 3))],
  magnifier: [P(circle(20, 20, 11)), T(circle(20, 20, 6)), O('M28 28l12 12', ), { d: 'M28 28l12 12', fill: 'none', width: 5 }],
  mirror: [T('M24 4c8 0 13 7 13 16s-5 16-13 16s-13-7-13-16s5-16 13-16z'), P('M24 8c6 0 9 5 9 12s-3 12-9 12s-9-5-9-12s3-12 9-12z'), O('M19 15l5-5M19 21l9-9'), O('M24 36v5M16 43h16')],
  clock: [P(circle(24, 24, 17)), O('M24 13v11l7 5'), T(circle(24, 24, 2))],
  calendar: [P(rect(8, 11, 32, 30, 3)), T(rect(8, 11, 32, 8, 3)), O('M16 7v7M32 7v7'), T(rect(14, 25, 5, 5, 1)), T(rect(22, 25, 5, 5, 1)), T(rect(30, 25, 5, 5, 1)), T(rect(14, 32, 5, 5, 1))],
  hourglass: [O('M12 6h24M12 42h24'), P('M14 6h20c0 10-8 12-8 18s8 8 8 18H14c0-10 8-12 8-18s-8-8-8-18z'), T('M18 38h12l-6-8z')],
  stopwatch: [P(circle(24, 27, 15)), T(rect(20, 6, 8, 5, 1)), O('M24 27V17'), O('M36 15l3-3')],
  coin: [T(circle(24, 24, 16)), P(circle(24, 24, 11)), O('M27 18h-5a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-5M24 15v3M24 30v3')],
  calculator: [T(rect(11, 6, 26, 36, 3)), P(rect(15, 10, 18, 8, 1)), P(rect(15, 22, 5, 5, 1)), P(rect(22, 22, 5, 5, 1)), P(rect(29, 22, 4, 5, 1)), P(rect(15, 30, 5, 5, 1)), P(rect(22, 30, 5, 5, 1)), P(rect(29, 30, 4, 9, 1))],
  scale: [O('M24 8v32M14 40h20M8 14h32'), T('M3 28l5-14l5 14z'), T('M35 28l5-14l5 14z')],
  phone: [T(rect(14, 5, 20, 38, 4)), P(rect(17, 10, 14, 24, 1)), I(circle(24, 38, 1.8))],
  laptop: [T(rect(10, 10, 28, 20, 2)), P(rect(13, 13, 22, 14, 1)), P('M5 32h38l-3 6H8z')],
  server: [T(rect(9, 7, 30, 10, 2)), T(rect(9, 19, 30, 10, 2)), T(rect(9, 31, 30, 10, 2)), I(circle(15, 12, 1.6)), I(circle(15, 24, 1.6)), I(circle(15, 36, 1.6))],
  database: [T('M10 12v24c0 4 6 6 14 6s14-2 14-6V12'), P('M10 12c0-4 6-6 14-6s14 2 14 6s-6 6-14 6s-14-2-14-6z'), O('M10 24c0 4 6 6 14 6s14-2 14-6')],
  cloud: [T('M14 36a8 8 0 0 1-1-16a11 11 0 0 1 21-3a9 9 0 0 1 2 19z')],
  globe: [P(circle(24, 24, 16)), T('M24 8c-6 5-6 27 0 32c6-5 6-27 0-32z'), O('M8 24h32M11 15h26M11 33h26')],
  plug: [T(rect(14, 16, 20, 14, 3)), O('M19 16V8M29 16V8'), O('M24 30v12')],
  battery: [P(rect(6, 15, 32, 18, 3)), T(rect(9, 18, 20, 12, 1.5)), I(rect(38, 20, 4, 8, 1))],
  brain: [T('M24 10c-3-4-11-3-12 3c-5 1-6 8-2 11c-3 4 0 10 5 10c2 4 8 4 9 0c1 4 7 4 9 0c5 0 8-6 5-10c4-3 3-10-2-11c-1-6-9-7-12-3z'), O('M24 10v28M17 20c3 0 4 3 4 5M31 20c-3 0-4 3-4 5')],
  bulb: [T('M24 6a12 12 0 0 1 7 22v5H17v-5a12 12 0 0 1 7-22z'), P(rect(18, 34, 12, 4, 1)), P(rect(20, 39, 8, 3, 1))],
  warning: [T('M24 6l19 34H5z'), I(rect(22.5, 17, 3, 12, 1.5)), I(circle(24, 34, 1.8))],
  check: [T(circle(24, 24, 17)), { d: 'M15 24l7 7l12-14', fill: 'none', width: 4 }],
  cross: [T(circle(24, 24, 17)), { d: 'M17 17l14 14M31 17l-14 14', fill: 'none', width: 4 }],
  question: [T(circle(24, 24, 17)), { d: 'M18 19a6 6 0 1 1 9 5c-2 1-3 2-3 5', fill: 'none', width: 3.5 }, I(circle(24, 34, 2))],
  star: [T('M24 6l5 11l12 1l-9 8l3 12l-11-6l-11 6l3-12l-9-8l12-1z')],
  heart: [T('M24 40C6 28 6 14 15 11c4-1 7 1 9 4c2-3 5-5 9-4c9 3 9 17-9 29z')],
  flag: [O('M12 6v36'), T('M12 8h24l-5 8l5 8H12z')],
  chain: [T('M6 24a8 8 0 0 1 8-8h8a8 8 0 0 1 0 16h-8a8 8 0 0 1-8-8z'), P('M12 24a3 3 0 0 1 3-3h6a3 3 0 0 1 0 6h-6a3 3 0 0 1-3-3z'), T('M20 24a8 8 0 0 1 8-8h6a8 8 0 0 1 0 16h-6a8 8 0 0 1-8-8z'), P('M26 24a3 3 0 0 1 3-3h4a3 3 0 0 1 0 6h-4a3 3 0 0 1-3-3z')],
  magnet: [T('M10 8h9v16a5 5 0 0 0 10 0V8h9v16a14 14 0 0 1-28 0z'), P(rect(10, 8, 9, 6, 1)), P(rect(29, 8, 9, 6, 1))],
  camera: [T(rect(6, 14, 36, 24, 4)), P(circle(24, 26, 7)), T(rect(16, 9, 10, 5, 1))],
  copy: [P(rect(8, 8, 22, 26, 2)), T(rect(18, 16, 22, 26, 2))],
  scissors: [P(circle(13, 34, 5)), P(circle(35, 34, 5)), T('M17 30L36 8M31 30L12 8')],
  pipe: [T(rect(4, 18, 26, 12, 2)), T('M30 18h8a6 6 0 0 1 6 6v18h-12V30h-2z'), P(rect(26, 15, 6, 18, 1))],
  tap: [T('M10 14h20a6 6 0 0 1 6 6v6h-8v-4H10z'), P(rect(16, 8, 8, 6, 1)), T('M31 32c0 3 2 4 1 7a3 3 0 0 1-5 0c-1-3 1-4 1-7z')],
  filter: [T('M8 10h32L28 25v13l-8 4V25z')],
  funnel: [P('M6 8h36L28 24v12l-8 6V24z'), T('M12 12h24l-6 8H18z')],
  thread: [T(rect(12, 6, 24, 6, 2)), T(rect(12, 34, 24, 6, 2)), P(rect(16, 12, 16, 22, 1)), O('M16 15h16M16 19h16M16 23h16M16 27h16M16 31h16'), { d: 'M32 31c6 1 6 7 12 9', fill: 'none', width: 2.5 }],
  baton: [T('M12 34L32 14l4 4l-20 20z'), P(circle(38, 12, 4)), O('M8 40l4-4')],
  whistle: [T('M10 22a10 10 0 1 0 20 0h12v-7H18a10 10 0 0 0-8 7z'), P(circle(20, 24, 4))],
  crown: [T('M6 16l9 8l9-14l9 14l9-8l-4 22H10z'), P(rect(10, 34, 28, 4, 1))],
  medal: [T('M16 6h6l3 10l-6 4zM32 6h-6l-3 10l6 4z'), T(circle(24, 30, 11)), P(circle(24, 30, 6))],
  rocket: [T('M24 4c8 6 10 16 8 26H16c-2-10 0-20 8-26z'), P(circle(24, 17, 4)), P('M16 30l-6 8h8zM32 30l6 8h-8z'), T('M20 34h8l-4 10z')],
  snail: [T(circle(26, 24, 11)), P('M26 24m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0'), P('M6 36h30a6 6 0 0 0 6-6h-4'), O('M10 36l-3-10M13 36l1-10')],
  bug: [T('M16 18a8 8 0 0 1 16 0v12a8 8 0 0 1-16 0z'), O('M24 18v20M16 22H8M32 22h8M16 30H9M32 30h7M18 12l-4-5M30 12l4-5')],
  wrench: [T('M30 6a10 10 0 0 0-9 14L7 34a4 4 0 0 0 6 6l14-14A10 10 0 0 0 41 17l-6 6l-6-2l-2-6l6-6a10 10 0 0 0-3-3z')],
  hammer: [T(rect(14, 8, 22, 9, 2)), P('M23 17h5v24a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2z')],
};

export const PICTOGRAM_NAMES = Object.keys(PICTOGRAMS) as PictogramName[];
