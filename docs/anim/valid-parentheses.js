DSAAnim.register('valid-parentheses', function(container) {
  'use strict';

  const input = '([{}])';
  const stack = [];
  const frames = [];
  const STACK_SIZE = 7;

  const matches = { '(': ')', '[': ']', '{': '}' };
  const openers = new Set(['(', '[', '{']);

  function makeFrame(caption, stat, highlightIdx) {
    const values = [];
    const labels = [];
    const faded = [];
    const color = {};
    const highlight = [];

    for (let i = 0; i < STACK_SIZE; i++) {
      if (i < stack.length) {
        values[i] = stack[i];
        labels[i] = stack[i];
      } else {
        values[i] = '';
        labels[i] = '';
        faded.push(i);
      }
    }

    if (highlightIdx !== undefined && highlightIdx < stack.length) {
      highlight.push(highlightIdx);
    }

    return { values, labels, faded, color, highlight, caption, stat };
  }

  // Initial empty stack
  frames.push(makeFrame('Start with empty stack', `scanning: none`));

  let valid = true;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (openers.has(ch)) {
      stack.push(ch);
      frames.push(makeFrame(
        `Scan '${ch}' → push opener`,
        `scanning: '${ch}'`,
        stack.length - 1
      ));
    } else {
      const top = stack[stack.length - 1];
      if (stack.length === 0 || matches[top] !== ch) {
        valid = false;
        const topIdx = stack.length > 0 ? stack.length - 1 : undefined;
        const frame = makeFrame(
          `Scan '${ch}' → mismatch!`,
          `scanning: '${ch}'`,
          topIdx
        );
        if (topIdx !== undefined) {
          frame.color[topIdx] = 'bad';
        }
        frames.push(frame);
        break;
      } else {
        const popIdx = stack.length - 1;
        const frame = makeFrame(
          `Scan '${ch}' → matches '${top}', pop`,
          `scanning: '${ch}'`,
          popIdx
        );
        frame.color[popIdx] = 'good';
        frames.push(frame);
        stack.pop();
      }
    }
  }

  if (valid && stack.length === 0) {
    frames.push(makeFrame('Stack empty → valid', 'valid ✓ (stack empty)'));
  } else if (valid && stack.length > 0) {
    frames.push(makeFrame('Stack not empty → invalid', 'invalid ✗ (unclosed)'));
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values: new Array(STACK_SIZE).fill(''),
    labels: new Array(STACK_SIZE).fill(''),
    title: 'Valid Parentheses (Stack)',
    note: 'Push openers, pop on matching closers',
    frames: frames
  });
});
