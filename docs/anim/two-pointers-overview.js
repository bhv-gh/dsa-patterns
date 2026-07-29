DSAAnim.register('two-pointers-overview', function(container) {
  const values = [1, 3, 4, 6, 8, 11];
  const target = 12;
  const frames = [];

  // Initial state
  frames.push({
    pointers: { L: 0, R: 5 },
    stat: '1 + 11 = 12',
    caption: 'Start with pointers at both ends of sorted array. Target sum: 12'
  });

  // Simulate the two-pointer algorithm
  let l = 0, r = 5;
  const steps = [];

  while (l < r) {
    const sum = values[l] + values[r];
    steps.push({ l, r, sum });
    if (sum === target) break;
    if (sum < target) l++;
    else r--;
  }

  // Build frames from simulation
  steps.forEach((step, idx) => {
    const { l, r, sum } = step;
    let caption, highlight, color;

    if (sum === target) {
      caption = 'Found it! ' + values[l] + ' + ' + values[r] + ' = ' + target;
      highlight = [l, r];
      color = { [l]: 'good', [r]: 'good' };
    } else if (sum < target) {
      caption = 'Sum too small (' + sum + ' < ' + target + ') → move L right';
      color = { [l]: 'bad', [r]: 'accent' };
    } else {
      caption = 'Sum too big (' + sum + ' > ' + target + ') → move R left';
      color = { [l]: 'accent', [r]: 'bad' };
    }

    frames.push({
      pointers: { L: l, R: r },
      stat: values[l] + ' + ' + values[r] + ' = ' + sum,
      caption: caption,
      highlight: highlight,
      color: color
    });
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Two Pointers: Find Pair with Target Sum',
    frames: frames
  });
});
