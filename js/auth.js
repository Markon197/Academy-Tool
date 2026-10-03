// ═══════════════════════════════════════════════════════════════
// AUTH — setup (first run) + login (GM PIN or per-character player PIN)
// Same PIN pattern as CP_Phantom: GM PIN unlocks everything, each PC can
// have its own player PIN that logs in read-only as that character.
// Only the DB URL + campaign name are persisted locally; the PIN itself
// is asked for again on every fresh page load.
// ═══════════════════════════════════════════════════════════════

function savedDbUrl() { return localStorage.getItem('academy_db_url') || (typeof DEFAULT_DB_URL !== 'undefined' ? DEFAULT_DB_URL : ''); }

function showSetupScreen() {
  document.getElementById('setup-screen').classList.remove('hidden');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-root').classList.add('hidden');
}

function showLoginScreen() {
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app-root').classList.add('hidden');
  const savedUrl = savedDbUrl();
  const savedName = localStorage.getItem('academy_campaign');
  const urlField = document.getElementById('login-db-url-field');
  if (savedUrl) {
    urlField.classList.add('hidden');
    document.getElementById('login-campaign-name').textContent = savedName ? savedName.toUpperCase() : 'Connect to a campaign';
  } else {
    urlField.classList.remove('hidden');
  }
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-pin').value = '';
}

function showApp() {
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-root').classList.remove('hidden');
  document.getElementById('header-campaign-name').textContent = state.campaignName;
  const badge = document.getElementById('header-role-badge');
  if (session.role === 'gm') {
    badge.textContent = 'Game Master';
  } else {
    const c = state.characters[session.charId];
    badge.textContent = c ? c.name : 'Player';
  }
  document.getElementById('demo-badge').classList.toggle('hidden', !demoMode);
  document.getElementById('demo-reset-btn').classList.toggle('hidden', !demoMode);
  applyRoleGating();
  restoreLastView();
}

// Elements marked data-gm-only are hidden/disabled for players.
function applyRoleGating() {
  const isGM = session.role === 'gm';
  document.querySelectorAll('[data-gm-only]').forEach(el => {
    el.classList.toggle('hidden', !isGM);
  });
}

async function doSetup() {
  const err = document.getElementById('setup-error');
  err.textContent = '';
  const campaignName = document.getElementById('setup-campaign-name').value.trim() || 'Campaign';
  const url = document.getElementById('setup-db-url').value.trim();
  const pin = document.getElementById('setup-gm-pin').value.trim();
  if (!url || !pin) { err.textContent = 'Database URL and GM PIN are required.'; return; }
  if (!initFirebase(url)) { err.textContent = 'Could not connect to the database.'; return; }
  try {
    const existing = await dbRead();
    if (existing) { err.textContent = 'A campaign already exists at this URL. Use Login instead.'; return; }
    await db.ref(dbPath()).set({
      campaignName,
      gmPin: btoa(pin),
      settings: { highWindow: 3 },
      combat: blankCombat(),
    });
    localStorage.setItem('academy_db_url', url);
    localStorage.setItem('academy_campaign', campaignName);
    session = { role: 'gm', charId: null };
    state = normaliseState({ campaignName });
    startSync();
    showApp(); renderAll();
  } catch (e) {
    console.error(e);
    err.textContent = 'Setup failed: ' + e.message;
  }
}

async function doLogin() {
  const err = document.getElementById('login-error');
  err.textContent = '';
  const pin = document.getElementById('login-pin').value.trim();
  let url = savedDbUrl();
  const urlFieldVisible = !document.getElementById('login-db-url-field').classList.contains('hidden');
  if (urlFieldVisible) url = document.getElementById('login-db-url').value.trim();
  if (!url || !pin) { err.textContent = 'Database URL and PIN are required.'; return; }
  if (!initFirebase(url)) { err.textContent = 'Could not connect to the database.'; return; }
  try {
    const data = await dbRead();
    if (!data) { err.textContent = 'No campaign found at this URL.'; return; }
    if (data.gmPin && atob(data.gmPin) === pin) {
      session = { role: 'gm', charId: null };
    } else {
      const chars = data.characters || {};
      const found = Object.values(chars).find(c => c.pin && c.pin === pin);
      if (!found) { err.textContent = 'Wrong PIN. Try again.'; return; }
      session = { role: 'player', charId: found.id };
    }
    localStorage.setItem('academy_db_url', url);
    if (data.campaignName) localStorage.setItem('academy_campaign', data.campaignName);
    state = normaliseState(data);
    startSync();
    showApp(); renderAll();
  } catch (e) {
    console.error(e);
    err.textContent = 'Login failed: ' + e.message;
  }
}

function doLogout() {
  if (demoMode) { exitDemoMode(); return; }
  if (db) { try { db.ref(dbPath()).off(); } catch (e) {} }
  session = { role: null, charId: null };
  db = null;
  lastStateHash = '';
  showLoginScreen();
}

function initAuthOnLoad() {
  // Demo mode (public sample data) is hidden unless the URL has ?demo
  if (new URLSearchParams(location.search).has('demo')) document.querySelectorAll('.demo-box').forEach(el => el.classList.remove('hidden'));
  const savedUrl = savedDbUrl();
  if (savedUrl) showLoginScreen(); else showSetupScreen();
}
