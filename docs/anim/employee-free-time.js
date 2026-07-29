DSAAnim.register('employee-free-time', function (container) {
  'use strict';

  // Time axis 0..12 (13 cells)
  const ticks = Array.from({ length: 13 }, (_, i) => i);

  // Example busy intervals for multiple employees
  const busyIntervals = [
    [1, 3],
    [6, 7],
    [2, 4],
    [2, 5],
    [9, 12]
  ];

  // Merge overlapping intervals
  function mergeIntervals(intervals) {
    if (intervals.length === 0) return [];
    const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      if (sorted[i][0] <= last[1]) {
        last[1] = Math.max(last[1], sorted[i][1]);
      } else {
        merged.push(sorted[i]);
      }
    }
    return merged;
  }

  const mergedBusy = mergeIntervals(busyIntervals);

  // Find free time gaps
  function findFreeTime(merged, maxTime) {
    const free = [];
    for (let i = 0; i < merged.length - 1; i++) {
      free.push([merged[i][1], merged[i + 1][0]]);
    }
    return free;
  }

  const freeTime = findFreeTime(mergedBusy, 12);

  // Helper: color cells in a time range [start, end)
  function colorRange(start, end, colorClass) {
    const result = {};
    for (let t = start; t < end; t++) {
      result[t] = colorClass;
    }
    return result;
  }

  // Helper: merge color objects
  function mergeColors(...objs) {
    return Object.assign({}, ...objs);
  }

  // Build frames
  const frames = [];

  // Frame 0: Show all raw busy intervals
  let colorMap = {};
  busyIntervals.forEach(([start, end]) => {
    colorMap = mergeColors(colorMap, colorRange(start, end, 'accent'));
  });
  frames.push({
    color: colorMap,
    caption: 'All busy intervals marked',
    stat: '5 intervals'
  });

  // Frame 1: Merge overlapping busy spans
  colorMap = {};
  mergedBusy.forEach(([start, end]) => {
    colorMap = mergeColors(colorMap, colorRange(start, end, 'accent'));
  });
  frames.push({
    color: colorMap,
    caption: 'Merge overlapping busy times',
    stat: `${mergedBusy.length} merged`
  });

  // Frame 2: Highlight the gaps as free time
  colorMap = {};
  mergedBusy.forEach(([start, end]) => {
    colorMap = mergeColors(colorMap, colorRange(start, end, 'accent'));
  });
  freeTime.forEach(([start, end]) => {
    colorMap = mergeColors(colorMap, colorRange(start, end, 'good'));
  });
  frames.push({
    color: colorMap,
    caption: 'Gaps between merged busy = free time',
    stat: freeTime.length > 0 ? `[${freeTime[0][0]},${freeTime[0][1]}]` : 'none'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: ticks,
    labels: ticks.map(String),
    title: 'Employee Free Time',
    frames: frames
  });
});
