/* Koko Eating Bananas - Binary Search on the Answer
 * Problem: piles=[3,6,7,11], h=8 hours. Find minimum eating speed.
 * For each candidate speed, check if sum(ceil(pile/speed)) <= h.
 */
DSAAnim.register('koko-eating-bananas', function (container) {
  'use strict';

  const piles = [3, 6, 7, 11];
  const h = 8;
  const maxPile = Math.max(...piles);
  const speedRange = Array.from({ length: maxPile }, (_, i) => i + 1); // 1..11

  // Calculate hours needed for a given speed
  function hoursNeeded(speed) {
    return piles.reduce((sum, pile) => sum + Math.ceil(pile / speed), 0);
  }

  // Check if speed is feasible
  function isFeasible(speed) {
    return hoursNeeded(speed) <= h;
  }

  const frames = [];

  // Initial frame
  frames.push({
    caption: `Binary search for minimum speed. Piles: [${piles.join(', ')}], h=${h}`,
    stat: `Target: hours ≤ ${h}`,
  });

  // Binary search
  let lo = 0;
  let hi = speedRange.length - 1;
  let answer = speedRange[hi];

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const speed = speedRange[mid];
    const hours = hoursNeeded(speed);
    const feasible = isFeasible(speed);

    // Show mid calculation
    frames.push({
      pointers: { lo, hi, mid },
      caption: `Check mid speed = ${speed}`,
      stat: `speed=${speed} → hours=${hours} (${feasible ? '✓' : '✗'})`,
    });

    // Color based on feasibility
    const color = {};
    if (feasible) {
      // Speed works: mark all speeds >= mid as good (right side)
      for (let i = mid; i <= hi; i++) {
        color[i] = 'good';
      }
      // Mark speeds < mid as unknown (will check)
    } else {
      // Speed too slow: mark all speeds <= mid as bad (left side)
      for (let i = lo; i <= mid; i++) {
        color[i] = 'bad';
      }
    }

    frames.push({
      pointers: { lo, hi, mid },
      color,
      caption: feasible
        ? `${speed} works! Can we go slower?`
        : `${speed} too slow, need faster`,
      stat: `speed=${speed} → hours=${hours} (${hours <= h ? '≤' : '>'} ${h})`,
    });

    // Fade eliminated range
    const faded = [];
    if (feasible) {
      // Eliminate right half
      for (let i = mid + 1; i <= hi; i++) {
        faded.push(i);
      }
      answer = speed;
      hi = mid - 1;
    } else {
      // Eliminate left half
      for (let i = lo; i <= mid; i++) {
        faded.push(i);
      }
      lo = mid + 1;
    }

    frames.push({
      pointers: { lo, hi },
      color,
      faded,
      caption: feasible ? 'Eliminate faster speeds' : 'Eliminate slower speeds',
      stat: `speed=${speed} → hours=${hours}`,
    });
  }

  // Final frame
  const finalColor = {};
  const finalIdx = speedRange.indexOf(answer);
  finalColor[finalIdx] = 'accent';

  frames.push({
    pointers: { answer: finalIdx },
    color: finalColor,
    caption: `Found minimum speed: ${answer}`,
    stat: `Answer: ${answer} bananas/hour`,
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: speedRange,
    labels: speedRange.map(String),
    title: 'Koko Eating Bananas (Binary Search)',
    frames,
  });
});
