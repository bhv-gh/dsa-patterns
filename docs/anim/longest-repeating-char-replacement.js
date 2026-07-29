DSAAnim.register('longest-repeating-char-replacement', function (container) {
  'use strict';

  const s = 'AABABBA';
  const k = 1;
  const chars = s.split('');
  const frames = [];

  let L = 0, R = 0;
  let best = 0;
  const freq = {};

  function maxFreq() {
    return Math.max(0, ...Object.values(freq));
  }

  function getColors() {
    const colors = {};
    const mf = maxFreq();
    const majorityChar = Object.keys(freq).find((ch) => freq[ch] === mf);
    for (let i = L; i <= R; i++) {
      colors[i] = chars[i] === majorityChar ? 'good' : 'bad';
    }
    return colors;
  }

  // initial
  frames.push({
    caption: `k=${k}, find longest substring with ≤k replacements`,
    stat: ''
  });

  // expand window
  while (R < chars.length) {
    const ch = chars[R];
    freq[ch] = (freq[ch] || 0) + 1;
    const winLen = R - L + 1;
    const mf = maxFreq();
    let replacements = winLen - mf;

    frames.push({
      window: [L, R],
      color: getColors(),
      caption: `Add '${ch}' at R=${R}`,
      stat: `len=${winLen}, maxFreq=${mf}, replacements=${replacements}`
    });

    // shrink if invalid
    while (replacements > k) {
      const oldCh = chars[L];
      freq[oldCh]--;
      if (freq[oldCh] === 0) delete freq[oldCh];
      L++;
      const newWinLen = R - L + 1;
      const newMf = maxFreq();
      const newRepl = newWinLen - newMf;

      frames.push({
        window: [L, R],
        color: getColors(),
        caption: `Invalid (${replacements}>${k}), shrink L=${L}`,
        stat: `len=${newWinLen}, maxFreq=${newMf}, replacements=${newRepl}`
      });

      replacements = newRepl;   // recompute loop condition (prevents infinite loop)
    }

    const validWinLen = R - L + 1;
    const validMf = maxFreq();
    const validRepl = validWinLen - validMf;
    best = Math.max(best, validWinLen);

    frames.push({
      window: [L, R],
      color: getColors(),
      caption: `Valid window [${L},${R}], update best=${best}`,
      stat: `len=${validWinLen}, maxFreq=${validMf}, replacements=${validRepl} (≤${k}✓), best=${best}`
    });

    R++;
  }

  // final
  frames.push({
    window: [L, R - 1],
    color: getColors(),
    caption: `Done. Longest repeating substring length = ${best}`,
    stat: `best=${best}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: chars,
    title: 'Longest Repeating Character Replacement',
    note: `Window valid iff (length − maxFreq) ≤ k`,
    frames: frames
  });
});
