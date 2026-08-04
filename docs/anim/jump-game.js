DSAAnim.register('jump-game', function (container) {
  'use strict';

  const nums = [2, 3, 1, 1, 4];
  const n = nums.length;
  const frames = [];

  // Initial state
  frames.push({
    caption: 'Can we jump from index 0 to the last index?',
    pointers: {},
    color: {},
    stat: 'reach = 0'
  });

  let reach = 0;
  for (let i = 0; i < n; i++) {
    // Before updating reach
    const colorMap = {};
    for (let j = 0; j <= reach && j < n; j++) {
      colorMap[j] = 'good';
    }
    for (let j = reach + 1; j < n; j++) {
      colorMap[j] = 'mut';
    }
    colorMap[i] = 'accent';

    if (i > reach) {
      frames.push({
        caption: 'i exceeds reach — stuck! Cannot reach the end.',
        pointers: { i: i },
        color: colorMap,
        stat: `i = ${i}, reach = ${reach}`
      });
      break;
    }

    frames.push({
      caption: `At index ${i} (jump = ${nums[i]}), checking if we extend reach`,
      pointers: { i: i },
      color: colorMap,
      stat: `i = ${i}, reach = ${reach}`
    });

    const newReach = Math.max(reach, i + nums[i]);
    if (newReach > reach) {
      reach = newReach;
      const updatedColorMap = {};
      for (let j = 0; j <= reach && j < n; j++) {
        updatedColorMap[j] = 'good';
      }
      for (let j = reach + 1; j < n; j++) {
        updatedColorMap[j] = 'mut';
      }
      updatedColorMap[i] = 'accent';

      frames.push({
        caption: `Reach extended to ${reach}`,
        pointers: { i: i },
        color: updatedColorMap,
        stat: `i = ${i}, reach = ${reach}`
      });
    }

    if (reach >= n - 1) {
      const finalColorMap = {};
      for (let j = 0; j < n; j++) {
        finalColorMap[j] = 'good';
      }
      frames.push({
        caption: `Reach >= last index (${n - 1}) — we can jump to the end!`,
        pointers: { i: i },
        color: finalColorMap,
        stat: `i = ${i}, reach = ${reach} ✓`
      });
      break;
    }
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values: nums,
    labels: nums.map(String),
    title: 'Jump Game (Greedy)',
    note: 'Track the furthest index we can reach from index 0.',
    frames: frames
  });
});
