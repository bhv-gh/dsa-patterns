DSAAnim.register('topological-sort', function (container) {
  'use strict';

  // Kahn's algorithm: DAG represented as A→B, A→C, B→D, C→D, D→E
  // We'll show 5 nodes: A,B,C,D,E
  const graph = {
    A: ['B', 'C'],
    B: ['D'],
    C: ['D'],
    D: ['E'],
    E: []
  };

  const nodes = ['A', 'B', 'C', 'D', 'E'];
  const inDegree = { A: 0, B: 1, C: 1, D: 2, E: 1 };

  const frames = [];

  // Frame 0: initial state with in-degrees
  frames.push({
    values: [0, 1, 1, 2, 1],
    labels: ['A\n0', 'B\n1', 'C\n1', 'D\n2', 'E\n1'],
    caption: 'Initial: each cell shows node and its in-degree',
    stat: 'Output: []'
  });

  // Simulate Kahn's algorithm
  const queue = [];
  const result = [];
  const currentInDegree = { ...inDegree };

  // Find initial nodes with in-degree 0
  for (const node of nodes) {
    if (currentInDegree[node] === 0) {
      queue.push(node);
    }
  }

  // Process queue
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);
    const nodeIdx = nodes.indexOf(node);

    // Highlight the node being processed
    const color = {};
    color[nodeIdx] = 'good';
    frames.push({
      values: nodes.map(n => currentInDegree[n]),
      labels: nodes.map(n => `${n}\n${currentInDegree[n]}`),
      color: color,
      caption: `Node ${node} has in-degree 0; add to output`,
      stat: `Output: [${result.join(', ')}]`
    });

    // Decrement in-degree of neighbors
    for (const neighbor of graph[node]) {
      currentInDegree[neighbor]--;
      const neighborIdx = nodes.indexOf(neighbor);

      const highlightColor = {};
      highlightColor[nodeIdx] = 'good';
      highlightColor[neighborIdx] = 'mut';

      frames.push({
        values: nodes.map(n => currentInDegree[n]),
        labels: nodes.map(n => `${n}\n${currentInDegree[n]}`),
        color: highlightColor,
        caption: `Decrement in-degree of ${neighbor} (neighbor of ${node})`,
        stat: `Output: [${result.join(', ')}]`
      });

      if (currentInDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Final frame
  if (result.length === nodes.length) {
    frames.push({
      values: nodes.map(n => currentInDegree[n]),
      labels: nodes.map(n => `${n}\n${currentInDegree[n]}`),
      caption: 'All nodes processed; topological order complete',
      stat: `Output: [${result.join(', ')}]`
    });
  } else {
    const remaining = nodes.filter(n => currentInDegree[n] > 0);
    const color = {};
    remaining.forEach(n => { color[nodes.indexOf(n)] = 'bad'; });
    frames.push({
      values: nodes.map(n => currentInDegree[n]),
      labels: nodes.map(n => `${n}\n${currentInDegree[n]}`),
      color: color,
      caption: 'Nodes with in-degree > 0 remain: CYCLE detected!',
      stat: `Output: [${result.join(', ')}]`
    });
  }

  DSAAnim.render(container, {
    mode: 'cells',
    values: [0, 1, 1, 2, 1],
    labels: ['A', 'B', 'C', 'D', 'E'],
    title: 'Topological Sort (Kahn Algorithm)',
    note: 'Repeatedly process nodes with in-degree 0',
    frames: frames
  });
});
