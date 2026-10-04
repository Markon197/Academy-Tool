// ═══════════════════════════════════════════════════════════════
// APP INIT / VIEW SWITCHING / BROWSER HISTORY
// The tabs and the open character sheet are real history entries, so the
// browser's Back button (and a phone's back gesture) steps back through them
// instead of leaving the app.
// ═══════════════════════════════════════════════════════════════

const VIEWS = ['view-status', 'view-characters', 'view-combat', 'view-curriculum', 'view-ledger', 'view-items', 'view-world'];
const GM_ONLY_VIEWS = ['view-items', 'view-world'];

// Items and World are GM-only. The old Combat tab is hidden for everyone unless the GM turns it on.
function viewAllowed(viewId) {
  if (!VIEWS.includes(viewId)) return false;
  if (viewId === 'view-combat') return !!state.settings?.combatTab;
  if (viewId === 'view-ledger' && session.role !== 'gm') return !!state.settings?.playerLedger;
  if (session.role === 'gm') return true;
  if (GM_ONLY_VIEWS.includes(viewId)) return false;
  return true;
}
async function setCombatTab(on) { await dbWrite('settings/combatTab', !!on); }
async function setPlayerLedger(on) { await dbWrite('settings/playerLedger', !!on); }

function currentView() { return document.querySelector('main > .view.active')?.id || 'view-characters'; }

// ── history ──
let navFromHistory = false;
function pushNav(replace) {
  if (navFromHistory) return;
  const st = { view: currentView(), char: (session.role === 'gm' && currentView() === 'view-characters') ? openCharId : null };
  const cur = history.state;
  if (!replace && cur && cur.view === st.view && cur.char === st.char) return;
  const hash = '#' + st.view.replace('view-', '') + (st.char ? '/' + st.char : '');
  try { history[replace ? 'replaceState' : 'pushState'](st, '', hash); } catch (e) { /* e.g. file:// */ }
}
window.addEventListener('resize', () => { if (typeof fitStatus === 'function') fitStatus(); });
window.addEventListener('popstate', e => {
  const st = e.state;
  if (!session.role || !st) return;
  navFromHistory = true;
  try {
    openCharId = st.char || null;
    switchView(st.view);
    renderCharacters();
  } finally { navFromHistory = false; }
});

function switchView(viewId, replace) {
  if (!viewAllowed(viewId)) viewId = 'view-status';
  document.querySelectorAll('#tabs > button[data-view]').forEach(b => {
    const on = b.dataset.view === viewId;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('main > .view').forEach(v => v.classList.toggle('active', v.id === viewId));
  try { localStorage.setItem('academy_last_view', viewId); } catch (e) {}
  pushNav(replace);
  if (typeof applyChrome === 'function') applyChrome();
  if (typeof aiRefreshContext === "function") aiRefreshContext();
}

function renderAll() {
  if (!session.role) return;
  renderStatus();
  renderCharacters();
  renderCombat();
  renderCurriculum();
  renderLedger();
  renderItems();
  renderWorld();
  if (rollerOpen) renderRoller();
  applyRoleGating();
  checkActivity();
  if (typeof aiRefreshContext === "function") aiRefreshContext();
  // in-app dice are optional (real dice by default)
  document.getElementById('roll-btn')?.classList.toggle('hidden', !digitalRolls());
  const dt = document.getElementById('dice-toggle');
  if (dt) dt.checked = digitalRolls();
  const showCombat = viewAllowed('view-combat');
  document.getElementById('tab-combat')?.classList.toggle('hidden', !showCombat);
  document.getElementById('tab-ledger')?.classList.toggle('hidden', !viewAllowed('view-ledger'));
  const lt = document.getElementById('ledger-toggle'); if (lt) lt.checked = !!state.settings?.playerLedger;
  const ct = document.getElementById('combat-toggle');
  if (ct) ct.checked = !!state.settings?.combatTab;
  // a player who is on the Combat tab when the GM hides it gets moved off it
  if (!showCombat && document.getElementById('view-combat').classList.contains('active')) switchView('view-status', true);
  if (!viewAllowed('view-ledger') && document.getElementById('view-ledger').classList.contains('active')) switchView('view-status', true);
  applyChrome();
  const name = document.getElementById('header-campaign-name');
  if (name) name.textContent = state.campaignName;
  // players only have one character, so say so
  const tab = document.getElementById('tab-characters');
  if (tab) tab.textContent = session.role === 'player' ? 'My Character' : 'Characters';
}

onStateChange(renderAll);

document.addEventListener('DOMContentLoaded', () => {
  initAuthOnLoad();
});

// Called by showApp() once someone is logged in. The first entry replaces
// the login page's history slot so Back doesn't land on a blank state.
function restoreLastView() {
  let last = 'view-status';
  try { last = localStorage.getItem('academy_last_view') || last; } catch (e) {}
  switchView(last, true);
}
