DSAAnim.register('split-array-largest-sum', function (container) {
  'use strict';

  const nums = [7, 2, 5, 10, 8];
  const k = 2;
  const minCap = Math.max(...nums); // 10
  const maxCap = nums.reduce((a, b) => a + b, 0); // 32

  // Greedy: count chunks needed if we cap subarray sums at `cap`
  function countChunks(cap) {
    let chunks = 1, sum = 0;
    for (let i = 0; i < nums.length; i++) {
      if (sum + nums[i] > cap) {
        chunks++;
        sum = nums[i];
      } else {
        sum += nums[i];
      }
    }
    return chunks;
  }

  // Binary search simulation
  const trace = [];
  let lo = minCap, hi = maxCap;
  const range = [];
  for (let v = minCap; v <= maxCap; v++) range.push(v);

  // Initial state
  trace.push({
    pointers: { lo: lo - minCap, hi: hi - minCap },
    caption: 'Binary search on candidate max-subarray-sum cap',
    stat: `nums=[${nums.join(',')}], k=${k}`
  });

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const chunks = countChunks(mid);
    const feasible = chunks <= k;

    trace.push({
      pointers: { lo: lo - minCap, mid: mid - minCap, hi: hi - minCap },
      color: { [mid - minCap]: feasible ? 'accent2' : 'warn' },
      caption: `Check mid=${mid}`,
      stat: `cap=${mid} → chunks=${chunks} (${chunks <= k ? '≤' : '>'} ${k})`
    });

    if (feasible) {
      // mid is feasible, try smaller
      const fadedIndices = [];
      for (let v = mid + 1; v <= hi; v++) fadedIndices.push(v - minCap);
      trace.push({
        pointers: { lo: lo - minCap, mid: mid - minCap, hi: hi - minCap },
        color: { [mid - minCap]: 'good' },
        faded: fadedIndices,
        caption: `Feasible! Try smaller cap`,
        stat: `cap=${mid} → chunks=${chunks} (≤${k}) ✓`
      });
      hi = mid;
    } else {
      // mid is too small, need bigger
      const fadedIndices = [];
      for (let v = lo; v <= mid; v++) fadedIndices.push(v - minCap);
      trace.push({
        pointers: { lo: lo - minCap, mid: mid - minCap, hi: hi - minCap },
        color: { [mid - minCap]: 'bad' },
        faded: fadedIndices,
        caption: `Too small! Need bigger cap`,
        stat: `cap=${mid} → chunks=${chunks} (>${k}) ✗`
      });
      lo = mid + 1;
    }

    trace.push({
      pointers: { lo: lo - minCap, hi: hi - minCap },
      caption: `Search range updated`,
      stat: `lo=${lo}, hi=${hi}`
    });
  }

  // Final answer
  trace.push({
    pointers: { lo: lo - minCap },
    color: { [lo - minCap]: 'good' },
    caption: `Answer found: ${lo}`,
    stat: `min feasible cap = ${lo}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: range,
    labels: range.map(String),
    title: 'Split Array Largest Sum — Binary Search on Answer',
    note: `Find smallest cap where greedy chunking uses ≤${k} subarrays`,
    frames: trace
  });
});
