// ═══════════════════════════════════════════════════════════════
// STATE + FIREBASE SYNC
// Same pattern as CP_Phantom: a single `state` tree lives at 'campaign/'
// in a Firebase Realtime Database, synced live via an onValue listener.
// dbWrite/dbUpdate write straight to the DB; the listener echoes the
// change back into `state` and triggers a re-render everywhere.
// ═══════════════════════════════════════════════════════════════

let db = null;
let session = { role: null, charId: null }; // role: 'gm' | 'player'
let demoMode = false; // true = no Firebase at all, state lives in localStorage only

let state = {
  campaignName: 'Campaign',
  gmPin: null,
  characters: {},   // id -> character
  professors: {},    // id -> professor (Pillar mentors)
  clubs: {},         // id -> club/extracurricular (membership + one signature ability)
  talents: {},       // id -> general, level-gated talent
  skills: {},        // id -> origin-bound technique (professor or club)
  combat: { active: false, round: 1, currentTurn: 0, order: [] }, // order: [characterId]
};

let lastStateHash = '';
const stateListeners = new Set(); // functions called after every sync

function onStateChange(fn) { stateListeners.add(fn); }

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

function initFirebase(dbUrl) {
  try {
    if (firebase.apps.length) firebase.apps[0].delete();
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
  if (demoMode) { setPath(state, path, val); saveDemoState(); renderAll(); return; }
  await db.ref(dbPath() + '/' + path).set(val);
}

async function dbUpdate(updates) {
  if (demoMode) {
    for (const [k, v] of Object.entries(updates)) setPath(state, k, v);
    saveDemoState(); renderAll(); return;
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
    state.campaignName = data.campaignName || 'Campaign';
    state.gmPin = data.gmPin || null;
    state.characters = data.characters || {};
    state.professors = data.professors || {};
    state.clubs = data.clubs || {};
    state.talents = data.talents || {};
    state.skills = data.skills || {};
    state.combat = data.combat || { active: false, round: 1, currentTurn: 0, order: [] };
    stateListeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 2200);
}
