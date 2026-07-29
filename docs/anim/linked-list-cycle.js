DSAAnim.register('linked-list-cycle', function (container) {
  'use strict';

  const values = [1, 2, 3, 4, 5];
  const cycleStart = 2;
  const frames = [];

  frames.push({
    pointers: { slow: 0, fast: 0 },
    caption: 'Floyd\'s cycle detection: tail (index 4) links back to index 2',
    stat: 'slow=0, fast=0'
  });

  function getNext(idx) {
    if (idx >= cycleStart) {
      const offset = (idx - cycleStart + 1) % 3;
      return cycleStart + offset;
    }
    return idx + 1;
  }

  let slow = 0, fast = 0;
  let step = 0;
  const maxSteps = 15;

  while (step < maxSteps) {
    slow = getNext(slow);
    fast = getNext(fast);
    fast = getNext(fast);
    step++;

    const color = {};
    if (slow === fast) {
      color[slow] = 'good';
      frames.push({
        pointers: { slow, fast },
        color,
        caption: 'Slow and fast meet → cycle exists',
        stat: `slow=${slow}, fast=${fast}`
      });
      break;
    } else {
      frames.push({
        pointers: { slow, fast },
        caption: `Slow +1, fast +2 (step ${step})`,
        stat: `slow=${slow}, fast=${fast}`
      });
    }
  }

  frames.push({
    caption: 'If no cycle, fast would reach null; here we detected the cycle',
    stat: 'Cycle found'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values,
    title: 'Linked List Cycle (Floyd\'s Algorithm)',
    frames
  });
});
