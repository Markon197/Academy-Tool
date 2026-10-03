// ═══════════════════════════════════════════════════════════════
// APP INIT / VIEW SWITCHING
// ═══════════════════════════════════════════════════════════════

const VIEWS = ['view-characters', 'view-combat', 'view-curriculum', 'view-ledger', 'view-items'];

// Items is GM-only. Combat is hidden from players until the GM ticks "Combat for players".
function viewAllowed(viewId) {
  if (!VIEWS.includes(viewId)) return false;
  if (session.role === 'gm') return true;
  if (viewId === 'view-items') return false;
  if (viewId === 'view-combat') return !!state.settings?.playerCombat;
  return true;
}
async function setPlayerCombat(on) { await dbWrite('settings/playerCombat', !!on); }

function switchView(viewId) {
  if (!viewAllowed(viewId)) viewId = 'view-characters';
  document.querySelectorAll('#tabs > button[data-view]').forEach(b => {
    const on = b.dataset.view === viewId;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('main > .view').forEach(v => v.classList.toggle('active', v.id === viewId));
  try { localStorage.setItem('academy_last_view', viewId); } catch (e) {}
}

function renderAll() {
  if (!session.role) return;
  renderCharacters();
  renderCombat();
  renderCurriculum();
  renderLedger();
  renderItems();
  if (rollerOpen) renderRoller();
  applyRoleGating();
  // in-app dice are optional (real dice by default)
  document.getElementById('roll-btn')?.classList.toggle('hidden', !digitalRolls());
  const dt = document.getElementById('dice-toggle');
  if (dt) dt.checked = digitalRolls();
  const showCombat = viewAllowed('view-combat');
  document.getElementById('tab-combat')?.classList.toggle('hidden', !showCombat);
  const ct = document.getElementById('combat-toggle');
  if (ct) ct.checked = !!state.settings?.playerCombat;
  // a player who is on the Combat tab when the GM hides it gets moved off it
  if (!showCombat && document.getElementById('view-combat').classList.contains('active')) switchView('view-characters');
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

// Called by showApp() once someone is logged in.
function restoreLastView() {
  let last = 'view-characters';
  try { last = localStorage.getItem('academy_last_view') || last; } catch (e) {}
  switchView(last);
}
