DSAAnim.register('subarray-sum-equals-k', function(container) {
  const nums = [1, 2, 3, -2, 3];
  const k = 3;
  const frames = [];

  // Simulate the algorithm
  const seen = { 0: 1 };
  let runningSum = 0;
  let count = 0;

  // Frame 0: Initial state
  frames.push({
    caption: 'Prefix sum + hashmap. Seed seen={0:1}, k=3',
    stat: 'seen={0:1} count=0'
  });

  // Process each index
  for (let i = 0; i < nums.length; i++) {
    runningSum += nums[i];
    const needed = runningSum - k;
    const color = {};
    const highlight = [];

    color[i] = 'accent';

    // Check if we found a subarray
    if (seen[needed] !== undefined) {
      count += seen[needed];

      // Find an earlier index with prefix sum = needed
      let earlierIdx = -1;
      let tempSum = 0;
      for (let j = 0; j <= i; j++) {
        if (j > 0) tempSum += nums[j - 1];
        if (tempSum === needed) {
          earlierIdx = j;
          break;
        }
      }

      if (earlierIdx >= 0 && earlierIdx < i) {
        highlight.push(earlierIdx);
      }
      for (let j = earlierIdx + 1; j <= i; j++) {
        color[j] = 'good';
      }

      const seenStr = JSON.stringify(seen).replace(/"/g, '');
      frames.push({
        pointers: { i },
        color,
        highlight: earlierIdx >= 0 ? highlight : [],
        caption: `count += seen[${runningSum}-${k}]=${seen[needed]}`,
        stat: `sum=${runningSum} seen=${seenStr} count=${count}`
      });
    } else {
      const seenStr = JSON.stringify(seen).replace(/"/g, '');
      frames.push({
        pointers: { i },
        color,
        caption: `sum=${runningSum}, need ${needed} (not in seen)`,
        stat: `sum=${runningSum} seen=${seenStr} count=${count}`
      });
    }

    // Update seen
    seen[runningSum] = (seen[runningSum] || 0) + 1;
    const seenStr = JSON.stringify(seen).replace(/"/g, '');

    frames.push({
      pointers: { i },
      color: { [i]: 'mut' },
      caption: `seen[${runningSum}]++`,
      stat: `sum=${runningSum} seen=${seenStr} count=${count}`
    });
  }

  // Final frame
  const seenStr = JSON.stringify(seen).replace(/"/g, '');
  frames.push({
    caption: `Found ${count} subarrays with sum=${k}`,
    stat: `count=${count} seen=${seenStr}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: nums,
    title: 'Subarray Sum Equals K',
    note: 'Works with negatives (sliding window would not)',
    frames
  });
});
