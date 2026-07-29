DSAAnim.register('swap-nodes-in-pairs', function(container) {
  'use strict';

  const frames = [];
  const values = [1, 2, 3, 4, 5, 6];

  // Initial state
  frames.push({
    values: [...values],
    caption: 'Initial list: swap each adjacent pair'
  });

  const arr = [...values];

  // Swap pair 1: indices 0,1
  frames.push({
    values: [...arr],
    color: { 0: 'accent', 1: 'accent' },
    caption: 'Swapping pair (1,2) at indices 0-1'
  });
  [arr[0], arr[1]] = [arr[1], arr[0]];
  frames.push({
    values: [...arr],
    color: { 0: 'good', 1: 'good' },
    caption: 'Pair swapped → [2,1,...]'
  });

  // Swap pair 2: indices 2,3
  frames.push({
    values: [...arr],
    color: { 2: 'accent', 3: 'accent' },
    caption: 'Swapping pair (3,4) at indices 2-3'
  });
  [arr[2], arr[3]] = [arr[3], arr[2]];
  frames.push({
    values: [...arr],
    color: { 2: 'good', 3: 'good' },
    caption: 'Pair swapped → [2,1,4,3,...]'
  });

  // Swap pair 3: indices 4,5
  frames.push({
    values: [...arr],
    color: { 4: 'accent', 5: 'accent' },
    caption: 'Swapping pair (5,6) at indices 4-5'
  });
  [arr[4], arr[5]] = [arr[5], arr[4]];
  frames.push({
    values: [...arr],
    color: { 4: 'good', 5: 'good' },
    caption: 'Pair swapped → [2,1,4,3,6,5]'
  });

  // Final state
  frames.push({
    values: [...arr],
    caption: 'All pairs swapped: [2,1,4,3,6,5]'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Swap Nodes in Pairs',
    frames: frames
  });
});
