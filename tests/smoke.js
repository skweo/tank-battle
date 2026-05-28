#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const gameJs = fs.readFileSync(path.join(root, 'scripts', 'game.js'), 'utf8');

function makeStyle() {
  return {
    display: '',
    cssText: '',
    setProperty(name, value) { this[name] = String(value); },
    removeProperty(name) { delete this[name]; },
  };
}

class FakeClassList {
  constructor(el) { this.el = el; }
  _set() {
    return new Set(String(this.el.className || '').split(/\s+/).filter(Boolean));
  }
  _write(set) {
    this.el.className = [...set].join(' ');
    if (this.el.className) this.el.attributes.class = this.el.className;
    else delete this.el.attributes.class;
  }
  add(...names) {
    const set = this._set();
    names.filter(Boolean).forEach(name => set.add(name));
    this._write(set);
  }
  remove(...names) {
    const set = this._set();
    names.filter(Boolean).forEach(name => set.delete(name));
    this._write(set);
  }
  contains(name) {
    return this._set().has(name);
  }
  toggle(name, force) {
    const set = this._set();
    const shouldAdd = force === undefined ? !set.has(name) : !!force;
    if (shouldAdd) set.add(name);
    else set.delete(name);
    this._write(set);
    return shouldAdd;
  }
}

class FakeElement {
  constructor(tagName, doc) {
    this.tagName = String(tagName || 'div').toUpperCase();
    this.nodeType = 1;
    this.ownerDocument = doc;
    this.parentNode = null;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.style = makeStyle();
    this.className = '';
    this.id = '';
    this.disabled = false;
    this.scrollTop = 0;
    this.width = this.tagName === 'CANVAS' ? 300 : 0;
    this.height = this.tagName === 'CANVAS' ? 150 : 0;
    this._innerHTML = '';
    this._textContent = '';
    this._listeners = {};
    this.classList = new FakeClassList(this);
  }
  setAttribute(name, value = '') {
    const str = String(value);
    this.attributes[name] = str;
    if (name === 'id') {
      this.id = str;
      this.ownerDocument?._register(this);
    } else if (name === 'class') {
      this.className = str;
    } else if (name === 'style') {
      this.style.cssText = str;
      const display = str.match(/display\s*:\s*([^;]+)/i);
      if (display) this.style.display = display[1].trim();
    } else if (name === 'disabled') {
      this.disabled = true;
    } else if (name === 'width') {
      this.width = Number(str) || this.width;
    } else if (name === 'height') {
      this.height = Number(str) || this.height;
    } else if (name.startsWith('data-')) {
      this.dataset[name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = str;
    }
  }
  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    this.ownerDocument?._registerTree(child);
    return child;
  }
  remove() {
    if (!this.parentNode) return;
    const siblings = this.parentNode.children;
    const idx = siblings.indexOf(this);
    if (idx >= 0) siblings.splice(idx, 1);
    this.parentNode = null;
  }
  contains(node) {
    if (node === this) return true;
    return this.children.some(child => child.contains(node));
  }
  addEventListener(type, handler) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(handler);
  }
  removeEventListener(type, handler) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter(fn => fn !== handler);
  }
  setPointerCapture() {}
  releasePointerCapture() {}
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight, right: this.clientWidth, bottom: this.clientHeight };
  }
  get clientWidth() {
    if (this.id === 'protocol-viewport') return 1200;
    if (this.id === 'game-container') return 1480;
    return this.width || 800;
  }
  get clientHeight() {
    if (this.id === 'protocol-viewport') return 620;
    if (this.id === 'game-container') return 960;
    return this.height || 600;
  }
  get offsetHeight() { return this.clientHeight; }
  get textContent() { return this._textContent; }
  set textContent(value) { this._textContent = String(value ?? ''); }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(value) {
    const markup = String(value ?? '');
    this._innerHTML = markup;
    this._textContent = stripTags(markup);
    this.children = [];
    parseFragment(markup, this.ownerDocument, this);
  }
  querySelector(selector) {
    return querySelectorAll(this, selector)[0] || null;
  }
  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }
  closest(selector) {
    let node = this;
    while (node) {
      if (matchesSelector(node, selector)) return node;
      node = node.parentNode;
    }
    return null;
  }
  getContext() {
    if (this.tagName !== 'CANVAS') return null;
    return createCanvasContext(this);
  }
}

