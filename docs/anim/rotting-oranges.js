DSAAnim.register('rotting-oranges', function (container) {
  'use strict';

  // Simulate multi-source BFS on a single row: [2,1,1,0,1,1]
  // 2 = rotten, 1 = fresh, 0 = empty
  // Each minute, every rotten cell infects adjacent fresh cells simultaneously

  const EMPTY = 0, FRESH = 1, ROTTEN = 2;
  const initial = [ROTTEN, FRESH, FRESH, EMPTY, FRESH, FRESH];
  const n = initial.length;

  // BFS simulation: enqueue all initial rotten cells at minute 0
  const frames = [];
  let grid = initial.slice();
  let minute = 0;
  let queue = [];

  // Find initial rotten cells
  for (let i = 0; i < n; i++) {
    if (grid[i] === ROTTEN) queue.push(i);
  }

  // Initial state
  const countFresh = () => grid.filter(c => c === FRESH).length;
  frames.push({
    values: grid.slice(),
    labels: grid.map(v => v === EMPTY ? '' : (v === FRESH ? '🍊' : '💀')),
    color: grid.reduce((acc, v, i) => {
      if (v === ROTTEN) acc[i] = 'bad';
      else if (v === FRESH) acc[i] = 'good';
      else acc[i] = 'mut';
      return acc;
    }, {}),
    caption: 'Multi-source BFS: enqueue ALL rotten cells at minute 0',
    stat: `minute ${minute}, fresh: ${countFresh()}`
  });

  // BFS: process level by level (each level = one minute)
  while (queue.length > 0 && countFresh() > 0) {
    minute++;
    const levelSize = queue.length;
    const newlyRotten = [];

    for (let k = 0; k < levelSize; k++) {
      const idx = queue.shift();

      // Check left neighbor
      if (idx > 0 && grid[idx - 1] === FRESH) {
        grid[idx - 1] = ROTTEN;
        queue.push(idx - 1);
        newlyRotten.push(idx - 1);
      }

      // Check right neighbor
      if (idx < n - 1 && grid[idx + 1] === FRESH) {
        grid[idx + 1] = ROTTEN;
        queue.push(idx + 1);
        newlyRotten.push(idx + 1);
      }
    }

    // Frame showing newly infected cells
    if (newlyRotten.length > 0) {
      frames.push({
        values: grid.slice(),
        labels: grid.map(v => v === EMPTY ? '' : (v === FRESH ? '🍊' : '💀')),
        color: grid.reduce((acc, v, i) => {
          if (newlyRotten.includes(i)) acc[i] = 'warn';
          else if (v === ROTTEN) acc[i] = 'bad';
          else if (v === FRESH) acc[i] = 'good';
          else acc[i] = 'mut';
          return acc;
        }, {}),
        caption: `Minute ${minute}: infection spreads in parallel`,
        stat: `minute ${minute}, fresh: ${countFresh()}`
      });
    }
  }

  // Final state
  const fresh = countFresh();
  frames.push({
    values: grid.slice(),
    labels: grid.map(v => v === EMPTY ? '' : (v === FRESH ? '🍊' : '💀')),
    color: grid.reduce((acc, v, i) => {
      if (v === ROTTEN) acc[i] = 'bad';
      else if (v === FRESH) acc[i] = 'good';
      else acc[i] = 'mut';
      return acc;
    }, {}),
    caption: fresh === 0 ? 'All reachable oranges rotted' : `${fresh} oranges unreachable (blocked by empty)`,
    stat: `minute ${minute}, fresh: ${fresh}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: initial,
    labels: initial.map(v => v === EMPTY ? '' : (v === FRESH ? '🍊' : '💀')),
    title: 'Rotting Oranges — Multi-Source BFS',
    frames: frames
  });
});
