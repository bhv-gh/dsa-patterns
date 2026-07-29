DSAAnim.register('monotonic-stack', function (container) {
  'use strict';

  const values = [2, 1, 2, 4, 3];
  const frames = [];
  const stack = [];
  const nge = new Array(values.length).fill(-1);

  // Initial state
  frames.push({
    pointers: {},
    highlight: [],
    color: {},
    caption: 'Find Next Greater Element for each bar using a decreasing monotonic stack',
    stat: 'stack: []'
  });

  // Process each element
  for (let i = 0; i < values.length; i++) {
    const current = values[i];

    // Frame: current element being processed
    frames.push({
      pointers: { i },
      highlight: stack.slice(),
      color: {},
      caption: `Scan i=${i}, value=${current}`,
      stat: `stack: [${stack.join(', ')}]`
    });

    // Pop elements smaller than current
    while (stack.length > 0 && values[stack[stack.length - 1]] < current) {
      const poppedIdx = stack.pop();
      nge[poppedIdx] = current;

      frames.push({
        pointers: { i },
        highlight: stack.slice(),
        color: { [poppedIdx]: 'good' },
        caption: `Pop ${poppedIdx}: value ${values[poppedIdx]} < ${current}, NGE[${poppedIdx}] = ${current}`,
        stat: `stack: [${stack.join(', ')}]`
      });
    }

    // Push current index
    stack.push(i);
    frames.push({
      pointers: { i },
      highlight: stack.slice(),
      color: {},
      caption: `Push index ${i} onto stack (value=${current})`,
      stat: `stack: [${stack.join(', ')}]`
    });
  }

  // Final state
  frames.push({
    pointers: {},
    highlight: [],
    color: {},
    caption: 'Complete. Remaining stack elements have no greater element.',
    stat: `NGE: [${nge.map(v => v === -1 ? '-' : v).join(', ')}]`
  });

  // Summary with O(n) explanation
  frames.push({
    pointers: {},
    highlight: [],
    color: Object.fromEntries(nge.map((v, i) => [i, v === -1 ? 'bad' : 'good'])),
    caption: 'O(n) time: each element pushed once, popped at most once = 2n ops total',
    stat: `NGE: [${nge.map(v => v === -1 ? '-' : v).join(', ')}]`
  });

  DSAAnim.render(container, {
    mode: 'bars',
    values: values,
    title: 'Monotonic Stack – Next Greater Element',
    note: 'Maintain a decreasing stack to find NGE in O(n)',
    frames: frames
  });
});
