// ═══════════════════════════════════════════════════════════════
// AUTH — setup (first run) + login (GM PIN or per-character player PIN)
// Same PIN pattern as CP_Phantom: GM PIN unlocks everything, each PC can
// have its own player PIN that logs in read-only as that character.
// Only the DB URL + campaign name are persisted locally; the PIN itself
// is asked for again on every fresh page load.
// ═══════════════════════════════════════════════════════════════

function savedDbUrl() { return localStorage.getItem('academy_db_url') || (typeof DEFAULT_DB_URL !== 'undefined' ? DEFAULT_DB_URL : ''); }

function showSetupScreen() {
  const urlInput = document.getElementById('setup-db-url');
  if (urlInput && !urlInput.value) urlInput.value = savedDbUrl();
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
  if (!(await initFirebase(url))) { err.textContent = 'Could not connect to the database.'; return; }
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
    localStorage.setItem(SESSION_PIN_KEY, pin);
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
  await loginWith(url, pin, false);
}

// Shared by the login button and by the silent "stay logged in" resume on page load.
// Returns true on success. When silent, failures just fall back to the login screen.
async function loginWith(url, pin, silent) {
  const err = document.getElementById('login-error');
  const fail = (msg, forgetPin) => {
    if (forgetPin) forgetSession();
    err.textContent = silent ? '' : msg;
    if (silent) showLoginScreen();
    return false;
  };
  if (!(await initFirebase(url))) return fail('Could not connect to the database.');
  try {
    const data = await dbRead();
    if (!data) return fail('No campaign found at this URL.', true);
    // PINs are compared ignoring case, so "henry" works as well as "Henry"
    const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
    if (data.gmPin && same(atob(data.gmPin), pin)) {
      session = { role: 'gm', charId: null };
    } else {
      const chars = data.characters || {};
      const found = Object.values(chars).find(c => c.pin && same(c.pin, pin));
      if (!found) return fail('Wrong PIN. Try again.', true);
      session = { role: 'player', charId: found.id };
    }
    try {
      localStorage.setItem('academy_db_url', url);
      localStorage.setItem(SESSION_PIN_KEY, pin);   // stay logged in on this device until "Log out"
      if (data.campaignName) localStorage.setItem('academy_campaign', data.campaignName);
    } catch (e) {}
    state = normaliseState(data);
    startSync();
    showApp(); renderAll();
    return true;
  } catch (e) {
    console.error(e);
    return fail('Login failed: ' + e.message);
  }
}

// The PIN is remembered only in this browser (like a "remember me" cookie) so the app can
// sign back in by itself. Logging out, or the GM changing that PIN, ends it.
const SESSION_PIN_KEY = 'academy_session_pin';
function forgetSession() { try { localStorage.removeItem(SESSION_PIN_KEY); } catch (e) {} }

function doLogout() {
  if (demoMode) { exitDemoMode(); return; }
  forgetSession();
  if (db) { try { db.ref(dbPath()).off(); } catch (e) {} }
  session = { role: null, charId: null };
  db = null;
  lastStateHash = '';
  showLoginScreen();
}

async function initAuthOnLoad() {
  // Demo mode (public sample data) is hidden unless the URL has ?demo
  if (new URLSearchParams(location.search).has('demo')) document.querySelectorAll('.demo-box').forEach(el => el.classList.remove('hidden'));
  // Already signed in on this device? Resume without asking again.
  let url = '', pin = '';
  try { url = savedDbUrl(); pin = localStorage.getItem(SESSION_PIN_KEY) || ''; } catch (e) {}
  if (url && pin) {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-campaign-name').textContent = 'Signing you in…';
    document.querySelectorAll('#login-screen .box, #login-screen > #auth-screen > a').forEach(el => { el.style.visibility = 'hidden'; });
    const ok = await loginWith(url, pin, true);
    document.querySelectorAll('#login-screen .box, #login-screen > #auth-screen > a').forEach(el => { el.style.visibility = ''; });
    if (ok) return;
  }
  // Otherwise land on login; the GM uses "Set up a new campaign" there the first time.
  showLoginScreen();
}
