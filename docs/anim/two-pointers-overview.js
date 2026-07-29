DSAAnim.register('two-pointers-overview', function(container) {
  const values = [1, 2, 4, 7, 10, 11, 15];
  const target = 13;
  const frames = [];

  // Initial state
  frames.push({
    pointers: { L: 0, R: 6 },
    stat: 'nums[L] + nums[R] = 1 + 15 = 16',
    caption: 'Start with L at left, R at right. Target: 13'
  });

  // L=0, R=6: 1+15=16 > 13 → move R left
  frames.push({
    pointers: { L: 0, R: 6 },
    stat: 'nums[L] + nums[R] = 1 + 15 = 16',
    caption: 'Sum 16 > 13, too big → move R left',
    color: { 0: 'accent', 6: 'bad' }
  });

  // L=0, R=5: 1+11=12 < 13 → move L right
  frames.push({
    pointers: { L: 0, R: 5 },
    stat: 'nums[L] + nums[R] = 1 + 11 = 12',
    caption: 'Sum 12 < 13, too small → move L right',
    color: { 0: 'bad', 5: 'accent' }
  });

  // L=1, R=5: 2+11=13 → found!
  frames.push({
    pointers: { L: 1, R: 5 },
    stat: 'nums[L] + nums[R] = 2 + 11 = 13',
    caption: 'Sum 13 = 13, match!',
    highlight: [1, 5],
    color: { 1: 'good', 5: 'good' }
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Two Pointers: Find Pair with Target Sum',
    frames: frames
  });
});
