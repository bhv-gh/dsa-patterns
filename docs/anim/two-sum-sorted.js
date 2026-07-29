/* Two Sum on a Sorted Array — two-pointer convergence visualization */
DSAAnim.register('two-sum-sorted', function(container) {
  'use strict';

  const values = [2, 3, 5, 8, 11, 15];
  const target = 13;
  const frames = [];

  // Simulate the two-pointer algorithm
  let L = 0;
  let R = values.length - 1;

  // Initial state
  frames.push({
    pointers: { L, R },
    stat: `target = ${target}`,
    caption: 'Start with L at leftmost, R at rightmost index.'
  });

  while (L < R) {
    const sum = values[L] + values[R];

    if (sum === target) {
      // Found the match
      frames.push({
        pointers: { L, R },
        highlight: [L, R],
        color: { [L]: 'good', [R]: 'good' },
        stat: `nums[${L}] + nums[${R}] = ${sum}`,
        caption: `Match! ${values[L]} + ${values[R]} = ${target}`
      });
      break;
    } else if (sum < target) {
      // Sum too small, move left pointer right
      frames.push({
        pointers: { L, R },
        highlight: [L, R],
        color: { [L]: 'accent', [R]: 'accent' },
        stat: `nums[${L}] + nums[${R}] = ${sum}`,
        caption: `${sum} < ${target} → need bigger → L++`
      });
      L++;
    } else {
      // Sum too large, move right pointer left
      frames.push({
        pointers: { L, R },
        highlight: [L, R],
        color: { [L]: 'accent2', [R]: 'accent2' },
        stat: `nums[${L}] + nums[${R}] = ${sum}`,
        caption: `${sum} > ${target} → need smaller → R--`
      });
      R--;
    }
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values,
    title: 'Two Sum (Sorted Array)',
    note: 'Sortedness makes the pointer move decision unambiguous.',
    frames
  });
});
