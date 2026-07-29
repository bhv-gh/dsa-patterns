DSAAnim.register('palindrome-linked-list', function(container) {
  'use strict';

  const original = [1, 2, 3, 2, 1];
  const frames = [];

  // Phase 1: Find middle using fast/slow pointers
  frames.push({
    caption: 'Initialize slow and fast pointers at head',
    pointers: { slow: 0, fast: 0 }
  });

  frames.push({
    caption: 'Move fast by 2, slow by 1',
    pointers: { slow: 1, fast: 2 }
  });

  frames.push({
    caption: 'Continue: fast advances twice, slow once',
    pointers: { slow: 2, fast: 4 }
  });

  frames.push({
    caption: 'Fast reached end; slow is at middle',
    pointers: { slow: 2, fast: 4 },
    color: { 2: 'accent' }
  });

  // Phase 2: Reverse second half
  const reversed = [1, 2, 3, 1, 2];

  frames.push({
    caption: 'Reverse second half in-place',
    values: [1, 2, 3, 1, 2],
    pointers: { slow: 2 },
    color: { 3: 'mut', 4: 'mut' }
  });

  frames.push({
    caption: 'Second half reversed',
    values: reversed,
    color: { 3: 'accent2', 4: 'accent2' }
  });

  // Phase 3: Compare from both ends
  frames.push({
    caption: 'Compare first and last elements',
    values: reversed,
    pointers: { left: 0, right: 4 }
  });

  frames.push({
    caption: 'Match found: 1 == 1',
    values: reversed,
    pointers: { left: 0, right: 4 },
    color: { 0: 'good', 4: 'good' }
  });

  frames.push({
    caption: 'Move pointers inward',
    values: reversed,
    pointers: { left: 1, right: 3 },
    color: { 0: 'good', 4: 'good' }
  });

  frames.push({
    caption: 'Match found: 2 == 2',
    values: reversed,
    pointers: { left: 1, right: 3 },
    color: { 0: 'good', 1: 'good', 3: 'good', 4: 'good' }
  });

  frames.push({
    caption: 'Pointers meet at middle',
    values: reversed,
    pointers: { left: 2, right: 2 },
    color: { 0: 'good', 1: 'good', 3: 'good', 4: 'good' }
  });

  frames.push({
    caption: 'Palindrome confirmed',
    values: reversed,
    color: { 0: 'good', 1: 'good', 2: 'good', 3: 'good', 4: 'good' },
    stat: 'Palindrome: YES'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: original,
    title: 'Palindrome Linked List',
    frames: frames
  });
});
