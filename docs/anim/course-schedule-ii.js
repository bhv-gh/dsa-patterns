DSAAnim.register('course-schedule-ii', function (container) {
  'use strict';

  // Example: 6 courses (0..5) with dependencies that form a valid DAG
  // edges: 1→0, 2→0, 3→1, 3→2, 4→3, 5→4, 5→3
  // Valid topological order: 5,4,3,2,1,0 (one possibility)

  const n = 6;
  const edges = [
    [1, 0],
    [2, 0],
    [3, 1],
    [3, 2],
    [4, 3],
    [5, 4],
    [5, 3]
  ];

  // Build adjacency list and in-degree
  const adj = Array.from({ length: n }, () => []);
  const indeg = Array(n).fill(0);
  for (const [u, v] of edges) {
    adj[u].push(v);
    indeg[v]++;
  }

  const frames = [];
  const order = [];
  const queue = [];
  const processed = Array(n).fill(false);

  // Initial frame
  frames.push({
    values: indeg.slice(),
    labels: indeg.map((d, i) => `${i}\n(${d})`),
    caption: 'Each course shows its in-degree (prereqs needed)',
    stat: 'order: []'
  });

  // Enqueue all zero in-degree nodes
  for (let i = 0; i < n; i++) {
    if (indeg[i] === 0) queue.push(i);
  }

  frames.push({
    values: indeg.slice(),
    labels: indeg.map((d, i) => `${i}\n(${d})`),
    color: Object.fromEntries(queue.map(c => [c, 'accent'])),
    caption: 'Courses with 0 in-degree can be taken first',
    stat: 'order: []'
  });

  // Kahn's algorithm
  const currentIndeg = indeg.slice();
  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);
    processed[u] = true;

    // Show taking course u
    frames.push({
      values: currentIndeg.slice(),
      labels: currentIndeg.map((d, i) => `${i}\n(${d})`),
      color: { [u]: 'good' },
      caption: `Take course ${u}, remove it from prerequisites`,
      stat: `order: [${order.join(',')}]`
    });

    // Decrement in-degree of neighbors
    for (const v of adj[u]) {
      currentIndeg[v]--;
      if (currentIndeg[v] === 0) {
        queue.push(v);
      }
    }

    // Show updated in-degrees
    const nextColor = {};
    for (let i = 0; i < n; i++) {
      if (processed[i]) nextColor[i] = 'faded';
      else if (currentIndeg[i] === 0 && !queue.includes(i)) nextColor[i] = 'accent';
    }
    queue.forEach(c => { if (!processed[c]) nextColor[c] = 'accent'; });

    if (queue.length > 0 || adj[u].length > 0) {
      frames.push({
        values: currentIndeg.slice(),
        labels: currentIndeg.map((d, i) => `${i}\n(${d})`),
        color: nextColor,
        caption: 'Updated in-degrees; new zero-indegree courses ready',
        stat: `order: [${order.join(',')}]`
      });
    }
  }

  // Final frame
  if (order.length === n) {
    frames.push({
      values: currentIndeg.slice(),
      labels: currentIndeg.map((d, i) => `${i}\n(${d})`),
      color: Object.fromEntries(order.map(c => [c, 'good'])),
      caption: `All ${n} courses taken — valid order found!`,
      stat: `order: [${order.join(',')}]`
    });
  } else {
    frames.push({
      values: currentIndeg.slice(),
      labels: currentIndeg.map((d, i) => `${i}\n(${d})`),
      caption: 'Cycle detected — cannot complete all courses, return []',
      stat: 'order: []'
    });
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values: indeg.slice(),
    labels: indeg.map((d, i) => `${i}\n(${d})`),
    title: 'Course Schedule II - Kahn\'s Algorithm',
    note: 'Find a valid course order using topological sort',
    frames: frames
  });
});
