// ═══════════════════════════════════════════════════════════════
// ITEMS MODULE (GM only) — the loot library.
// Holds the loot tables (Average / Rare / Epic / House / Forbidden Library)
// and everything dropped in missions so far. "Give" copies an item into a
// character's inventory. Library entries are templates — handing one out
// never removes it, so it can drop more than once.
// ═══════════════════════════════════════════════════════════════

let itemFilter = { q: '', rarity: '', type: '', source: '' };
let itemDraft = null;
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic'];

function renderItems() {
  const root = document.getElementById('items-root');
  if (!root) return;
  if (session.role !== 'gm') { root.innerHTML = ''; return; }
  const all = Object.values(state.items || {});
  const types = [...new Set(all.map(i => i.type).filter(Boolean))].sort();
  const sources = [...new Set(all.map(i => i.source).filter(Boolean))].sort();
  const f = itemFilter, q = f.q.toLowerCase();
  const list = all.filter(i => (!f.rarity || i.rarity === f.rarity) && (!f.type || i.type === f.type) && (!f.source || i.source === f.source)
    && (!q || (i.name + ' ' + (i.effect || '') + ' ' + (i.description || '')).toLowerCase().includes(q)))
    .sort((a, b) => RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity) || a.name.localeCompare(b.name));
  const pcs = Object.values(state.characters).sort((a, b) => (a.isNPC - b.isNPC) || a.name.localeCompare(b.name));
  const sel = (key, opts, label) => `<div class="field"><label>${label}</label><select onchange="itemFilter.${key}=this.value;renderItems()"><option value="">All</option>${opts.map(o => `<option ${f[key] === o ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}</select></div>`;

  root.innerHTML = `
  <div class="panel">
    <div class="panel-title">Loot library <span class="sub">${list.length} of ${all.length}</span><button class="btn small" onclick="itemDraft={name:'',type:'',rarity:'Common',effect:'',description:'',source:'Custom'};renderItems()">+ New item</button></div>
    <div class="toolbar">
      <div class="field grow"><label>Search</label><input type="text" value="${escapeAttr(f.q)}" placeholder="Name or effect…" oninput="itemFilter.q=this.value;renderItems()"></div>
      ${sel('rarity', RARITIES, 'Rarity')}${sel('type', types, 'Type')}${sel('source', sources, 'Source')}
    </div>
    ${list.length ? list.map(i => `
      <div class="inventory-item">
        <div style="flex:1"><strong>${escapeHtml(i.name)}</strong> <span class="tag rarity-${(i.rarity || '').toLowerCase()}">${escapeHtml(i.rarity)}</span>${i.type ? `<span class="tag">${escapeHtml(i.type)}</span>` : ''}${i.source ? `<span class="tag">${escapeHtml(i.source)}</span>` : ''}
          <div class="desc">${escapeHtml(i.effect) || '—'}</div>${i.description ? `<div class="desc"><em>${escapeHtml(i.description)}</em></div>` : ''}</div>
        <div class="inline">
          <select id="give-${i.id}" style="width:auto">${pcs.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select>
          <button class="btn small" onclick="giveItem('${i.id}',document.getElementById('give-${i.id}').value)">Give →</button>
          <button class="icon-btn" onclick="deleteLibraryItem('${i.id}')" aria-label="Delete ${escapeAttr(i.name)} from library">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">No items match.</div>'}
  </div>
  ${itemDraft ? `
  <div class="panel"><div class="panel-title">New item</div>
    <div class="grid cols-3">
      <div class="field"><label>Name</label><input type="text" oninput="itemDraft.name=this.value"></div>
      <div class="field"><label>Type</label><input type="text" value="${escapeAttr(itemDraft.type)}" placeholder="Weapon / Wearable / Artifact" oninput="itemDraft.type=this.value"></div>
      <div class="field"><label>Rarity</label><select onchange="itemDraft.rarity=this.value">${RARITIES.map(r => `<option ${itemDraft.rarity === r ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label>Effect</label><textarea oninput="itemDraft.effect=this.value"></textarea></div>
    <div class="field"><label>Flavour</label><input type="text" oninput="itemDraft.description=this.value"></div>
    <div class="btn-row"><button class="btn primary" onclick="saveItemDraft()">Save</button><button class="btn" onclick="itemDraft=null;renderItems()">Cancel</button></div>
  </div>` : ''}`;
}

async function giveItem(itemId, charId) {
  const it = state.items[itemId], c = state.characters[charId];
  if (!it || !c) return;
  const id = uid();
  await dbWrite(`characters/${charId}/inventory/${id}`, { id, name: it.name, type: it.type || '', rarity: it.rarity || '', effect: it.effect || '', description: it.description || '' });
  showToast(`${it.name} → ${c.name}`);
}
async function saveItemDraft() {
  if (!itemDraft.name.trim()) { showToast('Name is missing.'); return; }
  const id = uid();
  await dbWrite('items/' + id, { ...itemDraft, id, name: itemDraft.name.trim() });
  itemDraft = null;
  showToast('Item saved.');
}
async function deleteLibraryItem(id) {
  if (!confirm(`Remove "${state.items[id]?.name}" from the library? Characters who already own it keep their copy.`)) return;
  await dbWrite('items/' + id, null);
}
