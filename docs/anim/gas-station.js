DSAAnim.register('gas-station', function (container) {
  'use strict';

  // Gas station problem: gas = [1,2,3,4,5], cost = [3,4,5,1,2]
  // Net at each station: [-2,-2,-2,3,3]
  // Total = 0, so a solution exists. Find the greedy reset start.
  const gas = [1, 2, 3, 4, 5];
  const cost = [3, 4, 5, 1, 2];
  const net = gas.map((g, i) => g - cost[i]); // [-2,-2,-2,3,3]

  const frames = [];
  let tank = 0;
  let start = 0;

  // Frame 0: initial state
  frames.push({
    caption: 'Net gas at each station: [−2,−2,−2,3,3]. Total ≥ 0 → unique answer exists.',
    pointers: { start: 0, i: 0 },
    color: { 0: 'accent' },
    stat: 'tank = 0'
  });

  // Sweep i through all stations
  for (let i = 0; i < net.length; i++) {
    tank += net[i];

    if (tank < 0) {
      // Current start fails; color the failed path 'bad'
      const badIndices = {};
      for (let k = start; k <= i; k++) {
        badIndices[k] = 'bad';
      }

      frames.push({
        caption: `Station ${i}: tank = ${tank} < 0. Reset start to ${i + 1}.`,
        pointers: { start: start, i: i },
        color: badIndices,
        stat: `tank = ${tank}`
      });

      // Reset for next candidate
      tank = 0;
      start = i + 1;

      if (start < net.length) {
        frames.push({
          caption: `New start candidate at station ${start}.`,
          pointers: { start: start, i: i },
          color: { [start]: 'accent' },
          stat: 'tank = 0'
        });
      }
    } else {
      // Tank is OK, continue
      const colorMap = { [start]: 'accent' };
      if (i > start) {
        colorMap[i] = 'good';
      }

      frames.push({
        caption: `Station ${i}: tank += ${net[i]} = ${tank}. Continue.`,
        pointers: { start: start, i: i },
        color: colorMap,
        stat: `tank = ${tank}`
      });
    }
  }

  // Final frame: solution found
  const finalColor = {};
  for (let k = start; k < net.length; k++) {
    finalColor[k] = 'good';
  }
  frames.push({
    caption: `Answer: start at station ${start} (last reset point).`,
    pointers: { start: start },
    color: finalColor,
    stat: `tank = ${tank}`
  });

  DSAAnim.render(container, {
    mode: 'cells',
    values: net,
    title: 'Gas Station — Greedy Reset',
    note: 'Track running tank; reset start when tank < 0.',
    frames: frames
  });
});
