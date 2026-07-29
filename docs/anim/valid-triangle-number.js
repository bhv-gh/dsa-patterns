DSAAnim.register('valid-triangle-number', function (container) {
  'use strict';

  const values = [2, 2, 3, 4, 6];
  const frames = [];

  frames.push({
    caption: 'Array sorted: [2,2,3,4,6]. Count valid triangle triplets.',
    stat: 'count = 0'
  });

  frames.push({
    caption: 'Fix largest side k=4 (value=6). Try pairs with L=0, R=3.',
    pointers: { L: 0, R: 3, k: 4 },
    color: { 4: 'accent' },
    stat: 'count = 0'
  });

  frames.push({
    caption: '2+4 > 6? No. Move L forward.',
    pointers: { L: 0, R: 3, k: 4 },
    color: { 4: 'accent' },
    highlight: [0, 3],
    stat: '2+4=6 ≯ 6'
  });

  frames.push({
    caption: 'L=1, R=3: 2+4 > 6? No. Move L forward.',
    pointers: { L: 1, R: 3, k: 4 },
    color: { 4: 'accent' },
    highlight: [1, 3],
    stat: '2+4=6 ≯ 6'
  });

  frames.push({
    caption: 'L=2, R=3: 3+4 > 6? Yes! All pairs from L..R with R work.',
    pointers: { L: 2, R: 3, k: 4 },
    color: { 4: 'accent', 2: 'good', 3: 'good' },
    highlight: [2, 3],
    stat: '3+4=7 > 6 ✓'
  });

  frames.push({
    caption: 'Add (R-L) = 2 triangles. Move R left.',
    pointers: { L: 2, R: 3, k: 4 },
    color: { 4: 'accent', 2: 'good', 3: 'good' },
    stat: 'count = 2'
  });

  frames.push({
    caption: 'L=2, R=2: 3+3 > 6? Yes. Add (R-L)=1.',
    pointers: { L: 2, R: 2, k: 4 },
    color: { 4: 'accent', 2: 'good' },
    highlight: [2],
    stat: '3+3=6 ≯ 6'
  });

  frames.push({
    caption: 'Next largest: k=3 (value=4), L=0, R=2.',
    pointers: { L: 0, R: 2, k: 3 },
    color: { 3: 'accent' },
    stat: 'count = 2'
  });

  frames.push({
    caption: '2+3 > 4? Yes! Add (R-L)=2.',
    pointers: { L: 0, R: 2, k: 3 },
    color: { 3: 'accent', 0: 'good', 2: 'good' },
    highlight: [0, 2],
    stat: '2+3=5 > 4 ✓'
  });

  frames.push({
    caption: 'Move R left. L=0, R=1.',
    pointers: { L: 0, R: 1, k: 3 },
    color: { 3: 'accent' },
    stat: 'count = 4'
  });

  frames.push({
    caption: '2+2 > 4? No. Move L forward.',
    pointers: { L: 0, R: 1, k: 3 },
    color: { 3: 'accent' },
    highlight: [0, 1],
    stat: '2+2=4 ≯ 4'
  });

  frames.push({
    caption: 'L=1, R=1: 2+2 > 4? No. L≥R, done with k=3.',
    pointers: { L: 1, R: 1, k: 3 },
    color: { 3: 'accent' },
    stat: 'count = 4'
  });

  frames.push({
    caption: 'Continue for remaining k… Final count = 3 (simplified).',
    stat: 'count = 3',
    color: {}
  });

  frames.push({
    caption: 'Total valid triangles: 3.',
    stat: 'count = 3'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Valid Triangle Number (Two Pointers)',
    frames: frames
  });
});
