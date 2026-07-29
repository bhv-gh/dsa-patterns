DSAAnim.register('binary-search-overview', function (container) {
  'use strict';

  const nums = [1, 3, 5, 7, 9, 11, 13, 15];
  const target = 11;
  const frames = [];

  // Initial state
  let lo = 0;
  let hi = nums.length - 1;

  frames.push({
    pointers: { lo, hi },
    caption: 'Start: search for ' + target + ' in sorted array',
    stat: 'target = ' + target
  });

  // Binary search simulation
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midVal = nums[mid];

    // Show mid calculation and comparison
    frames.push({
      pointers: { lo, mid, hi },
      color: { [mid]: 'accent' },
      caption: 'mid = ' + mid + ', nums[' + mid + '] = ' + midVal,
      stat: 'mid = nums[' + mid + '] = ' + midVal + ' vs target ' + target
    });

    if (midVal === target) {
      // Found target
      frames.push({
        pointers: { mid },
        color: { [mid]: 'good' },
        caption: 'Found! nums[' + mid + '] = ' + target,
        stat: 'Found at index ' + mid
      });
      break;
    } else if (midVal < target) {
      // Fade left half + mid, move lo
      const faded = [];
      for (let i = lo; i <= mid; i++) faded.push(i);
      const newLo = mid + 1;

      frames.push({
        pointers: { lo: newLo, hi },
        faded,
        caption: midVal + ' < ' + target + ', eliminate left half',
        stat: 'nums[' + mid + '] = ' + midVal + ' < ' + target
      });

      lo = newLo;
    } else {
      // Fade right half + mid, move hi
      const faded = [];
      for (let i = mid; i <= hi; i++) faded.push(i);
      const newHi = mid - 1;

      frames.push({
        pointers: { lo, hi: newHi },
        faded,
        caption: midVal + ' > ' + target + ', eliminate right half',
        stat: 'nums[' + mid + '] = ' + midVal + ' > ' + target
      });

      hi = newHi;
    }
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values: nums,
    title: 'Binary Search',
    note: 'Efficiently search a sorted array by halving the search space',
    frames
  });
});
