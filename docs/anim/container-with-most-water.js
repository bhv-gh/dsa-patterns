DSAAnim.register('container-with-most-water', function (container) {
  'use strict';
  const walls = [1, 8, 6, 2, 5, 4, 8, 3, 7];
  const frames = [];
  let L = 0;
  let R = walls.length - 1;
  let maxArea = 0;

  // Initial frame
  const water0 = new Array(walls.length).fill(0);
  const minH0 = Math.min(walls[L], walls[R]);
  for (let i = L; i <= R; i++) water0[i] = minH0;
  const area0 = minH0 * (R - L);
  maxArea = area0;
  frames.push({
    pointers: { L: L, R: R },
    water: water0,
    stat: `area = ${area0}`,
    highlight: walls[L] < walls[R] ? [L] : [R],
    caption: 'Start: L=0, R=8. Area = min(1,7) × 8 = 8. Move shorter wall (L).'
  });

  // Simulate two-pointer algorithm
  while (L < R) {
    if (walls[L] < walls[R]) {
      L++;
    } else {
      R--;
    }

    const water = new Array(walls.length).fill(0);
    const minH = Math.min(walls[L], walls[R]);
    for (let i = L; i <= R; i++) water[i] = minH;
    const area = minH * (R - L);
    if (area > maxArea) maxArea = area;

    const shorter = walls[L] < walls[R] ? L : R;
    const caption = L < R
      ? `L=${L}, R=${R}. Area = min(${walls[L]},${walls[R]}) × ${R - L} = ${area}. Best=${maxArea}. Move shorter wall.`
      : `Done! Max area = ${maxArea}`;

    frames.push({
      pointers: { L: L, R: R },
      water: water,
      stat: `area = ${area}, best = ${maxArea}`,
      highlight: L < R ? [shorter] : [],
      caption: caption
    });
  }

  DSAAnim.render(container, {
    mode: 'bars',
    values: walls,
    title: 'Container With Most Water',
    note: 'Move the shorter wall inward (moving the taller can never help).',
    frames: frames
  });
});
