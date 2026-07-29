DSAAnim.register('fixed-length-sliding-window', function (container) {
  'use strict';
  const values = [2, 1, 5, 1, 3, 2];
  const k = 3;
  const frames = [];

  // Frame 0: Initial window [0,2]
  let sum = values[0] + values[1] + values[2]; // 2+1+5=8
  let best = sum;
  frames.push({
    window: [0, 2],
    color: { 0: 'accent', 1: 'accent', 2: 'accent' },
    caption: 'Initial window: sum first k=3 elements',
    stat: `sum=${sum}, best=${best}`
  });

  // Frame 1: Slide to [1,3]
  const leaving1 = values[0]; // 2
  const entering1 = values[3]; // 1
  sum = sum - leaving1 + entering1; // 8-2+1=7
  best = Math.max(best, sum);
  frames.push({
    window: [1, 3],
    color: { 0: 'bad', 3: 'good' },
    caption: `−${leaving1}, +${entering1} → O(1) update`,
    stat: `sum=${sum}, best=${best}`
  });

  // Frame 2: Slide to [2,4]
  const leaving2 = values[1]; // 1
  const entering2 = values[4]; // 3
  sum = sum - leaving2 + entering2; // 7-1+3=9
  best = Math.max(best, sum);
  frames.push({
    window: [2, 4],
    color: { 1: 'bad', 4: 'good' },
    caption: `−${leaving2}, +${entering2} → O(1) update`,
    stat: `sum=${sum}, best=${best}`
  });

  // Frame 3: Slide to [3,5]
  const leaving3 = values[2]; // 5
  const entering3 = values[5]; // 2
  sum = sum - leaving3 + entering3; // 9-5+2=6
  best = Math.max(best, sum);
  frames.push({
    window: [3, 5],
    color: { 2: 'bad', 5: 'good' },
    caption: `−${leaving3}, +${entering3} → O(1) update`,
    stat: `sum=${sum}, best=${best}`
  });

  // Frame 4: Final result
  frames.push({
    window: [2, 4],
    color: { 2: 'accent2', 3: 'accent2', 4: 'accent2' },
    caption: 'Maximum sum window found',
    stat: `best=${best}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Fixed-Length Sliding Window (k=3)',
    note: 'Add entering, subtract leaving — O(n) total vs O(n·k) naive',
    frames: frames
  });
});
