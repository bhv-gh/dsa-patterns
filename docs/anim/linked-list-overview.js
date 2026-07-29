DSAAnim.register('linked-list-overview', function(container) {
  'use strict';

  const values = [3, 7, 2, 9, 5];
  const frames = [];

  // Initial state
  frames.push({
    caption: 'Linked list: each node holds a value and a pointer to the next node',
    stat: 'length = 5'
  });

  // Traversal demonstration
  frames.push({
    pointers: { curr: 0 },
    caption: 'Traversal: start at head (curr = 0)',
    stat: 'curr.val = 3'
  });

  frames.push({
    pointers: { curr: 1 },
    highlight: [0],
    caption: 'Move to next: curr = curr.next',
    stat: 'curr.val = 7'
  });

  frames.push({
    pointers: { curr: 2 },
    highlight: [0, 1],
    caption: 'Continue traversing via next pointers',
    stat: 'curr.val = 2'
  });

  frames.push({
    pointers: { curr: 3 },
    highlight: [0, 1, 2],
    caption: 'Each step follows the next pointer',
    stat: 'curr.val = 9'
  });

  frames.push({
    pointers: { curr: 4 },
    highlight: [0, 1, 2, 3],
    caption: 'Reached last node (next = null)',
    stat: 'curr.val = 5'
  });

  // Fast/slow pointers demonstration
  frames.push({
    pointers: { slow: 0, fast: 0 },
    caption: 'Fast/slow technique: both pointers start at head',
    stat: 'slow = 0, fast = 0'
  });

  frames.push({
    pointers: { slow: 1, fast: 2 },
    caption: 'slow moves +1, fast moves +2 each step',
    stat: 'slow = 1, fast = 2'
  });

  frames.push({
    pointers: { slow: 2, fast: 4 },
    caption: 'slow advances one, fast advances two',
    stat: 'slow = 2, fast = 4'
  });

  frames.push({
    pointers: { slow: 2, fast: 4 },
    color: { 2: 'good' },
    highlight: [2],
    caption: 'fast reached end → slow at middle node',
    stat: 'middle = 2'
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: values,
    title: 'Linked List Basics',
    note: 'Node traversal and fast/slow pointer technique',
    frames: frames
  });
});
