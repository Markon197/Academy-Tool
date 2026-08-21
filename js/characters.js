// ═══════════════════════════════════════════════════════════════
// CHARACTER MODULE
// GM: creates characters/NPCs manually (free-form stats, no fixed rule
//     system), manages inventory including 1-click transfer between
//     characters.
// Player: only sees their own character card, read-only.
// ═══════════════════════════════════════════════════════════════

let editingCharId = null;   // id of the character whose sheet-editor is open
let editingDraft = null;    // local unsaved copy of that character's core fields
let charFilter = 'all';     // 'all' | 'pc' | 'npc'
let charSearch = '';

function blankCharacter(isNPC) {
  return {
    id: uid(), name: '', isNPC, level: 1,
    hp: 10, maxHp: 10, mana: 5, maxMana: 5,
    stats: [], professorIds: [], clubIds: [],
    talentRanks: {}, skillIds: [], unlockedIds: [],
    inventory: [], abilitiesNotes: '', pin: '',
  };
}

function renderCharacters() {
  const root = document.getElementById('characters-root');
  if (!root) return;

  if (session.role === 'player') {
    const c = state.characters[session.charId];
    root.innerHTML = c ? characterReadCardHtml(c) : '<div class="empty-state">No character found.</div>';
    return;
  }

  const list = Object.values(state.characters)
    .filter(c => charFilter === 'all' || (charFilter === 'pc' && !c.isNPC) || (charFilter === 'npc' && c.isNPC))
    .filter(c => !charSearch || c.name.toLowerCase().includes(charSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  let html = `
  <div class="panel">
    <div class="panel-title">Characters & NPCs</div>
    <div class="grid cols-3" style="align-items:end;margin-bottom:12px">
      <div class="field" style="margin-bottom:0">
        <label>Search</label>
        <input type="text" placeholder="Name…" value="${escapeAttr(charSearch)}" oninput="charSearch=this.value;renderCharacters()">
      </div>
      <div class="field" style="margin-bottom:0">
        <label>Filter</label>
        <select onchange="charFilter=this.value;renderCharacters()">
          <option value="all" ${charFilter === 'all' ? 'selected' : ''}>All</option>
          <option value="pc" ${charFilter === 'pc' ? 'selected' : ''}>PCs only</option>
          <option value="npc" ${charFilter === 'npc' ? 'selected' : ''}>NPCs only</option>
        </select>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn primary" onclick="startNewCharacter(false)">+ New PC</button>
        <button class="btn" onclick="startNewCharacter(true)">+ New NPC</button>
      </div>
    </div>
    ${list.length ? list.map(c => rosterItemHtml(c)).join('') : '<div class="empty-state">No characters created yet.</div>'}
  </div>`;

  if (editingCharId) html += characterEditorHtml();

  root.innerHTML = html;
}

function rosterItemHtml(c) {
  return `
  <div class="roster-item" onclick="openCharEditor('${c.id}')">
    <div>
      <div class="name">${escapeHtml(c.name || '(unnamed)')} ${c.isNPC ? '<span class="tag">NPC</span>' : '<span class="tag">PC</span>'}</div>
      <div class="meta">Level ${c.level} · HP ${c.hp}/${c.maxHp} · Mana ${c.mana}/${c.maxMana}</div>
    </div>
    <button class="icon-btn" onclick="event.stopPropagation();deleteCharacter('${c.id}')" title="Delete">✕</button>
  </div>`;
}

function startNewCharacter(isNPC) {
  const draft = blankCharacter(isNPC);
  editingCharId = draft.id;
  editingDraft = draft;
  editingDraft._isNew = true;
  renderCharacters();
  setTimeout(() => document.getElementById('editor-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

function openCharEditor(id) {
  const c = state.characters[id];
  if (!c) return;
  editingCharId = id;
  editingDraft = JSON.parse(JSON.stringify(c));
  renderCharacters();
  setTimeout(() => document.getElementById('editor-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

function closeCharEditor() {
  editingCharId = null;
  editingDraft = null;
  renderCharacters();
}

async function saveCharEditor() {
  if (!editingDraft.name.trim()) { showToast('Name is missing.'); return; }
  const clean = JSON.parse(JSON.stringify(editingDraft));
  delete clean._isNew;
  await dbWrite('characters/' + clean.id, clean);
  showToast('Character saved.');
  closeCharEditor();
}

async function deleteCharacter(id) {
  if (!confirm('Really delete this character?')) return;
  await dbWrite('characters/' + id, null);
  const order = (state.combat.order || []).filter(x => x !== id);
  await dbWrite('combat/order', order);
  if (editingCharId === id) closeCharEditor();
  showToast('Character deleted.');
}

// ── Draft field helpers (mutate editingDraft without re-rendering, so the
//    input keeps focus while typing) ──
function draftSet(field, value) { editingDraft[field] = value; }
function draftSetNum(field, value) { editingDraft[field] = Number(value) || 0; }
function draftToggleProfessor(professorId) {
  const i = editingDraft.professorIds.indexOf(professorId);
  if (i === -1) editingDraft.professorIds.push(professorId); else editingDraft.professorIds.splice(i, 1);
}
function draftToggleClub(clubId) {
  const i = editingDraft.clubIds.indexOf(clubId);
  if (i === -1) editingDraft.clubIds.push(clubId); else editingDraft.clubIds.splice(i, 1);
}

function addStatRow() { editingDraft.stats.push({ key: '', value: '' }); renderCharacters(); }
function removeStatRow(i) { editingDraft.stats.splice(i, 1); renderCharacters(); }
function statSet(i, field, value) { editingDraft.stats[i][field] = value; }

function characterEditorHtml() {
  const d = editingDraft;
  const professorOptions = Object.values(state.professors).sort((a, b) => a.name.localeCompare(b.name));
  const clubOptions = Object.values(state.clubs).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel" id="editor-panel">
    <div class="panel-title">
      ${d._isNew ? 'New' : 'Edit'} ${d.isNPC ? 'NPC' : 'Character'}
      <button class="icon-btn" onclick="closeCharEditor()">✕</button>
    </div>
    <div class="grid cols-2">
      <div>
        <div class="field">
          <label>Name</label>
          <input type="text" value="${escapeAttr(d.name)}" oninput="draftSet('name',this.value)">
        </div>
        <div class="grid cols-3">
          <div class="field"><label>Level</label><input type="number" min="1" value="${d.level}" oninput="draftSetNum('level',this.value)"></div>
          <div class="field"><label>HP</label><input type="number" value="${d.hp}" oninput="draftSetNum('hp',this.value)"></div>
          <div class="field"><label>Max HP</label><input type="number" value="${d.maxHp}" oninput="draftSetNum('maxHp',this.value)"></div>
        </div>
        <div class="grid cols-3">
          <div class="field"><label>Mana</label><input type="number" value="${d.mana}" oninput="draftSetNum('mana',this.value)"></div>
          <div class="field"><label>Max Mana</label><input type="number" value="${d.maxMana}" oninput="draftSetNum('maxMana',this.value)"></div>
          ${!d.isNPC ? `<div class="field"><label>Player PIN</label><input type="text" maxlength="8" value="${escapeAttr(d.pin)}" oninput="draftSet('pin',this.value)"></div>` : ''}
        </div>
        <div class="field">
          <label>Professors / Focus areas (2–3)</label>
          <div>${professorOptions.length ? professorOptions.map(p => `
            <label style="display:inline-flex;align-items:center;gap:4px;width:auto;text-transform:none;font-size:12px;margin-right:12px">
              <input type="checkbox" style="width:auto" ${d.professorIds.includes(p.id) ? 'checked' : ''} onchange="draftToggleProfessor('${p.id}')"> ${escapeHtml(p.name)}
            </label>`).join('') : '<span class="note">No professors created yet (see the Talents tab).</span>'}
          </div>
        </div>
        <div class="field">
          <label>Clubs / Extracurricular</label>
          <div>${clubOptions.length ? clubOptions.map(cl => `
            <label style="display:inline-flex;align-items:center;gap:4px;width:auto;text-transform:none;font-size:12px;margin-right:12px">
              <input type="checkbox" style="width:auto" ${d.clubIds.includes(cl.id) ? 'checked' : ''} onchange="draftToggleClub('${cl.id}')"> ${escapeHtml(cl.name)}
            </label>`).join('') : '<span class="note">No clubs created yet (see the Talents tab).</span>'}
          </div>
        </div>
      </div>
      <div>
        <div class="field">
          <label>Free-form stats</label>
          ${d.stats.map((s, i) => `
          <div class="stat-row">
            <input type="text" placeholder="Attribute" value="${escapeAttr(s.key)}" oninput="statSet(${i},'key',this.value)">
            <input type="text" placeholder="Value" value="${escapeAttr(s.value)}" oninput="statSet(${i},'value',this.value)">
            <button class="icon-btn" onclick="removeStatRow(${i})">✕</button>
          </div>`).join('')}
          <button class="btn small" onclick="addStatRow()">+ Add stat</button>
        </div>
        <div class="field">
          <label>Abilities / description (free text)</label>
          <textarea oninput="draftSet('abilitiesNotes',this.value)" placeholder="Special abilities, traits, background…">${escapeHtml(d.abilitiesNotes)}</textarea>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:6px">
      <button class="btn primary" onclick="saveCharEditor()">Save</button>
      <button class="btn" onclick="closeCharEditor()">Cancel</button>
    </div>
  </div>
  ${!d._isNew ? inventoryPanelHtml(d.id) : '<div class="note" style="margin:-6px 0 16px">Inventory can be edited once the character has been saved.</div>'}
  `;
}

// ── Inventory — lives against the LIVE synced character (not the draft),
//    so add/remove/transfer take effect immediately for everyone at the
//    table without waiting on the sheet's Save button. ──
function inventoryPanelHtml(charId) {
  const c = state.characters[charId];
  if (!c) return '';
  const others = Object.values(state.characters).filter(x => x.id !== charId).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Inventory — ${escapeHtml(c.name)}</div>
    ${(c.inventory || []).length ? c.inventory.map(item => `
      <div class="inventory-item">
        <div style="flex:1">
          <strong>${escapeHtml(item.name)}</strong>
          ${item.description ? `<div class="desc">${escapeHtml(item.description)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          ${others.length ? `
          <select id="transfer-target-${item.id}" style="width:auto">
            ${others.map(o => `<option value="${o.id}">${escapeHtml(o.name)}</option>`).join('')}
          </select>
          <button class="btn small" onclick="transferItem('${charId}','${item.id}',document.getElementById('transfer-target-${item.id}').value)">Transfer →</button>
          ` : ''}
          <button class="icon-btn" onclick="removeInventoryItem('${charId}','${item.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">No inventory.</div>'}
    <div class="grid cols-3" style="margin-top:10px">
      <input type="text" id="new-item-name-${charId}" placeholder="Item name (e.g. Flame Blade)">
      <input type="text" id="new-item-desc-${charId}" placeholder="Description (optional)">
      <button class="btn" onclick="addInventoryItem('${charId}')">+ Add</button>
    </div>
  </div>`;
}

async function addInventoryItem(charId) {
  const nameEl = document.getElementById('new-item-name-' + charId);
  const descEl = document.getElementById('new-item-desc-' + charId);
  const name = nameEl.value.trim();
  if (!name) return;
  const c = state.characters[charId];
  const inv = (c.inventory || []).slice();
  inv.push({ id: uid(), name, description: descEl.value.trim() });
  await dbWrite('characters/' + charId + '/inventory', inv);
  showToast('Item added.');
}

async function removeInventoryItem(charId, itemId) {
  const c = state.characters[charId];
  const inv = (c.inventory || []).filter(i => i.id !== itemId);
  await dbWrite('characters/' + charId + '/inventory', inv);
}

async function transferItem(fromId, itemId, toId) {
  if (!toId || fromId === toId) return;
  const from = state.characters[fromId], to = state.characters[toId];
  if (!from || !to) return;
  const item = (from.inventory || []).find(i => i.id === itemId);
  if (!item) return;
  const fromInv = (from.inventory || []).filter(i => i.id !== itemId);
  const toInv = (to.inventory || []).concat([item]);
  await dbUpdate({
    ['characters/' + fromId + '/inventory']: fromInv,
    ['characters/' + toId + '/inventory']: toInv,
  });
  showToast(`${item.name} → ${to.name}`);
}

function characterReadCardHtml(c) {
  return `
  <div class="panel">
    <div class="panel-title">${escapeHtml(c.name)}</div>
    <div class="grid cols-2">
      <div>
        <div class="stat-bar-wrap">
          <div class="stat-bar-label"><span>HP</span><span>${c.hp}/${c.maxHp}</span></div>
          <div class="stat-bar"><div class="stat-bar-fill hp" style="width:${pct(c.hp, c.maxHp)}%"></div></div>
        </div>
        <div class="stat-bar-wrap">
          <div class="stat-bar-label"><span>Mana</span><span>${c.mana}/${c.maxMana}</span></div>
          <div class="stat-bar"><div class="stat-bar-fill mana" style="width:${pct(c.mana, c.maxMana)}%"></div></div>
        </div>
        <p style="margin-top:8px;color:var(--text2)">Level ${c.level}</p>
        <div style="margin-top:10px">${(c.stats || []).map(s => `<span class="tag">${escapeHtml(s.key)}: ${escapeHtml(s.value)}</span>`).join('') || '<span class="note">No stats recorded.</span>'}</div>
      </div>
      <div>
        <h4 style="margin-bottom:6px">Abilities</h4>
        <p style="color:var(--text2);white-space:pre-wrap">${escapeHtml(c.abilitiesNotes) || '—'}</p>
      </div>
    </div>
    <h4 style="margin:14px 0 6px">Inventory</h4>
    ${(c.inventory || []).length ? c.inventory.map(i => `<div class="inventory-item"><div><strong>${escapeHtml(i.name)}</strong>${i.description ? `<div class="desc">${escapeHtml(i.description)}</div>` : ''}</div></div>`).join('') : '<div class="empty-state">No inventory.</div>'}
  </div>`;
}

function pct(v, max) { if (!max) return 0; return Math.max(0, Math.min(100, Math.round((v / max) * 100))); }
function escapeHtml(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function escapeAttr(s) { return escapeHtml(s); }
