DSAAnim.register('largest-rectangle-in-histogram', function(container) {
  'use strict';

  const heights = [2, 1, 5, 6, 2, 3];
  const frames = [];

  // Simulation
  const stack = [];
  let maxArea = 0;
  let i = 0;

  frames.push({
    pointers: { i: 0 },
    highlight: [],
    caption: 'Start with empty stack',
    stat: 'max = 0'
  });

  while (i < heights.length) {
    // Pop while stack top has height >= current
    while (stack.length > 0 && heights[stack[stack.length - 1]] >= heights[i]) {
      const poppedIdx = stack.pop();
      const h = heights[poppedIdx];
      const left = stack.length > 0 ? stack[stack.length - 1] + 1 : 0;
      const right = i - 1;
      const width = right - left + 1;
      const area = h * width;

      if (area > maxArea) maxArea = area;

      // Create water array to shade rectangle
      const water = Array(heights.length).fill(0);
      for (let j = left; j <= right; j++) {
        water[j] = h;
      }

      frames.push({
        pointers: { i },
        highlight: [...stack],
        water,
        caption: `Pop idx ${poppedIdx}: h=${h}, width=${width} (${left}..${right})`,
        stat: `area=${area}, max=${maxArea}`
      });
    }

    // Push current index
    stack.push(i);
    frames.push({
      pointers: { i },
      highlight: [...stack],
      caption: `Push idx ${i} (h=${heights[i]}) to stack`,
      stat: `max = ${maxArea}`
    });

    i++;
  }

  // Flush remaining stack
  frames.push({
    pointers: { i },
    highlight: [...stack],
    caption: 'End of array, flush stack',
    stat: `max = ${maxArea}`
  });

  while (stack.length > 0) {
    const poppedIdx = stack.pop();
    const h = heights[poppedIdx];
    const left = stack.length > 0 ? stack[stack.length - 1] + 1 : 0;
    const right = i - 1;
    const width = right - left + 1;
    const area = h * width;

    if (area > maxArea) maxArea = area;

    const water = Array(heights.length).fill(0);
    for (let j = left; j <= right; j++) {
      water[j] = h;
    }

    frames.push({
      pointers: { i },
      highlight: [...stack],
      water,
      caption: `Pop idx ${poppedIdx}: h=${h}, width=${width} (${left}..${right})`,
      stat: `area=${area}, max=${maxArea}`
    });
  }

  frames.push({
    pointers: {},
    highlight: [],
    caption: `Done. Largest rectangle area = ${maxArea}`,
    stat: `max = ${maxArea}`
  });

  DSAAnim.render(container, {
    mode: 'bars',
    values: heights,
    title: 'Largest Rectangle in Histogram',
    note: 'Monotonic increasing stack tracks potential left boundaries',
    frames
  });
});
