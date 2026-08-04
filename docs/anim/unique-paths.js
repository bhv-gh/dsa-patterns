/* unique-paths — rolling-row DP for grid paths */
DSAAnim.register('unique-paths', function (container) {
  'use strict';

  // Simulate a 3×4 grid. We use rolling-row DP: only ONE row (4 cells) in memory.
  const cols = 4;
  const rows = 3;
  const frames = [];

  // Initial state: row 0 (top row) — all cells = 1 (one path each)
  let dp = [1, 1, 1, 1];
  frames.push({
    values: [...dp],
    labels: dp.map(String),
    caption: 'row 0: each cell has 1 path (from start)',
    stat: `row 0: [${dp.join(',')}]`,
    color: {}
  });

  // Compute row 1
  for (let c = 1; c < cols; c++) {
    frames.push({
      values: [...dp],
      labels: dp.map(String),
      caption: `row 1: reading dp[${c - 1}]`,
      stat: `row 1: updating dp[${c}]`,
      color: { [c - 1]: 'accent' }
    });
    dp[c] = dp[c] + dp[c - 1]; // dp[r][c] = dp[r-1][c] + dp[r][c-1]
    frames.push({
      values: [...dp],
      labels: dp.map(String),
      caption: `row 1: dp[${c}] = dp[${c}] + dp[${c - 1}] = ${dp[c]}`,
      stat: `row 1: [${dp.join(',')}]`,
      color: { [c]: 'good', [c - 1]: 'accent' }
    });
  }
  // Final state for row 1
  frames.push({
    values: [...dp],
    labels: dp.map(String),
    caption: 'row 1 complete',
    stat: `row 1: [${dp.join(',')}]`,
    color: {}
  });

  // Compute row 2 (final row)
  for (let c = 1; c < cols; c++) {
    frames.push({
      values: [...dp],
      labels: dp.map(String),
      caption: `row 2: reading dp[${c - 1}]`,
      stat: `row 2: updating dp[${c}]`,
      color: { [c - 1]: 'accent' }
    });
    dp[c] = dp[c] + dp[c - 1];
    frames.push({
      values: [...dp],
      labels: dp.map(String),
      caption: `row 2: dp[${c}] = dp[${c}] + dp[${c - 1}] = ${dp[c]}`,
      stat: `row 2: [${dp.join(',')}]`,
      color: { [c]: 'good', [c - 1]: 'accent' }
    });
  }
  // Final result
  frames.push({
    values: [...dp],
    labels: dp.map(String),
    caption: `dp[c] += dp[c-1] IS dp[r][c] = dp[r-1][c] + dp[r][c-1]`,
    stat: `row 2: [${dp.join(',')}] → answer = ${dp[cols - 1]}`,
    color: { [cols - 1]: 'good' }
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: [1, 1, 1, 1],
    labels: ['1', '1', '1', '1'],
    title: 'Unique Paths — Rolling-Row DP',
    note: 'Each cell = paths from top-left. dp[c] += dp[c-1] per row.',
    frames: frames
  });
});
