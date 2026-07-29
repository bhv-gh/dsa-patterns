DSAAnim.register('max-points-from-cards', function (container) {
  'use strict';

  const values = [1, 2, 3, 4, 5, 6, 1];
  const k = 3;
  const n = values.length;
  const windowSize = n - k;

  const total = values.reduce((sum, v) => sum + v, 0);

  const frames = [];

  // Frame 0: Intro
  frames.push({
    caption: `Pick k=${k} cards from either end to maximize points. Total=${total}.`,
    stat: `k = ${k}`
  });

  // Frame 1: Show the reframe
  frames.push({
    caption: `Key insight: taking ${k} from ends = LEAVING a middle window of ${windowSize}.`,
    stat: `window size = ${windowSize}`
  });

  // Frame 2: Goal reframe
  frames.push({
    caption: `To MAXIMIZE points taken, we MINIMIZE the window left behind.`,
    stat: `max take = total − min window`
  });

  // Sliding window frames
  let minWindowSum = Infinity;
  let bestStart = 0;

  for (let i = 0; i <= n - windowSize; i++) {
    const windowSum = values.slice(i, i + windowSize).reduce((sum, v) => sum + v, 0);
    const takeSum = total - windowSum;

    const color = {};
    const faded = [];

    // Window is faded
    for (let j = i; j < i + windowSize; j++) {
      faded.push(j);
    }

    // Cards outside window are "good" (taken)
    for (let j = 0; j < i; j++) {
      color[j] = 'good';
    }
    for (let j = i + windowSize; j < n; j++) {
      color[j] = 'good';
    }

    frames.push({
      window: [i, i + windowSize - 1],
      faded: faded,
      color: color,
      caption: `Window [${i}..${i + windowSize - 1}]: sum=${windowSum}. Take = ${total} − ${windowSum} = ${takeSum}.`,
      stat: `take = ${takeSum}`
    });

    if (windowSum < minWindowSum) {
      minWindowSum = windowSum;
      bestStart = i;
    }
  }

  // Final frame: best solution
  const bestEnd = bestStart + windowSize - 1;
  const maxTake = total - minWindowSum;
  const finalColor = {};
  const finalFaded = [];

  for (let j = bestStart; j <= bestEnd; j++) {
    finalFaded.push(j);
  }
  for (let j = 0; j < bestStart; j++) {
    finalColor[j] = 'good';
  }
  for (let j = bestEnd + 1; j < n; j++) {
    finalColor[j] = 'good';
  }

  frames.push({
    window: [bestStart, bestEnd],
    faded: finalFaded,
    color: finalColor,
    caption: `Best: minimize window [${bestStart}..${bestEnd}] (sum=${minWindowSum}). Max points = ${maxTake}.`,
    stat: `answer = ${maxTake}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Max Points from Cards',
    frames: frames
  });
});
