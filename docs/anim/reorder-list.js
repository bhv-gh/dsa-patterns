DSAAnim.register('reorder-list', function(container) {
  'use strict';

  DSAAnim.render(container, {
    mode: 'cells',
    values: [1, 2, 3, 4, 5],
    title: 'Reorder List (LeetCode 143)',
    frames: [
      {
        values: [1, 2, 3, 4, 5],
        caption: 'Initial list: 1→2→3→4→5'
      },
      {
        values: [1, 2, 3, 4, 5],
        pointers: { slow: 0, fast: 0 },
        caption: 'Find middle: slow & fast start at head'
      },
      {
        values: [1, 2, 3, 4, 5],
        pointers: { slow: 1, fast: 2 },
        caption: 'slow advances 1, fast advances 2'
      },
      {
        values: [1, 2, 3, 4, 5],
        pointers: { slow: 2, fast: 4 },
        caption: 'slow at middle when fast reaches end'
      },
      {
        values: [1, 2, 3, 4, 5],
        pointers: { mid: 2 },
        color: { 0: 'accent', 1: 'accent', 2: 'good', 3: 'accent2', 4: 'accent2' },
        caption: 'Split: first half [1,2,3], second half [4,5]'
      },
      {
        values: [1, 2, 3, 5, 4],
        pointers: { mid: 2 },
        color: { 0: 'accent', 1: 'accent', 2: 'good', 3: 'mut', 4: 'mut' },
        caption: 'Reverse second half: [4,5] → [5,4]'
      },
      {
        values: [1, 2, 3, 5, 4],
        pointers: { L: 0, R: 3 },
        color: { 0: 'accent', 3: 'accent2' },
        caption: 'Merge: L at 1, R at 5'
      },
      {
        values: [1, 5, 2, 4, 3],
        pointers: { L: 1, R: 4 },
        color: { 0: 'good', 1: 'good', 2: 'accent', 4: 'accent2' },
        caption: 'After merge step: 1→5, advance pointers'
      },
      {
        values: [1, 5, 2, 4, 3],
        pointers: { L: 2, R: 4 },
        color: { 0: 'good', 1: 'good', 2: 'good', 3: 'good', 4: 'accent2' },
        caption: 'Continue: 2→4, merge alternately'
      },
      {
        values: [1, 5, 2, 4, 3],
        color: { 0: 'good', 1: 'good', 2: 'good', 3: 'good', 4: 'good' },
        caption: 'Final: 1→5→2→4→3'
      }
    ]
  });
});
