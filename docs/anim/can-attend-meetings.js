DSAAnim.register('can-attend-meetings', function (container) {
  'use strict';

  // Example meetings: [start, end]
  const meetings = [[0, 3], [2, 5], [6, 8]];

  // Sort by start time
  const sorted = meetings.slice().sort((a, b) => a[0] - b[0]);

  // Time axis: 0..10 (11 cells)
  const timeSlots = Array(11).fill(0).map((_, i) => i);

  const frames = [];

  // Frame 0: empty time axis
  frames.push({
    caption: 'Time axis (0..10). Check if we can attend all meetings.',
    stat: 'ok so far'
  });

  let canAttend = true;
  let lastEnd = -1;
  const occupied = {}; // track which cells are colored

  sorted.forEach((meeting, idx) => {
    const [start, end] = meeting;

    // Check for overlap
    const hasConflict = start < lastEnd;

    // Build color map for this frame
    const colorMap = { ...occupied };

    // Color the current meeting's time slots
    for (let t = start; t <= end; t++) {
      if (hasConflict && t >= start && t < lastEnd) {
        colorMap[t] = 'bad';
      } else if (!hasConflict) {
        colorMap[t] = 'good';
      }
    }

    if (hasConflict) {
      canAttend = false;
      frames.push({
        color: colorMap,
        highlight: Array.from({ length: end - start + 1 }, (_, i) => start + i),
        caption: `Meeting [${start},${end}] overlaps → cannot attend all`,
        stat: 'conflict!'
      });
    } else {
      // Mark occupied cells for future frames
      for (let t = start; t <= end; t++) {
        occupied[t] = 'good';
      }
      frames.push({
        color: colorMap,
        highlight: Array.from({ length: end - start + 1 }, (_, i) => start + i),
        caption: `Meeting [${start},${end}] added. No overlap yet.`,
        stat: 'ok so far'
      });
      lastEnd = end;
    }
  });

  // Final verdict
  frames.push({
    color: occupied,
    caption: canAttend ? 'All meetings fit! ✓' : 'Conflict detected. Cannot attend all. ✗',
    stat: canAttend ? 'success' : 'failed'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: timeSlots,
    labels: timeSlots.map(String),
    title: 'Can Attend Meetings',
    note: 'Sort by start time, scan for overlaps.',
    frames: frames
  });
});
