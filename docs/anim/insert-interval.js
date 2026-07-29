/* INSERT INTERVAL — merge a new interval into sorted, non-overlapping intervals
 * Technique: use mode:'cells' as a TIME AXIS (0..12).
 * Represent interval [s,e] by coloring cells s..e.
 */
DSAAnim.register('insert-interval', function(container) {
  'use strict';

  // Time axis 0..12 (13 cells)
  const ticks = Array.from({length: 13}, (_, i) => i);

  // Existing intervals: [[1,2],[3,5],[9,11]]
  // New interval: [4,8]
  const intervals = [[1,2],[3,5],[9,11]];
  const newInterval = [4,8];

  // Helper: color cells in range [s,e]
  function colorRange(s, e, cls) {
    const obj = {};
    for (let i = s; i <= e; i++) obj[i] = cls;
    return obj;
  }

  // Helper: merge color objects
  function mergeColors(...objs) {
    return Object.assign({}, ...objs);
  }

  const frames = [];

  // Frame 0: Initial state - show existing intervals
  frames.push({
    color: mergeColors(
      colorRange(1, 2, 'accent'),
      colorRange(3, 5, 'accent'),
      colorRange(9, 11, 'accent')
    ),
    caption: 'Existing intervals: [1,2], [3,5], [9,11]',
    stat: ''
  });

  // Frame 1: Show new interval to insert
  frames.push({
    color: mergeColors(
      colorRange(1, 2, 'accent'),
      colorRange(3, 5, 'accent'),
      colorRange(9, 11, 'accent'),
      colorRange(4, 8, 'accent2')
    ),
    caption: 'Insert new interval: [4,8]',
    stat: 'new=[4,8]'
  });

  // Frame 2: Phase 1 - intervals ending before new starts
  frames.push({
    color: mergeColors(
      colorRange(1, 2, 'good'),
      colorRange(3, 5, 'accent'),
      colorRange(9, 11, 'accent'),
      colorRange(4, 8, 'accent2')
    ),
    caption: 'Phase 1: [1,2] ends before [4,8] starts → keep as-is',
    stat: 'result=[[1,2]]'
  });

  // Frame 3: Phase 2 - detect overlap with [3,5]
  frames.push({
    color: mergeColors(
      colorRange(1, 2, 'good'),
      colorRange(3, 5, 'warn'),
      colorRange(9, 11, 'accent'),
      colorRange(4, 8, 'accent2')
    ),
    caption: 'Phase 2: [3,5] overlaps [4,8] → merge',
    stat: 'merged=[3,8]'
  });

  // Frame 4: Phase 2 - show merged interval [3,8]
  frames.push({
    color: mergeColors(
      colorRange(1, 2, 'good'),
      colorRange(3, 8, 'good'),
      colorRange(9, 11, 'accent')
    ),
    caption: 'Merged [3,5] and [4,8] into [3,8]',
    stat: 'merged=[3,8]'
  });

  // Frame 5: Phase 3 - intervals starting after merged interval ends
  frames.push({
    color: mergeColors(
      colorRange(1, 2, 'good'),
      colorRange(3, 8, 'good'),
      colorRange(9, 11, 'good')
    ),
    caption: 'Phase 3: [9,11] starts after [3,8] ends → keep as-is',
    stat: 'result=[[1,2],[3,8],[9,11]]'
  });

  // Frame 6: Final result
  frames.push({
    color: mergeColors(
      colorRange(1, 2, 'good'),
      colorRange(3, 8, 'good'),
      colorRange(9, 11, 'good')
    ),
    caption: 'Final merged intervals: [1,2], [3,8], [9,11]',
    stat: 'done'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: ticks,
    labels: ticks.map(String),
    title: 'Insert Interval',
    frames: frames
  });
});
