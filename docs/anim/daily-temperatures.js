DSAAnim.register('daily-temperatures', function (container) {
  'use strict';

  const temps = [73, 74, 75, 71, 69, 72, 76];
  const n = temps.length;
  const answer = Array(n).fill(0);
  const stack = [];
  const frames = [];
  const colors = {};

  // Initial frame
  frames.push({
    pointers: {},
    highlight: [],
    color: {},
    caption: 'Find how many days until a warmer temperature',
    stat: `answer: [${answer.join(', ')}]`
  });

  // Scan each day
  for (let i = 0; i < n; i++) {
    // Frame: pointer at current day
    frames.push({
      pointers: { i },
      highlight: stack.slice(),
      color: Object.assign({}, colors),
      caption: `Day ${i}: temp = ${temps[i]}°, check stack`,
      stat: `answer: [${answer.join(', ')}]`
    });

    // Resolve stack: pop days colder than current
    while (stack.length > 0 && temps[stack[stack.length - 1]] < temps[i]) {
      const day = stack.pop();
      const wait = i - day;
      answer[day] = wait;
      colors[day] = 'good';

      frames.push({
        pointers: { i, d: day },
        highlight: stack.slice(),
        color: Object.assign({}, colors),
        caption: `Day ${day} (${temps[day]}°) resolved: wait ${wait} day${wait > 1 ? 's' : ''}`,
        stat: `answer: [${answer.join(', ')}]`
      });
    }

    // Push current day onto stack
    stack.push(i);
    frames.push({
      pointers: { i },
      highlight: stack.slice(),
      color: Object.assign({}, colors),
      caption: `Day ${i} pushed to stack (waiting)`,
      stat: `answer: [${answer.join(', ')}]`
    });
  }

  // Final frame
  frames.push({
    pointers: {},
    highlight: [],
    color: colors,
    caption: 'Remaining days never get a warmer day (answer = 0)',
    stat: `answer: [${answer.join(', ')}]`
  });

  DSAAnim.render(container, {
    mode: 'bars',
    values: temps,
    title: 'Daily Temperatures (Monotonic Stack)',
    note: 'Maintain decreasing stack of indices awaiting warmer days',
    frames: frames
  });
});
