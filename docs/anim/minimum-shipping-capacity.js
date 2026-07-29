/* Minimum Shipping Capacity — Binary search on the answer.
 * Given weights and D days, find the smallest ship capacity such that
 * all packages can be shipped in <= D days (greedy loading).
 */
DSAAnim.register('minimum-shipping-capacity', function (container) {
  'use strict';

  const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const D = 5;
  const maxWeight = Math.max(...weights);
  const sumWeights = weights.reduce((a, b) => a + b, 0);

  // Compute how many days needed for a given capacity (greedy).
  function daysNeeded(cap) {
    let days = 1, current = 0;
    for (let w of weights) {
      if (current + w > cap) { days++; current = w; } else { current += w; }
    }
    return days;
  }

  // Build candidate range as cells: from maxWeight to sumWeights.
  const range = [];
  for (let c = maxWeight; c <= sumWeights; c++) range.push(c);

  const frames = [];

  // Initial: show entire range.
  frames.push({
    caption: `Find smallest capacity where days ≤ ${D}. Range [${maxWeight}, ${sumWeights}].`,
    stat: ''
  });

  let lo = 0, hi = range.length - 1, ans = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const cap = range[mid];
    const days = daysNeeded(cap);
    const feasible = days <= D;

    // Highlight mid, show stat.
    frames.push({
      pointers: { lo, mid, hi },
      caption: `Try mid=${mid} → capacity=${cap}.`,
      stat: `cap=${cap} → days=${days} ${feasible ? '(≤5✓)' : '(>5✗)'}`
    });

    if (feasible) {
      ans = cap;
      // Color mid as good, fade right half (eliminated).
      const fadedIndices = [];
      for (let i = mid + 1; i <= hi; i++) fadedIndices.push(i);
      frames.push({
        pointers: { lo, mid, hi },
        color: { [mid]: 'good' },
        faded: fadedIndices,
        caption: `Feasible → record answer=${cap}, search left.`,
        stat: `cap=${cap} → days=${days} (≤5✓)`
      });
      hi = mid - 1;
    } else {
      // Color mid as bad, fade left half.
      const fadedIndices = [];
      for (let i = lo; i <= mid; i++) fadedIndices.push(i);
      frames.push({
        pointers: { lo, mid, hi },
        color: { [mid]: 'bad' },
        faded: fadedIndices,
        caption: `Infeasible → search right.`,
        stat: `cap=${cap} → days=${days} (>5✗)`
      });
      lo = mid + 1;
    }
  }

  // Final: highlight answer.
  const answerIdx = range.indexOf(ans);
  frames.push({
    pointers: { ans: answerIdx },
    color: { [answerIdx]: 'good' },
    caption: `Minimum capacity = ${ans}.`,
    stat: `Answer: ${ans}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: range,
    title: 'Minimum Shipping Capacity (Binary Search on Answer)',
    frames
  });
});
