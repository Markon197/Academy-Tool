// ═══════════════════════════════════════════════════════════════
// APP INIT / VIEW SWITCHING
// ═══════════════════════════════════════════════════════════════

function switchView(viewId) {
  document.querySelectorAll('#tabs > button[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  document.querySelectorAll('main > .view').forEach(v => v.classList.toggle('active', v.id === viewId));
  localStorage.setItem('academy_last_view', viewId);
}

function renderAll() {
  renderCharacters();
  renderCombat();
  renderTalents();
  applyRoleGating();
  const badge = document.getElementById('header-role-badge');
  if (badge && session.role) {
    document.getElementById('header-campaign-name').textContent = state.campaignName;
  }
}

onStateChange(renderAll);

document.addEventListener('DOMContentLoaded', () => {
  const lastView = localStorage.getItem('academy_last_view') || 'view-characters';
  switchView(lastView);
  initAuthOnLoad();
});
