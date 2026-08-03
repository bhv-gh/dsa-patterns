DSAAnim.register('subsets', function (container) {
  'use strict';

  // Generate all subsets of [1,2,3] via backtracking
  // Each frame shows: which elements are chosen (good), skipped (mut), and current subset in stat
  const input = [1, 2, 3];
  const frames = [];

  function backtrack(index, current, colorState) {
    // Base case: reached the end, capture the subset
    if (index === input.length) {
      frames.push({
        color: { ...colorState },
        stat: '[' + current.join(',') + ']',
        caption: 'Found subset ' + '[' + current.join(',') + ']'
      });
      return;
    }

    // Choose current element
    const chosenColor = { ...colorState, [index]: 'good' };
    frames.push({
      color: chosenColor,
      stat: '[' + current.join(',') + ']',
      caption: 'Choose ' + input[index] + ' → explore'
    });
    current.push(input[index]);
    backtrack(index + 1, current, chosenColor);
    current.pop();

    // Backtrack: un-choose
    const skippedColor = { ...colorState, [index]: 'mut' };
    frames.push({
      color: skippedColor,
      stat: '[' + current.join(',') + ']',
      caption: 'Un-choose ' + input[index] + ' → backtrack'
    });

    // Skip current element (explore without it)
    backtrack(index + 1, current, skippedColor);
  }

  backtrack(0, [], {});

  DSAAnim.render(container, {
    mode: 'cells',
    values: input,
    title: 'Power Set via Backtracking',
    note: 'Choose/un-choose each element to generate all subsets',
    frames: frames
  });
});
