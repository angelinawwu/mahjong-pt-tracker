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

export function generateHandTiles(comboIds: string[]): { hand: string[], flowers: string[] } {
  const counts = comboIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const isPure = counts['pure-suit'] > 0 || counts['perfect-chi-chi-chi'] > 0;
  const isMixed = counts['mixed-suit'] > 0;
  const isAllTriplets = counts['all-triplets'] > 0;
  const isAllSequences = counts['chi-chi-chi'] > 0 || counts['perfect-chi-chi-chi'] > 0;
  const isDragon = counts['dragon'] > 0;
  const isThirteenOrphans = counts['thirteen-orphans'] > 0;
  const isAllSymbols = counts['all-symbols'] > 0;
  const isSevenPairs = counts['seven-pairs'] > 0;

  const mainSuit = randomItem(SUITS);
  let hand: string[] = [];

  if (isThirteenOrphans) {
    hand = [
      'bucket-1', 'bucket-9',
      'log-1', 'log-9',
      'number-1', 'number-9',
      ...WINDS,
      ...DRAGONS
    ];
    hand.push(randomItem(hand)); // duplicate one for the pair
  } else if (isAllSymbols) {
    const chosenSymbols = randomItems(SYMBOLS, 5); // 4 triplets + 1 pair
    hand = [
      ...Array(3).fill(chosenSymbols[0]),
      ...Array(3).fill(chosenSymbols[1]),
      ...Array(3).fill(chosenSymbols[2]),
      ...Array(3).fill(chosenSymbols[3]),
      ...Array(2).fill(chosenSymbols[4]),
    ];
  } else if (isSevenPairs) {
    let availableTiles: string[] = [];
    if (isPure) {
      availableTiles = Array.from({ length: 9 }, (_, i) => `${mainSuit}-${i + 1}`);
    } else if (isMixed) {
      availableTiles = [
        ...Array.from({ length: 9 }, (_, i) => `${mainSuit}-${i + 1}`),
        ...SYMBOLS
      ];
    } else {
      availableTiles = [
        ...Array.from({ length: 9 }, (_, i) => `bucket-${i + 1}`),
        ...Array.from({ length: 9 }, (_, i) => `log-${i + 1}`),
        ...Array.from({ length: 9 }, (_, i) => `number-${i + 1}`),
        ...SYMBOLS
      ];
    }
    // We only need 7 distinct pairs. Make sure availableTiles has at least 7.
    // If not, we fallback to all tiles just to be safe.
    if (availableTiles.length < 7) {
        availableTiles = [
            ...Array.from({ length: 9 }, (_, i) => `bucket-${i + 1}`),
            ...Array.from({ length: 9 }, (_, i) => `log-${i + 1}`),
            ...Array.from({ length: 9 }, (_, i) => `number-${i + 1}`),
            ...SYMBOLS
        ];
    }
    const chosenPairs = randomItems(availableTiles, 7);
    hand = chosenPairs.flatMap(t => [t, t]);
  } else {
    // 4 sets + 1 pair
    let setsLeft = 4;
    let windTripletsNeeded = counts['wind-triplet'] || 0;
    let symbolTripletsNeeded = counts['symbol-triplet'] || 0;
    
    // Dragon (一条龙)
    if (isDragon) {
      hand.push(
        `${mainSuit}-1`, `${mainSuit}-2`, `${mainSuit}-3`,
        `${mainSuit}-4`, `${mainSuit}-5`, `${mainSuit}-6`,
        `${mainSuit}-7`, `${mainSuit}-8`, `${mainSuit}-9`
      );
      setsLeft -= 3;
    }

    // Forced Triplets (Winds / Dragons)
    const availableWinds = [...WINDS].sort(() => 0.5 - Math.random());
    while (windTripletsNeeded > 0 && setsLeft > 0) {
      const w = availableWinds.pop() || WINDS[0];
      hand.push(w, w, w);
      windTripletsNeeded--;
      setsLeft--;
    }

    const availableDragons = [...DRAGONS].sort(() => 0.5 - Math.random());
    while (symbolTripletsNeeded > 0 && setsLeft > 0) {
      const d = availableDragons.pop() || DRAGONS[0];
      hand.push(d, d, d);
      symbolTripletsNeeded--;
      setsLeft--;
    }

    // Remaining sets
    while (setsLeft > 0) {
      let isTriplet = isAllTriplets ? true : isAllSequences ? false : Math.random() > 0.5;
      
      let suitChoice = mainSuit;
      if (!isPure && !isMixed && Math.random() > 0.5) {
        suitChoice = randomItem(SUITS); // can pick other suits if not restricted
      }

      let useSymbol = false;
      if (!isPure && !isAllSequences && Math.random() > 0.8) {
        useSymbol = true;
      }
      // Cannot have sequences of symbols
      if (!isTriplet && useSymbol) {
        useSymbol = false; 
      }
      
      if (useSymbol) {
        const sym = randomItem(SYMBOLS);
        hand.push(sym, sym, sym);
      } else {
        if (isTriplet) {
          const num = randomInt(9) + 1;
          hand.push(`${suitChoice}-${num}`, `${suitChoice}-${num}`, `${suitChoice}-${num}`);
        } else {
          // Sequence
          const startNum = randomInt(7) + 1; // 1 to 7
          hand.push(`${suitChoice}-${startNum}`, `${suitChoice}-${startNum + 1}`, `${suitChoice}-${startNum + 2}`);
        }
      }
      setsLeft--;
    }

    // Pair
    let pairSuit = mainSuit;
    if (!isPure && !isMixed && Math.random() > 0.5) {
      pairSuit = randomItem(SUITS);
    }
    let pairUseSymbol = false;
    if (!isPure && Math.random() > 0.8) {
      pairUseSymbol = true;
    }
    
    if (pairUseSymbol) {
      const sym = randomItem(SYMBOLS);
      hand.push(sym, sym);
    } else {
      const num = randomInt(9) + 1;
      hand.push(`${pairSuit}-${num}`, `${pairSuit}-${num}`);
    }
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
