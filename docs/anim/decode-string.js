DSAAnim.register('decode-string', function(container) {
  'use strict';

  const input = '3[a2[c]]';
  const stackSize = 6;

  // Simulate the decode algorithm
  const frames = [];
  const stack = [];
  let current = '';
  let num = 0;

  function addFrame(caption, stat, highlightIdx) {
    const values = [];
    const labels = [];
    const faded = [];
    const highlight = [];

    for (let i = 0; i < stackSize; i++) {
      if (i < stack.length) {
        const entry = stack[i];
        values.push(i);
        labels.push(entry.str === '' ? `'',${entry.count}` : `${entry.str}×${entry.count}`);
      } else {
        values.push(i);
        labels.push('');
        faded.push(i);
      }
    }

    if (highlightIdx != null && highlightIdx >= 0 && highlightIdx < stackSize) {
      highlight.push(highlightIdx);
    }

    frames.push({
      values: values,
      labels: labels,
      faded: faded,
      highlight: highlight,
      caption: caption,
      stat: stat || current || '""'
    });
  }

  addFrame('Start: empty stack, scan "3[a2[c]]"', '""');

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch >= '0' && ch <= '9') {
      num = num * 10 + parseInt(ch);
      addFrame(`Read digit '${ch}', build count = ${num}`, current || '""');
    } else if (ch === '[') {
      stack.push({ str: current, count: num });
      const topIdx = stack.length - 1;
      addFrame(`'[': push ("${current}",${num}), reset`, '""', topIdx);
      current = '';
      num = 0;
    } else if (ch === ']') {
      const topIdx = stack.length - 1;
      const popped = stack.pop();
      const repeated = current.repeat(popped.count);
      const newCurrent = popped.str + repeated;
      addFrame(`']': pop ("${popped.str}",${popped.count}), repeat "${current}"×${popped.count}`, newCurrent, topIdx);
      current = newCurrent;
    } else {
      current += ch;
      const topIdx = stack.length > 0 ? stack.length - 1 : null;
      addFrame(`Read '${ch}', append to current`, current, topIdx);
    }
  }

  addFrame('Done! Final decoded string', current);

  DSAAnim.render(container, {
    mode: 'cells',
    values: Array.from({ length: stackSize }, (_, i) => i),
    labels: Array(stackSize).fill(''),
    title: 'Decode String (Stack)',
    note: 'Push state on "[", pop and expand on "]"',
    frames: frames
  });
});
