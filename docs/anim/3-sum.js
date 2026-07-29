DSAAnim.register('3-sum', function(container) {
  'use strict';

  const values = [-4, -1, -1, 0, 1, 2];
  const frames = [];

  // Initial state
  frames.push({
    caption: 'Sorted array. Goal: find all triplets that sum to 0',
    stat: ''
  });

  // i = 0, nums[i] = -4, target = 4
  frames.push({
    pointers: { i: 0 },
    color: { 0: 'accent' },
    caption: 'Fix i=0 (val=-4). Find pairs summing to 4 in rest',
    stat: 'target = 4'
  });

  frames.push({
    pointers: { i: 0, L: 1, R: 5 },
    color: { 0: 'accent' },
    caption: 'Init L=1, R=5',
    stat: '(-4) + (-1) + 2 = -3'
  });

  frames.push({
    pointers: { i: 0, L: 2, R: 5 },
    color: { 0: 'accent' },
    caption: 'sum < 0 → L++',
    stat: '(-4) + (-1) + 2 = -3'
  });

  frames.push({
    pointers: { i: 0, L: 3, R: 5 },
    color: { 0: 'accent' },
    caption: 'sum < 0 → L++',
    stat: '(-4) + 0 + 2 = -2'
  });

  frames.push({
    pointers: { i: 0, L: 4, R: 5 },
    color: { 0: 'accent' },
    caption: 'sum < 0 → L++',
    stat: '(-4) + 1 + 2 = -1'
  });

  frames.push({
    pointers: { i: 0, L: 5, R: 5 },
    color: { 0: 'accent' },
    caption: 'L meets R. No triplets for i=0',
    stat: ''
  });

  // i = 1, nums[i] = -1, target = 1
  frames.push({
    pointers: { i: 1 },
    color: { 1: 'accent' },
    caption: 'Fix i=1 (val=-1). Find pairs summing to 1',
    stat: 'target = 1'
  });

  frames.push({
    pointers: { i: 1, L: 2, R: 5 },
    color: { 1: 'accent' },
    caption: 'Init L=2, R=5',
    stat: '(-1) + (-1) + 2 = 0'
  });

  frames.push({
    pointers: { i: 1, L: 2, R: 5 },
    color: { 1: 'good', 2: 'good', 5: 'good' },
    caption: 'sum = 0 → triplet found! [-1,-1,2]',
    stat: '(-1) + (-1) + 2 = 0 ✓'
  });

  frames.push({
    pointers: { i: 1, L: 3, R: 4 },
    color: { 1: 'accent' },
    caption: 'Move both: L++ (skip dup -1), R--',
    stat: '(-1) + 0 + 1 = 0'
  });

  frames.push({
    pointers: { i: 1, L: 3, R: 4 },
    color: { 1: 'good', 3: 'good', 4: 'good' },
    caption: 'sum = 0 → triplet found! [-1,0,1]',
    stat: '(-1) + 0 + 1 = 0 ✓'
  });

  frames.push({
    pointers: { i: 1, L: 4, R: 3 },
    color: { 1: 'accent' },
    caption: 'L > R. Done with i=1',
    stat: ''
  });

  // i = 2, nums[i] = -1 (duplicate of i=1)
  frames.push({
    pointers: { i: 2 },
    color: { 2: 'warn' },
    faded: [2],
    caption: 'i=2 has same value as i=1. Skip duplicate',
    stat: ''
  });

  // i = 3, nums[i] = 0
  frames.push({
    pointers: { i: 3 },
    color: { 3: 'accent' },
    caption: 'Fix i=3 (val=0). Find pairs summing to 0',
    stat: 'target = 0'
  });

  frames.push({
    pointers: { i: 3, L: 4, R: 5 },
    color: { 3: 'accent' },
    caption: 'Init L=4, R=5',
    stat: '0 + 1 + 2 = 3'
  });

  frames.push({
    pointers: { i: 3, L: 4, R: 4 },
    color: { 3: 'accent' },
    caption: 'sum > 0 → R--. Now L meets R, done',
    stat: ''
  });

  frames.push({
    caption: 'Algorithm complete. Found 2 triplets: [-1,-1,2] and [-1,0,1]',
    stat: 'triplets = 2'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: '3-Sum (Two-Pointer Technique)',
    frames: frames
  });
});
