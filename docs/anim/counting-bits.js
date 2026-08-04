DSAAnim.register('counting-bits', function (container) {
  'use strict';

  // Simulate the dp[i] = dp[i >> 1] + (i & 1) algorithm for i = 0..8
  const n = 9;
  const dp = new Array(n);
  const frames = [];

  // Initial state: all slots empty
  frames.push({
    labels: Array(n).fill('?'),
    caption: 'dp[i] = popcount of i. Each answer reuses dp[i>>1].',
  });

  // Base case: dp[0] = 0
  dp[0] = 0;
  frames.push({
    labels: dp.map((v, i) => (i === 0 ? String(v) : '?')),
    color: { 0: 'good' },
    caption: 'Base case: dp[0] = 0.',
  });

  // Compute dp[1..8]
  for (let i = 1; i < n; i++) {
    const half = i >> 1;
    const bit = i & 1;
    dp[i] = dp[half] + bit;

    frames.push({
      labels: dp.map((v, idx) => (idx <= i ? String(v) : '?')),
      color: { [half]: 'accent', [i]: 'good' },
      stat: `dp[${i}] = dp[${half}] + ${bit} = ${dp[i]}`,
      caption: `dp[${i}] reuses already-computed dp[${half}]. Total O(n).`,
    });
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values: Array.from({ length: n }, (_, i) => i),
    title: 'Counting Bits (dp[i] = dp[i>>1] + (i&1))',
    frames: frames,
  });
});
