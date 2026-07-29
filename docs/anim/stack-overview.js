DSAAnim.register('stack-overview', function(container) {
  'use strict';

  DSAAnim.render(container, {
    mode: 'cells',
    values: ['', '', '', '', '', ''],
    labels: ['', '', '', '', '', ''],
    title: 'Stack (LIFO)',
    note: 'Last In, First Out',
    frames: [
      {
        values: ['', '', '', '', '', ''],
        labels: ['', '', '', '', '', ''],
        faded: [0, 1, 2, 3, 4, 5],
        color: { 0: 'mut', 1: 'mut', 2: 'mut', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'Empty stack',
        stat: 'top = -1'
      },
      {
        values: ['A', '', '', '', '', ''],
        labels: ['A', '', '', '', '', ''],
        highlight: [0],
        faded: [1, 2, 3, 4, 5],
        color: { 1: 'mut', 2: 'mut', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'push A',
        stat: 'top = A'
      },
      {
        values: ['A', 'B', '', '', '', ''],
        labels: ['A', 'B', '', '', '', ''],
        highlight: [1],
        faded: [2, 3, 4, 5],
        color: { 2: 'mut', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'push B',
        stat: 'top = B'
      },
      {
        values: ['A', 'B', 'C', '', '', ''],
        labels: ['A', 'B', 'C', '', '', ''],
        highlight: [2],
        faded: [3, 4, 5],
        color: { 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'push C',
        stat: 'top = C'
      },
      {
        values: ['A', 'B', 'C', '', '', ''],
        labels: ['A', 'B', 'C', '', '', ''],
        highlight: [2],
        faded: [3, 4, 5],
        color: { 2: 'bad', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'pop → C removed',
        stat: 'top = B'
      },
      {
        values: ['A', 'B', '', '', '', ''],
        labels: ['A', 'B', '', '', '', ''],
        highlight: [1],
        faded: [2, 3, 4, 5],
        color: { 2: 'mut', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'After pop',
        stat: 'top = B'
      },
      {
        values: ['A', 'B', 'D', '', '', ''],
        labels: ['A', 'B', 'D', '', '', ''],
        highlight: [2],
        faded: [3, 4, 5],
        color: { 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'push D',
        stat: 'top = D'
      },
      {
        values: ['A', 'B', 'D', '', '', ''],
        labels: ['A', 'B', 'D', '', '', ''],
        highlight: [2],
        faded: [3, 4, 5],
        color: { 2: 'bad', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'pop → D removed',
        stat: 'top = B'
      },
      {
        values: ['A', 'B', '', '', '', ''],
        labels: ['A', 'B', '', '', '', ''],
        highlight: [1],
        faded: [2, 3, 4, 5],
        color: { 2: 'mut', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'After pop',
        stat: 'top = B'
      },
      {
        values: ['A', 'B', '', '', '', ''],
        labels: ['A', 'B', '', '', '', ''],
        highlight: [1],
        faded: [2, 3, 4, 5],
        color: { 1: 'bad', 2: 'mut', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'pop → B removed',
        stat: 'top = A'
      },
      {
        values: ['A', '', '', '', '', ''],
        labels: ['A', '', '', '', '', ''],
        highlight: [0],
        faded: [1, 2, 3, 4, 5],
        color: { 1: 'mut', 2: 'mut', 3: 'mut', 4: 'mut', 5: 'mut' },
        caption: 'LIFO: Last In, First Out',
        stat: 'top = A'
      }
    ]
  });
});
