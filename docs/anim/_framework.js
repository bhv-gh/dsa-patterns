/* DSAAnim — shared, offline, no-build interactive visualization framework.
 *
 * An "animation" is a sequence of FRAMES the learner steps/plays/scrubs through.
 * Authors only compute frames; this file renders bars/cells, pointers, a sliding
 * window overlay, water fills, captions, a running stat, and playback controls.
 *
 * Register:   DSAAnim.register('<module-slug>', function(container){ ... });
 * Render one visualization into a container:
 *     DSAAnim.render(container, {
 *       mode: 'bars' | 'cells',     // bars: height ∝ value; cells: boxed value/char
 *       values: [3,1,4,1,5],        // base array
 *       labels: ['a','b',...],      // optional cell labels (defaults to values)
 *       title: 'Two pointers converge',
 *       note:  'Move the shorter wall inward.',
 *       frames: [ frame, frame, ... ]
 *     });
 *
 * FRAME (all keys optional):
 *   values:   number[]            override array for this frame (in-place algos)
 *   labels:   string[]            override cell text
 *   pointers: { i: 2, j: 6 }      named markers drawn under the row
 *   window:   [l, r]              inclusive index range highlighted as a window
 *   highlight:[indices]           emphasized items
 *   faded:    [indices]           dimmed items
 *   color:    { 3: 'good', 4:'bad', 0:'red' }   per-index color class
 *   water:    number[]            (bars mode) water level per index
 *   caption:  'what happens here'
 *   stat:     'area = 49'         chip shown top-right
 *
 * Color classes: accent, accent2, good, bad, warn, red, white, blue, mut.
 * A mount function may call render() multiple times to show several visualizations.
 */
