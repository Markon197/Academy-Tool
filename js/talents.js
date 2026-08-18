// ═══════════════════════════════════════════════════════════════
// TALENTMODUL
// Zwei Talent-Arten:
//  - "general": ans Charakterlevel gekoppelt, automatisch verfügbar sobald
//    Level erreicht ist.
//  - "teacher": an einen Lehrer gebunden, wird an narrativen Momenten vom
//    GM manuell pro Charakter freigeschaltet.
// Zweck für Spieler: selbstständig alle für sie in Frage kommenden Talente
// durchlesen können, ohne dass der GM sie live vorliest. Nicht freigeschaltete
// Lehrer-Talente sind für Spieler unsichtbar (nicht nur ausgegraut).
// GM hat volle Kontrolle: Lehrer/Talente anlegen, pro Charakter freischalten.
// ═══════════════════════════════════════════════════════════════

let talentSubView = 'talents'; // 'teachers' | 'talents' | 'unlocks'
let teacherFormDraft = null;
let talentFormDraft = null;
let unlockCharId = null;

function renderTalents() {
  const root = document.getElementById('talents-root');
  if (!root) return;
  root.innerHTML = session.role === 'player' ? renderPlayerTalents() : renderGMTalents();
}

// ── Player: read-only browse ──
function renderPlayerTalents() {
  const c = state.characters[session.charId];
  if (!c) return '<div class="empty-state">Kein Charakter gefunden.</div>';

  const general = Object.values(state.talents)
    .filter(t => t.category === 'general' && (t.levelRequirement || 1) <= c.level)
    .sort((a, b) => (a.levelRequirement || 1) - (b.levelRequirement || 1));

  const teacherIds = c.teacherIds || [];
  const unlocked = c.unlockedTeacherTalentIds || [];
  const taken = c.talentIds || [];

  let html = `<div class="panel"><div class="panel-title">Allgemeine Talente (Level ${c.level})</div>
    ${general.length ? general.map(t => talentCardHtml(t, taken.includes(t.id))).join('') : '<div class="empty-state">Keine allgemeinen Talente für dein Level verfügbar.</div>'}
  </div>`;

  teacherIds.forEach(tid => {
    const teacher = state.teachers[tid];
    if (!teacher) return;
    const talents = Object.values(state.talents).filter(t => t.category === 'teacher' && t.teacherId === tid && unlocked.includes(t.id));
    html += `<div class="panel"><div class="panel-title">${escapeHtml(teacher.name)}</div>
      ${teacher.description ? `<p class="note" style="margin-bottom:10px">${escapeHtml(teacher.description)}</p>` : ''}
      ${talents.length ? talents.map(t => talentCardHtml(t, taken.includes(t.id))).join('') : '<div class="empty-state">Dein GM hat hier noch keine Talente freigeschaltet.</div>'}
    </div>`;
  });

  if (!teacherIds.length) html += '<div class="note">Dir sind noch keine Lehrer zugewiesen — das macht dein GM im Charaktermodul.</div>';
  return html;
}

function talentCardHtml(t, taken) {
  const teacher = t.teacherId ? state.teachers[t.teacherId] : null;
  return `
  <div class="card talent-card ${taken ? 'taken' : ''}">
    <div class="badge ${t.category}">${t.category === 'general' ? `Allgemein · ab Level ${t.levelRequirement || 1}` : `Lehrer-Talent${teacher ? ' · ' + escapeHtml(teacher.name) : ''}`}</div>
    <h3>${escapeHtml(t.name)} ${taken ? '<span class="tag on-card">✓ genommen</span>' : ''}</h3>
    <p style="margin-top:4px;white-space:pre-wrap">${escapeHtml(t.description) || '—'}</p>
  </div>`;
}

// ── GM: manage teachers, talents, per-character unlocks ──
function renderGMTalents() {
  return `
  <nav id="tabs" style="padding:0 0 0 0;margin-bottom:14px;border:none">
    <button class="${talentSubView === 'talents' ? 'active' : ''}" onclick="talentSubView='talents';renderTalents()">Talente</button>
    <button class="${talentSubView === 'teachers' ? 'active' : ''}" onclick="talentSubView='teachers';renderTalents()">Lehrer</button>
    <button class="${talentSubView === 'unlocks' ? 'active' : ''}" onclick="talentSubView='unlocks';renderTalents()">Freischaltungen</button>
  </nav>
  ${talentSubView === 'teachers' ? renderTeachersAdmin() : talentSubView === 'talents' ? renderTalentsAdmin() : renderUnlocksAdmin()}
  `;
}

