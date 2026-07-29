DSAAnim.register('variable-length-sliding-window', function(container) {
  'use strict';
  const vals = [2, 3, 1, 2, 4, 3];
  const target = 7;
  const frames = [];

  // Build frames: expand R, then shrink L when valid
  let L = 0, R = 0, sum = vals[0], best = Infinity, bestL = -1, bestR = -1;

  // Initial state
  frames.push({
    window: [L, R],
    pointers: { L: L, R: R },
    stat: `sum=${sum}, best=none`,
    caption: 'Start: L=0, R=0'
  });

  while (R < vals.length) {
    if (sum < target) {
      // Need more → expand right
      R++;
      if (R < vals.length) {
        sum += vals[R];
        frames.push({
          window: [L, R],
          pointers: { L: L, R: R },
          stat: `sum=${sum}, best=${best === Infinity ? 'none' : best}`,
          caption: `Expand right: R=${R}, sum=${sum}`
        });
      }
    } else {
      // Valid (sum >= target) → try shrink left
      const len = R - L + 1;
      if (len < best) {
        best = len;
        bestL = L;
        bestR = R;
        frames.push({
          window: [L, R],
          pointers: { L: L, R: R },
          highlight: [L, R],
          stat: `sum=${sum}, best=${best}`,
          caption: `Valid! New best length=${best}`
        });
      }
      sum -= vals[L];
      L++;
      if (L <= R) {
        frames.push({
          window: [L, R],
          pointers: { L: L, R: R },
          stat: `sum=${sum}, best=${best}`,
          caption: `Shrink left: L=${L}, sum=${sum}`
        });
      } else {
        // L passed R, expand right
        R++;
        if (R < vals.length) {
          sum = vals[R];
          frames.push({
            window: [R, R],
            pointers: { L: R, R: R },
            stat: `sum=${sum}, best=${best}`,
            caption: `Reset: L=R=${R}`
          });
          L = R;
        }
      }
    }
  }

  // Final answer
  frames.push({
    window: [bestL, bestR],
    highlight: Array.from({ length: bestR - bestL + 1 }, (_, i) => bestL + i),
    color: Object.fromEntries(Array.from({ length: bestR - bestL + 1 }, (_, i) => [bestL + i, 'good'])),
    stat: `Answer: length=${best}`,
    caption: `Smallest subarray [${vals[bestL]},${vals[bestR]}] with sum≥${target}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: vals,
    title: 'Variable-Length Sliding Window',
    note: `Find smallest subarray with sum ≥ ${target}. Expand to meet goal, shrink to minimize. O(n) — each element visited ≤2 times.`,
    frames: frames
  });
});