(function () {
  'use strict';
  const NS = (window.DSAAnim = window.DSAAnim || {});
  NS.registry = NS.registry || {};
  NS.register = function (key, fn) { NS.registry[key] = fn; };

  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };

  NS.render = function (parent, cfg) {
    const mode = cfg.mode === 'bars' ? 'bars' : 'cells';
    const base = cfg.values || [];
    const baseLabels = cfg.labels || base.map((v) => String(v));
    const frames = (cfg.frames && cfg.frames.length) ? cfg.frames : [{ caption: cfg.note || '' }];
    const maxVal = Math.max(1, ...base.flatMap((_, i) =>
      frames.map((f) => Math.max(...((f.values || base).map(Math.abs)), ...((f.water || []).map(Math.abs) || [0])))));

    // ---- scaffold ----
    const wrap = el('div', 'dsa-viz');
    if (cfg.title) wrap.appendChild(el('div', 'dsa-viz-title', cfg.title));
    const stage = el('div', 'dsa-stage dsa-' + mode);
    const statChip = el('div', 'dsa-stat'); statChip.hidden = true;
    stage.appendChild(statChip);
    const winOverlay = el('div', 'dsa-window'); winOverlay.hidden = true;
    stage.appendChild(winOverlay);
    const row = el('div', 'dsa-row');
    stage.appendChild(row);
    const ptrLayer = el('div', 'dsa-ptrs');
    stage.appendChild(ptrLayer);
    wrap.appendChild(stage);

    const caption = el('div', 'dsa-caption');
    wrap.appendChild(caption);

    // ---- items ----
    const items = base.map((v, i) => {
      const item = el('div', 'dsa-item');
      if (mode === 'bars') {
        const col = el('div', 'dsa-col');
        const water = el('div', 'dsa-water'); water.hidden = true;
        const bar = el('div', 'dsa-bar');
        col.appendChild(bar); col.appendChild(water);
        const val = el('div', 'dsa-val', String(v));
        item.appendChild(col); item.appendChild(val);
        item._bar = bar; item._water = water; item._val = val;
      } else {
        const box = el('div', 'dsa-cell', baseLabels[i]);
        const idxLbl = el('div', 'dsa-idx', String(i));
        item.appendChild(box); item.appendChild(idxLbl);
        item._box = box;
      }
      row.appendChild(item);
      return item;
    });

    // ---- controls ----
    const ctrls = el('div', 'dsa-ctrls');
    const btn = (label, aria) => { const b = el('button', 'dsa-btn', label); b.setAttribute('aria-label', aria); return b; };
    const bBack = btn('◀', 'Step back');
    const bPlay = btn('▶', 'Play');
    const bFwd = btn('▶|', 'Step forward');
    const bReset = btn('↺', 'Reset');
    const scrub = el('input', 'dsa-scrub'); scrub.type = 'range'; scrub.min = 0; scrub.max = frames.length - 1; scrub.value = 0;
    const counter = el('div', 'dsa-counter', `1 / ${frames.length}`);
    ctrls.append(bBack, bPlay, bFwd, bReset, scrub, counter);
    wrap.appendChild(ctrls);

    parent.appendChild(wrap);

    // ---- state ----
    let cur = 0, timer = null;
    const SPEED = cfg.speed || 950;

    function clearClasses(n) { n.classList.remove('hl', 'fade', 'c-accent', 'c-accent2', 'c-good', 'c-bad', 'c-warn', 'c-red', 'c-white', 'c-blue', 'c-mut'); }

    function apply(idx) {
      cur = Math.max(0, Math.min(frames.length - 1, idx));
      const f = frames[cur];
      const vals = f.values || base;
      const labels = f.labels || (f.values ? f.values.map(String) : baseLabels);

      items.forEach((item, i) => {
        const target = mode === 'bars' ? item._bar : item._box;
        clearClasses(target);
        if (mode === 'bars') {
          const h = Math.max(2, (Math.abs(vals[i]) / maxVal) * 100);
          item._bar.style.height = h + '%';
          item._val.textContent = String(vals[i]);
          const wlvl = f.water && f.water[i] != null ? f.water[i] : 0;
          if (wlvl > vals[i]) {
            item._water.hidden = false;
            item._water.style.bottom = ((vals[i] / maxVal) * 100) + '%';
            item._water.style.height = (((wlvl - vals[i]) / maxVal) * 100) + '%';
          } else { item._water.hidden = true; }
        } else {
          item._box.textContent = labels[i];
        }
        if (f.faded && f.faded.includes(i)) target.classList.add('fade');
        if (f.highlight && f.highlight.includes(i)) target.classList.add('hl');
        if (f.color && f.color[i]) target.classList.add('c-' + f.color[i]);
      });

      // window overlay
      if (f.window && f.window.length === 2 && f.window[0] <= f.window[1]) {
        const a = items[f.window[0]], b = items[f.window[1]];
        if (a && b) {
          const L = a.offsetLeft, R = b.offsetLeft + b.offsetWidth;
          winOverlay.hidden = false;
          winOverlay.style.left = L + 'px';
          winOverlay.style.width = (R - L) + 'px';
        }
      } else { winOverlay.hidden = true; }

      // pointers
      ptrLayer.innerHTML = '';
      if (f.pointers) {
        const byIdx = {};
        Object.keys(f.pointers).forEach((name) => {
          const i = f.pointers[name];
          if (i == null || i < 0 || i >= items.length) return;
          (byIdx[i] = byIdx[i] || []).push(name);
        });
        Object.keys(byIdx).forEach((i) => {
          const item = items[+i];
          const p = el('div', 'dsa-ptr');
          p.style.left = (item.offsetLeft + item.offsetWidth / 2) + 'px';
          p.append(el('div', 'dsa-ptr-arrow', '▲'), el('div', 'dsa-ptr-name', byIdx[i].join(',')));
          ptrLayer.appendChild(p);
        });
      }

      caption.textContent = f.caption || '';
      if (f.stat != null) { statChip.hidden = false; statChip.textContent = f.stat; } else { statChip.hidden = true; }
      scrub.value = cur;
      counter.textContent = `${cur + 1} / ${frames.length}`;
      bBack.disabled = cur === 0;
      bFwd.disabled = cur === frames.length - 1;
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; bPlay.textContent = '▶'; bPlay.setAttribute('aria-label', 'Play'); } }
    function play() {
      if (cur === frames.length - 1) apply(0);
      bPlay.textContent = '⏸'; bPlay.setAttribute('aria-label', 'Pause');
      timer = setInterval(() => { if (cur >= frames.length - 1) { stop(); } else { apply(cur + 1); } }, SPEED);
    }

    bPlay.addEventListener('click', () => { timer ? stop() : play(); });
    bFwd.addEventListener('click', () => { stop(); apply(cur + 1); });
    bBack.addEventListener('click', () => { stop(); apply(cur - 1); });
    bReset.addEventListener('click', () => { stop(); apply(0); });
    scrub.addEventListener('input', () => { stop(); apply(+scrub.value); });

    // initial + keep overlays aligned on resize
    apply(0);
    requestAnimationFrame(() => apply(cur));
    const ro = new ResizeObserver(() => apply(cur));
    ro.observe(stage);

    return { goto: apply, destroy: () => { stop(); ro.disconnect(); wrap.remove(); } };
  };
})();
