DSAAnim.register('remove-nth-node-from-end', function (container) {
  'use strict';

  const values = [1, 2, 3, 4, 5];
  const n = 2;

  const frames = [
    {
      caption: 'Remove the 2nd node from the end using two pointers',
      stat: 'n = 2'
    },
    {
      pointers: { fast: 0 },
      caption: 'Initialize fast pointer at head',
      stat: 'Gap: 0'
    },
    {
      pointers: { fast: 1 },
      caption: 'Move fast pointer 1 step ahead',
      stat: 'Gap: 1'
    },
    {
      pointers: { fast: 2 },
      caption: 'Move fast pointer 2 steps ahead (n=2 gap created)',
      stat: 'Gap: 2'
    },
    {
      pointers: { slow: 0, fast: 2 },
      caption: 'Initialize slow pointer; now gap = n',
      stat: 'Gap: 2',
      highlight: [0, 2]
    },
    {
      pointers: { slow: 1, fast: 3 },
      caption: 'Move both pointers together',
      stat: 'Gap: 2',
      highlight: [1, 3]
    },
    {
      pointers: { slow: 2, fast: 4 },
      caption: 'Move both pointers together',
      stat: 'Gap: 2',
      highlight: [2, 4]
    },
    {
      pointers: { slow: 3, fast: 4 },
      caption: 'Fast reached end; slow is before target node',
      stat: 'Gap: 1',
      highlight: [3]
    },
    {
      pointers: { slow: 3 },
      color: { 3: 'bad' },
      caption: 'Node at index 3 (value 4) marked for removal',
      stat: 'Removing: 4'
    },
    {
      values: [1, 2, 3, 5],
      pointers: { slow: 3 },
      color: { 3: 'good' },
      caption: 'Node removed; value 5 shifted to index 3',
      stat: 'Done'
    }
  ];

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Remove Nth Node From End',
    note: 'Use two pointers with a gap of n',
    frames: frames
  });
});
