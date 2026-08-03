DSAAnim.register('generate-parentheses', function (container) {
  'use strict';

  // Generate valid parentheses strings with pruning (n=3 → 6 chars)
  const n = 3;
  const totalSlots = 2 * n; // 6 fixed slots
  const frames = [];

  // Backtracking simulation
  function backtrack(path, open, close) {
    // Show current state
    const values = new Array(totalSlots).fill('');
    const labels = new Array(totalSlots).fill('');
    const faded = [];
    const color = {};

    // Fill built portion
    for (let i = 0; i < path.length; i++) {
      labels[i] = path[i];
    }
    // Fade unused slots
    for (let i = path.length; i < totalSlots; i++) {
      labels[i] = '';
      faded.push(i);
    }

    const stat = `open=${open} close=${close}`;

    // Check if complete
    if (path.length === totalSlots) {
      // Valid complete string
      for (let i = 0; i < totalSlots; i++) {
        color[i] = 'good';
      }
      frames.push({ labels, faded, color, caption: 'Valid string completed ✓', stat });
      return;
    }

    // Try adding '('
    if (open < n) {
      frames.push({
        labels: [...labels],
        faded: [...faded],
        color: {},
        caption: `Can add '(' (open=${open} < n=${n})`,
        stat
      });
      backtrack(path + '(', open + 1, close);
    } else {
      // Show pruning
      const prunedLabels = [...labels];
      if (path.length < totalSlots) {
        prunedLabels[path.length] = '(';
        color[path.length] = 'bad';
      }
      frames.push({
        labels: prunedLabels,
        faded: [...faded],
        color,
        caption: `Cannot add '(' (open=${open} = n=${n}) — pruned`,
        stat
      });
    }

    // Try adding ')'
    if (close < open) {
      frames.push({
        labels: [...labels],
        faded: [...faded],
        color: {},
        caption: `Can add ')' (close=${close} < open=${open})`,
        stat
      });
      backtrack(path + ')', open, close + 1);
    } else if (close < n) {
      // Show pruning
      const prunedLabels = [...labels];
      if (path.length < totalSlots) {
        prunedLabels[path.length] = ')';
        color[path.length] = 'bad';
      }
      frames.push({
        labels: prunedLabels,
        faded: [...faded],
        color,
        caption: `Cannot add ')' (close=${close} = open=${open}) — pruned`,
        stat
      });
    }
  }

  // Initial state
  frames.push({
    labels: new Array(totalSlots).fill(''),
    faded: Array.from({ length: totalSlots }, (_, i) => i),
    caption: 'Start: build valid parentheses (n=3)',
    stat: 'open=0 close=0'
  });

  backtrack('', 0, 0);

  // Limit frames to avoid unbounded growth
  const limitedFrames = frames.slice(0, 20);

  DSAAnim.render(container, {
    mode: 'cells',
    values: new Array(totalSlots).fill(0),
    labels: new Array(totalSlots).fill(''),
    title: 'Generate Parentheses with Pruning',
    note: 'Add ( when open<n; add ) only when close<open',
    frames: limitedFrames
  });
});
