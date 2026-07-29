DSAAnim.register('max-sum-distinct-subarrays-k', function(container) {
  'use strict';

  const values = [1, 5, 4, 2, 9, 9, 9];
  const k = 3;
  const frames = [];

  // Initial state
  frames.push({
    caption: 'Find max sum of distinct subarrays of length k=3'
  });

  let maxSum = 0;

  // Slide the window
  for (let l = 0; l <= values.length - k; l++) {
    const r = l + k - 1;
    const windowVals = values.slice(l, r + 1);

    // Check for duplicates
    const seen = new Set();
    let hasDuplicate = false;
    const duplicateIndices = [];

    for (let i = 0; i < windowVals.length; i++) {
      const val = windowVals[i];
      if (seen.has(val)) {
        hasDuplicate = true;
        duplicateIndices.push(l + i);
        // Also mark the first occurrence
        for (let j = 0; j < i; j++) {
          if (windowVals[j] === val && !duplicateIndices.includes(l + j)) {
            duplicateIndices.push(l + j);
          }
        }
      }
      seen.add(val);
    }

    if (hasDuplicate) {
      // Window has duplicates - skip it
      const color = {};
      duplicateIndices.forEach(idx => { color[idx] = 'bad'; });

      frames.push({
        window: [l, r],
        color: color,
        caption: 'duplicate → skip'
      });
    } else {
      // All distinct - compute sum
      const sum = windowVals.reduce((a, b) => a + b, 0);
      maxSum = Math.max(maxSum, sum);

      const color = {};
      for (let i = l; i <= r; i++) {
        color[i] = 'good';
      }

      frames.push({
        window: [l, r],
        color: color,
        stat: `sum=${sum} (valid), best=${maxSum}`,
        caption: 'all distinct ✓'
      });
    }
  }

  // Final frame
  frames.push({
    stat: `best=${maxSum}`,
    caption: `Maximum sum of distinct subarray of length ${k} is ${maxSum}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Max Sum of Distinct Subarrays (k=3)',
    note: 'Only windows with all distinct elements count',
    frames: frames
  });
});
