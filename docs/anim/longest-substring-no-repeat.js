DSAAnim.register('longest-substring-no-repeat', function (container) {
  'use strict';

  const s = 'abcabcbb';
  const chars = s.split('');
  const frames = [];

  frames.push({
    caption: 'Find the longest substring without repeating characters',
    stat: 'len=0, best=0'
  });

  let L = 0;
  let R = 0;
  let best = 0;
  const seen = new Map();

  while (R < chars.length) {
    const ch = chars[R];
    const prevIdx = seen.get(ch);

    if (prevIdx !== undefined && prevIdx >= L) {
      // Duplicate found in current window
      frames.push({
        window: [L, R - 1],
        color: { [prevIdx]: 'bad', [R]: 'bad' },
        caption: `Duplicate '${ch}' found at ${prevIdx} and ${R}`,
        stat: `len=${R - L}, best=${best}`
      });

      // Shrink window past the previous occurrence
      L = prevIdx + 1;

      frames.push({
        window: [L, R - 1],
        color: {},
        caption: `Move L past duplicate to ${L}`,
        stat: `len=${R - L}, best=${best}`
      });
    }

    // Expand window to include current character
    seen.set(ch, R);
    const currentLen = R - L + 1;

    if (currentLen > best) {
      best = currentLen;
      frames.push({
        window: [L, R],
        color: { [R]: 'good' },
        caption: `Include '${ch}' at ${R}. New best window!`,
        stat: `len=${currentLen}, best=${best}`
      });
    } else {
      frames.push({
        window: [L, R],
        color: { [R]: 'accent' },
        caption: `Include '${ch}' at ${R}`,
        stat: `len=${currentLen}, best=${best}`
      });
    }

    R++;
  }

  // Final frame showing the best result
  let bestL = 0;
  let bestR = 0;
  const finalSeen = new Map();
  L = 0;
  R = 0;

  while (R < chars.length) {
    const ch = chars[R];
    const prevIdx = finalSeen.get(ch);
    if (prevIdx !== undefined && prevIdx >= L) {
      L = prevIdx + 1;
    }
    finalSeen.set(ch, R);
    if (R - L + 1 > bestR - bestL + 1) {
      bestL = L;
      bestR = R;
    }
    R++;
  }

  const colorMap = {};
  for (let i = bestL; i <= bestR; i++) {
    colorMap[i] = 'good';
  }

  frames.push({
    window: [bestL, bestR],
    color: colorMap,
    caption: `Answer: "${chars.slice(bestL, bestR + 1).join('')}" (length ${best})`,
    stat: `len=${best}, best=${best}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: chars,
    title: 'Longest Substring Without Repeating Characters',
    note: 'Sliding window expands right; shrinks left on duplicates',
    frames: frames
  });
});
