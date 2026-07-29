DSAAnim.register('max-sum-subarrays-size-k', function(container) {
  'use strict';

  const values = [5, 1, 3, 2, 4];
  const k = 3;
  const frames = [];

  // Build initial window sum
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += values[i];
    const color = {};
    for (let j = 0; j <= i; j++) {
      color[j] = 'accent';
    }
    frames.push({
      window: [0, i],
      color: color,
      caption: i === k - 1 ? 'Initial window complete' : `Add values[${i}] = ${values[i]}`,
      stat: `sum=${windowSum}, best=${windowSum}`
    });
  }

  let maxSum = windowSum;

  // Slide the window
  for (let i = k; i < values.length; i++) {
    const leaving = i - k;
    const entering = i;

    // Show leaving element
    const leaveColor = {};
    for (let j = leaving + 1; j < entering; j++) {
      leaveColor[j] = 'accent2';
    }
    leaveColor[leaving] = 'bad';
    frames.push({
      window: [leaving, entering - 1],
      color: leaveColor,
      caption: `Remove values[${leaving}] = ${values[leaving]}`,
      stat: `sum=${windowSum}, best=${maxSum}`
    });

    windowSum -= values[leaving];

    // Show entering element
    const enterColor = {};
    for (let j = leaving + 1; j < entering; j++) {
      enterColor[j] = 'accent2';
    }
    enterColor[entering] = 'good';
    frames.push({
      window: [leaving + 1, entering],
      color: enterColor,
      caption: `Add values[${entering}] = ${values[entering]}`,
      stat: `sum=${windowSum + values[entering]}, best=${maxSum}`
    });

    windowSum += values[entering];

    // Check if new max
    const isNewMax = windowSum > maxSum;
    if (isNewMax) {
      maxSum = windowSum;
    }

    const finalColor = {};
    for (let j = leaving + 1; j <= entering; j++) {
      finalColor[j] = isNewMax ? 'good' : 'accent';
    }
    frames.push({
      window: [leaving + 1, entering],
      color: finalColor,
      highlight: isNewMax ? [leaving + 1, entering] : undefined,
      caption: isNewMax ? `New max found: ${maxSum}` : `Window sum = ${windowSum}`,
      stat: `sum=${windowSum}, best=${maxSum}`
    });
  }

  // Final frame
  frames.push({
    caption: `Maximum sum of subarray of size ${k} is ${maxSum}`,
    stat: `best=${maxSum}`,
    color: {}
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: `Maximum Sum of Subarrays of Size K (k=${k})`,
    note: 'Sliding window technique',
    frames: frames
  });
});
