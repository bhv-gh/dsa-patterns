DSAAnim.register('trapping-rain-water', function(container) {
  'use strict';
  const height = [0,1,0,2,1,0,1,3,2,1,2,1];
  const n = height.length;
  const frames = [];

  // Track cumulative water at each index
  const water = new Array(n).fill(0);
  let total = 0;

  // Two-pointer algorithm simulation
  let L = 0, R = n - 1;
  let leftMax = 0, rightMax = 0;

  // Initial frame
  frames.push({
    pointers: { L, R },
    caption: 'Start with pointers at both ends. Track leftMax and rightMax.',
    stat: `water = ${total}`,
    water: [...water]
  });

  while (L < R) {
    if (height[L] < height[R]) {
      // Process left side
      if (height[L] >= leftMax) {
        leftMax = height[L];
        frames.push({
          pointers: { L, R },
          highlight: [L],
          caption: `height[L=${L}] = ${height[L]} updates leftMax to ${leftMax}. No water trapped.`,
          stat: `water = ${total}`,
          water: [...water]
        });
      } else {
        const trapped = leftMax - height[L];
        water[L] = leftMax;
        total += trapped;
        frames.push({
          pointers: { L, R },
          highlight: [L],
          color: { [L]: 'accent' },
          caption: `leftMax (${leftMax}) < rightMax (${rightMax}): trap ${trapped} at L=${L}`,
          stat: `water = ${total}`,
          water: [...water]
        });
      }
      L++;
    } else {
      // Process right side
      if (height[R] >= rightMax) {
        rightMax = height[R];
        frames.push({
          pointers: { L, R },
          highlight: [R],
          caption: `height[R=${R}] = ${height[R]} updates rightMax to ${rightMax}. No water trapped.`,
          stat: `water = ${total}`,
          water: [...water]
        });
      } else {
        const trapped = rightMax - height[R];
        water[R] = rightMax;
        total += trapped;
        frames.push({
          pointers: { L, R },
          highlight: [R],
          color: { [R]: 'accent2' },
          caption: `rightMax (${rightMax}) <= leftMax (${leftMax}): trap ${trapped} at R=${R}`,
          stat: `water = ${total}`,
          water: [...water]
        });
      }
      R--;
    }
  }

  // Final frame
  frames.push({
    caption: 'Done. Water trapped where min(leftMax, rightMax) > height.',
    stat: `water = ${total}`,
    water: [...water]
  });

  DSAAnim.render(container, {
    mode: 'bars',
    values: height,
    title: 'Trapping Rain Water (Two Pointers)',
    frames: frames
  });
});
