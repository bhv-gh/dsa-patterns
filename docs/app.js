/* DSA Patterns — offline PWA. Vanilla JS, no build step. */
(() => {
  'use strict';

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
    topbarTitle.textContent = 'DSA Patterns';
    const idx = await loadIndex();
    const progress = getProgress();
    const total = idx.modules.length;
    const done = idx.modules.filter((m) => progress[m.id]).length;
    const pct = Math.round((done / total) * 100);

    const intro = idx.modules.find((m) => m.type === 'intro');
    let html = `
      <section class="hero">
        <h1>Master coding-interview patterns</h1>
        <p>Bite-sized, visual-first lessons you can study anywhere — fully offline.</p>
        <div class="progress-wrap">
          <div class="progress-row"><span>${done} of ${total} complete</span><span>${pct}%</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      </section>`;

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

    view.innerHTML = html;
    view.scrollTo?.(0, 0);
    window.scrollTo(0, 0);
    view.querySelectorAll('[data-goto]').forEach((el) =>
      el.addEventListener('click', () => { location.hash = `#/m/${el.dataset.goto}`; }));
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
      if (nowDone) toast('Nice — progress saved');
    });

    // wire pager
    view.querySelectorAll('[data-goto]').forEach((el) =>
      el.addEventListener('click', (e) => { e.preventDefault(); location.hash = `#/m/${el.dataset.goto}`; }));
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

  /* ---------- router ---------- */
  async function route() {
    const hash = location.hash || '#/';
    const mMatch = hash.match(/^#\/m\/(\d+)/);
    try {
      if (mMatch) await renderModule(parseInt(mMatch[1], 10));
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
    if (history.length > 1 && location.hash.startsWith('#/m/')) history.back();
    else location.hash = '#/';
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

  /* ---------- go ---------- */
  route();
})();
