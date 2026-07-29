DSAAnim.register('longest-valid-parentheses', function(container) {
  'use strict';

  const input = ')()())';
  const n = input.length;
  const frames = [];

  // Helper to build stack text
  function stackText(stack) {
    return 'stack: [' + stack.join(',') + ']';
  }

  // Initial: show input and empty state
  frames.push({
    caption: 'Input: "' + input + '". Seed stack with -1 as base.',
    stat: 'best = 0'
  });

  const stack = [-1];
  let best = 0;
  const colors = {};

  frames.push({
    caption: stackText(stack),
    stat: 'best = 0'
  });

  // Scan each character
  for (let i = 0; i < n; i++) {
    const ch = input[i];
    const pointers = { i };

    if (ch === '(') {
      // Push index
      stack.push(i);
      frames.push({
        pointers,
        color: Object.assign({}, colors),
        caption: 'i=' + i + ' is "(": push ' + i + '. ' + stackText(stack),
        stat: 'best = ' + best
      });
    } else {
      // Pop
      stack.pop();
      if (stack.length === 0) {
        // Stack empty, new base
        stack.push(i);
        frames.push({
          pointers,
          color: Object.assign({}, colors),
          caption: 'i=' + i + ' is ")": popped, stack empty → push ' + i + ' as new base. ' + stackText(stack),
          stat: 'best = ' + best
        });
      } else {
        // Calculate valid length
        const top = stack[stack.length - 1];
        const len = i - top;
        if (len > best) best = len;

        // Mark the valid span as good
        for (let j = top + 1; j <= i; j++) {
          colors[j] = 'good';
        }

        frames.push({
          pointers,
          color: Object.assign({}, colors),
          caption: 'i=' + i + ' is ")": popped. len = ' + i + ' - ' + top + ' = ' + len + '. ' + stackText(stack),
          stat: 'best = ' + best
        });
      }
    }
  }

  // Final frame
  frames.push({
    color: Object.assign({}, colors),
    caption: 'Done. Longest valid parentheses length = ' + best,
    stat: 'best = ' + best
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: input.split(''),
    labels: input.split(''),
    title: 'Longest Valid Parentheses (Stack of Indices)',
    note: 'Track indices on stack; compute length from stack top.',
    frames
  });
});
