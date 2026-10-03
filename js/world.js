// ═══════════════════════════════════════════════════════════════
// WORLD MODULE (GM only) — places, factions, NPC write-ups, events and lore
// that don't belong on a character sheet. The AI assistant files new
// information here too, appending to an existing entry when one matches.
// ═══════════════════════════════════════════════════════════════

const WORLD_KINDS = ['Place', 'Faction', 'NPC', 'Event', 'Lore', 'Other'];
let worldDraft = null;
let worldSearch = '';
let worldKind = '';

function renderWorld() {
  const root = document.getElementById('world-root');
  if (!root) return;
  if (session.role !== 'gm') { root.innerHTML = ''; return; }
  const q = worldSearch.toLowerCase();
  const list = Object.values(state.world || {})
    .filter(e => (!worldKind || e.kind === worldKind) && (!q || (e.name + ' ' + e.text).toLowerCase().includes(q)))
    .sort((a, b) => WORLD_KINDS.indexOf(a.kind) - WORLD_KINDS.indexOf(b.kind) || a.name.localeCompare(b.name));
  root.innerHTML = `
  <div class="panel">
    <div class="panel-title">World <span class="sub">${Object.keys(state.world || {}).length} entries · places, factions, lore</span><button class="btn small" onclick="openWorldDraft(null)">+ New entry</button></div>
    <div class="toolbar">
      <div class="field grow"><label>Search</label><input type="text" value="${escapeAttr(worldSearch)}" placeholder="Search the world…" oninput="worldSearch=this.value;renderWorld()"></div>
      <div class="field"><label>Kind</label><select onchange="worldKind=this.value;renderWorld()"><option value="">All</option>${WORLD_KINDS.map(k => `<option ${worldKind === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
    </div>
    ${list.length ? list.map(e => `
      <div class="origin">
        <div class="inline" style="justify-content:space-between"><div><strong>${escapeHtml(e.name)}</strong> <span class="tag">${escapeHtml(e.kind || 'Other')}</span></div>
          <div class="inline"><button class="icon-btn" onclick="openWorldDraft('${e.id}')" aria-label="Edit ${escapeAttr(e.name)}">✎</button><button class="icon-btn" onclick="deleteWorldEntry('${e.id}')" aria-label="Delete ${escapeAttr(e.name)}">✕</button></div></div>
        <div class="desc">${escapeHtml(e.text) || '—'}</div>
      </div>`).join('') : '<div class="empty-state">Nothing here yet. Write an entry, or tell the AI assistant about a place and it will add one.</div>'}
  </div>
  ${worldDraft ? `
  <div class="panel" id="world-draft"><div class="panel-title">${worldDraft.id ? 'Edit entry' : 'New entry'}</div>
    <div class="grid cols-2">
      <div class="field"><label>Name</label><input type="text" value="${escapeAttr(worldDraft.name)}" oninput="worldDraft.name=this.value"></div>
      <div class="field"><label>Kind</label><select onchange="worldDraft.kind=this.value">${WORLD_KINDS.map(k => `<option ${worldDraft.kind === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label>Text</label><textarea style="min-height:160px" oninput="worldDraft.text=this.value">${escapeHtml(worldDraft.text)}</textarea></div>
    <div class="btn-row"><button class="btn primary" onclick="saveWorldDraft()">Save</button><button class="btn" onclick="worldDraft=null;renderWorld()">Cancel</button></div>
  </div>` : ''}`;
}

function openWorldDraft(id) {
  worldDraft = id ? { ...state.world[id] } : { id: null, name: '', kind: 'Place', text: '' };
  renderWorld();
  setTimeout(() => document.getElementById('world-draft')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
}
async function saveWorldDraft() {
  if (!worldDraft.name.trim()) { showToast('Name is missing.'); return; }
  const id = worldDraft.id || uid();
  await dbWrite('world/' + id, { id, name: worldDraft.name.trim(), kind: worldDraft.kind || 'Other', text: worldDraft.text || '', updated: Date.now() });
  worldDraft = null;
  showToast('Saved.');
}
async function deleteWorldEntry(id) {
  if (!confirm(`Delete "${state.world[id]?.name}"?`)) return;
  await dbWrite('world/' + id, null);
}
