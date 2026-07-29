DSAAnim.register('move-zeroes', function (container) {
  'use strict';

  const frames = [];
  const nums = [0, 1, 0, 3, 12];
  let slow = 0;

  // Initial state
  frames.push({
    values: [...nums],
    pointers: { slow: 0, fast: 0 },
    color: { 0: 'mut', 2: 'mut' },
    caption: 'Start: slow and fast at index 0'
  });

  // Process each element with fast pointer
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      // Show the non-zero element found
      const colorBefore = {};
      for (let i = 0; i < nums.length; i++) {
        if (nums[i] === 0) colorBefore[i] = 'mut';
      }
      colorBefore[fast] = 'accent';
      frames.push({
        values: [...nums],
        pointers: { slow, fast },
        color: colorBefore,
        caption: `nums[${fast}]=${nums[fast]} is non-zero`
      });

      // Perform swap
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]];

      // Show after swap
      const colorAfter = {};
      for (let i = 0; i < nums.length; i++) {
        if (nums[i] === 0) colorAfter[i] = 'mut';
      }
      colorAfter[slow] = 'good';
      frames.push({
        values: [...nums],
        pointers: { slow, fast },
        color: colorAfter,
        caption: `Swap: nums[${slow}] ↔ nums[${fast}], then slow++`
      });

      slow++;
    } else {
      // Zero found, skip it
      const color = {};
      for (let i = 0; i < nums.length; i++) {
        if (nums[i] === 0) color[i] = 'mut';
      }
      color[fast] = 'warn';
      frames.push({
        values: [...nums],
        pointers: { slow, fast },
        color,
        caption: `nums[${fast}]=0 → skip, fast++`
      });
    }
  }

  // Final state
  const colorFinal = {};
  for (let i = 0; i < slow; i++) {
    colorFinal[i] = 'good';
  }
  for (let i = slow; i < nums.length; i++) {
    colorFinal[i] = 'mut';
  }
  frames.push({
    values: [...nums],
    pointers: {},
    color: colorFinal,
    caption: 'Done: all non-zeros moved to front'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: [0, 1, 0, 3, 12],
    title: 'Move Zeroes (In-Place)',
    note: 'Two pointers: slow tracks next non-zero position, fast scans array',
    frames
  });
});
