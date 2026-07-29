/* Intervals pattern: overlap detection via time axis */
DSAAnim.register('intervals-overview', function (container) {
  'use strict';

  // Example 1: overlapping intervals [1,4] and [3,7]
  const timeAxis = Array.from({ length: 13 }, (_, i) => i);
  const timeLabels = timeAxis.map((t) => String(t));

  DSAAnim.render(container, {
    mode: 'cells',
    values: timeAxis,
    labels: timeLabels,
    title: 'Overlap Detection',
    frames: [
      { caption: 'Time axis: 0 to 12' },
      {
        color: { 1: 'accent', 2: 'accent', 3: 'accent', 4: 'accent' },
        caption: 'Interval A: [1, 4]'
      },
      {
        color: {
          1: 'accent', 2: 'accent', 3: 'accent', 4: 'accent',
          3: 'accent2', 4: 'accent2', 5: 'accent2', 6: 'accent2', 7: 'accent2'
        },
        caption: 'Interval B: [3, 7]'
      },
      {
        color: {
          1: 'accent', 2: 'accent',
          3: 'bad', 4: 'bad',
          5: 'accent2', 6: 'accent2', 7: 'accent2'
        },
        highlight: [3, 4],
        caption: 'start(3) <= end(4) → overlap',
        stat: 'overlap!'
      }
    ]
  });

  // Example 2: non-overlapping intervals [1,3] and [6,9]
  DSAAnim.render(container, {
    mode: 'cells',
    values: timeAxis,
    labels: timeLabels,
    title: 'No Overlap',
    frames: [
      { caption: 'Time axis: 0 to 12' },
      {
        color: { 1: 'accent', 2: 'accent', 3: 'accent' },
        caption: 'Interval A: [1, 3]'
      },
      {
        color: {
          1: 'accent', 2: 'accent', 3: 'accent',
          6: 'accent2', 7: 'accent2', 8: 'accent2', 9: 'accent2'
        },
        caption: 'Interval B: [6, 9]'
      },
      {
        color: {
          1: 'accent', 2: 'accent', 3: 'accent',
          6: 'accent2', 7: 'accent2', 8: 'accent2', 9: 'accent2'
        },
        caption: 'start(6) > end(3) → no overlap',
        stat: 'no overlap'
      }
    ]
  });
});
