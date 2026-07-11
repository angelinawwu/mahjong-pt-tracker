const SUITS = ['bucket', 'log', 'number'] as const;
const WINDS = ['wind-east', 'wind-south', 'wind-west', 'wind-north'] as const;
const DRAGONS = ['symbol-blue', 'symbol-green', 'symbol-red'] as const;
const SYMBOLS = [...WINDS, ...DRAGONS] as const;

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function randomItem<T>(arr: readonly T[] | T[]): T {
  return arr[randomInt(arr.length)];
}

function randomItems<T>(arr: readonly T[] | T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function shuffle<T>(arr: readonly T[] | T[]): T[] {
  return [...arr].sort(() => 0.5 - Math.random());
}

function countIds(ids: string[]): Record<string, number> {
  return ids.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

type Suit = (typeof SUITS)[number];

function suitTiles(suit: Suit): string[] {
  return Array.from({ length: 9 }, (_, i) => `${suit}-${i + 1}`);
}

function isHonor(tile: string): boolean {
  return (SYMBOLS as readonly string[]).includes(tile);
}

// ---------------------------------------------------------------------------
// Combo compatibility
// ---------------------------------------------------------------------------

const HAND_TYPE_IDS = new Set([
  'none', 'chi-chi-chi', 'perfect-chi-chi-chi', 'all-triplets',
  'dragon', 'seven-pairs', 'thirteen-orphans', 'all-symbols',
]);

const ALL_COMBO_IDS = [
  ...HAND_TYPE_IDS,
  'wind-triplet', 'symbol-triplet', 'pure-suit', 'mixed-suit',
  'no-flower', 'own-flower',
];

// Pairs of combos that can never coexist in one hand. Symmetrized below.
const BASE_INCOMPATIBLE: Record<string, string[]> = {
  // Seven pairs has no triplets at all.
  'seven-pairs': ['wind-triplet', 'symbol-triplet'],
  // House rule: all 14 tiles distinct, suited tiles >=3 apart within a suit.
  // That forces 5-7 honors and 2-3 suits, so no triplets and no suit locks.
  'thirteen-orphans': ['wind-triplet', 'symbol-triplet', 'pure-suit', 'mixed-suit'],
  // All symbols contains no suited tiles, so suit modifiers are meaningless.
  'all-symbols': ['pure-suit', 'mixed-suit'],
  // All sequences means no triplets of any kind.
  'chi-chi-chi': ['wind-triplet', 'symbol-triplet'],
  // Perfect chi chi chi already implies pure suit (and has no triplets).
  'perfect-chi-chi-chi': ['wind-triplet', 'symbol-triplet', 'pure-suit', 'mixed-suit'],
  // Pure suit has no honor tiles.
  'pure-suit': ['mixed-suit', 'wind-triplet', 'symbol-triplet'],
};

const INCOMPATIBLE: Record<string, Set<string>> = {};
for (const [id, list] of Object.entries(BASE_INCOMPATIBLE)) {
  for (const other of list) {
    (INCOMPATIBLE[id] ??= new Set()).add(other);
    (INCOMPATIBLE[other] ??= new Set()).add(id);
  }
}

// How many honor (wind/dragon) triplets the selected hand shape can hold.
function honorTripletCapacity(counts: Record<string, number>): number {
  if (
    counts['seven-pairs'] || counts['thirteen-orphans'] ||
    counts['chi-chi-chi'] || counts['perfect-chi-chi-chi'] ||
    counts['pure-suit']
  ) return 0;
  // Dragon consumes 3 of the 4 sets.
  if (counts['dragon']) return 1;
  if (counts['all-triplets'] || counts['all-symbols']) return 4;
  // Otherwise keep one set free for a sequence so the hand isn't forced
  // into an unselected "all triplets" shape.
  return 3;
}

function isSelectionPossible(counts: Record<string, number>): boolean {
  for (const id of Object.keys(counts)) {
    if (!counts[id]) continue;
    for (const other of INCOMPATIBLE[id] ?? []) {
      if (counts[other]) return false;
    }
  }
  // Only 3 dragon tile types exist, so at most 3 symbol triplets.
  if ((counts['symbol-triplet'] || 0) > 3) return false;
  const honorTriplets = (counts['wind-triplet'] || 0) + (counts['symbol-triplet'] || 0);
  return honorTriplets <= honorTripletCapacity(counts);
}

export interface ComboAvailability {
  disabled: boolean;
  maxCount?: number;
}

// For each combo, report whether it can still be (further) selected given the
// current selection, and — for counted modifiers — the highest valid count.
export function getComboAvailability(selectedIds: string[]): Record<string, ComboAvailability> {
  const base = countIds(selectedIds);

  const tryWith = (id: string, count: number): boolean => {
    const sim: Record<string, number> = { ...base };
    if (HAND_TYPE_IDS.has(id)) {
      // Selecting a hand type replaces the current one.
      for (const h of HAND_TYPE_IDS) delete sim[h];
    }
    sim[id] = count;
    return isSelectionPossible(sim);
  };

  const result: Record<string, ComboAvailability> = {};
  for (const id of ALL_COMBO_IDS) {
    if (id === 'wind-triplet' || id === 'symbol-triplet') {
      const limit = id === 'wind-triplet' ? 2 : 4;
      let maxCount = 0;
      for (let n = limit; n >= 1; n--) {
        if (tryWith(id, n)) { maxCount = n; break; }
      }
      result[id] = { disabled: maxCount === 0, maxCount };
    } else {
      result[id] = { disabled: !tryWith(id, 1) };
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hand generation
// ---------------------------------------------------------------------------

function spacedSuitTiles(suit: Suit, count: number): string[] {
  // `count` distinct numbers from 1..9, pairwise at least 3 apart.
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 200; i++) {
    const nums = randomItems(numbers, count).sort((a, b) => a - b);
    if (nums.every((n, idx) => idx === 0 || n - nums[idx - 1] >= 3)) {
      return nums.map((n) => `${suit}-${n}`);
    }
  }
  return Array.from({ length: count }, (_, i) => `${suit}-${1 + i * 3}`);
}

function generateThirteenOrphans(): string[] {
  // House rule: all 14 tiles distinct; tiles sharing a suit must be >= 3 apart.
  // Max 3 tiles per suit (e.g. 1-4-7) and max 7 honors, so honors are 5..7.
  const honorCount = 5 + randomInt(3);
  const suitedTotal = 14 - honorCount; // 7..9 across the 3 suits
  let split: number[];
  do {
    split = [1 + randomInt(3), 1 + randomInt(3), 1 + randomInt(3)];
  } while (split[0] + split[1] + split[2] !== suitedTotal);

  const hand: string[] = randomItems(SYMBOLS, honorCount);
  SUITS.forEach((suit, i) => hand.push(...spacedSuitTiles(suit, split[i])));
  return hand;
}

function generateAllSymbols(counts: Record<string, number>): string[] {
  // 4 honor triplets + honor pair; make sure the selected wind/symbol
  // triplet counts are represented among them.
  const windCount = Math.min(counts['wind-triplet'] || 0, 2);
  const dragonCount = Math.min(counts['symbol-triplet'] || 0, 3);
  const winds = shuffle(WINDS);
  const dragons = shuffle(DRAGONS);
  const triplets: string[] = [
    ...winds.splice(0, windCount),
    ...dragons.splice(0, dragonCount),
  ];
  const rest = shuffle([...winds, ...dragons]);
  while (triplets.length < 4) triplets.push(rest.shift()!);
  const pairTile = rest.shift()!;
  return [...triplets.flatMap((t) => [t, t, t]), pairTile, pairTile];
}

function generateSevenPairs(counts: Record<string, number>): string[] {
  const isPure = (counts['pure-suit'] || 0) > 0;
  const isMixed = (counts['mixed-suit'] || 0) > 0;
  const mainSuit = randomItem(SUITS);

  let pairs: string[];
  if (isPure) {
    pairs = randomItems(suitTiles(mainSuit), 7);
  } else if (isMixed) {
    const honorPairs = 1 + randomInt(4); // at least one honor pair
    pairs = [
      ...randomItems(SYMBOLS, honorPairs),
      ...randomItems(suitTiles(mainSuit), 7 - honorPairs),
    ];
  } else {
    // Span at least two suits so the hand is not accidentally pure or mixed.
    const [suitA, suitB] = randomItems(SUITS, 2);
    const honorPairs = randomInt(3);
    const suited = 7 - honorPairs;
    const countA = 1 + randomInt(suited - 1);
    pairs = [
      ...randomItems(SYMBOLS, honorPairs),
      ...randomItems(suitTiles(suitA), countA),
      ...randomItems(suitTiles(suitB), suited - countA),
    ];
  }
  return pairs.flatMap((t) => [t, t]);
}

interface BuiltSet { kind: 'seq' | 'trip'; tiles: string[]; suit: Suit | null }

interface StandardFlags {
  isPure: boolean;
  isMixed: boolean;
  isAllTriplets: boolean;
  isAllSequences: boolean;
  isDragon: boolean;
  windTriplets: number;
  symbolTriplets: number;
}

function tryBuildStandardHand(flags: StandardFlags): string[] | null {
  const { isPure, isMixed, isAllTriplets, isAllSequences, isDragon, windTriplets, symbolTriplets } = flags;
  const mainSuit = randomItem(SUITS);
  const usage: Record<string, number> = {};
  // In an all-sequence hand, 3+ copies of a tile would visually read as a
  // triplet, so cap usage at 2 there.
  const maxPerTile = isAllSequences ? 2 : 4;
  const use = (tile: string, n: number): boolean => {
    if ((usage[tile] || 0) + n > maxPerTile) return false;
    usage[tile] = (usage[tile] || 0) + n;
    return true;
  };

  const sets: BuiltSet[] = [];
  let setsLeft = 4;

  // Dragon (一条龙): 1-2-3 / 4-5-6 / 7-8-9 of the main suit
  if (isDragon) {
    for (const start of [1, 4, 7]) {
      const tiles = [start, start + 1, start + 2].map((n) => `${mainSuit}-${n}`);
      tiles.forEach((t) => use(t, 1));
      sets.push({ kind: 'seq', tiles, suit: mainSuit });
    }
    setsLeft -= 3;
  }

  // Selected honor triplets
  for (const w of randomItems(WINDS, windTriplets)) {
    if (!use(w, 3)) return null;
    sets.push({ kind: 'trip', tiles: [w, w, w], suit: null });
    setsLeft--;
  }
  for (const d of randomItems(DRAGONS, symbolTriplets)) {
    if (!use(d, 3)) return null;
    sets.push({ kind: 'trip', tiles: [d, d, d], suit: null });
    setsLeft--;
  }
  if (setsLeft < 0) return null;
  const honorTripletCount = windTriplets + symbolTriplets;

  // Decide the kinds of the remaining suited sets. The hand must show only
  // the chosen combos: without "chi chi chi" it needs a triplet somewhere,
  // and without "all triplets" it needs a sequence somewhere.
  const kinds: ('seq' | 'trip')[] = [];
  for (let i = 0; i < setsLeft; i++) {
    kinds.push(isAllTriplets ? 'trip' : isAllSequences ? 'seq' : Math.random() > 0.5 ? 'trip' : 'seq');
  }
  if (!isAllTriplets && !isAllSequences && setsLeft > 0) {
    if (isDragon) {
      // A 4th sequence would make a dragon hand also read as chi chi chi.
      kinds.fill('trip');
    } else {
      if (!kinds.includes('seq')) kinds[randomInt(kinds.length)] = 'seq';
      if (!kinds.includes('trip') && honorTripletCount === 0) kinds[randomInt(kinds.length)] = 'trip';
    }
  }

  for (const kind of kinds) {
    let suit: Suit = isPure || isMixed ? mainSuit : randomItem(SUITS);
    if (isDragon && !isPure && !isMixed) {
      // Avoid the whole hand collapsing into a single suit.
      suit = randomItem(SUITS.filter((s) => s !== mainSuit));
    }
    if (kind === 'trip') {
      const tile = `${suit}-${randomInt(9) + 1}`;
      if (!use(tile, 3)) return null;
      sets.push({ kind, tiles: [tile, tile, tile], suit });
    } else {
      const start = randomInt(7) + 1;
      const tiles = [start, start + 1, start + 2].map((n) => `${suit}-${n}`);
      for (const t of tiles) if (!use(t, 1)) return null;
      sets.push({ kind, tiles, suit });
    }
  }

  // Pair
  let pairTile: string;
  if (isMixed && honorTripletCount === 0) {
    pairTile = randomItem(SYMBOLS); // guarantee honors so the hand reads mixed
  } else {
    const suit = isPure || isMixed ? mainSuit : randomItem(SUITS);
    pairTile = `${suit}-${randomInt(9) + 1}`;
  }
  if (!use(pairTile, 2)) return null;

  const hand = [...sets.flatMap((s) => s.tiles), pairTile, pairTile];

  // Structural validation: the hand must reflect exactly the chosen combos.
  const suitedSuits = new Set<Suit>();
  for (const t of hand) if (!isHonor(t)) suitedSuits.add(t.split('-')[0] as Suit);
  const hasHonors = hand.some(isHonor);

  if (isPure && (hasHonors || suitedSuits.size !== 1)) return null;
  if (isMixed && (!hasHonors || suitedSuits.size !== 1)) return null;
  if (!isPure && !isMixed) {
    const suitedGroups = sets.filter((s) => s.suit !== null).length + (isHonor(pairTile) ? 0 : 1);
    if (suitedSuits.size < 2 && suitedGroups >= 2) return null;
  }

  // No accidental dragon: three sequences covering 1-9 of one suit.
  if (!isDragon) {
    for (const suit of SUITS) {
      const starts = new Set(
        sets
          .filter((s) => s.kind === 'seq' && s.suit === suit)
          .map((s) => parseInt(s.tiles[0].split('-')[1]))
      );
      if (starts.has(1) && starts.has(4) && starts.has(7)) return null;
    }
  }

  return hand;
}

function generateStandardHand(counts: Record<string, number>): string[] {
  const capacity = honorTripletCapacity(counts);
  const windTriplets = Math.min(counts['wind-triplet'] || 0, 2, capacity);
  const symbolTriplets = Math.min(counts['symbol-triplet'] || 0, 3, Math.max(0, capacity - windTriplets));
  const flags: StandardFlags = {
    isPure: (counts['pure-suit'] || 0) > 0 || (counts['perfect-chi-chi-chi'] || 0) > 0,
    isMixed: (counts['mixed-suit'] || 0) > 0,
    isAllTriplets: (counts['all-triplets'] || 0) > 0,
    isAllSequences: (counts['chi-chi-chi'] || 0) > 0 || (counts['perfect-chi-chi-chi'] || 0) > 0,
    isDragon: (counts['dragon'] || 0) > 0,
    windTriplets,
    symbolTriplets,
  };

  for (let attempt = 0; attempt < 120; attempt++) {
    const hand = tryBuildStandardHand(flags);
    if (hand) return hand;
  }
  // Fallback: a simple valid two-suit hand (should be unreachable).
  return [
    'bucket-1', 'bucket-2', 'bucket-3',
    'log-4', 'log-5', 'log-6',
    'number-7', 'number-7', 'number-7',
    'bucket-5', 'bucket-6', 'bucket-7',
    'log-9', 'log-9',
  ];
}

export function generateHandTiles(comboIds: string[]): { hand: string[], flowers: string[] } {
  const counts = countIds(comboIds);

  let hand: string[];
  if (counts['thirteen-orphans']) {
    hand = generateThirteenOrphans();
  } else if (counts['all-symbols']) {
    hand = generateAllSymbols(counts);
  } else if (counts['seven-pairs']) {
    hand = generateSevenPairs(counts);
  } else {
    hand = generateStandardHand(counts);
  }

  // Sort the hand
  const suitOrder = { 'bucket': 1, 'log': 2, 'number': 3, 'wind': 4, 'symbol': 5 };
  hand.sort((a, b) => {
    const [suitA, numA] = a.split('-');
    const [suitB, numB] = b.split('-');
    
    const catA = WINDS.includes(a as any) ? 'wind' : DRAGONS.includes(a as any) ? 'symbol' : suitA;
    const catB = WINDS.includes(b as any) ? 'wind' : DRAGONS.includes(b as any) ? 'symbol' : suitB;

    if (catA !== catB) {
      return (suitOrder[catA as keyof typeof suitOrder] || 99) - (suitOrder[catB as keyof typeof suitOrder] || 99);
    }
    
    if (catA === 'wind') {
      return WINDS.indexOf(a as any) - WINDS.indexOf(b as any);
    }
    if (catA === 'symbol') {
      return DRAGONS.indexOf(a as any) - DRAGONS.indexOf(b as any);
    }
    return parseInt(numA) - parseInt(numB);
  });

  let flowers: string[] = [];
  const ownFlowerCount = counts['own-flower'] || 0;
  const noFlower = counts['no-flower'] > 0;
  
  if (!noFlower && ownFlowerCount > 0) {
    const allFlowers = [
      'flower-1a', 'flower-1b', 'flower-2a', 'flower-2b',
      'flower-3a', 'flower-3b', 'flower-4a', 'flower-4b'
    ];
    flowers = randomItems(allFlowers, ownFlowerCount);
  }

  return { hand, flowers };
}