class FakeDocument {
  constructor() {
    this.elementsById = new Map();
    this.body = new FakeElement('body', this);
    this.activeElement = this.body;
    this._listeners = {};
  }
  createElement(tagName) {
    return new FakeElement(tagName, this);
  }
  getElementById(id) {
    return this.elementsById.get(id) || null;
  }
  querySelector(selector) {
    return querySelectorAll(this.body, selector)[0] || null;
  }
  querySelectorAll(selector) {
    return querySelectorAll(this.body, selector);
  }
  addEventListener(type, handler) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(handler);
  }
  removeEventListener(type, handler) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter(fn => fn !== handler);
  }
  _register(el) {
    if (el.id) this.elementsById.set(el.id, el);
  }
  _registerTree(el) {
    this._register(el);
    el.children.forEach(child => this._registerTree(child));
  }
}

function stripTags(markup) {
  return String(markup).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseAttrs(raw) {
  const attrs = {};
  const attrRe = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attrRe.exec(raw))) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function parseFragment(markup, doc, parent) {
  const stack = [parent];
  const tagRe = /<\/?([a-zA-Z][\w-]*)([^>]*)>/g;
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  let match;
  while ((match = tagRe.exec(markup))) {
    const raw = match[0];
    const tag = match[1].toLowerCase();
    const attrRaw = match[2] || '';
    if (raw.startsWith('</')) {
      while (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() !== tag) stack.pop();
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (tag === 'script') continue;
    const el = doc.createElement(tag);
    const attrs = parseAttrs(attrRaw);
    Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
    stack[stack.length - 1].appendChild(el);
    const selfClosing = /\/\s*>$/.test(raw) || voidTags.has(tag);
    if (!selfClosing) stack.push(el);
  }
}

function walk(root, out = []) {
  root.children.forEach(child => {
    out.push(child);
    walk(child, out);
  });
  return out;
}

function splitSelectorList(selector) {
  return String(selector).split(',').map(part => part.trim()).filter(Boolean);
}

function matchesSelector(el, selector) {
  return splitSelectorList(selector).some(part => matchesComplexSelector(el, part));
}

function matchesComplexSelector(el, selector) {
  const parts = selector.split(/\s+/).filter(Boolean);
  if (!parts.length) return false;
  if (!matchesSimpleSelector(el, parts[parts.length - 1])) return false;
  let cursor = el.parentNode;
  for (let i = parts.length - 2; i >= 0; i--) {
    while (cursor && !matchesSimpleSelector(cursor, parts[i])) cursor = cursor.parentNode;
    if (!cursor) return false;
    cursor = cursor.parentNode;
  }
  return true;
}

function matchesSimpleSelector(el, selector) {
  if (!el || !selector) return false;
  let simple = selector;
  const nth = simple.match(/:nth-child\((\d+)\)/);
  if (nth) {
    simple = simple.replace(nth[0], '');
    const siblings = el.parentNode ? el.parentNode.children : [];
    if (siblings.indexOf(el) !== Number(nth[1]) - 1) return false;
  }
  const attrMatches = [...simple.matchAll(/\[([^\]=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]]+)))?\]/g)];
  simple = simple.replace(/\[[^\]]+\]/g, '');
  for (const attr of attrMatches) {
    const name = attr[1];
    const expected = attr[2] ?? attr[3] ?? attr[4];
    const actual = el.getAttribute(name);
    if (expected === undefined) {
      if (actual === null) return false;
    } else if (String(actual) !== String(expected).replace(/^["']|["']$/g, '')) {
      return false;
    }
  }
  const id = simple.match(/#([\w-]+)/);
  if (id && el.id !== id[1]) return false;
  const classes = [...simple.matchAll(/\.([\w-]+)/g)].map(m => m[1]);
  if (classes.some(cls => !String(el.className || '').split(/\s+/).includes(cls))) return false;
  const tag = simple.replace(/#[\w-]+/g, '').replace(/\.[\w-]+/g, '').trim();
  if (tag && tag !== '*' && el.tagName.toLowerCase() !== tag.toLowerCase()) return false;
  return true;
}

function querySelectorAll(root, selector) {
  return walk(root).filter(el => matchesSelector(el, selector));
}

function createCanvasContext(canvas) {
  const gradient = { addColorStop() {} };
  const ctx = {
    canvas,
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: text => ({ width: String(text).length * 8 }),
  };
  return new Proxy(ctx, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return () => {};
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
}

function makeLocalStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(String(key), String(value)); },
    removeItem(key) { data.delete(String(key)); },
    clear() { data.clear(); },
  };
}

function makeBrowserContext() {
  const document = new FakeDocument();
  parseFragment(html, document, document.body);
  const context = {
    console,
    document,
    localStorage: makeLocalStorage(),
    Math,
    Date,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    RegExp,
    Error,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    performance: { now: () => Date.now() },
    innerWidth: 1480,
    innerHeight: 960,
    setTimeout: () => 1,
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
    addEventListener() {},
    removeEventListener() {},
  };
  context.window = context;
  context.globalThis = context;
  return context;
}

function getOnclickHandlerNames(markup) {
  return [...markup.matchAll(/onclick="([^"]+)"/g)]
    .map(match => match[1].match(/^([A-Za-z_$][\w$]*)\s*\(/)?.[1])
    .filter(Boolean);
}

const hostChecks = [];
function hostCheck(name, fn) {
  try {
    fn();
    hostChecks.push({ name, ok: true });
  } catch (err) {
    hostChecks.push({ name, ok: false, message: err.message });
  }
}

hostCheck('game script syntax parses', () => {
  new vm.Script(gameJs, { filename: 'scripts/game.js' });
});

hostCheck('html onclick handlers resolve', () => {
  const missing = [...new Set(getOnclickHandlerNames(html))]
    .filter(name => !new RegExp(`function\\s+${name}\\s*\\(`).test(gameJs) && !new RegExp(`(?:let|const|var)\\s+${name}\\b`).test(gameJs));
  if (missing.length) throw new Error(missing.join(', '));
});

hostCheck('leaderboard renderer is unique', () => {
  const count = [...gameJs.matchAll(/function\s+renderLeaderboard\s*\(/g)].length;
  if (count !== 1) throw new Error(`expected 1 renderLeaderboard, found ${count}`);
});

const smokeHarness = `
(() => {
  const results = [];
  function pass(name) { results.push({ name, ok: true }); }
  function fail(name, err) { results.push({ name, ok: false, message: err && err.stack ? err.stack : String(err) }); }
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function step(name, fn) {
    try { fn(); pass(name); } catch (err) { fail(name, err); }
  }
  function el(id) { return document.getElementById(id); }

  step('initial menu renders', () => {
    assert(gameRunning === false, 'game should idle after init');
    assert(el('start-screen').style.display === 'flex', 'start screen should be visible');
    assert(el('difficulty-buttons').querySelectorAll('.diff-btn').length === DIFFICULTY_ORDER.length, 'difficulty buttons missing');
  });

  step('run mode switch updates menu copy', () => {
    selectRunMode('endless');
    assert(selectedRunMode === 'endless', 'endless mode not selected');
    assert(el('diff-info').innerHTML.includes('ENDLESS FRONT'), 'endless hint missing');
    selectRunMode('clear');
  });

  step('tank select renders all chassis', () => {
    showTankSelect('easy');
    assert(el('tank-select-screen').style.display === 'flex', 'tank select not visible');
    assert(document.querySelectorAll('#tank-select-screen .tank-card').length >= 10, 'tank cards missing');
  });

  step('start game initializes first run', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    assert(gameRunning === true, 'game should be running');
    assert(gameOverFlag === false, 'game over flag should be false');
    assert(wave === 1, 'first wave should start');
    assert(player && player.alive, 'player should be alive');
    assert(obstacles.length > 0, 'map obstacles should generate');
    assert(waveEnemiesTotal > 0, 'wave enemy budget should initialize');
  });

  step('pause and resume flow works', () => {
    pauseGame();
    assert(isPaused === true && gameRunning === false, 'pause state invalid');
    assert(el('pause-screen').style.display === 'flex', 'pause screen hidden');
    resumeGame();
    assert(isPaused === false && gameRunning === true, 'resume state invalid');
  });

  step('game over then quick restart starts a second run', () => {
    endGame(false);
    assert(gameOverFlag === true && gameRunning === false, 'game over state invalid');
    assert(el('game-over').classList.contains('visible'), 'game over panel not visible');
    quickRestart();
    assert(gameRunning === true, 'quick restart did not resume game');
    assert(gameOverFlag === false, 'game over flag still set after quick restart');
    assert(wave === 1 && player && player.alive, 'second run did not initialize');
  });

  step('return home resets run overlays', () => {
    restartGame();
    assert(gameRunning === false, 'game should stop on home');
    assert(el('start-screen').style.display === 'flex', 'start screen not visible after restartGame');
    assert(!el('game-over').classList.contains('visible'), 'game over overlay still visible');
  });

  step('protocol tree opens with generated map elements', () => {
    showProtocolScreen();
    assert(el('protocol-screen').style.display === 'flex', 'protocol screen not visible');
    assert(el('protocol-viewport'), 'protocol viewport missing');
    assert(el('protocol-map'), 'protocol map missing');
    assert(el('protocol-zoom-readout'), 'protocol zoom readout missing');
    assert(protocolMapPan.initialized === true, 'protocol map not initialized');
    hideProtocolScreen();
  });

  step('bestiary screen renders archive entries', () => {
    showBestiary();
    assert(el('bestiary-screen').style.display === 'flex', 'bestiary screen not visible');
    assert(el('bestiary-grid').innerHTML.length > 0, 'bestiary grid empty');
    hideBestiary();
  });

  step('achievements screen renders rows', () => {
    showAchievements();
    assert(el('achievements-screen').style.display === 'flex', 'achievements screen not visible');
    assert(el('achieve-grid').innerHTML.length > 0, 'achievement grid empty');
    hideAchievements();
  });

  step('leaderboard screen renders mode tabs', () => {
    showLeaderboard();
    assert(el('leaderboard-screen').style.display === 'flex', 'leaderboard screen not visible');
    assert(el('leader-tabs').innerHTML.includes('ENDLESS FRONT'), 'leaderboard mode tabs missing');
    hideLeaderboard();
  });

  step('clear-mode boss archive pacing is compact', () => {
    currentRunMode = 'clear';
    currentDifficulty = 'normal';
    runBossesSeen = new Set(BOSS_TYPES.map(b => b.name));
    wave = getBossArchiveFinalWave();
    assert(getBossArchiveFinalWave() === 20, 'boss archive should finish on wave 20');
    assert(getDifficultyClearWaveTarget(difficultySettings.normal) === 20, 'normal clear target should be wave 20');
    assert(getBossSupportCount(4) === 0 && getBossSupportCount(20) === 0, 'archive bosses should not spawn support mobs');
    assert(getBossSupportCount(24) === 1, 'post-archive bosses should reintroduce one support mob');
    assert(shouldClearDifficulty() === true, 'clear mode should finish after all five archive bosses');
    currentRunMode = 'clear';
  });

  step('lab screen renders preview panel', () => {
    showLabScreen();
    assert(el('lab-screen').style.display === 'flex', 'lab screen not visible');
    assert(el('lab-detail').innerHTML.length > 0, 'lab detail empty');
    hideLabScreen();
  });

  globalThis.__smokeResults = results;
})();
`;

const context = makeBrowserContext();
let runtimeError = null;
try {
  vm.createContext(context);
  new vm.Script(`${gameJs}\n${smokeHarness}`, { filename: 'smoke-runtime.js' }).runInContext(context, { timeout: 5000 });
} catch (err) {
  runtimeError = err;
}

const allResults = [...hostChecks, ...(context.__smokeResults || [])];
if (runtimeError) allResults.push({ name: 'runtime harness executes', ok: false, message: runtimeError.stack || String(runtimeError) });

let failed = 0;
for (const result of allResults) {
  if (result.ok) {
    console.log(`PASS ${result.name}`);
  } else {
    failed++;
    console.error(`FAIL ${result.name}`);
    console.error(`     ${result.message}`);
  }
}

console.log(`Smoke summary: ${allResults.length - failed}/${allResults.length} passed`);
if (failed) process.exitCode = 1;
