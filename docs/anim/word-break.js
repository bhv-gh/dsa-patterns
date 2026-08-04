DSAAnim.register('word-break', function(container) {
  const s = 'leetcode';
  const dict = new Set(['leet', 'code']);
  const n = s.length;
  const dp = Array(n + 1).fill(false);
  dp[0] = true;

  const frames = [];
  const chars = ['∅', ...s.split('')];

  // Initial state
  frames.push({
    labels: chars,
    color: { 0: 'good' },
    caption: 'dp[0] = True (empty string can be segmented)',
  });

  // DP iteration
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      const word = s.slice(j, i);
      const inDict = dict.has(word);
      const canSeg = dp[j] && inDict;

      const colorMap = {};
      for (let k = 0; k <= n; k++) {
        if (dp[k]) colorMap[k] = 'good';
        else if (k < i) colorMap[k] = 'mut';
      }
      colorMap[j] = 'accent';
      colorMap[i] = 'accent2';

      frames.push({
        labels: chars,
        pointers: { j: j, i: i },
        color: colorMap,
        caption: `Check s[${j}:${i}]="${word}" ${inDict ? '✓' : '✗'} dict, dp[${j}]=${dp[j]}`,
      });

      if (canSeg) {
        dp[i] = true;
        const colorMapAfter = {};
        for (let k = 0; k <= n; k++) {
          if (dp[k]) colorMapAfter[k] = 'good';
          else if (k <= i) colorMapAfter[k] = 'mut';
        }
        frames.push({
          labels: chars,
          pointers: { i: i },
          color: colorMapAfter,
          caption: `dp[${i}] = True`,
        });
        break;
      }
    }
  }

  // Final state
  const finalColor = {};
  for (let k = 0; k <= n; k++) {
    finalColor[k] = dp[k] ? 'good' : 'mut';
  }
  frames.push({
    labels: chars,
    color: finalColor,
    caption: `Result: "${s}" can${dp[n] ? '' : 'not'} be segmented`,
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: Array(n + 1).fill(0),
    labels: chars,
    title: 'Word Break DP',
    note: 'Can the string be split into dictionary words?',
    frames: frames,
  });
});
