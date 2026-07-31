#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const difficultyConfigJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'difficulty-config.js'), 'utf8');
const wavePacingJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'wave-pacing.js'), 'utf8');
const factionConfigJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'faction-config.js'), 'utf8');
const itemConfigJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'item-config.js'), 'utf8');
const enemyVisualProfileJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'enemy-visual-profile.js'), 'utf8');
const tankConfigJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'tank-config.js'), 'utf8');
const bestiaryConfigJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'bestiary-config.js'), 'utf8');
const bossPacingJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'boss-pacing.js'), 'utf8');
const bossSelectionJs = fs.readFileSync(path.join(root, 'scripts', 'systems', 'boss-selection.js'), 'utf8');
const gameJs = fs.readFileSync(path.join(root, 'scripts', 'game.js'), 'utf8');
const runtimeJs = `${difficultyConfigJs}\n${wavePacingJs}\n${factionConfigJs}\n${itemConfigJs}\n${enemyVisualProfileJs}\n${tankConfigJs}\n${bestiaryConfigJs}\n${bossPacingJs}\n${bossSelectionJs}\n${gameJs}`;

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
    child.remove?.();
    child.parentNode = this;
    this.children.push(child);
    this.ownerDocument?._registerTree(child);
    return child;
  }
  insertBefore(child, referenceChild) {
    if (referenceChild == null) return this.appendChild(child);
    const idx = this.children.indexOf(referenceChild);
    if (idx < 0) throw new Error('insertBefore reference child is not a child of this node');
    child.remove?.();
    child.parentNode = this;
    this.children.splice(idx, 0, child);
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
  get previousSibling() {
    if (!this.parentNode) return null;
    const idx = this.parentNode.children.indexOf(this);
    return idx > 0 ? this.parentNode.children[idx - 1] : null;
  }
  get nextSibling() {
    if (!this.parentNode) return null;
    const idx = this.parentNode.children.indexOf(this);
    return idx >= 0 && idx < this.parentNode.children.length - 1 ? this.parentNode.children[idx + 1] : null;
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
  dispatchEvent(event) {
    const evt = event || {};
    evt.target = evt.target || this;
    const listeners = this._listeners[evt.type] || [];
    listeners.forEach(handler => handler.call(this, evt));
    return true;
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
    this.documentElement = new FakeElement('html', this);
    this.head = new FakeElement('head', this);
    this.body = new FakeElement('body', this);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
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

function getScriptSources(markup) {
  return [...markup.matchAll(/<script\s+[^>]*src="([^"]+)"/g)].map(match => match[1]);
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

hostCheck('game scripts syntax parses', () => {
  new vm.Script(runtimeJs, { filename: 'game-runtime.js' });
});

hostCheck('browser script order loads systems before game', () => {
  const sources = getScriptSources(html);
  const difficultyConfigIndex = sources.indexOf('scripts/systems/difficulty-config.js');
  const wavePacingIndex = sources.indexOf('scripts/systems/wave-pacing.js');
  const factionConfigIndex = sources.indexOf('scripts/systems/faction-config.js');
  const itemConfigIndex = sources.indexOf('scripts/systems/item-config.js');
  const enemyVisualProfileIndex = sources.indexOf('scripts/systems/enemy-visual-profile.js');
  const tankConfigIndex = sources.indexOf('scripts/systems/tank-config.js');
  const bestiaryConfigIndex = sources.indexOf('scripts/systems/bestiary-config.js');
  const bossPacingIndex = sources.indexOf('scripts/systems/boss-pacing.js');
  const bossSelectionIndex = sources.indexOf('scripts/systems/boss-selection.js');
  const gameIndex = sources.indexOf('scripts/game.js');
  if (difficultyConfigIndex < 0) throw new Error('scripts/systems/difficulty-config.js missing from index.html');
  if (wavePacingIndex < 0) throw new Error('scripts/systems/wave-pacing.js missing from index.html');
  if (factionConfigIndex < 0) throw new Error('scripts/systems/faction-config.js missing from index.html');
  if (itemConfigIndex < 0) throw new Error('scripts/systems/item-config.js missing from index.html');
  if (enemyVisualProfileIndex < 0) throw new Error('scripts/systems/enemy-visual-profile.js missing from index.html');
  if (tankConfigIndex < 0) throw new Error('scripts/systems/tank-config.js missing from index.html');
  if (bestiaryConfigIndex < 0) throw new Error('scripts/systems/bestiary-config.js missing from index.html');
  if (bossPacingIndex < 0) throw new Error('scripts/systems/boss-pacing.js missing from index.html');
  if (bossSelectionIndex < 0) throw new Error('scripts/systems/boss-selection.js missing from index.html');
  if (gameIndex < 0) throw new Error('scripts/game.js missing from index.html');
  if (difficultyConfigIndex > wavePacingIndex) throw new Error('difficulty config must load before wave pacing');
  if (wavePacingIndex > factionConfigIndex) throw new Error('wave pacing must load before faction config');
  if (factionConfigIndex > itemConfigIndex) throw new Error('faction config must load before item config');
  if (itemConfigIndex > enemyVisualProfileIndex) throw new Error('item config must load before enemy visual profile');
  if (enemyVisualProfileIndex > tankConfigIndex) throw new Error('enemy visual profile must load before tank config');
  if (tankConfigIndex > bestiaryConfigIndex) throw new Error('tank config must load before bestiary config');
  if (bestiaryConfigIndex > bossPacingIndex) throw new Error('bestiary config must load before boss pacing');
  if (difficultyConfigIndex > bossPacingIndex) throw new Error('difficulty config must load before boss pacing');
  if (bossSelectionIndex > gameIndex) throw new Error('boss selection must load before game.js');
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

  step('locked difficulties name the required previous mode', () => {
    const previousUnlocks = unlockedDifficulties;
    try {
      unlockedDifficulties = new Set(['easy']);
      renderDifficultyButtons();
      const buttons = el('difficulty-buttons');
      const markup = buttons.innerHTML;
      assert(buttons.querySelectorAll('.lock-hint').length === 4, 'expected four locked difficulty hints');
      assert(markup.includes('简单模式获得2800分解锁普通'), 'normal unlock hint should reference easy mode');
      assert(markup.includes('普通模式获得7200分解锁困难'), 'hard unlock hint should reference normal mode');
      assert(markup.includes('困难模式获得12800分解锁极限'), 'extreme unlock hint should reference hard mode');
      assert(markup.includes('极限模式获得20500分解锁梦魇'), 'nightmare unlock hint should reference extreme mode');
    } finally {
      unlockedDifficulties = previousUnlocks;
      renderDifficultyButtons();
    }
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
    assert(el('protocol-summary'), 'protocol summary missing');
    assert(el('protocol-viewport'), 'protocol viewport missing');
    assert(el('protocol-map'), 'protocol map missing');
    assert(el('protocol-zoom-readout'), 'protocol zoom readout missing');
    assert(document.querySelectorAll('#protocol-screen .node-effect-block.next').length > 0, 'protocol node next-effect blocks missing');
    assert(protocolMapPan.initialized === true, 'protocol map not initialized');
    hideProtocolScreen();
  });

  step('bestiary screen renders archive entries', () => {
    showBestiary();
    assert(el('bestiary-screen').style.display === 'flex', 'bestiary screen not visible');
    assert(el('bestiary-grid').innerHTML.length > 0, 'bestiary grid empty');
    assert(el('bestiary-progress').textContent.includes('/'), 'bestiary progress summary missing');
    assert(el('bestiary-search'), 'bestiary search missing');
    assert(el('bestiary-filter-all').classList.contains('active'), 'bestiary should default to all filter');
    hideBestiary();
  });

  step('bestiary search and unlock filters narrow entries', () => {
    discoveredBestiary = makeEmptyBestiaryDiscovery();
    discoveredBestiary.bosses.add('双子坦克');
    saveBestiaryDiscovery();
    showBestiary();
    switchBestiaryTab('enemies_boss');

    const search = el('bestiary-search');
    search.value = '双子';
    search.dispatchEvent({ type: 'input', target: search });
    assert(el('bestiary-grid').textContent.includes('双子坦克'), 'bestiary search should keep matching boss');
    assert(!el('bestiary-grid').textContent.includes('巨兽坦克'), 'bestiary search should hide nonmatching boss');

    setBestiaryUnlockFilter('locked');
    assert(el('bestiary-grid').textContent.includes('没有符合条件的档案'), 'locked filter should hide the only matching unlocked boss');

    setBestiaryUnlockFilter('unlocked');
    assert(el('bestiary-grid').textContent.includes('双子坦克'), 'unlocked filter should show discovered matching boss');
    assert(el('bestiary-filter-unlocked').classList.contains('active'), 'unlocked filter button should be active');
    hideBestiary();
  });

  step('achievements screen renders rows', () => {
    unlockedAchievements = new Set(['first_blood', 'sharpshooter']);
    claimedAchievementRewards = new Set(['first_blood']);
    showAchievements();
    assert(el('achievements-screen').style.display === 'flex', 'achievements screen not visible');
    assert(el('achieve-grid').innerHTML.length > 0, 'achievement grid empty');
    assert(el('achieve-summary').textContent.includes('总进度'), 'achievement summary missing');
    assert(el('ach-filter-all').classList.contains('active'), 'achievements should default to all filter');
    assert(el('achieve-grid').textContent.includes('档案'), 'unlocked achievement lore missing');
    setAchievementFilter('claimable');
    assert(el('ach-filter-claimable').classList.contains('active'), 'claimable filter button should be active');
    assert(el('achieve-grid').textContent.includes('百发百中'), 'claimable filter should show unclaimed unlocked achievement');
    assert(!el('achieve-grid').textContent.includes('首次击杀'), 'claimable filter should hide claimed achievement');
    setAchievementFilter('locked');
    assert(el('achieve-grid').textContent.includes('???'), 'locked filter should show hidden achievements');
    setAchievementFilter('all');
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
    const normalRequiredBosses = difficultySettings.normal.bossRequired;
    const normalArchiveFinalWave = normalRequiredBosses * BOSS_WAVE_INTERVAL;
    runBossesSeen = new Set(BOSS_TYPES.slice(0, normalRequiredBosses).map(b => b.name));
    wave = getBossArchiveFinalWave();
    assert(getBossArchiveFinalWave() === normalArchiveFinalWave, 'boss archive should follow normal bossRequired pacing');
    assert(getDifficultyClearWaveTarget(difficultySettings.normal) === Math.max(difficultySettings.normal.clearWave, normalArchiveFinalWave), 'normal clear target should match difficulty config');
    assert(getBossSupportCount(4) === 0 && getBossSupportCount(normalArchiveFinalWave) === 0, 'archive bosses should not spawn support mobs');
    assert(getBossSupportCount(normalArchiveFinalWave + BOSS_WAVE_INTERVAL) === 1, 'post-archive bosses should reintroduce one support mob');
    assert(shouldClearDifficulty() === true, 'clear mode should finish after required archive bosses');
    currentRunMode = 'clear';
  });

  step('boss wave uses warning presentation before spawn', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    playerBullets = [];
    enemyBullets = [];
    runBossesSeen = new Set();
    lastBossName = null;
    bossRef = null;
    bossWarningTimer = 0;
    bossWarningDef = null;
    bossWarningSpawn = null;
    wave = 3;

    startNextWave();

    assert(wave === 4, 'boss warning should start on wave 4');
    assert(bossWarningTimer === BOSS_WARNING_DURATION, 'boss warning should use configured duration');
    assert(bossWarningDef && bossWarningDef.name, 'boss warning definition missing');
    assert(bossWarningSpawn && Number.isFinite(bossWarningSpawn.x) && Number.isFinite(bossWarningSpawn.y), 'boss warning spawn missing');
    assert(bossRef === null, 'boss should not spawn before warning finishes');
    assert(enemies.length === 0, 'warning should not create enemies immediately');

    const initialPresentation = getBossWarningPresentation();
    assert(initialPresentation.active === true, 'warning presentation should be active');
    assert(initialPresentation.name === bossWarningDef.name, 'warning presentation boss name mismatch');
    assert(initialPresentation.factionName && initialPresentation.factionCode, 'warning presentation faction missing');
    assert(initialPresentation.spawnX === bossWarningSpawn.x && initialPresentation.spawnY === bossWarningSpawn.y, 'warning presentation spawn mismatch');
    assert(initialPresentation.stageCode === 'SIGNAL', 'warning should start in signal stage');

    bossWarningTimer = Math.floor(BOSS_WARNING_DURATION * 0.2);
    const latePresentation = getBossWarningPresentation();
    assert(latePresentation.stageCode === 'IMPACT', 'late warning should reach impact stage');
    drawBossWarningOverlay(ctx);

    bossWarningTimer = 1;
    update();

    assert(bossWarningTimer === 0, 'warning timer should expire');
    assert(bossWarningDef === null && bossWarningSpawn === null, 'warning state should clear after spawn');
    assert(bossRef && bossRef.bossDef, 'boss should spawn after warning');
    assert(enemies.some(enemy => enemy && enemy.bossDef), 'spawned enemies should include boss');

    resetRunState();
    assert(bossWarningTimer === 0 && bossWarningDef === null && bossWarningSpawn === null, 'reset should clear warning state');
  });

  step('behemoth boss entry attack telegraphs breach shockwave', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];
    particles.length = 0;

    const behemothDef = BOSS_TYPES.find(b => b.name === '巨兽坦克');
    assert(behemothDef && behemothDef.entryAttack && behemothDef.entryAttack.type === 'breach_shockwave', 'behemoth entry attack definition missing');
    const boss = new BossEnemy(640, 420, behemothDef);
    enemies = [boss];
    player.x = boss.x + 150;
    player.y = boss.y;
    boss.entryAttackTimer = 1;

    boss.drawEntryTelegraph(ctx, behemothDef.turret);
    boss.update();

    assert(boss.entryAttackDone === true, 'behemoth entry attack should complete after windup');
    assert(boss.attackState === 'recover', 'behemoth should return to recovery after entry attack');
    assert(enemyBullets.length >= 18, 'behemoth entry attack should emit a visible breach shockwave');
    assert(enemyBullets.some(b => b.color === '#f44' || b.color === '#ff6040'), 'behemoth entry attack should use siege colors');
    assert(enemyBullets.some(b => b.damage >= 2), 'behemoth entry attack should include a heavy center breaker shell');
  });

  step('phantom boss teleport and mirror pressure stay readable', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];
    particles.length = 0;

    const phantomDef = BOSS_TYPES.find(b => b.name === '幻影坦克');
    assert(phantomDef, 'phantom boss definition missing');
    const boss = new BossEnemy(520, 420, phantomDef);
    enemies = [boss];
    player.x = 720;
    player.y = 420;

    boss.attackState = 'firing';
    boss.attackBurstShots = 0;
    boss.currentPhase = 0;
    boss.shoot();

    const teleportDistance = Math.hypot(boss.x - player.x, boss.y - player.y);
    assert(teleportDistance >= 190, 'phantom teleport should preserve readable player distance');
    assert(boss.phantomEchoes.length >= 2, 'phantom teleport should leave origin and arrival echoes');
    assert(enemyBullets.length <= 14, 'phantom teleport burst should stay within balanced bullet budget');

    enemyBullets = [];
    boss.currentPhase = 1;
    boss.attackBurstShots = 1;
    boss.bossDef = phantomDef;
    boss.turretAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.shoot();
    assert(enemyBullets.length <= 16, 'phantom mirror barrage should stay within balanced bullet budget');
    assert(enemyBullets.some(b => b.color === '#aaf'), 'phantom mirror barrage should use mirror bullet color');
    boss.setAttackState('telegraph', boss.getBossTelegraphDuration(phantomDef.phases[1]));
    boss.drawTelegraph(ctx, phantomDef.phases[1], phantomDef.turret);
  });

  step('enemy and boss projectiles keep correct ownership', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];

    const orbitalDef = BOSS_TYPES.find(b => b.name === '轨道炮台');
    const orbital = new BossEnemy(520, 420, orbitalDef);
    orbital.attackState = 'firing';
    orbital.currentPhase = 0;
    orbital.telegraphAngle = 0;
    orbital.turretAngle = 0;
    orbital.shoot();
    assert(enemyBullets.some(b => b.color === '#f84' && b.railgun && b.fromPlayer === false), 'orbital snipe should be an enemy railgun');

    enemyBullets = [];
    const anchorDef = BOSS_TYPES.find(b => b.name === '重力锚');
    const anchor = new BossEnemy(520, 420, anchorDef);
    anchor.currentPhase = 1;
    anchor.attackState = 'firing';
    anchor.turretAngle = 0;
    anchor.shoot();
    const anchors = enemyBullets.filter(b => b.color === '#adf');
    assert(anchors.length >= 5, 'anchor judgment should emit anchor projectiles');
    assert(anchors.every(b => b.fromPlayer === false), 'anchor projectiles should be enemy bullets');
    assert(anchors.some(b => b.homing === true && b.homingStrength > 0), 'anchor projectiles should actually home');
  });

  step('boss barrage variants keep distinctive projectile identities', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];
    player.x = 820;
    player.y = 420;

    function fireBoss(icon, phaseIndex, setup = {}) {
      const bossDef = BOSS_TYPES.find(b => b.icon === icon);
      assert(bossDef, 'boss definition missing for ' + icon);
      const boss = new BossEnemy(520, 420, bossDef);
      boss.currentPhase = phaseIndex;
      boss.attackState = 'firing';
      boss.turretAngle = 0;
      boss.telegraphAngle = 0;
      boss.phaseTimer = 52;
      boss.attackBurstShots = 1;
      Object.assign(boss, setup);
      enemyBullets = [];
      boss.shoot();
      return enemyBullets.slice();
    }

    const beam = fireBoss('ORB', 1);
    assert(beam.filter(b => b.color === '#f84' && b.railgun === true).length === 3, 'beam sweep should use three readable rail lanes');
    assert(beam.some(b => b.color === '#ffcf8a'), 'beam sweep should add rear gate chips instead of a plain fan');
    assert(beam.length <= 16, 'beam sweep should stay within a readable bullet budget');

    const shurikens = fireBoss('SWF', 0);
    assert(shurikens.some(b => b.ricochet === true && b.bounces === 1), 'swift shadow fan should include bouncing edge shurikens');
    assert(new Set(shurikens.map(b => b.speed.toFixed(2))).size >= 3, 'swift shadow fan should stagger shuriken speeds');
    assert(shurikens.length >= 8 && shurikens.length <= 10, 'swift shadow P1 should enrich the pattern without flooding');

    const flurry = fireBoss('SWF', 1, { findTeleportPoint: () => ({ x: 560, y: 420 }) });
    assert(flurry.filter(b => b.railgun === true && b.color === '#cfffff').length === 4, 'swift shadow flurry should form a four-way slash');
    assert(flurry.some(b => b.color === '#8ff'), 'swift shadow flurry should keep a staggered ring after the slash');
    assert(flurry.length <= 24, 'swift shadow flurry should stay readable after enrichment');

    player._tankDef = { tankType: 'wide' };
    const mirrorCopy = fireBoss('MIR', 0);
    assert(mirrorCopy.some(b => b.color === '#d6d6d6'), 'mirror copy should add reflected shard bullets');
    assert(mirrorCopy.length <= 16, 'mirror copy should stay close to the copied weapon budget');

    const mirrorEnhance = fireBoss('MIR', 1);
    assert(mirrorEnhance.some(b => b.ricochet === true && b.bounces === 1), 'mirror enhance should add bouncing reflector shards');
    assert(mirrorEnhance.some(b => b.homing === true && b.homingStrength > 0), 'mirror enhance should add light seeking reflector shards');
    assert(mirrorEnhance.length <= 16, 'mirror enhance should intensify without becoming a wall');

    const sand = fireBoss('SND', 0);
    assert(sand.length === 12, 'sand veil should form three controlled sand bands');
    assert(sand.some(b => b.color === '#d9a45f'), 'sand veil should use highlighted sand-band bullets');
    assert(new Set(sand.map(b => b.speed.toFixed(2))).size >= 3, 'sand veil should stagger band speeds');

    const gravityWell = fireBoss('GRV', 0);
    assert(gravityWell.some(b => b.color === '#5f9fd8'), 'gravity well should mark the rotating gap edges');
    assert(gravityWell.some(b => b.color === '#adf' && b.homing === true), 'gravity well should add light side-anchor tracking');
    assert(gravityWell.length <= 18, 'gravity well should preserve a usable gap');

    const anchorJudgment = fireBoss('GRV', 1);
    assert(anchorJudgment.some(b => b.color === '#5f9fd8'), 'anchor judgment should include visible chain nodes');
    assert(anchorJudgment.some(b => b.color === '#adf' && b.homing === true), 'anchor judgment should keep homing anchor heads');
    assert(anchorJudgment.length <= 30, 'anchor judgment should remain below screen-flood density');
  });

  step('enemy AI range decisions remain stable between retarget ticks', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    const enemy = new EnemyTank(300, 300, '#f00', '#f80', 0.5, 3, 'sniper');
    enemies = [enemy];
    player.x = 760;
    player.y = 300;
    enemy.aiTimer = 10;
    enemy.aiChangeTime = 999;
    enemy.rangeJitter = 12;
    enemy.update();
    const firstRange = enemy.preferredRange;
    enemy.update();
    assert(enemy.preferredRange === firstRange, 'preferred range should not jitter every frame');
  });

  step('tank bodies steer toward movement while collision boxes rotate with profiles', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    obstacles.length = 0;
    enemies = [];
    player.x = 760;
    player.y = 360;

    const runner = new EnemyTank(300, 300, '#f00', '#f80', 0.5, 3, 'runner');
    runner.moveAxis = 'x';
    runner.moveDir = 1;
    runner.aiChangeTime = 999;
    runner.aiTimer = 10;
    runner.strafeBias = 0;
    enemies = [runner];
    const initialAngle = runner.bodyAngle;
    runner.update();
    assert(runner.bodyAngle !== initialAngle, 'enemy body angle should steer when the enemy moves');

    const baseProfile = runner.getCollisionProfile();
    runner.bodyAngle = 0;
    const forwardBox = runner.getCollisionBox();
    runner.bodyAngle = Math.PI / 2;
    const sideBox = runner.getCollisionBox();
    assert(Math.abs(forwardBox.w - baseProfile.obstacleW) < 0.001, 'unrotated enemy collision width should match its profile');
    assert(sideBox.w < forwardBox.w && sideBox.h > forwardBox.h, 'wide enemy collision box should rotate with body angle');

    const bossDef = BOSS_TYPES.find(b => b.icon === 'SWF');
    assert(bossDef, 'swift boss definition missing');
    const boss = new BossEnemy(360, 360, bossDef);
    enemies = [boss];
    player.x = 720;
    player.y = 360;
    boss.attackState = 'idle';
    boss.phaseTimer = 1;
    const bossInitialAngle = boss.bodyAngle;
    boss.update();
    assert(boss.bodyAngle !== bossInitialAngle, 'boss body angle should steer when the boss moves');
  });

  step('enemy and boss visuals expose differentiated scale and aura profiles', () => {
    const runnerVisual = getEnemyVisualScale('runner');
    const bruteVisual = getEnemyVisualScale('brute');
    const sniperVisual = getEnemyVisualScale('sniper');
    assert(runnerVisual.scaleX > bruteVisual.scaleX && runnerVisual.scaleY < bruteVisual.scaleY, 'runner should read long and low while brute reads heavy');
    assert(sniperVisual.scaleX !== bruteVisual.scaleX || sniperVisual.scaleY !== bruteVisual.scaleY, 'sniper and brute should not share the same visual size');

    const behemothAura = getBossAuraProfile({ name: '巨兽坦克', faction: 'moon_arsenal' });
    const phantomAura = getBossAuraProfile({ name: '幻影坦克', faction: 'void_cult' });
    const hydraAura = getBossAuraProfile({ name: '多头蛇', faction: 'void_cult' });
    assert(behemothAura.shape !== phantomAura.shape, 'behemoth and phantom boss auras should use different silhouettes');
    assert(hydraAura.shape === 'spores', 'hydra should use organic spore aura instead of generic rings');

    const bossDef = BOSS_TYPES.find(b => b.icon === 'HYD');
    const boss = new BossEnemy(620, 420, bossDef);
    boss.currentPhase = 1;
    boss.drawBossAura(ctx, bossDef.turret);
  });

  step('boss body profiles drive visual and collision size', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    playerBullets = [];
    enemyBullets = [];
    obstacles.length = 0;

    const behemothDef = BOSS_TYPES.find(b => b.icon === 'BST');
    const swiftDef = BOSS_TYPES.find(b => b.icon === 'SWF');
    assert(behemothDef && swiftDef, 'boss definitions for body-size comparison missing');

    const behemothProfile = getBossBodyProfile(behemothDef);
    const swiftProfile = getBossBodyProfile(swiftDef);
    assert(behemothProfile.scaleX > swiftProfile.scaleX && behemothProfile.scaleY > swiftProfile.scaleY, 'large boss should draw larger than agile boss');
    assert(behemothProfile.hitRadius > swiftProfile.hitRadius, 'large boss should expose a larger bullet hit radius');
    assert(behemothProfile.obstacleW > swiftProfile.obstacleW && behemothProfile.obstacleH > swiftProfile.obstacleH, 'large boss should use a larger obstacle footprint');

    const behemoth = new BossEnemy(400, 300, behemothDef);
    const swift = new BossEnemy(400, 420, swiftDef);
    assert(behemoth.getHitRadius() > swift.getHitRadius(), 'boss instances should report differentiated hit radii');
    assert(behemoth.getCollisionBox().w > swift.getCollisionBox().w, 'boss instances should report differentiated collision boxes');
    assert(behemoth.getRamRadius() > swift.getRamRadius(), 'boss instances should report differentiated ram radii');

    player.x = 80;
    player.y = 80;
    playerBossDamageMul = 1;
    buffs.big_bullet = 0;

    const largeHp = behemoth.hp;
    playerBullets = [new Bullet(behemoth.x + behemoth.getHitRadius() - 1, behemoth.y, 0, 0, '#fff', true, 1)];
    checkBulletTankCollisions(playerBullets, [behemoth], true);
    assert(behemoth.hp < largeHp, 'large boss should be hittable at its body radius');

    const swiftHp = swift.hp;
    playerBullets = [new Bullet(swift.x + behemoth.getHitRadius() - 1, swift.y, 0, 0, '#fff', true, 1)];
    checkBulletTankCollisions(playerBullets, [swift], true);
    assert(swift.hp === swiftHp, 'small boss should not share the large boss hit radius');
  });

  step('boss body-art slice draws selected bosses without crashing', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    const bossIcons = ['TRP', 'WEV', 'SCT', 'ORB', 'ARB', 'SND', 'GRV', 'HYD', 'AST'];
    for (const icon of bossIcons) {
      const bossDef = BOSS_TYPES.find(b => b.icon === icon);
      assert(bossDef, 'boss definition missing for ' + icon);
      const boss = new BossEnemy(620, 420, bossDef);
      boss.currentPhase = Math.min(1, bossDef.phases.length - 1);
      boss.turretAngle = 0.35;
      boss.attackState = 'idle';
      boss.draw(ctx);
    }
  });

  step('sanctum guard shield and trapper lane mines stay bounded', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];
    mines.length = 0;

    const sanctumDef = BOSS_TYPES.find(b => b.name === '圣龛守卫');
    const sanctum = new BossEnemy(520, 420, sanctumDef);
    sanctum.currentPhase = 1;
    sanctum.attackState = 'firing';
    sanctum.turretAngle = 0;
    sanctum.hp = sanctum.maxHp - 10;
    sanctum.shoot();
    assert(sanctum.sanctumShieldCharges >= 2 && sanctum.sanctumShieldCharges <= 3, 'sanctum shield should have bounded charges');
    const blocked = sanctum.hit({ damage: 4 });
    assert(blocked === false && sanctum.sanctumShieldCharges < 3, 'sanctum shield should consume a charge and block damage');

    const trapperDef = BOSS_TYPES.find(b => b.name === '陷阱师');
    const trapper = new BossEnemy(640, 420, trapperDef);
    player.x = 760;
    player.y = 420;
    const placed = trapper.deployMinesNearPlayerLane(3, 95, 62);
    assert(placed > 0 && placed <= 3, 'trapper should place a bounded number of lane mines');
    assert(mines.length === placed, 'lane mines should use the existing mine system');
    assert(mines.every(m => Math.hypot(m.x - player.x, m.y - player.y) < 230), 'lane mines should pressure player routes, not random far positions');
  });

  step('trapper pressures distant stationary players', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];
    mines.length = 0;

    const trapperDef = BOSS_TYPES.find(b => b.name === '陷阱师');
    const trapper = new BossEnemy(260, 420, trapperDef);
    player.x = 900;
    player.y = 420;
    trapper.currentPhase = 0;
    trapper.attackState = 'firing';
    trapper.shoot();

    const pressureMines = mines.filter(m => m.warning > 0 && Math.hypot(m.x - player.x, m.y - player.y) < 170);
    assert(pressureMines.length >= 3, 'trapper P1 should place warning mines around distant players');
    assert(pressureMines.every(m => m.armed === false), 'trapper warning mines should arm after their warning, not instantly');

    mines.length = 0;
    enemyBullets = [];
    trapper.currentPhase = 1;
    trapper.attackState = 'firing';
    trapper.shoot();
    const frenzyMines = mines.filter(m => m.warning > 0 && Math.hypot(m.x - player.x, m.y - player.y) < 180);
    assert(frenzyMines.length >= 5, 'trapper P2 should tighten the mine cage around distant players');
    assert(frenzyMines.every(m => m.armed === false), 'trapper frenzy cage mines should have a fair warning window');
    assert(enemyBullets.some(b => b.fromPlayer === false && b.homing === true && b.color === '#f80'), 'trapper P2 homing mines should be enemy pressure bullets');
  });

  step('hydra boss heads use distinct pressure patterns', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];

    const hydraDef = BOSS_TYPES.find(b => b.icon === 'HYD');
    assert(hydraDef, 'hydra boss definition missing');
    const hydra = new BossEnemy(560, 420, hydraDef);
    player.x = 820;
    player.y = 420;
    hydra.attackState = 'firing';
    hydra.turretAngle = 0;
    hydra.phaseTimer = 45;

    hydra.currentPhase = 0;
    hydra.shoot();
    const p1 = enemyBullets.slice();
    assert(p1.some(b => b.color === '#7dff73' && b.railgun === true), 'hydra center head should fire readable fang lances');
    assert(p1.some(b => b.color === '#4e4'), 'hydra side heads should keep green fan pressure');
    assert(p1.some(b => b.color === '#2b7a2b' && b.speed < 1.5), 'hydra rear head should seed slow poison pressure');
    assert(p1.length >= 11 && p1.length <= 18, 'hydra P1 bullet budget should stay readable');

    enemyBullets = [];
    hydra.currentPhase = 1;
    hydra.shoot();
    const p2 = enemyBullets.slice();
    assert(p2.some(b => b.homing === true && b.color === '#b6ff8a'), 'hydra frenzy should add homing regrowth fangs');
    assert(p2.some(b => b.color === '#174f17' && b.radius >= 4), 'hydra frenzy should add large poison clouds');
    assert(p2.length >= 19 && p2.length <= 32, 'hydra P2 should intensify without flooding the screen');
  });

  step('gemini survivor enrages whichever twin dies', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];

    const geminiDef = BOSS_TYPES.find(b => b.icon === 'GEM');
    assert(geminiDef, 'gemini boss definition missing');

    const master = new BossEnemy(500, 420, geminiDef);
    const spawnedTwin = new BossEnemy(620, 420, geminiDef);
    spawnedTwin.geminiMaster = master;
    master.geminiTwin = spawnedTwin;
    enemies = [master, spawnedTwin];
    const masterBaseSpeed = master.baseSpeed;
    spawnedTwin.alive = false;
    onEnemyKilled(spawnedTwin);
    assert(master.currentPhase === 1, 'master should enrage when the spawned twin dies first');
    assert(master.geminiEnraged === true, 'master should mark one-time gemini rage');
    assert(master.baseSpeed > masterBaseSpeed, 'gemini rage should persist through base speed');

    const masterFirstDead = new BossEnemy(500, 420, geminiDef);
    const survivorTwin = new BossEnemy(620, 420, geminiDef);
    survivorTwin.geminiMaster = masterFirstDead;
    masterFirstDead.geminiTwin = survivorTwin;
    enemies = [masterFirstDead, survivorTwin];
    const twinBaseSpeed = survivorTwin.baseSpeed;
    masterFirstDead.alive = false;
    onEnemyKilled(masterFirstDead);
    assert(survivorTwin.currentPhase === 1, 'spawned twin should enrage when the master dies first');
    assert(survivorTwin.geminiEnraged === true, 'spawned twin should mark one-time gemini rage');
    assert(survivorTwin.baseSpeed > twinBaseSpeed, 'spawned twin rage should persist through base speed');
  });

  step('gemini crossfire threatens player lanes instead of partner-only line', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];

    const geminiDef = BOSS_TYPES.find(b => b.icon === 'GEM');
    assert(geminiDef, 'gemini boss definition missing');
    player.x = 560;
    player.y = 520;

    const master = new BossEnemy(500, 320, geminiDef);
    const spawnedTwin = new BossEnemy(620, 320, geminiDef);
    spawnedTwin.geminiMaster = master;
    master.geminiTwin = spawnedTwin;
    enemies = [master, spawnedTwin];

    function angleDiff(a, b) {
      let d = a - b;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      return Math.abs(d);
    }
    function threatensPlayerLane(bullet, source) {
      const target = Math.atan2(player.y - source.y, player.x - source.x);
      return angleDiff(bullet.angle, target) < 0.42;
    }

    master.currentPhase = 0;
    master.attackState = 'firing';
    master.turretAngle = Math.PI / 2;
    master.phaseTimer = 30;
    master.shoot();
    const masterBullets = enemyBullets.slice();

    enemyBullets = [];
    spawnedTwin.currentPhase = 0;
    spawnedTwin.attackState = 'firing';
    spawnedTwin.turretAngle = Math.PI / 2;
    spawnedTwin.phaseTimer = 30;
    spawnedTwin.shoot();
    const twinBullets = enemyBullets.slice();

    assert(masterBullets.some(b => threatensPlayerLane(b, master)), 'master gemini crossfire should include player-pressure lanes');
    assert(twinBullets.some(b => threatensPlayerLane(b, spawnedTwin)), 'spawned gemini crossfire should include player-pressure lanes');
    assert(masterBullets.some(b => b.color === '#a4f'), 'master crossfire should keep light gemini color');
    assert(twinBullets.some(b => b.color === '#d8f'), 'spawned twin crossfire should keep dark gemini color');
  });

  step('gemini twins split formation when crowded', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];
    obstacles.length = 0;

    const geminiDef = BOSS_TYPES.find(b => b.icon === 'GEM');
    assert(geminiDef, 'gemini boss definition missing');
    player.x = 820;
    player.y = 420;

    const master = new BossEnemy(520, 420, geminiDef);
    const spawnedTwin = new BossEnemy(548, 420, geminiDef);
    spawnedTwin.geminiMaster = master;
    master.geminiTwin = spawnedTwin;
    master.attackState = 'recover';
    spawnedTwin.attackState = 'recover';
    master.attackStateTimer = 999;
    spawnedTwin.attackStateTimer = 999;
    enemies = [master, spawnedTwin];

    const startDistance = Math.hypot(master.x - spawnedTwin.x, master.y - spawnedTwin.y);
    for (let i = 0; i < 150; i++) {
      master.update();
      spawnedTwin.update();
    }
    const endDistance = Math.hypot(master.x - spawnedTwin.x, master.y - spawnedTwin.y);
    assert(endDistance > Math.max(120, startDistance + 90), 'gemini twins should actively split when crowded');
  });

  step('patchwork boss devour burst uses graveyard shockwave identity', () => {
    startGame('easy', 'spread', { mode: 'clear' });
    enemies = [];
    enemyBullets = [];
    particles.length = 0;

    const patchworkDef = BOSS_TYPES.find(b => b.name === '缝合巨兽');
    assert(patchworkDef, 'patchwork boss definition missing');
    const boss = new BossEnemy(640, 420, patchworkDef);
    boss.currentPhase = 1;
    boss.hp = boss.maxHp - 30;
    boss.attackState = 'firing';
    boss.attackBurstShots = 0;
    boss.phaseTimer = 60;
    boss.turretAngle = 0;
    player.x = boss.x + 120;
    player.y = boss.y;

    const wreck = { alive: false, hp: 0, x: boss.x + 45, y: boss.y + 12 };
    enemies = [boss, wreck];
    const hpBefore = boss.hp;
    boss.shoot();

    assert(wreck._absorbedByBoss === true, 'devour burst should consume nearby wrecks once');
    assert(boss.hp > hpBefore, 'devour burst should heal from consumed wrecks');
    assert(enemyBullets.length >= 20, 'devour burst should emit a visible shockwave pattern');
    assert(enemyBullets.some(b => b.color === '#c84' || b.color === '#f84' || b.color === '#fa6'), 'devour burst should use graveyard scrap colors');
    assert(enemyBullets.every(b => b.color !== '#a4f' && b.color !== '#d8f'), 'devour burst should not reuse gemini void bullets');

    const phase = patchworkDef.phases[1];
    boss.setAttackState('telegraph', boss.getBossTelegraphDuration(phase));
    boss.drawTelegraph(ctx, phase, patchworkDef.turret);
  });

  step('lab screen renders preview panel', () => {
    showLabScreen();
    assert(el('lab-screen').style.display === 'flex', 'lab screen not visible');
    assert(el('lab-detail').innerHTML.length > 0, 'lab detail empty');
    hideLabScreen();
  });

  step('menu interaction resumes suspended background music', () => {
    class TestAudioParam {
      constructor(value = 0) { this.value = value; }
      setValueAtTime(value) { this.value = value; }
      linearRampToValueAtTime(value) { this.value = value; }
    }
    class TestAudioNode {
      constructor() { this.gain = new TestAudioParam(1); }
      connect() { return this; }
    }
    class TestAudioContext {
      constructor() {
        this.state = 'running';
        this.currentTime = 0;
        this.sampleRate = 44100;
        this.destination = new TestAudioNode();
        this.resumeCalls = 0;
      }
      createGain() { return new TestAudioNode(); }
      resume() {
        this.resumeCalls++;
        this.state = 'running';
        return Promise.resolve();
      }
    }
    class TestCyberSynth {
      start() {}
      switchMode() {}
      fadeIn() {}
      fadeOut() {}
      setIntensity() {}
    }

    window.AudioContext = TestAudioContext;
    window.CyberSynth = TestCyberSynth;
    const clickHandlers = document._listeners.click || [];
    const clickMenu = () => clickHandlers.forEach(handler => handler({ type: 'click', target: document.body }));

    clickMenu();
    assert(audioCtx && musicSys, 'first menu interaction should start the music system');
    audioCtx.state = 'suspended';
    clickMenu();
    assert(audioCtx.resumeCalls === 1, 'later menu interaction should resume a suspended audio context');
  });

  globalThis.__smokeResults = results;
})();
`;

const context = makeBrowserContext();
let runtimeError = null;
try {
  vm.createContext(context);
  new vm.Script(`${runtimeJs}\n${smokeHarness}`, { filename: 'smoke-runtime.js' }).runInContext(context, { timeout: 5000 });
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