function renderTeachersAdmin() {
  const list = Object.values(state.teachers).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Lehrer <button class="btn small" onclick="openTeacherForm(null)">+ Neuer Lehrer</button></div>
    ${list.length ? list.map(t => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(t.name)}</div><div class="meta">${escapeHtml(t.description) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openTeacherForm('${t.id}')">✎</button>
          <button class="icon-btn" onclick="deleteTeacher('${t.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">Noch keine Lehrer angelegt.</div>'}
  </div>
  ${teacherFormDraft ? `
  <div class="panel">
    <div class="panel-title">${teacherFormDraft.id ? 'Lehrer bearbeiten' : 'Neuer Lehrer'}</div>
    <div class="field"><label>Name</label><input type="text" value="${escapeAttr(teacherFormDraft.name)}" oninput="teacherFormDraft.name=this.value"></div>
    <div class="field"><label>Beschreibung</label><textarea oninput="teacherFormDraft.description=this.value">${escapeHtml(teacherFormDraft.description)}</textarea></div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveTeacherForm()">Speichern</button><button class="btn" onclick="cancelTeacherForm()">Abbrechen</button></div>
  </div>` : ''}`;
}

function renderTalentsAdmin() {
  const list = Object.values(state.talents).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Talente <button class="btn small" onclick="openTalentForm(null)">+ Neues Talent</button></div>
    ${list.length ? list.map(t => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(t.name)} <span class="tag">${t.category === 'general' ? 'Allgemein Lvl ' + (t.levelRequirement || 1) : (state.teachers[t.teacherId]?.name || 'Lehrer')}</span></div>
        <div class="meta">${escapeHtml(t.description) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openTalentForm('${t.id}')">✎</button>
          <button class="icon-btn" onclick="deleteTalent('${t.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">Noch keine Talente angelegt.</div>'}
  </div>
  ${talentFormDraft ? `
  <div class="panel">
    <div class="panel-title">${talentFormDraft.id ? 'Talent bearbeiten' : 'Neues Talent'}</div>
    <div class="field"><label>Name</label><input type="text" value="${escapeAttr(talentFormDraft.name)}" oninput="talentFormDraft.name=this.value"></div>
    <div class="field"><label>Beschreibung</label><textarea oninput="talentFormDraft.description=this.value">${escapeHtml(talentFormDraft.description)}</textarea></div>
    <div class="field">
      <label>Art</label>
      <select onchange="talentFormDraft.category=this.value;renderTalents()">
        <option value="general" ${talentFormDraft.category === 'general' ? 'selected' : ''}>Allgemein (levelgebunden)</option>
        <option value="teacher" ${talentFormDraft.category === 'teacher' ? 'selected' : ''}>Lehrer-gebunden (GM schaltet frei)</option>
      </select>
    </div>
    ${talentFormDraft.category === 'general'
      ? `<div class="field"><label>Ab Level</label><input type="number" min="1" value="${talentFormDraft.levelRequirement || 1}" oninput="talentFormDraft.levelRequirement=Number(this.value)"></div>`
      : `<div class="field"><label>Lehrer</label><select onchange="talentFormDraft.teacherId=this.value">
          <option value="">— wählen —</option>
          ${Object.values(state.teachers).map(t => `<option value="${t.id}" ${talentFormDraft.teacherId === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
        </select></div>`}
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveTalentForm()">Speichern</button><button class="btn" onclick="cancelTalentForm()">Abbrechen</button></div>
  </div>` : ''}`;
}

function renderUnlocksAdmin() {
  const chars = Object.values(state.characters).sort((a, b) => a.name.localeCompare(b.name));
  let html = `
  <div class="panel">
    <div class="panel-title">Freischaltungen pro Charakter</div>
    <select onchange="unlockCharId=this.value;renderTalents()">
      <option value="">— Charakter wählen —</option>
      ${chars.map(c => `<option value="${c.id}" ${unlockCharId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
    </select>
  </div>`;

  const c = unlockCharId ? state.characters[unlockCharId] : null;
  if (!c) return html;

  const general = Object.values(state.talents).filter(t => t.category === 'general' && (t.levelRequirement || 1) <= c.level);
  const taken = c.talentIds || [];
  const unlocked = c.unlockedTeacherTalentIds || [];

  html += `<div class="panel"><div class="panel-title">Allgemeine Talente (automatisch verfügbar, Level ${c.level})</div>
    ${general.length ? general.map(t => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(t.name)}</div><div class="meta">ab Level ${t.levelRequirement || 1}</div></div>
        <label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none">
          <input type="checkbox" style="width:auto" ${taken.includes(t.id) ? 'checked' : ''} onchange="toggleTaken('${c.id}','${t.id}')"> genommen
        </label>
      </div>`).join('') : '<div class="empty-state">Keine allgemeinen Talente für dieses Level.</div>'}
  </div>`;

  (c.teacherIds || []).forEach(tid => {
    const teacher = state.teachers[tid];
    if (!teacher) return;
    const talents = Object.values(state.talents).filter(t => t.category === 'teacher' && t.teacherId === tid);
    html += `<div class="panel"><div class="panel-title">${escapeHtml(teacher.name)}</div>
      ${talents.length ? talents.map(t => `
        <div class="roster-item">
          <div><div class="name">${escapeHtml(t.name)}</div><div class="meta">${escapeHtml(t.description) || '—'}</div></div>
          <div style="display:flex;gap:14px">
            <label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none">
              <input type="checkbox" style="width:auto" ${unlocked.includes(t.id) ? 'checked' : ''} onchange="toggleUnlock('${c.id}','${t.id}')"> freigeschaltet
            </label>
            <label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none">
              <input type="checkbox" style="width:auto" ${taken.includes(t.id) ? 'checked' : ''} onchange="toggleTaken('${c.id}','${t.id}')"> genommen
            </label>
          </div>
        </div>`).join('') : '<div class="empty-state">Keine Talente bei diesem Lehrer angelegt.</div>'}
    </div>`;
  });
  if (!(c.teacherIds || []).length) html += '<div class="note">Diesem Charakter sind noch keine Lehrer zugewiesen (im Charaktermodul einstellbar).</div>';

  return html;
}

// ── Form helpers ──
function openTeacherForm(id) { teacherFormDraft = id ? { ...state.teachers[id] } : { id: null, name: '', description: '' }; renderTalents(); }
function cancelTeacherForm() { teacherFormDraft = null; renderTalents(); }
async function saveTeacherForm() {
  if (!teacherFormDraft.name.trim()) { showToast('Name fehlt.'); return; }
  const id = teacherFormDraft.id || uid();
  await dbWrite('teachers/' + id, { id, name: teacherFormDraft.name.trim(), description: teacherFormDraft.description || '' });
  teacherFormDraft = null; renderTalents(); showToast('Lehrer gespeichert.');
}
async function deleteTeacher(id) {
  if (!confirm('Lehrer wirklich löschen?')) return;
  await dbWrite('teachers/' + id, null);
}

function openTalentForm(id) {
  talentFormDraft = id ? { ...state.talents[id] } : { id: null, name: '', description: '', category: 'general', levelRequirement: 1, teacherId: '' };
  renderTalents();
}
function cancelTalentForm() { talentFormDraft = null; renderTalents(); }
async function saveTalentForm() {
  if (!talentFormDraft.name.trim()) { showToast('Name fehlt.'); return; }
  const id = talentFormDraft.id || uid();
  const t = { id, name: talentFormDraft.name.trim(), description: talentFormDraft.description || '', category: talentFormDraft.category };
  if (t.category === 'teacher') t.teacherId = talentFormDraft.teacherId || null;
  else t.levelRequirement = Number(talentFormDraft.levelRequirement) || 1;
  await dbWrite('talents/' + id, t);
  talentFormDraft = null; renderTalents(); showToast('Talent gespeichert.');
}
async function deleteTalent(id) {
  if (!confirm('Talent wirklich löschen?')) return;
  await dbWrite('talents/' + id, null);
}

async function toggleUnlock(charId, talentId) {
  const c = state.characters[charId];
  const list = (c.unlockedTeacherTalentIds || []).slice();
  const i = list.indexOf(talentId);
  if (i === -1) list.push(talentId); else list.splice(i, 1);
  await dbWrite('characters/' + charId + '/unlockedTeacherTalentIds', list);
}
async function toggleTaken(charId, talentId) {
  const c = state.characters[charId];
  const list = (c.talentIds || []).slice();
  const i = list.indexOf(talentId);
  if (i === -1) list.push(talentId); else list.splice(i, 1);
  await dbWrite('characters/' + charId + '/talentIds', list);
}
