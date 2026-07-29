DSAAnim.register('sort-colors', function(container) {
  const frames = [];
  const arr = [2, 0, 2, 1, 1, 0];
  let low = 0, mid = 0, high = arr.length - 1;

  function getColor(val) {
    if (val === 0) return 'red';
    if (val === 1) return 'white';
    if (val === 2) return 'blue';
    return '';
  }

  function buildColorMap() {
    const cm = {};
    for (let i = 0; i < arr.length; i++) {
      cm[i] = getColor(arr[i]);
    }
    return cm;
  }

  function addFrame(caption) {
    frames.push({
      values: [...arr],
      pointers: { low, mid, high },
      color: buildColorMap(),
      caption
    });
  }

  addFrame('Start: three pointers. low=0, mid=0, high=5. Sort 0s/1s/2s in one pass.');

  while (mid <= high) {
    if (arr[mid] === 0) {
      addFrame(`arr[mid]=${arr[mid]} is 0 (red). Swap with low pointer.`);
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      low++;
      mid++;
      addFrame(`Swapped. low++ and mid++ (we know arr[low-1] was ≤1, now sorted).`);
    } else if (arr[mid] === 1) {
      addFrame(`arr[mid]=${arr[mid]} is 1 (white). Already in middle. mid++.`);
      mid++;
    } else {
      addFrame(`arr[mid]=${arr[mid]} is 2 (blue). Swap with high pointer.`);
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      high--;
      addFrame(`Swapped. high--. mid STAYS—we haven't examined the swapped-in value yet.`);
    }
  }

  addFrame('Done! All 0s (red) left, 1s (white) middle, 2s (blue) right.');

  DSAAnim.render(container, {
    mode: 'cells',
    values: [2, 0, 2, 1, 1, 0],
    title: 'Sort Colors (Dutch National Flag)',
    frames
  });
});
