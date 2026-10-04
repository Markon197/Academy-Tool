// ═══════════════════════════════════════════════════════════════
// STATE + FIREBASE SYNC
// A single `state` tree lives at 'campaign/' in a Firebase Realtime Database
// and is synced live via an onValue listener. dbWrite/dbUpdate write straight
// to the DB; the listener echoes the change back into `state` and re-renders.
// In demo mode there is no Firebase: state lives in localStorage instead.
// ═══════════════════════════════════════════════════════════════

let db = null;
let session = { role: null, charId: null }; // role: 'gm' | 'player'
let demoMode = false;

// Every collection that is synced. Firebase drops empty objects/arrays, so
// each one gets a default when it comes back missing.
const COLLECTIONS = ['characters', 'professors', 'clubs', 'talents', 'skills', 'archetypes', 'items', 'missions', 'rolls', 'activity', 'world', 'scene'];

function blankCombat() {
  return { active: false, round: 1, turn: 0, ambush: false, order: [], actions: {} };
}

let state = {
  campaignName: 'Campaign',
  gmPin: null,
  settings: { highWindow: 3, digitalRolls: false, combatTab: false, playerLedger: false, playerMagic: false, clock: 480, timeCooldowns: false, sceneName: '' },
  characters: {},   // id -> character (PCs and NPCs)
  professors: {},   // id -> professor
  clubs: {},        // id -> club / extracurricular
  talents: {},      // id -> general, level-gated talent
  skills: {},       // id -> origin-bound technique
  archetypes: {},   // id -> archetype
  items: {},        // id -> item library entry
  missions: {},     // id -> { name, notes, seals: { charId: { mastery, method, conduct } } }
  rolls: {},        // id -> roll log entry (shared table log)
  activity: {},     // id -> change a player made (shown to the GM as notices)
  world: {},        // id -> places, factions, lore (GM only)
  scene: {},        // id -> { charId, side: ally|enemy, visible } NPCs in the current scene
  combat: blankCombat(),
};

const stateListeners = new Set();
function onStateChange(fn) { stateListeners.add(fn); }
let lastStateHash = '';

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// ── path helper shared by the demo-mode write path below ──
function setPath(obj, path, val) {
  const parts = path.split('/');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  if (val === null) delete cur[parts[parts.length - 1]];
  else cur[parts[parts.length - 1]] = val;
}

// Normalise whatever came back from Firebase / localStorage into a full state.
// Firebase turns {0:..,1:..} maps into arrays and drops empty containers, so
// everything is defaulted and list-like fields are coerced back.
function normaliseState(data) {
  const s = {
    campaignName: data.campaignName || 'Campaign',
    gmPin: data.gmPin || null,
    settings: { highWindow: 3, digitalRolls: false, combatTab: false, playerLedger: false, playerMagic: false, clock: 480, timeCooldowns: false, sceneName: '', ...(data.settings || {}) },
  };
  COLLECTIONS.forEach(k => { s[k] = data[k] || {}; });
  const c = { ...blankCombat(), ...(data.combat || {}) };
  c.order = toList(c.order);
  c.actions = c.actions || {};
  s.combat = c;
  Object.values(s.characters).forEach(normaliseCharacter);
  return s;
}

function toList(v) { return Array.isArray(v) ? v.filter(x => x != null) : v ? Object.values(v) : []; }

function normaliseCharacter(c) {
  c.pillars = { ...blankPillars(), ...(c.pillars || {}) };
  c.skills = { ...blankSkills(), ...(c.skills || {}) };
  ['professorIds', 'clubIds', 'skillIds', 'unlockedIds', 'conditions', 'schools'].forEach(k => { c[k] = toList(c[k]); });   // schools = magic schools this character has
  c.talentRanks = c.talentRanks || {};
  c.techniques = c.techniques || {};
  c.cooldowns = c.cooldowns || {};
  c.inventory = c.inventory || {};
  // free-form sheet sections (id-keyed maps so simultaneous edits don't clobber each other)
  ['relationships', 'passives', 'sheetConditions', 'quick', 'discipline'].forEach(k => { c[k] = c[k] || {}; });
  // "Active talents" no longer exist as a separate list: anything left in the old field is shown as a technique.
  Object.values(c.activeTalents || {}).forEach(r => {
    const id = 'tq_' + r.id;
    if (!c.techniques[id]) c.techniques[id] = { id, name: r.name || '', origin: '', cooldownCost: '', levelRequirement: 0, roll: '', bonus: 0, effect: r.effect || '' };
  });
  c.activeTalents = {};
  c.xp = Number(c.xp) || 0; c.xpMax = Number(c.xpMax) || 0; c.background = c.background || '';
  c.status = c.status || 'Alive';
  c.faction = c.faction || '';
  ['life', 'focus', 'energy', 'stress', 'ascension', 'ruin', 'detention'].forEach(k => { c[k] = Number(c[k]) || 0; });
  return c;
}

// Async: the previous app must be fully deleted before a new one with the same
// name is created, otherwise its late cleanup can tear down the new connection
// (seen as a hung second login after logging out in the same page).
async function initFirebase(dbUrl) {
  try {
    if (typeof firebase === 'undefined') return false;
    for (const a of firebase.apps.slice()) await a.delete();
    const app = firebase.initializeApp({ databaseURL: dbUrl }, 'academy');
    db = firebase.database(app);
    return true;
  } catch (e) { console.error(e); return false; }
}

function dbPath() { return 'campaign'; }

async function dbRead() {
  const snap = await db.ref(dbPath()).get();
  return snap.exists() ? snap.val() : null;
}

async function dbWrite(path, val) {
  if (demoMode) { setPath(state, path, val); saveDemoState(); scheduleRender(); return; }
  await db.ref(dbPath() + '/' + path).set(val);
}

async function dbUpdate(updates) {
  if (demoMode) {
    for (const [k, v] of Object.entries(updates)) setPath(state, k, v);
    saveDemoState(); scheduleRender(); return;
  }
  const prefixed = {};
  for (const [k, v] of Object.entries(updates)) prefixed[dbPath() + '/' + k] = v;
  await db.ref('/').update(prefixed);
}

function startSync() {
  db.ref(dbPath()).on('value', snap => {
    if (!snap.exists()) return;
    const data = snap.val();
    const hash = JSON.stringify(data);
    if (hash === lastStateHash) return;
    lastStateHash = hash;
    state = normaliseState(data);
    scheduleRender();
  });
}

// ── Rendering ──
// Re-rendering replaces innerHTML, which would yank focus (and the caret)
// out of an input while someone is typing and a sync update arrives. If a
// text field is focused we wait until it loses focus, then render once.
let renderPending = false;
function isTyping() {
  const el = document.activeElement;
  if (!el || !el.closest('#app-root') || el.closest('#roller')) return false;
  // selects and checkboxes commit instantly on change, so only text-like fields need protecting
  return el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|number|search|password)$/.test(el.type));
}
function scheduleRender() {
  if (isTyping()) { renderPending = true; return; }
  renderPending = false;
  stateListeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
}
document.addEventListener('focusout', () => {
  if (renderPending) setTimeout(() => { if (!isTyping()) scheduleRender(); }, 60);
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 2600);
}
