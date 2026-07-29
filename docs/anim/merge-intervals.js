DSAAnim.register('merge-intervals', function (container) {
  'use strict';

  // intervals: [[1,3],[2,6],[8,10],[9,12]]
  // We'll represent intervals on a time axis 0..12 (13 cells)
  const intervals = [[1, 3], [2, 6], [8, 10], [9, 12]];
  const TIME_MAX = 12;

  // Sort by start
  intervals.sort((a, b) => a[0] - b[0]);

  // Build frames
  const frames = [];
  const merged = [];

  // Initial: show all intervals in neutral color
  frames.push({
    caption: 'Four intervals sorted by start time',
    color: buildColor(intervals, {}),
    stat: ''
  });

  // Process each interval
  for (let i = 0; i < intervals.length; i++) {
    const [s, e] = intervals[i];

    if (merged.length === 0) {
      // First interval
      merged.push([s, e]);
      frames.push({
        caption: `Start first interval [${s},${e}]`,
        color: buildColor(intervals, { current: merged, accent: [[s, e]] }),
        stat: `[${s},${e}]`
      });
    } else {
      const last = merged[merged.length - 1];
      if (s <= last[1]) {
        // Overlapping: extend
        const oldEnd = last[1];
        last[1] = Math.max(last[1], e);
        frames.push({
          caption: `[${s},${e}] overlaps [${last[0]},${oldEnd}], extend to [${last[0]},${last[1]}]`,
          color: buildColor(intervals, { current: merged, growing: [last] }),
          stat: `[${last[0]},${last[1]}]`
        });
      } else {
        // Non-overlapping: new interval
        merged.push([s, e]);
        frames.push({
          caption: `[${s},${e}] does not overlap, start new interval`,
          color: buildColor(intervals, { current: merged, accent: [[s, e]] }),
          stat: `[${s},${e}]`
        });
      }
    }
  }

  // Final: show merged result
  frames.push({
    caption: `Merged: [${merged.map(iv => `${iv[0]},${iv[1]}`).join('], [')}]`,
    color: buildColor(intervals, { current: merged, final: true }),
    stat: `${merged.length} intervals`
  });

  // Helper: color cells based on which intervals cover them
  function buildColor(original, opts) {
    const colorMap = {};
    const { current, accent, growing, final } = opts;

    if (current && current.length > 0) {
      current.forEach((iv, idx) => {
        const isGrowing = growing && growing.some(g => g === iv);
        const isAccent = accent && accent.some(a => a === iv);
        const colorClass = final ? 'good' : (isGrowing ? 'good' : (isAccent ? 'accent' : 'good'));

        for (let t = iv[0]; t <= iv[1]; t++) {
          colorMap[t] = colorClass;
        }
      });
    }

    return colorMap;
  }

  // Render using cells mode: each cell = a time tick
  const labels = [];
  for (let t = 0; t <= TIME_MAX; t++) {
    labels.push(String(t));
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values: Array(TIME_MAX + 1).fill(0).map((_, i) => i),
    labels: labels,
    title: 'Merge Intervals',
    note: 'Sweep left to right, merging overlapping intervals',
    frames: frames
  });
});
