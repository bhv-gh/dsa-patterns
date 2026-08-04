DSAAnim.register('best-time-to-buy-and-sell-stock', function(container) {
  const prices = [7, 1, 5, 3, 6, 4];
  const frames = [];

  // Initial state
  frames.push({
    pointers: { i: 0 },
    color: { 0: 'accent' },
    caption: 'Start: track min price and best profit',
    stat: 'min=7, profit=0, best=0'
  });

  // Simulate the one-pass greedy algorithm
  let minSoFar = prices[0];
  let minIdx = 0;
  let bestProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    const profit = prices[i] - minSoFar;
    const isNewBest = profit > bestProfit;

    // Current day: check profit
    const colorMap = { [minIdx]: 'good', [i]: 'accent' };
    frames.push({
      pointers: { i },
      color: colorMap,
      caption: `Day ${i}: sell today profit = ${prices[i]} - ${minSoFar} = ${profit}`,
      stat: `min=${minSoFar}, profit=${profit}, best=${isNewBest ? profit : bestProfit}`
    });

    if (isNewBest) {
      bestProfit = profit;
    }

    // Update min if needed
    if (prices[i] < minSoFar) {
      minSoFar = prices[i];
      minIdx = i;
      const newColorMap = { [minIdx]: 'good', [i]: 'accent' };
      frames.push({
        pointers: { i },
        color: newColorMap,
        caption: `New minimum found: ${minSoFar}`,
        stat: `min=${minSoFar}, profit=${profit}, best=${bestProfit}`
      });
    }
  }

  // Final result
  frames.push({
    pointers: {},
    color: { [minIdx]: 'good' },
    caption: `Best profit: ${bestProfit} (buy at ${minSoFar}, sell at ${minSoFar + bestProfit})`,
    stat: `best=${bestProfit}`
  });

  DSAAnim.render(container, {
    mode: 'bars',
    values: prices,
    title: 'Best Time to Buy and Sell Stock',
    note: 'Track min price so far, compute profit if we sell today',
    frames: frames
  });
});
