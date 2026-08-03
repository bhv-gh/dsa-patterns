/* BFS Fundamentals — explains level-order traversal using a queue. */
DSAAnim.register('bfs-fundamentals', function (container) {
  'use strict';

  // Simulate BFS on a small tree:
  //      A
  //     / \
  //    B   C
  //   / \   \
  //  D   E   F

  const graph = {
    A: ['B', 'C'],
    B: ['D', 'E'],
    C: ['F'],
    D: [],
    E: [],
    F: []
  };

  const QUEUE_SIZE = 7; // fixed slots for the queue visualization
  const frames = [];

  // Helper: build a frame for the current queue state
  function makeFrame(queue, caption, stat, frontIdx) {
    const values = [];
    const labels = [];
    const faded = [];
    const highlight = [];

    for (let i = 0; i < QUEUE_SIZE; i++) {
      if (i < queue.length) {
        values.push(1);
        labels.push(queue[i]);
      } else {
        values.push(0);
        labels.push('·');
        faded.push(i);
      }
    }

    if (frontIdx != null && frontIdx < queue.length) {
      highlight.push(frontIdx);
    }

    return { values, labels, faded, highlight, caption, stat };
  }

  // --- BFS simulation ---
  const queue = ['A'];
  let level = 0;

  frames.push(makeFrame(queue, 'Start: enqueue root A', `level ${level}`, null));

  const visited = new Set(['A']);

  while (queue.length > 0) {
    const levelSize = queue.length;
    level++;

    for (let i = 0; i < levelSize; i++) {
      // Show front element highlighted
      frames.push(makeFrame(queue, `Process front: ${queue[0]}`, `level ${level}`, 0));

      const node = queue.shift();
      const neighbors = graph[node];

      if (neighbors.length === 0) {
        frames.push(makeFrame(queue, `${node} has no children`, `level ${level}`, null));
      } else {
        const toEnqueue = neighbors.filter(n => !visited.has(n));
        if (toEnqueue.length > 0) {
          toEnqueue.forEach(n => {
            queue.push(n);
            visited.add(n);
          });
          frames.push(makeFrame(queue, `Dequeue ${node} → enqueue ${toEnqueue.join(', ')}`, `level ${level}`, null));
        } else {
          frames.push(makeFrame(queue, `Dequeue ${node} (neighbors visited)`, `level ${level}`, null));
        }
      }
    }
  }

  frames.push(makeFrame([], 'BFS complete: queue empty', 'done', null));

  DSAAnim.render(container, {
    mode: 'cells',
    values: Array(QUEUE_SIZE).fill(0),
    labels: Array(QUEUE_SIZE).fill('·'),
    title: 'BFS: Level-by-Level with a Queue',
    note: 'Queue front at index 0. Process all nodes at one level before moving to the next.',
    frames: frames
  });
});
