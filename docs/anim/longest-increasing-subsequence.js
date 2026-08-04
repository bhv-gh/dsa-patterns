DSAAnim.register('longest-increasing-subsequence', function(container) {
  'use strict';

  const nums = [10, 9, 2, 5, 3, 7, 101, 18];
  const n = nums.length;
  const dp = new Array(n).fill(1);
  const frames = [];

  // Initial frame
  frames.push({
    labels: nums.map(() => '1'),
    caption: 'dp[i] = 1 + max(dp[j] for nums[j] < nums[i])',
    stat: 'dp[i]=1, best=1'
  });

  let best = 1;

  // Simulate the O(n^2) DP algorithm
  for (let i = 1; i < n; i++) {
    // Show i pointer at current position
    frames.push({
      labels: dp.map(String),
      pointers: { i: i },
      color: { [i]: 'accent' },
      caption: `Computing dp[${i}] for nums[${i}]=${nums[i]}`,
      stat: `dp[i]=1, best=${best}`
    });

    let maxLen = 0;
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        // Show j scanning, this j can extend
        const color = { [i]: 'accent', [j]: 'good' };
        const newLen = Math.max(maxLen, dp[j]);
        frames.push({
          labels: dp.map(String),
          pointers: { i: i, j: j },
          color: color,
          caption: `nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}, dp[${j}]=${dp[j]}`,
          stat: `dp[i]=${1 + newLen}, best=${best}`
        });
        maxLen = newLen;
      }
    }

    dp[i] = 1 + maxLen;
    best = Math.max(best, dp[i]);

    // Update dp[i] with final value
    frames.push({
      labels: dp.map(String),
      pointers: { i: i },
      color: { [i]: 'good' },
      caption: `dp[${i}] = ${dp[i]}`,
      stat: `dp[i]=${dp[i]}, best=${best}`
    });
  }

  // Final frame showing result
  frames.push({
    labels: dp.map(String),
    caption: `Longest increasing subsequence length = ${best}`,
    stat: `best=${best}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: nums,
    title: 'Longest Increasing Subsequence (O(n²) DP)',
    note: 'dp[i] = length of LIS ending at index i',
    frames: frames
  });
});
