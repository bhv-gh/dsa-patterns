/* DSA Patterns — offline PWA. Vanilla JS, no build step. */
(() => {
  'use strict';

  // Bump this on every deploy (keep in sync with CACHE in sw.js). Shown in the top bar.
  const APP_VERSION = 'v14';

  const view = document.getElementById('view');
  const topbarTitle = document.getElementById('topbarTitle');
  const backBtn = document.getElementById('backBtn');
  const themeBtn = document.getElementById('themeBtn');
  const netDot = document.getElementById('netDot');
  const toastEl = document.getElementById('toast');

  const LS_PROGRESS = 'dsa.progress.v1';
  const LS_THEME = 'dsa.theme.v1';

  let INDEX = null;                 // loaded index.json
  const moduleCache = new Map();    // id -> module json

  /* ---------- utilities ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const getProgress = () => {
    try { return JSON.parse(localStorage.getItem(LS_PROGRESS)) || {}; }
    catch { return {}; }
  };
  const setDone = (id, done) => {
    const p = getProgress();
    if (done) p[id] = true; else delete p[id];
    localStorage.setItem(LS_PROGRESS, JSON.stringify(p));
  };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toastEl.hidden = true; }, 1800);
  }

  /* ---------- tiny markdown (bold, inline code, lists, paragraphs) ---------- */
  function mdInline(s) {
    let out = esc(s);
    out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
    out = out.replace(/\*\*([^*]+)\*\*/g, (_, b) => `<strong>${b}</strong>`);
    return out;
  }
  function mdBlock(text) {
    if (!text) return '';
    const lines = String(text).split('\n');
    let html = '', list = null, para = [];
    const flushP = () => { if (para.length) { html += `<p>${mdInline(para.join(' '))}</p>`; para = []; } };
    const flushL = () => { if (list) { html += `<ul>${list}</ul>`; list = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flushP(); flushL(); continue; }
      const m = line.match(/^[-*]\s+(.*)$/);
      if (m) { flushP(); list = (list || '') + `<li>${mdInline(m[1])}</li>`; }
      else { flushL(); para.push(line); }
    }
    flushP(); flushL();
    return html;
  }

  /* ---------- minimal python highlighter ---------- */
  const PY_KW = new Set(('def return if elif else for while in and or not is None True False break continue '
    + 'class import from as with try except finally raise lambda yield global nonlocal pass assert del').split(' '));
  function highlightPy(code) {
    // tokenize protecting strings & comments
    const parts = [];
    let i = 0;
    const push = (cls, txt) => parts.push(cls ? `<span class="${cls}">${esc(txt)}</span>` : esc(txt));
    while (i < code.length) {
      const ch = code[i];
      if (ch === '#') { let j = code.indexOf('\n', i); if (j < 0) j = code.length; push('tok-com', code.slice(i, j)); i = j; continue; }
      if (ch === '"' || ch === "'") {
        const triple = code.substr(i, 3) === ch.repeat(3);
        const q = triple ? ch.repeat(3) : ch;
        let j = i + q.length;
        while (j < code.length) { if (code.substr(j, q.length) === q) { j += q.length; break; } j++; }
        push('tok-str', code.slice(i, j)); i = j; continue;
      }
      if (/[A-Za-z_]/.test(ch)) {
        let j = i + 1; while (j < code.length && /[A-Za-z0-9_]/.test(code[j])) j++;
        const word = code.slice(i, j);
        const prev = code.slice(0, i).match(/def\s+$/);
        if (prev) push('tok-def', word);
        else if (PY_KW.has(word)) push('tok-kw', word);
        else push(null, word);
        i = j; continue;
      }
      if (/[0-9]/.test(ch)) { let j = i + 1; while (j < code.length && /[0-9.]/.test(code[j])) j++; push('tok-num', code.slice(i, j)); i = j; continue; }
      push(null, ch); i++;
    }
    return parts.join('');
  }

  /* ---------- data loading ---------- */
  async function loadIndex() {
    if (INDEX) return INDEX;
    const res = await fetch('./modules/index.json', { cache: 'no-cache' });
    INDEX = await res.json();
    return INDEX;
  }
  async function loadModule(id) {
    if (moduleCache.has(id)) return moduleCache.get(id);
    const res = await fetch(`./modules/${id}.json`, { cache: 'no-cache' });
    const data = await res.json();
    moduleCache.set(id, data);
    return data;
  }
  let REELS = null;
  async function loadReels() {
    if (REELS) return REELS;
    const res = await fetch('./reels.json', { cache: 'no-cache' });
    REELS = await res.json();
    return REELS;
  }

  /* ---------- bookmarks ---------- */
  const LS_BOOKMARKS = 'dsa.bookmarks.v1';
  const getBookmarks = () => {
    try { return JSON.parse(localStorage.getItem(LS_BOOKMARKS)) || []; }
    catch { return []; }
  };
  const isBookmarked = (id) => getBookmarks().includes(id);
  const bookmarkCount = () => getBookmarks().length;
  function toggleBookmark(id) {
    const b = getBookmarks();
    const i = b.indexOf(id);
    if (i >= 0) b.splice(i, 1); else b.unshift(id);
    localStorage.setItem(LS_BOOKMARKS, JSON.stringify(b));
    return i < 0; // true if now bookmarked
  }

  /* ---------- notes (highlight any text -> save) ---------- */
  const LS_NOTES = 'dsa.notes.v1';
  const getNotes = () => {
    try { return JSON.parse(localStorage.getItem(LS_NOTES)) || []; }
    catch { return []; }
  };
  const notesCount = () => getNotes().length;
  function addNote(text, src) {
    const notes = getNotes();
    const clean = String(text).replace(/\s+/g, ' ').trim();
    if (!clean) return false;
    if (notes.some((n) => n.text === clean && n.moduleId === src.moduleId)) return 'dup';
    notes.unshift({
      id: 'n' + Date.now().toString(36) + Math.floor(performance.now() % 1000).toString(36),
      text: clean.slice(0, 1200),
      moduleId: src.moduleId || null,
      title: src.title || '',
      pattern: src.pattern || '',
      at: Date.now(),
    });
    localStorage.setItem(LS_NOTES, JSON.stringify(notes));
    return true;
  }
  function deleteNote(id) {
    localStorage.setItem(LS_NOTES, JSON.stringify(getNotes().filter((n) => n.id !== id)));
  }

  // what lesson is on screen right now (for note attribution)
  let noteSource = { moduleId: null, title: '', pattern: '' };
  const setNoteSource = (s) => { noteSource = Object.assign({ moduleId: null, title: '', pattern: '' }, s); };

  /* ---------- reels position memory (resume where you left off) ---------- */
  const LS_REELPOS = 'dsa.reelpos.v1';
  const getReelPos = () => {
    try { return JSON.parse(localStorage.getItem(LS_REELPOS)) || null; }
    catch { return null; }
  };
  function saveReelPos(mode, cardId, index, total) {
    if (!cardId) return;
    try {
      localStorage.setItem(LS_REELPOS, JSON.stringify({
        mode, cardId, index, total, at: Date.now(),
      }));
    } catch (e) { /* storage full/blocked — non-fatal */ }
  }
  function agoText(ts) {
    const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 90) return 'just now';
    const m = Math.round(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.round(h / 24); return d === 1 ? 'yesterday' : `${d}d ago`;
  }

  // per-pattern accent (hue) for reel backgrounds
  const PATTERN_HUE = {
    'intro': 250, 'two-pointers': 222, 'sliding-window': 275, 'intervals': 200,
    'stack': 155, 'linked-list': 330, 'binary-search': 35, 'heap': 10, 'depth-first-search': 190,
  };
  const hueFor = (p) => (PATTERN_HUE[p] != null ? PATTERN_HUE[p] : 240);

  /* ---------- badge helpers ---------- */
  function badge(m) {
    if (m.type === 'lesson' || m.type === 'intro') return `<span class="badge lesson">${m.type === 'intro' ? 'Start' : 'Guide'}</span>`;
    if (m.difficulty) return `<span class="badge ${m.difficulty}">${m.difficulty}</span>`;
    return '';
  }
  const tickSvg = '<svg class="tick" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const chevSvg = '<svg class="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- HOME view ---------- */
  async function renderHome() {
    backBtn.hidden = true;
    topbarTitle.textContent = 'DSA Patterns 🧿';
    const idx = await loadIndex();
    const progress = getProgress();
    const total = idx.modules.length;
    const done = idx.modules.filter((m) => progress[m.id]).length;
    const pct = Math.round((done / total) * 100);

    const intro = idx.modules.find((m) => m.type === 'intro');
    let html = `
      <section class="hero">
        <h1>Master coding-interview patterns <span class="nz">🧿</span></h1>
        <p>Bite-sized, visual-first lessons you can study anywhere — fully offline.</p>
        <div class="progress-wrap">
          <div class="progress-row"><span>${done} of ${total} complete</span><span>${pct}%</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="launchers">
          <button class="launch" data-nav="#/reels">
            <span class="lx-ic">🎬</span><span class="lx-tx"><b>Reels</b><small>Scroll &amp; learn</small></span>
          </button>
          <button class="launch" data-nav="#/saved">
            <span class="lx-ic">🔖</span><span class="lx-tx"><b>Saved</b><small>${bookmarkCount()} bookmarked</small></span>
          </button>
          <button class="launch" data-nav="#/notes">
            <span class="lx-ic">📝</span><span class="lx-tx"><b>Notes</b><small>${notesCount()} saved</small></span>
          </button>
        </div>
      </section>`;

    // resume where you left off in Reels
    const rp = getReelPos();
    if (rp && rp.cardId) {
      const pos = (rp.index != null && rp.total) ? `card ${rp.index + 1} of ${rp.total}` : 'your last reel';
      html += `<button class="resume-chip" data-nav="#/reels${rp.mode && rp.mode !== 'all' ? '/' + rp.mode : ''}">
        <span class="rz-ic">▶</span>
        <span class="rz-tx"><b>Pick up where you left off</b><small>${esc(pos)} · ${agoText(rp.at)}</small></span>
        <span class="rz-go">Resume</span>
      </button>`;
    }

    if (intro) {
      html += `<div class="cards" style="margin-bottom:22px">${cardHtml(intro, progress)}</div>`;
    }

    for (const pat of idx.patterns) {
      const mods = idx.modules.filter((m) => m.pattern === pat.id);
      if (!mods.length) continue;
      html += `
        <section class="group">
          <div class="group-head"><h2>${esc(pat.title)}</h2><span class="count">${mods.length} lessons</span></div>
          <p class="group-blurb">${esc(pat.blurb)}</p>
          <div class="cards">${mods.map((m) => cardHtml(m, progress)).join('')}</div>
        </section>`;
    }

    if (done > 0) {
      html += `<button class="reset-link" id="resetBtn">Reset progress</button>`;
    }

    // nazar — wards off the evil eye while you grind 🧿
    html += `<div class="nazar" aria-hidden="true">🧿 &nbsp; happy studying &nbsp; 🧿</div>`;

    view.innerHTML = html;
    view.scrollTo?.(0, 0);
    window.scrollTo(0, 0);
    view.querySelectorAll('[data-goto]').forEach((el) =>
      el.addEventListener('click', () => { location.hash = `#/m/${el.dataset.goto}`; }));
    view.querySelectorAll('[data-nav]').forEach((el) =>
      el.addEventListener('click', () => { location.hash = el.dataset.nav; }));
    const reset = document.getElementById('resetBtn');
    if (reset) reset.addEventListener('click', () => {
      if (confirm('Reset all progress?')) { localStorage.removeItem(LS_PROGRESS); renderHome(); }
    });
  }

  function cardHtml(m, progress) {
    const isDone = !!progress[m.id];
    const sub = m.type === 'problem' ? 'Problem' : (m.type === 'intro' ? 'Course overview' : 'Pattern guide');
    return `
      <button class="card ${isDone ? 'done' : ''}" data-goto="${m.id}">
        <span class="idx">${isDone ? tickSvg : m.id}</span>
        <span class="card-body">
          <span class="card-title"><span class="t">${esc(m.title)}</span>${badge(m)}</span>
          <span class="card-sub">${sub} · ${esc(m.summary || '')}</span>
        </span>
        ${chevSvg}
      </button>`;
  }

  /* ---------- MODULE view ---------- */
  async function renderModule(id) {
    backBtn.hidden = false;
    let m;
    try { m = await loadModule(id); }
    catch { view.innerHTML = `<div class="empty">Couldn't load this lesson.<br>Try again when online.</div>`; return; }

    topbarTitle.textContent = m.title;
    setNoteSource({ moduleId: m.id, title: m.title, pattern: m.pattern });
    const progress = getProgress();
    const isDone = !!progress[m.id];

    let html = `<article class="m-head">
      <div class="m-meta">${badge(m)}${m.type === 'problem' ? '' : `<span class="badge lesson">${m.pattern.replace('-', ' ')}</span>`}</div>
      <h1>${esc(m.title)}</h1>
      ${m.summary ? `<p class="m-summary">${esc(m.summary)}</p>` : ''}
    </article>`;

    // sections
    for (const s of (m.sections || [])) {
      html += `<section class="section"><h3>${esc(s.heading)}</h3><div class="body">${mdBlock(s.body)}</div></section>`;
    }

    // interactive visualization mount (filled after render, removed if none)
    if (m.type !== 'intro') html += `<section class="anim-section" id="animMount" hidden></section>`;

    // approach steps
    if (Array.isArray(m.approach) && m.approach.length) {
      html += `<section class="section"><h3>${m.type === 'problem' ? 'Step-by-step' : 'When to use it'}</h3>
        <ol class="steps">${m.approach.map((s) => `<li>${mdInline(s)}</li>`).join('')}</ol></section>`;
    }

    // complexity
    if (m.complexity && (m.complexity.time || m.complexity.space)) {
      html += `<div class="cplx">
        ${m.complexity.time ? `<div class="chip"><div class="k">Time</div><div class="v">${esc(m.complexity.time)}</div></div>` : ''}
        ${m.complexity.space ? `<div class="chip"><div class="k">Space</div><div class="v">${esc(m.complexity.space)}</div></div>` : ''}
      </div>`;
    }

    // code
    if (m.code) {
      const label = m.type === 'problem' ? 'Solution · Python' : 'Template · Python';
      html += `<section class="section"><h3>Code</h3>
        <div class="code-wrap">
          <div class="code-head"><span>${label}</span><button class="copy-btn" id="copyBtn">Copy</button></div>
          <pre class="code"><code id="codeBlock">${highlightPy(m.code)}</code></pre>
        </div></section>`;
    }

    // quiz
    if (Array.isArray(m.quiz) && m.quiz.length) {
      html += `<section class="quiz"><h2 class="quiz-head">Check yourself</h2>` +
        m.quiz.map((q, qi) => quizHtml(q, qi)).join('') + `</section>`;
    }

    // complete button
    html += `<button class="complete-btn ${isDone ? 'done' : ''}" id="completeBtn">${isDone ? '✓ Completed — tap to undo' : 'Mark as complete'}</button>`;

    // reels for this lesson
    if (m.type !== 'intro') html += `<a class="reels-link" href="#/reels/m/${m.id}">🎬 Reels for this lesson</a>`;

    // pager
    html += pagerHtml(m.id);

    view.innerHTML = html;
    window.scrollTo(0, 0);

    // wire copy
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(m.code); toast('Code copied'); }
      catch { toast('Copy not supported'); }
    });

    // wire quiz
    view.querySelectorAll('.q-card').forEach((card, qi) => {
      const q = m.quiz[qi];
      card.querySelectorAll('.opt').forEach((opt, oi) => {
        opt.addEventListener('click', () => {
          card.querySelectorAll('.opt').forEach((o) => o.classList.add('disabled'));
          const correct = oi === q.answer;
          opt.classList.add(correct ? 'correct' : 'wrong');
          opt.querySelector('.mark').textContent = correct ? '✓' : '✕';
          if (!correct) {
            const right = card.querySelectorAll('.opt')[q.answer];
            right.classList.add('correct');
            right.querySelector('.mark').textContent = '✓';
          }
          const ex = card.querySelector('.explain');
          if (ex) ex.hidden = false;
        });
      });
    });

    // wire complete
    const cbtn = document.getElementById('completeBtn');
    cbtn.addEventListener('click', () => {
      const nowDone = !cbtn.classList.contains('done');
      setDone(m.id, nowDone);
      cbtn.classList.toggle('done', nowDone);
      cbtn.textContent = nowDone ? '✓ Completed — tap to undo' : 'Mark as complete';
      if (nowDone) toast('Nice — progress saved 🧿');
    });

    // wire pager — REPLACE the history entry (don't push) so the phone's
    // edge-swipe / back gesture returns to the home list instead of walking
    // back through every module you paged through.
    view.querySelectorAll('[data-goto]').forEach((el) =>
      el.addEventListener('click', (e) => {
        e.preventDefault();
        location.replace(location.pathname + location.search + `#/m/${el.dataset.goto}`);
      }));

    // load & mount the module's visualization (if one exists)
    mountAnimation(m);
  }

  const loadedScripts = new Set();
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (loadedScripts.has(src)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => { loadedScripts.add(src); resolve(); };
      s.onerror = () => reject(new Error('failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  async function mountAnimation(m) {
    if (m.type === 'intro') return;
    const mount = document.getElementById('animMount');
    if (!mount) return;
    try {
      await loadScript(`./anim/${m.slug}.js`);
      const fn = window.DSAAnim && window.DSAAnim.registry[m.slug];
      if (typeof fn === 'function') {
        mount.innerHTML = '<h3>Visualize it</h3>';
        fn(mount);
        mount.hidden = false;
      } else {
        mount.remove();
      }
    } catch (e) {
      mount.remove();  // no animation for this module, or offline & uncached
    }
  }

  function quizHtml(q, qi) {
    const opts = q.options.map((o, oi) =>
      `<button class="opt" data-oi="${oi}">${esc(o)}<span class="mark"></span></button>`).join('');
    return `<div class="q-card">
      <p class="q-text">${qi + 1}. ${esc(q.q)}</p>
      ${opts}
      ${q.explain ? `<div class="explain" hidden>${mdInline(q.explain)}</div>` : ''}
    </div>`;
  }

  function pagerHtml(id) {
    if (!INDEX) return '';
    const list = INDEX.modules;
    const pos = list.findIndex((m) => m.id === id);
    const prev = pos > 0 ? list[pos - 1] : null;
    const next = pos < list.length - 1 ? list[pos + 1] : null;
    return `<nav class="pager">
      <a class="prev ${prev ? '' : 'disabled'}" ${prev ? `href="#/m/${prev.id}" data-goto="${prev.id}"` : ''}>
        <span class="lbl">Previous</span><span class="nm">${prev ? esc(prev.title) : '—'}</span></a>
      <a class="next ${next ? '' : 'disabled'}" ${next ? `href="#/m/${next.id}" data-goto="${next.id}"` : ''}>
        <span class="lbl">Next</span><span class="nm">${next ? esc(next.title) : '—'}</span></a>
    </nav>`;
  }

  /* ---------- REELS (mixed feed, vertical scroll, double-tap bookmark) ---------- */
  function reelInner(c) {
    const chip = `<div class="reel-tag">${esc(c.patternTitle)} · ${c.type === 'quiz' ? 'Quiz' : c.type === 'code' ? 'Code' : 'Concept'}</div>`;
    if (c.type === 'concept') {
      return `${chip}<div class="reel-title">${esc(c.title)}</div>
        ${c.heading ? `<div class="reel-h">${esc(c.heading)}</div>` : ''}
        <div class="reel-body">${mdBlock(c.body)}</div>`;
    }
    if (c.type === 'code') {
      return `${chip}<div class="reel-title">${esc(c.title)}</div>
        <div class="reel-h">${esc(c.label || 'Code')}</div>
        <pre class="code reel-code"><code>${highlightPy(c.code)}</code></pre>`;
    }
    // quiz
    const opts = c.options.map((o, oi) => `<button class="opt" data-oi="${oi}">${esc(o)}<span class="mark"></span></button>`).join('');
    return `${chip}<div class="reel-title">${esc(c.title)}</div>
      <div class="reel-q">${esc(c.q)}</div>${opts}
      ${c.explain ? `<div class="explain" hidden>${mdInline(c.explain)}</div>` : ''}`;
  }

  function fxEmojis(type) {
    if (type === 'code') return ['💻', '⚡', '🧩', '⚙️', '✨', '🧿'];
    if (type === 'quiz') return ['❓', '🧠', '✅', '🎯', '✨', '🧿'];
    return ['💡', '✨', '🧿', '📘', '⚡', '🌟'];
  }
  function fxLayer(type) {
    const em = fxEmojis(type);
    let out = '';
    for (let i = 0; i < 6; i++) {
      const left = 6 + i * 15 + (i % 2 ? 4 : -3);
      const size = 16 + (i % 3) * 6;
      const dur = (7 + (i * 1.3) % 6).toFixed(1);
      const delay = ((i * 1.7) % 6).toFixed(1);
      const dx = (i % 2 ? 1 : -1) * (20 + i * 8);
      const rot = (i % 2 ? 1 : -1) * (15 + i * 10);
      out += `<span class="fx" style="left:${left}%;font-size:${size}px;--dur:${dur}s;--delay:${delay}s;--dx:${dx}px;--rot:${rot}deg">${em[i % em.length]}</span>`;
    }
    return `<div class="reel-fx" aria-hidden="true">${out}</div>`;
  }

  // filter: {mode:'all'|'saved'|'completed'|'module', id?}
  async function renderReels(filter) {
    backBtn.hidden = true;
    let data;
    try { data = await loadReels(); }
    catch { view.innerHTML = `<div class="empty">Couldn't load reels.</div>`; return; }
    let cards = data.cards;
    let heading = 'Reels 🧿', emptyMsg = 'No reels available.', moduleTitle = '';
    if (filter.mode === 'saved') {
      const bm = new Set(getBookmarks());
      cards = cards.filter((c) => bm.has(c.id));
      heading = 'Saved reels 🔖'; emptyMsg = 'No bookmarks yet.<br>Double-tap a reel to save it.';
    } else if (filter.mode === 'completed') {
      const prog = getProgress();
      cards = cards.filter((c) => prog[c.moduleId]);
      heading = 'Completed reels ✓'; emptyMsg = "No completed lessons yet.<br>Finish a lesson to see its reels here.";
    } else if (filter.mode === 'module') {
      cards = cards.filter((c) => c.moduleId === filter.id);
      const m = INDEX && INDEX.modules.find((x) => x.id === filter.id);
      moduleTitle = m ? m.title : '';
      heading = 'Reels · this lesson'; emptyMsg = 'No reels for this lesson.';
    }

    // filter chips shown in the bar
    const chip = (mode, label, hash) =>
      `<button class="reels-filter ${filter.mode === mode ? 'on' : ''}" data-nav="${hash}">${label}</button>`;
    const bar = `<div class="reels-bar">
        <button class="icon-btn" data-nav="${filter.mode === 'module' ? '#/m/' + filter.id : '#/'}" aria-label="Close reels">✕</button>
        <div class="reels-title">${heading}${moduleTitle ? ` · ${esc(moduleTitle)}` : ''}</div>
        <div class="reels-filters">
          ${chip('all', 'All', '#/reels')}${chip('saved', '🔖', '#/reels/saved')}${chip('completed', '✓', '#/reels/completed')}
        </div>
      </div>`;

    if (!cards.length) {
      view.innerHTML = `<div class="reels">${bar}<div class="reels-empty">
        <div class="nazar" style="font-size:32px">🧿</div>
        <p>${emptyMsg}</p>
        <button class="complete-btn" data-nav="#/">Back home</button></div></div>`;
      view.querySelectorAll('[data-nav]').forEach((el) => el.addEventListener('click', () => { location.hash = el.dataset.nav; }));
      return;
    }

    const reelsHtml = cards.map((c) => {
      const saved = isBookmarked(c.id);
      return `<section class="reel" data-id="${esc(c.id)}" data-module="${c.moduleId}" style="--hue:${hueFor(c.pattern)}">
        ${fxLayer(c.type)}
        <div class="reel-inner">${reelInner(c)}</div>
        <div class="reel-actions">
          <button class="reel-bm ${saved ? 'on' : ''}" aria-label="Bookmark">${saved ? '🔖' : '🏷️'}</button>
        </div>
        <button class="reel-open-btn" aria-label="Open full lesson">📖 Open lesson</button>
        <div class="reel-heart" aria-hidden="true">🧿</div>
        <div class="reel-swipe" aria-hidden="true">🔖 Saved</div>
      </section>`;
    }).join('');

    view.innerHTML = `<div class="reels" id="reels">
      ${bar}
      <div class="reels-scroll">${reelsHtml}</div>
    </div>`;
    window.scrollTo(0, 0);

    view.querySelectorAll('[data-nav]').forEach((el) =>
      el.addEventListener('click', () => { location.hash = el.dataset.nav; }));

    view.querySelectorAll('.reel').forEach((reel) => {
      const id = reel.dataset.id;
      const bmBtn = reel.querySelector('.reel-bm');
      const setBm = (on) => { bmBtn.classList.toggle('on', on); bmBtn.textContent = on ? '🔖' : '🏷️'; };
      const doBookmark = (viaTap) => {
        const nowOn = toggleBookmark(id);
        setBm(nowOn);
        if (nowOn && viaTap) {
          reel.classList.remove('pop'); void reel.offsetWidth; reel.classList.add('pop');
        }
        toast(nowOn ? 'Saved 🧿' : 'Removed');
      };
      bmBtn.addEventListener('click', (e) => { e.stopPropagation(); doBookmark(false); });
      reel.querySelector('.reel-open-btn').addEventListener('click', (e) => {
        e.stopPropagation(); location.hash = `#/m/${reel.dataset.module}`;
      });
      // double-tap anywhere to bookmark
      let lastTap = 0;
      reel.addEventListener('click', (e) => {
        if (e.target.closest('.opt') || e.target.closest('button')) return;
        const now = e.timeStamp;
        if (now - lastTap < 320) { doBookmark(true); lastTap = 0; } else { lastTap = now; }
      });

      // swipe RIGHT to bookmark (horizontal drag; vertical is left to scroll-snap)
      let sx = 0, sy = 0, dragging = false, decided = false, horiz = false;
      const inner = reel.querySelector('.reel-inner');
      reel.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        sx = e.touches[0].clientX; sy = e.touches[0].clientY;
        dragging = true; decided = false; horiz = false;
      }, { passive: true });
      reel.addEventListener('touchmove', (e) => {
        if (!dragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - sx;
        const dy = e.touches[0].clientY - sy;
        if (!decided) {
          if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
          decided = true;
          horiz = Math.abs(dx) > Math.abs(dy) * 1.5;   // clearly horizontal
        }
        if (!horiz) return;
        const shift = Math.max(0, Math.min(dx, 120));   // right-drag only
        reel.style.setProperty('--sx', shift + 'px');
        reel.classList.toggle('swiping', shift > 8);
        reel.classList.toggle('swipe-armed', shift > 70);
        if (inner) inner.style.transform = `translateX(${shift * 0.5}px)`;
      }, { passive: true });
      const endSwipe = () => {
        if (!dragging) return;
        dragging = false;
        const armed = reel.classList.contains('swipe-armed');
        reel.classList.remove('swiping', 'swipe-armed');
        reel.style.removeProperty('--sx');
        if (inner) inner.style.transform = '';
        if (armed && !isBookmarked(id)) doBookmark(true);
        else if (armed) toast('Already saved 🔖');
      };
      reel.addEventListener('touchend', endSwipe, { passive: true });
      reel.addEventListener('touchcancel', endSwipe, { passive: true });
      // quiz interactivity
      const q = reel.querySelector('.reel-q');
      if (q) {
        const cardData = cards.find((c) => c.id === id);
        reel.querySelectorAll('.opt').forEach((opt, oi) => {
          opt.addEventListener('click', () => {
            reel.querySelectorAll('.opt').forEach((o) => o.classList.add('disabled'));
            const correct = oi === cardData.answer;
            opt.classList.add(correct ? 'correct' : 'wrong');
            opt.querySelector('.mark').textContent = correct ? '✓' : '✕';
            if (!correct) { const r = reel.querySelectorAll('.opt')[cardData.answer]; r.classList.add('correct'); r.querySelector('.mark').textContent = '✓'; }
            const ex = reel.querySelector('.explain'); if (ex) ex.hidden = false;
          });
        });
      }
    });

    // activate the reel currently in view (drives entrance + floating emojis)
    // and remember the position so you can resume later
    const scroller = view.querySelector('.reels-scroll');
    const reelEls = Array.from(view.querySelectorAll('.reel'));
    if (reelEls[0]) reelEls[0].classList.add('active');
    try {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            reelEls.forEach((r) => r.classList.toggle('active', r === en.target));
            const i = reelEls.indexOf(en.target);
            saveReelPos(filter.mode, en.target.dataset.id, i, reelEls.length);
            const cd = cards[i];
            if (cd) setNoteSource({ moduleId: cd.moduleId, title: cd.title, pattern: cd.pattern });
          }
        });
      }, { root: scroller, threshold: [0.55, 0.9] });
      reelEls.forEach((r) => io.observe(r));
    } catch (e) {
      reelEls.forEach((r) => r.classList.add('active')); // no IO support → animate all
    }

    // resume: jump to the last-viewed card of this same feed
    const rp = getReelPos();
    if (rp && rp.mode === filter.mode && rp.cardId) {
      const target = reelEls.find((r) => r.dataset.id === rp.cardId);
      if (target && target !== reelEls[0]) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: 'start' });
          reelEls.forEach((r) => r.classList.toggle('active', r === target));
          toast('Resumed where you left off 🧿');
        });
      }
    }
  }

  /* ---------- NOTES list ---------- */
  async function renderNotes() {
    backBtn.hidden = false;
    topbarTitle.textContent = 'Notes 📝';
    setNoteSource({});
    const notes = getNotes();
    if (!notes.length) {
      view.innerHTML = `<div class="empty"><div style="font-size:32px">📝</div>
        <p><b>No notes yet.</b><br>Select any text in a lesson or reel,<br>then tap <b>➕ Note</b> to save it here.</p>
        <button class="complete-btn" data-nav="#/">Back home</button></div>`;
      view.querySelectorAll('[data-nav]').forEach((el) => el.addEventListener('click', () => { location.hash = el.dataset.nav; }));
      return;
    }
    const items = notes.map((n) => `
      <div class="note-card" data-note="${esc(n.id)}">
        <div class="note-text">${esc(n.text)}</div>
        <div class="note-meta">
          ${n.moduleId ? `<button class="note-src" data-goto="${n.moduleId}">${esc(n.title || 'lesson')} ↗</button>` : '<span class="note-src plain">general</span>'}
          <span class="note-when">${agoText(n.at)}</span>
          <button class="note-del" data-del="${esc(n.id)}" aria-label="Delete note">✕</button>
        </div>
      </div>`).join('');
    view.innerHTML = `<div class="saved-head"><h1>Notes 📝</h1><p>${notes.length} saved · tap a lesson name to jump back</p></div>
      ${items}
      <button class="reset-link" id="copyNotes">Copy all notes</button>
      <button class="reset-link" id="clearNotes">Clear all notes</button>
      <div class="nazar" aria-hidden="true">🧿</div>`;
    window.scrollTo(0, 0);
    view.querySelectorAll('[data-nav]').forEach((el) => el.addEventListener('click', () => { location.hash = el.dataset.nav; }));
    view.querySelectorAll('[data-goto]').forEach((el) =>
      el.addEventListener('click', () => { location.hash = `#/m/${el.dataset.goto}`; }));
    view.querySelectorAll('[data-del]').forEach((el) =>
      el.addEventListener('click', () => { deleteNote(el.dataset.del); renderNotes(); }));
    const copyBtn = document.getElementById('copyNotes');
    if (copyBtn) copyBtn.addEventListener('click', async () => {
      const txt = notes.map((n) => `• ${n.text}${n.title ? `\n  — ${n.title}` : ''}`).join('\n\n');
      try { await navigator.clipboard.writeText(txt); toast('Notes copied 📝'); }
      catch { toast('Copy not supported'); }
    });
    const clr = document.getElementById('clearNotes');
    if (clr) clr.addEventListener('click', () => {
      if (confirm('Delete all notes?')) { localStorage.removeItem(LS_NOTES); renderNotes(); }
    });
  }

  /* ---------- SAVED list ---------- */
  async function renderSaved() {
    backBtn.hidden = false;
    topbarTitle.textContent = 'Saved 🔖';
    const data = await loadReels();
    const bm = getBookmarks();
    const byId = Object.fromEntries(data.cards.map((c) => [c.id, c]));
    const saved = bm.map((id) => byId[id]).filter(Boolean);
    if (!saved.length) {
      view.innerHTML = `<div class="empty"><div style="font-size:32px">🧿</div>
        <p>Nothing saved yet.<br>Open <b>Reels</b> and double-tap a card to bookmark it.</p>
        <button class="complete-btn" data-nav="#/reels">Open Reels 🎬</button></div>`;
      view.querySelectorAll('[data-nav]').forEach((el) => el.addEventListener('click', () => { location.hash = el.dataset.nav; }));
      return;
    }
    const items = saved.map((c) => {
      const kind = c.type === 'quiz' ? 'Quiz' : c.type === 'code' ? 'Code' : 'Concept';
      const sub = c.type === 'quiz' ? c.q : (c.heading || c.summary || '');
      return `<button class="card" data-goto="${c.moduleId}">
        <span class="idx" style="font-size:15px">${c.type === 'quiz' ? '❓' : c.type === 'code' ? '💻' : '💡'}</span>
        <span class="card-body">
          <span class="card-title"><span class="t">${esc(c.title)}</span><span class="badge lesson">${kind}</span></span>
          <span class="card-sub">${esc(c.patternTitle)} · ${esc(sub)}</span>
        </span>${chevSvg}</button>`;
    }).join('');
    view.innerHTML = `<div class="saved-head"><h1>Saved 🔖</h1><p>${saved.length} bookmarked · tap to open the lesson</p></div>
      <div class="cards">${items}</div>
      <button class="reset-link" id="clearBm">Clear all bookmarks</button>
      <div class="nazar" aria-hidden="true">🧿</div>`;
    window.scrollTo(0, 0);
    view.querySelectorAll('[data-goto]').forEach((el) =>
      el.addEventListener('click', () => { location.hash = `#/m/${el.dataset.goto}`; }));
    const clr = document.getElementById('clearBm');
    if (clr) clr.addEventListener('click', () => {
      if (confirm('Clear all bookmarks?')) { localStorage.removeItem(LS_BOOKMARKS); renderSaved(); }
    });
  }

  /* ---------- router ---------- */
  async function route() {
    const hash = location.hash || '#/';
    const mMatch = hash.match(/^#\/m\/(\d+)/);
    const reelModule = hash.match(/^#\/reels\/m\/(\d+)/);
    try {
      if (reelModule) { await loadIndex(); await renderReels({ mode: 'module', id: parseInt(reelModule[1], 10) }); }
      else if (hash.startsWith('#/reels/saved')) await renderReels({ mode: 'saved' });
      else if (hash.startsWith('#/reels/completed')) await renderReels({ mode: 'completed' });
      else if (hash.startsWith('#/reels')) await renderReels({ mode: 'all' });
      else if (hash.startsWith('#/notes')) await renderNotes();
      else if (hash.startsWith('#/saved')) await renderSaved();
      else if (mMatch) await renderModule(parseInt(mMatch[1], 10));
      else await renderHome();
    } catch (e) {
      view.innerHTML = `<div class="empty">Something went wrong loading content.</div>`;
      console.error(e);
    }
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', t === 'light' ? '#f5f7fb' : '#0b0f17');
    const icon = document.getElementById('themeIcon');
    // moon for dark, sun-ish for light
    icon.setAttribute('d', t === 'dark'
      ? 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z'
      : 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5v3m0 14v3M4 12H1m22 0h-3M5.6 5.6L3.5 3.5m17 17l-2.1-2.1M5.6 18.4l-2.1 2.1m17-17l-2.1 2.1');
  }
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem(LS_THEME, next);
    applyTheme(next);
  });
  applyTheme(localStorage.getItem(LS_THEME) || 'dark');

  /* ---------- nav ---------- */
  backBtn.addEventListener('click', () => {
    // the top-left back arrow always returns to the home list,
    // regardless of how many modules were paged through
    location.replace(location.pathname + location.search + '#/');
  });
  window.addEventListener('hashchange', route);

  /* ---------- online/offline indicator ---------- */
  function updateNet() {
    const online = navigator.onLine;
    netDot.classList.toggle('online', online);
    netDot.classList.toggle('offline', !online);
    netDot.title = online ? 'Online' : 'Offline — cached content available';
  }
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  updateNet();

  /* ---------- install prompt ---------- */
  const installBtn = document.getElementById('installBtn');
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e; installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null; installBtn.hidden = true;
  });
  window.addEventListener('appinstalled', () => { installBtn.hidden = true; });

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('SW failed', e));
    });
  }

  /* ---------- select text -> add to notes ---------- */
  const noteBtn = document.getElementById('noteBtn');
  let pendingSel = '';

  function hideNoteBtn() { if (noteBtn) { noteBtn.hidden = true; pendingSel = ''; } }

  function updateNoteBtn() {
    if (!noteBtn) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return hideNoteBtn();
    const text = sel.toString().trim();
    if (text.length < 3) return hideNoteBtn();
    // only offer notes for content inside the app view
    const anchor = sel.anchorNode;
    const host = anchor && (anchor.nodeType === 1 ? anchor : anchor.parentElement);
    if (!host || !host.closest || !host.closest('#view')) return hideNoteBtn();

    let rect;
    try { rect = sel.getRangeAt(0).getBoundingClientRect(); } catch (e) { return hideNoteBtn(); }
    if (!rect || (!rect.width && !rect.height)) return hideNoteBtn();

    pendingSel = text;
    noteBtn.hidden = false;
    const bw = noteBtn.offsetWidth || 110;
    const bh = noteBtn.offsetHeight || 38;
    let left = rect.left + rect.width / 2 - bw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - bw - 10));
    let top = rect.top - bh - 10;                       // above the selection
    if (top < 8) top = Math.min(rect.bottom + 10, window.innerHeight - bh - 10);
    noteBtn.style.left = left + 'px';
    noteBtn.style.top = top + 'px';
  }

  if (noteBtn) {
    document.addEventListener('selectionchange', () => {
      clearTimeout(updateNoteBtn._t);
      updateNoteBtn._t = setTimeout(updateNoteBtn, 120);
    });
    window.addEventListener('scroll', hideNoteBtn, true);
    noteBtn.addEventListener('mousedown', (e) => e.preventDefault());  // keep the selection
    noteBtn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const text = pendingSel;
      if (!text) return hideNoteBtn();
      const res = addNote(text, noteSource);
      toast(res === 'dup' ? 'Already in notes' : 'Added to notes 📝');
      hideNoteBtn();
      const s = window.getSelection(); if (s) s.removeAllRanges();
    });
  }

  /* ---------- version chip ---------- */
  const verChip = document.getElementById('verChip');
  if (verChip) verChip.textContent = APP_VERSION;
  console.log('DSA Patterns ' + APP_VERSION + ' 🧿');

  /* ---------- hard refresh (clear caches + SW, reload latest) ---------- */
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', async () => {
    refreshBtn.classList.add('spin');
    toast('Updating to latest…');
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (e) { /* ignore — reload anyway */ }
    // cache-busted reload so the HTML/JS come fresh from the network
    const u = new URL(location.href);
    u.searchParams.set('_r', String(Date.now()));
    location.replace(u.toString());
  });

  /* ---------- go ---------- */
  route();
})();
