DSAAnim.register('search-in-rotated-sorted-array', function (container) {
  'use strict';

  const nums = [4, 5, 6, 7, 0, 1, 2];
  const target = 0;
  const frames = [];

  let lo = 0, hi = nums.length - 1;

  frames.push({
    pointers: { lo, hi },
    caption: `Search for ${target} in rotated sorted array`,
    stat: `target = ${target}`
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    frames.push({
      pointers: { lo, mid, hi },
      color: { [mid]: 'accent' },
      caption: `mid=${mid}, nums[mid]=${nums[mid]}`,
      stat: `target = ${target}`
    });

    if (nums[mid] === target) {
      frames.push({
        pointers: { mid },
        color: { [mid]: 'good' },
        caption: `Found! target at index ${mid}`,
        stat: `target = ${target}`
      });
      break;
    }

    if (nums[lo] <= nums[mid]) {
      const sortedHalf = [];
      for (let i = lo; i <= mid; i++) sortedHalf.push(i);

      frames.push({
        pointers: { lo, mid, hi },
        highlight: sortedHalf,
        color: { [mid]: 'accent' },
        caption: `Left half [${lo}..${mid}] is sorted`,
        stat: `target = ${target}`
      });

      if (nums[lo] <= target && target < nums[mid]) {
        const eliminated = [];
        for (let i = mid + 1; i <= hi; i++) eliminated.push(i);

        frames.push({
          pointers: { lo, mid, hi },
          highlight: sortedHalf,
          faded: eliminated,
          color: { [mid]: 'accent' },
          caption: `Target in left half, eliminate right`,
          stat: `target = ${target}`
        });
        hi = mid - 1;
      } else {
        const eliminated = [];
        for (let i = lo; i <= mid; i++) eliminated.push(i);

        frames.push({
          pointers: { lo, mid, hi },
          faded: eliminated,
          color: { [mid]: 'accent' },
          caption: `Target NOT in left half, search right`,
          stat: `target = ${target}`
        });
        lo = mid + 1;
      }
    } else {
      const sortedHalf = [];
      for (let i = mid; i <= hi; i++) sortedHalf.push(i);

      frames.push({
        pointers: { lo, mid, hi },
        highlight: sortedHalf,
        color: { [mid]: 'accent' },
        caption: `Right half [${mid}..${hi}] is sorted`,
        stat: `target = ${target}`
      });

      if (nums[mid] < target && target <= nums[hi]) {
        const eliminated = [];
        for (let i = lo; i < mid; i++) eliminated.push(i);

        frames.push({
          pointers: { lo, mid, hi },
          highlight: sortedHalf,
          faded: eliminated,
          color: { [mid]: 'accent' },
          caption: `Target in right half, eliminate left`,
          stat: `target = ${target}`
        });
        lo = mid + 1;
      } else {
        const eliminated = [];
        for (let i = mid; i <= hi; i++) eliminated.push(i);

        frames.push({
          pointers: { lo, mid, hi },
          faded: eliminated,
          color: { [mid]: 'accent' },
          caption: `Target NOT in right half, search left`,
          stat: `target = ${target}`
        });
        hi = mid - 1;
      }
    }
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values: nums,
    title: 'Search in Rotated Sorted Array',
    frames
  });
});
