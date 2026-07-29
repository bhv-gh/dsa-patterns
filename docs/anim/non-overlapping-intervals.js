DSAAnim.register('non-overlapping-intervals', function (container) {
  'use strict';

  // Example intervals: [[1,2],[2,3],[3,4],[1,3]]
  const intervals = [[1, 2], [2, 3], [3, 4], [1, 3]];

  // Sort by end time (greedy choice)
  const sorted = intervals.map((iv, idx) => ({ start: iv[0], end: iv[1], orig: idx }))
    .sort((a, b) => a.end - b.end);

  const frames = [];

  // Frame 0: Show the timeline
  frames.push({
    caption: 'Timeline 0..10. Intervals: [1,2], [2,3], [3,4], [1,3]',
    stat: 'removals = 0'
  });

  // Frame 1: Explain greedy strategy
  frames.push({
    caption: 'Greedy: sort by END time, keep earliest ending intervals',
    stat: 'removals = 0'
  });

  let removals = 0;
  let lastEnd = -1;

  sorted.forEach((iv, step) => {
    const colorMap = {};
    const highlightCells = [];

    // Color cells for this interval
    for (let t = iv.start; t <= iv.end; t++) {
      highlightCells.push(t);
    }

    // Check overlap
    const overlaps = iv.start < lastEnd;

    if (overlaps) {
      removals++;
      // Mark as bad (removed)
      for (let t = iv.start; t <= iv.end; t++) {
        colorMap[t] = 'bad';
      }
      frames.push({
        color: colorMap,
        highlight: highlightCells,
        caption: `[${iv.start},${iv.end}] starts before ${lastEnd} → REMOVE`,
        stat: `removals = ${removals}`
      });
    } else {
      // Mark as good (kept)
      for (let t = iv.start; t <= iv.end; t++) {
        colorMap[t] = 'good';
      }
      lastEnd = iv.end;
      frames.push({
        color: colorMap,
        highlight: highlightCells,
        caption: `[${iv.start},${iv.end}] no overlap → KEEP (end=${iv.end})`,
        stat: `removals = ${removals}`
      });
    }
  });

  // Final frame
  frames.push({
    caption: 'Minimum removals needed to have non-overlapping intervals',
    stat: `answer = ${removals}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    title: 'Non-Overlapping Intervals (Min Removals)',
    frames: frames
  });
});
