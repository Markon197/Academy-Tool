// ═══════════════════════════════════════════════════════════════
// TALENTMODUL
// Drei Content-Typen, passend zum echten Regelwerk (The Last Curriculum):
//  - "Talents": allgemeine, reine Level-Talente (kein Origin nötig), können
//    mehrstufig sein (z.B. Level 4/8/12 = Rang I/II/III, stapelnd).
//  - "Skills": an einen Origin (Professor-Disziplin ODER Club) gebundene
//    Techniken, zusätzlich levelgated. Origin ist Freitext (kein starres
//    Fremdschlüssel-Feld, da echte Daten Clubs/Professoren/Items mischen).
//  - "Clubs": Extracurricular-Mitgliedschaft, gibt genau eine Signature-
//    Fähigkeit (Freitext) + optional einen betreuenden Professor.
// "Professoren" sind eigene NPC-Entitäten mit Flavor (Quote/Oath/Rules) und
// einem GM-only Geheimnis-Feld (secretNotes), das erst nach globalem Reveal
// sichtbar wird.
// "Secret" ist ein GM-Freischalt-Flag, das auf JEDEM der drei Content-Typen
// existieren kann (nicht nur auf Origin-gebundenen wie vorher) — bei Bedarf
// pro Charakter über character.unlockedIds freigeschaltet.
// Zweck für Spieler: selbstständig alle für sie in Frage kommenden Inhalte
// durchlesen können, ohne dass der GM sie live vorliest.
// ═══════════════════════════════════════════════════════════════

let talentSubView = 'talents'; // 'talents' | 'skills' | 'professors' | 'clubs' | 'unlocks'
let talentFormDraft = null;
let skillFormDraft = null;
let professorFormDraft = null;
let clubFormDraft = null;
let unlockCharId = null;

function renderTalents() {
  const root = document.getElementById('talents-root');
  if (!root) return;
  root.innerHTML = session.role === 'player' ? renderPlayerTalents() : renderGMTalents();
}

// ── shared helpers ──
function eligibleRanks(talent, level) {
  return (talent.levelRequirements && talent.levelRequirements.length ? talent.levelRequirements : [1])
    .filter(l => level >= l).length;
}
function wordStems(name) {
  return (name || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 3).map(w => w.slice(0, 4));
}
// Heuristic: a Skill's free-text "origin" is matched against the names of the
// character's assigned professors/clubs (word-stem substring match) — there's
// no strict foreign key between them since real origins mix clubs/professors/
// items freely. Secret skills bypass this and use the unlock list instead.
function characterHasAccessToOrigin(character, originText) {
  if (!originText) return true;
  const text = originText.toLowerCase();
  const names = [
    ...(character.professorIds || []).map(id => state.professors[id]?.name),
    ...(character.clubIds || []).map(id => state.clubs[id]?.name),
  ].filter(Boolean);
  for (const name of names) {
    for (const stem of wordStems(name)) { if (text.includes(stem)) return true; }
  }
  return false;
}

// ═══════════════════ PLAYER VIEW ═══════════════════
function renderPlayerTalents() {
  const c = state.characters[session.charId];
  if (!c) return '<div class="empty-state">Kein Charakter gefunden.</div>';
  const unlocked = c.unlockedIds || [];
  const ranks = c.talentRanks || {};
  const skillIds = c.skillIds || [];

  const talents = Object.values(state.talents)
    .filter(t => eligibleRanks(t, c.level) >= 1)
    .filter(t => !t.secret || unlocked.includes(t.id))
    .sort((a, b) => (a.levelRequirements?.[0] || 1) - (b.levelRequirements?.[0] || 1));

  const skills = Object.values(state.skills)
    .filter(s => c.level >= (s.levelRequirement || 0))
    .filter(s => s.secret ? unlocked.includes(s.id) : characterHasAccessToOrigin(c, s.origin))
    .sort((a, b) => (a.origin || '').localeCompare(b.origin || ''));

  let html = `<div class="panel"><div class="panel-title">Allgemeine Talente (Level ${c.level})</div>
    ${talents.length ? talents.map(t => talentCardHtml(t, ranks[t.id] || 0, eligibleRanks(t, c.level))).join('') : '<div class="empty-state">Keine allgemeinen Talente für dein Level verfügbar.</div>'}
  </div>`;

  html += `<div class="panel"><div class="panel-title">Skills / Techniques</div>
    ${skills.length ? skills.map(s => skillCardHtml(s, skillIds.includes(s.id))).join('') : '<div class="empty-state">Noch keine Skills verfügbar — brauchst Zugang über einen Professor oder Club.</div>'}
  </div>`;

  (c.clubIds || []).forEach(cid => {
    const club = state.clubs[cid];
    if (!club) return;
    const clubHidden = club.secret && !unlocked.includes(club.id);
    html += `<div class="panel"><div class="panel-title">${escapeHtml(club.name)}</div>
      ${club.whatYouDo ? `<p class="note" style="margin-bottom:8px">${escapeHtml(club.whatYouDo)}</p>` : ''}
      ${clubHidden ? '<div class="empty-state">Dein GM hat die Fähigkeit dieses Clubs noch nicht enthüllt.</div>' : `<div class="card"><strong>Signature-Fähigkeit</strong><p style="margin-top:4px">${escapeHtml(club.unlockableText) || '—'}</p></div>`}
    </div>`;
  });

  (c.professorIds || []).forEach(pid => {
    const p = state.professors[pid];
    if (!p) return;
    html += `<div class="panel"><div class="panel-title">${escapeHtml(p.name)}${p.pillar ? ` <span class="tag">${escapeHtml(p.pillar)}</span>` : ''}</div>
      ${p.titleRole ? `<p class="sub" style="margin-bottom:6px">${escapeHtml(p.titleRole)}</p>` : ''}
      ${p.description ? `<p style="margin-bottom:6px">${escapeHtml(p.description)}</p>` : ''}
      ${p.quote ? `<p style="font-style:italic;color:var(--text2);margin-bottom:6px">${escapeHtml(p.quote)}</p>` : ''}
      ${p.oath ? `<p style="margin-bottom:6px"><strong>Oath:</strong> ${escapeHtml(p.oath)}</p>` : ''}
      ${p.tableRules ? `<p style="margin-bottom:6px"><strong>Regeln am Tisch:</strong> ${escapeHtml(p.tableRules)}</p>` : ''}
      ${p.secretRevealed && p.secretNotes ? `<div class="card"><strong>Enthüllt</strong><p style="margin-top:4px;white-space:pre-wrap">${escapeHtml(p.secretNotes)}</p></div>` : ''}
    </div>`;
  });

  if (!(c.professorIds || []).length && !(c.clubIds || []).length) {
    html += '<div class="note">Dir sind noch keine Professoren oder Clubs zugewiesen — das macht dein GM im Charaktermodul.</div>';
  }
  return html;
}

function talentCardHtml(t, currentRanks, maxRanks) {
  const thresholds = (t.levelRequirements && t.levelRequirements.length ? t.levelRequirements : [1]);
  const rankLabel = thresholds.length > 1 ? `Level ${thresholds.join(' / ')} · Rang ${currentRanks}/${thresholds.length}` : `ab Level ${thresholds[0]}`;
  return `
  <div class="card talent-card ${currentRanks > 0 ? 'taken' : ''}">
    <div class="badge general">${escapeHtml(t.type) || 'Talent'} · ${rankLabel}</div>
    <h3>${escapeHtml(t.name)} ${currentRanks > 0 ? `<span class="tag on-card">✓ ${thresholds.length > 1 ? currentRanks + ' Rang(e)' : 'genommen'}</span>` : ''}</h3>
    <p style="margin-top:4px;white-space:pre-wrap">${escapeHtml(t.description) || '—'}</p>
  </div>`;
}

function skillCardHtml(s, taken) {
  return `
  <div class="card talent-card ${taken ? 'taken' : ''}">
    <div class="badge teacher">${escapeHtml(s.origin) || 'Origin'} · ab Level ${s.levelRequirement || 0}${s.cooldownCost ? ' · ' + escapeHtml(s.cooldownCost) : ''}</div>
    <h3>${escapeHtml(s.name)} ${taken ? '<span class="tag on-card">✓ gelernt</span>' : ''}</h3>
    ${s.roll ? `<p class="sub" style="margin-top:4px">Roll: ${escapeHtml(s.roll)}</p>` : ''}
    <p style="margin-top:4px;white-space:pre-wrap">${escapeHtml(s.effect) || '—'}</p>
  </div>`;
}

// ═══════════════════ GM VIEW ═══════════════════
function renderGMTalents() {
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <nav id="tabs" style="padding:0;margin:0;border:none">
      <button class="${talentSubView === 'talents' ? 'active' : ''}" onclick="talentSubView='talents';renderTalents()">Talente</button>
      <button class="${talentSubView === 'skills' ? 'active' : ''}" onclick="talentSubView='skills';renderTalents()">Skills</button>
      <button class="${talentSubView === 'professors' ? 'active' : ''}" onclick="talentSubView='professors';renderTalents()">Professoren</button>
      <button class="${talentSubView === 'clubs' ? 'active' : ''}" onclick="talentSubView='clubs';renderTalents()">Clubs</button>
      <button class="${talentSubView === 'unlocks' ? 'active' : ''}" onclick="talentSubView='unlocks';renderTalents()">Freischaltungen</button>
    </nav>
    <button class="btn small" onclick="importCurriculum()">📥 Regelwerk importieren</button>
  </div>
  ${talentSubView === 'skills' ? renderSkillsAdmin()
    : talentSubView === 'professors' ? renderProfessorsAdmin()
    : talentSubView === 'clubs' ? renderClubsAdmin()
    : talentSubView === 'unlocks' ? renderUnlocksAdmin()
    : renderTalentsAdmin()}
  `;
}

// ── Talente admin ──
function renderTalentsAdmin() {
  const list = Object.values(state.talents).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Talente <button class="btn small" onclick="openTalentForm(null)">+ Neues Talent</button></div>
    ${list.length ? list.map(t => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(t.name)} <span class="tag">${escapeHtml(t.type) || '—'}</span> <span class="tag">Lvl ${(t.levelRequirements || [1]).join('/')}</span>${t.secret ? ' <span class="tag">🔒 secret</span>' : ''}</div>
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
    <div class="grid cols-3">
      <div class="field"><label>Type (z.B. Fight, RP, Health...)</label><input type="text" value="${escapeAttr(talentFormDraft.type)}" oninput="talentFormDraft.type=this.value"></div>
      <div class="field"><label>Level(s), z.B. "1" oder "4;8;12"</label><input type="text" value="${escapeAttr((talentFormDraft.levelRequirements||[1]).join(';'))}" oninput="talentFormDraft.levelRequirementsRaw=this.value"></div>
      <div class="field"><label style="display:flex;align-items:center;gap:6px;margin-top:18px"><input type="checkbox" style="width:auto" ${talentFormDraft.secret ? 'checked' : ''} onchange="talentFormDraft.secret=this.checked"> Secret (GM schaltet frei)</label></div>
    </div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveTalentForm()">Speichern</button><button class="btn" onclick="cancelTalentForm()">Abbrechen</button></div>
  </div>` : ''}`;
}

function openTalentForm(id) {
  talentFormDraft = id ? { ...state.talents[id] } : { id: null, name: '', description: '', type: '', levelRequirements: [1], secret: false };
  renderTalents();
}
function cancelTalentForm() { talentFormDraft = null; renderTalents(); }
async function saveTalentForm() {
  if (!talentFormDraft.name.trim()) { showToast('Name fehlt.'); return; }
  const id = talentFormDraft.id || uid();
  let levelRequirements = talentFormDraft.levelRequirements || [1];
  if (talentFormDraft.levelRequirementsRaw !== undefined) {
    const nums = talentFormDraft.levelRequirementsRaw.split(';').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    levelRequirements = nums.length ? nums : [1];
  }
  const t = { id, name: talentFormDraft.name.trim(), description: talentFormDraft.description || '', type: talentFormDraft.type || '', levelRequirements, secret: !!talentFormDraft.secret };
  await dbWrite('talents/' + id, t);
  talentFormDraft = null; renderTalents(); showToast('Talent gespeichert.');
}
async function deleteTalent(id) {
  if (!confirm('Talent wirklich löschen?')) return;
  await dbWrite('talents/' + id, null);
}

// ── Skills admin ──
function renderSkillsAdmin() {
  const list = Object.values(state.skills).sort((a, b) => (a.origin || '').localeCompare(b.origin || '') || a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Skills / Techniques <button class="btn small" onclick="openSkillForm(null)">+ Neuer Skill</button></div>
    ${list.length ? list.map(s => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(s.name)} <span class="tag">${escapeHtml(s.origin) || '—'}</span> <span class="tag">Lvl ${s.levelRequirement || 0}</span>${s.secret ? ' <span class="tag">🔒 secret</span>' : ''}</div>
        <div class="meta">${escapeHtml(s.effect) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openSkillForm('${s.id}')">✎</button>
          <button class="icon-btn" onclick="deleteSkill('${s.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">Noch keine Skills angelegt.</div>'}
  </div>
  ${skillFormDraft ? `
  <div class="panel">
    <div class="panel-title">${skillFormDraft.id ? 'Skill bearbeiten' : 'Neuer Skill'}</div>
    <div class="field"><label>Name</label><input type="text" value="${escapeAttr(skillFormDraft.name)}" oninput="skillFormDraft.name=this.value"></div>
    <div class="grid cols-3">
      <div class="field"><label>Origin (Club/Professor)</label><input type="text" value="${escapeAttr(skillFormDraft.origin)}" oninput="skillFormDraft.origin=this.value"></div>
      <div class="field"><label>Level</label><input type="number" min="0" value="${skillFormDraft.levelRequirement || 0}" oninput="skillFormDraft.levelRequirement=Number(this.value)"></div>
      <div class="field"><label>Cooldown / Cost</label><input type="text" value="${escapeAttr(skillFormDraft.cooldownCost)}" oninput="skillFormDraft.cooldownCost=this.value"></div>
    </div>
    <div class="field"><label>Roll (Freitext, z.B. "Body + Force")</label><input type="text" value="${escapeAttr(skillFormDraft.roll)}" oninput="skillFormDraft.roll=this.value"></div>
    <div class="field"><label>Effekt</label><textarea oninput="skillFormDraft.effect=this.value">${escapeHtml(skillFormDraft.effect)}</textarea></div>
    <div class="field"><label style="display:flex;align-items:center;gap:6px"><input type="checkbox" style="width:auto" ${skillFormDraft.secret ? 'checked' : ''} onchange="skillFormDraft.secret=this.checked"> Secret (GM schaltet frei)</label></div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveSkillForm()">Speichern</button><button class="btn" onclick="cancelSkillForm()">Abbrechen</button></div>
  </div>` : ''}`;
}

function openSkillForm(id) {
  skillFormDraft = id ? { ...state.skills[id] } : { id: null, name: '', origin: '', cooldownCost: '', levelRequirement: 0, roll: '', effect: '', secret: false };
  renderTalents();
}
function cancelSkillForm() { skillFormDraft = null; renderTalents(); }
async function saveSkillForm() {
  if (!skillFormDraft.name.trim()) { showToast('Name fehlt.'); return; }
  const id = skillFormDraft.id || uid();
  const sObj = { id, name: skillFormDraft.name.trim(), origin: skillFormDraft.origin || '', cooldownCost: skillFormDraft.cooldownCost || '', levelRequirement: Number(skillFormDraft.levelRequirement) || 0, roll: skillFormDraft.roll || '', effect: skillFormDraft.effect || '', secret: !!skillFormDraft.secret };
  await dbWrite('skills/' + id, sObj);
  skillFormDraft = null; renderTalents(); showToast('Skill gespeichert.');
}
async function deleteSkill(id) {
  if (!confirm('Skill wirklich löschen?')) return;
  await dbWrite('skills/' + id, null);
}

// ── Professoren admin ──
function renderProfessorsAdmin() {
  const list = Object.values(state.professors).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Professoren <button class="btn small" onclick="openProfessorForm(null)">+ Neuer Professor</button></div>
    ${list.length ? list.map(p => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(p.name)} ${p.pillar ? `<span class="tag">${escapeHtml(p.pillar)}</span>` : ''}${p.secretNotes ? ` <span class="tag">${p.secretRevealed ? '👁 enthüllt' : '🔒 secret'}</span>` : ''}</div>
        <div class="meta">${escapeHtml(p.titleRole) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openProfessorForm('${p.id}')">✎</button>
          <button class="icon-btn" onclick="deleteProfessor('${p.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">Noch keine Professoren angelegt.</div>'}
  </div>
  ${professorFormDraft ? `
  <div class="panel">
    <div class="panel-title">${professorFormDraft.id ? 'Professor bearbeiten' : 'Neuer Professor'}</div>
    <div class="grid cols-2">
      <div class="field"><label>Name</label><input type="text" value="${escapeAttr(professorFormDraft.name)}" oninput="professorFormDraft.name=this.value"></div>
      <div class="field"><label>Pillar (BODY/MIND/SOUL...)</label><input type="text" value="${escapeAttr(professorFormDraft.pillar)}" oninput="professorFormDraft.pillar=this.value"></div>
    </div>
    <div class="field"><label>Title / Role</label><input type="text" value="${escapeAttr(professorFormDraft.titleRole)}" oninput="professorFormDraft.titleRole=this.value"></div>
    <div class="field"><label>Beschreibung</label><textarea oninput="professorFormDraft.description=this.value">${escapeHtml(professorFormDraft.description)}</textarea></div>
    <div class="field"><label>Quote</label><input type="text" value="${escapeAttr(professorFormDraft.quote)}" oninput="professorFormDraft.quote=this.value"></div>
    <div class="field"><label>Oath</label><textarea oninput="professorFormDraft.oath=this.value">${escapeHtml(professorFormDraft.oath)}</textarea></div>
    <div class="field"><label>Regeln am Tisch</label><textarea oninput="professorFormDraft.tableRules=this.value">${escapeHtml(professorFormDraft.tableRules)}</textarea></div>
    <div class="field"><label>Vibe</label><input type="text" value="${escapeAttr(professorFormDraft.vibe)}" oninput="professorFormDraft.vibe=this.value"></div>
    <div class="field"><label>GM-Geheimnis (secretNotes)</label><textarea oninput="professorFormDraft.secretNotes=this.value">${escapeHtml(professorFormDraft.secretNotes)}</textarea></div>
    <div class="field"><label style="display:flex;align-items:center;gap:6px"><input type="checkbox" style="width:auto" ${professorFormDraft.secretRevealed ? 'checked' : ''} onchange="professorFormDraft.secretRevealed=this.checked"> Geheimnis bereits enthüllt (für alle Spieler sichtbar)</label></div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveProfessorForm()">Speichern</button><button class="btn" onclick="cancelProfessorForm()">Abbrechen</button></div>
  </div>` : ''}`;
}

function openProfessorForm(id) {
  professorFormDraft = id ? { ...state.professors[id] } : { id: null, name: '', pillar: '', titleRole: '', description: '', quote: '', oath: '', tableRules: '', vibe: '', secretNotes: '', secretRevealed: false };
  renderTalents();
}
function cancelProfessorForm() { professorFormDraft = null; renderTalents(); }
async function saveProfessorForm() {
  if (!professorFormDraft.name.trim()) { showToast('Name fehlt.'); return; }
  const id = professorFormDraft.id || uid();
  const p = { id, name: professorFormDraft.name.trim(), pillar: professorFormDraft.pillar || '', titleRole: professorFormDraft.titleRole || '', description: professorFormDraft.description || '', quote: professorFormDraft.quote || '', oath: professorFormDraft.oath || '', tableRules: professorFormDraft.tableRules || '', vibe: professorFormDraft.vibe || '', secretNotes: professorFormDraft.secretNotes || '', secretRevealed: !!professorFormDraft.secretRevealed };
  await dbWrite('professors/' + id, p);
  professorFormDraft = null; renderTalents(); showToast('Professor gespeichert.');
}
async function deleteProfessor(id) {
  if (!confirm('Professor wirklich löschen?')) return;
  await dbWrite('professors/' + id, null);
}

// ── Clubs admin ──
function renderClubsAdmin() {
  const list = Object.values(state.clubs).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Clubs / Extracurricular <button class="btn small" onclick="openClubForm(null)">+ Neuer Club</button></div>
    ${list.length ? list.map(c => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(c.name)}${c.professorId && state.professors[c.professorId] ? ` <span class="tag">${escapeHtml(state.professors[c.professorId].name)}</span>` : ''}${c.secret ? ' <span class="tag">🔒 secret</span>' : ''}</div>
        <div class="meta">${escapeHtml(c.whatYouDo) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openClubForm('${c.id}')">✎</button>
          <button class="icon-btn" onclick="deleteClub('${c.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">Noch keine Clubs angelegt.</div>'}
  </div>
  ${clubFormDraft ? `
  <div class="panel">
    <div class="panel-title">${clubFormDraft.id ? 'Club bearbeiten' : 'Neuer Club'}</div>
    <div class="field"><label>Name</label><input type="text" value="${escapeAttr(clubFormDraft.name)}" oninput="clubFormDraft.name=this.value"></div>
    <div class="field"><label>Was man dort tut</label><textarea oninput="clubFormDraft.whatYouDo=this.value">${escapeHtml(clubFormDraft.whatYouDo)}</textarea></div>
    <div class="field"><label>Signature-Fähigkeit (Unlockable, Freitext)</label><textarea oninput="clubFormDraft.unlockableText=this.value">${escapeHtml(clubFormDraft.unlockableText)}</textarea></div>
    <div class="grid cols-2">
      <div class="field"><label>Betreuender Professor</label>
        <select onchange="clubFormDraft.professorId=this.value||null">
          <option value="">— keiner —</option>
          ${Object.values(state.professors).map(p => `<option value="${p.id}" ${clubFormDraft.professorId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label style="display:flex;align-items:center;gap:6px;margin-top:18px"><input type="checkbox" style="width:auto" ${clubFormDraft.secret ? 'checked' : ''} onchange="clubFormDraft.secret=this.checked"> Secret (GM schaltet frei)</label></div>
    </div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveClubForm()">Speichern</button><button class="btn" onclick="cancelClubForm()">Abbrechen</button></div>
  </div>` : ''}`;
}

function openClubForm(id) {
  clubFormDraft = id ? { ...state.clubs[id] } : { id: null, name: '', whatYouDo: '', unlockableText: '', professorId: null, secret: false };
  renderTalents();
}
function cancelClubForm() { clubFormDraft = null; renderTalents(); }
async function saveClubForm() {
  if (!clubFormDraft.name.trim()) { showToast('Name fehlt.'); return; }
  const id = clubFormDraft.id || uid();
  const c = { id, name: clubFormDraft.name.trim(), whatYouDo: clubFormDraft.whatYouDo || '', unlockableText: clubFormDraft.unlockableText || '', professorId: clubFormDraft.professorId || null, secret: !!clubFormDraft.secret };
  await dbWrite('clubs/' + id, c);
  clubFormDraft = null; renderTalents(); showToast('Club gespeichert.');
}
async function deleteClub(id) {
  if (!confirm('Club wirklich löschen?')) return;
  await dbWrite('clubs/' + id, null);
}

// ── Freischaltungen admin ──
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

  const unlocked = c.unlockedIds || [];
  const ranks = c.talentRanks || {};
  const skillIds = c.skillIds || [];
  const profNames = (c.professorIds || []).map(id => state.professors[id]?.name).filter(Boolean).join(', ') || '—';
  const clubNames = (c.clubIds || []).map(id => state.clubs[id]?.name).filter(Boolean).join(', ') || '—';

  html += `<div class="panel"><p class="note">Professoren: ${escapeHtml(profNames)} · Clubs: ${escapeHtml(clubNames)} (Zuweisung im Charaktermodul)</p></div>`;

  const talentsList = Object.values(state.talents).sort((a, b) => a.name.localeCompare(b.name));
  html += `<div class="panel"><div class="panel-title">Talente</div>
    ${talentsList.length ? talentsList.map(t => {
      const thresholds = t.levelRequirements && t.levelRequirements.length ? t.levelRequirements : [1];
      const cur = ranks[t.id] || 0;
      return `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(t.name)} <span class="tag">Lvl ${thresholds.join('/')}</span></div><div class="meta">${escapeHtml(t.description) || '—'}</div></div>
        <div style="display:flex;gap:10px;align-items:center">
          ${t.secret ? `<label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none"><input type="checkbox" style="width:auto" ${unlocked.includes(t.id) ? 'checked' : ''} onchange="toggleUnlock('${c.id}','${t.id}')"> freigeschaltet</label>` : ''}
          <div style="display:flex;align-items:center;gap:4px">
            <button class="icon-btn" onclick="adjustRank('${c.id}','${t.id}',-1)">−</button>
            <span class="sub">${cur}/${thresholds.length} Rang(e)</span>
            <button class="icon-btn" onclick="adjustRank('${c.id}','${t.id}',1,${thresholds.length})">+</button>
          </div>
        </div>
      </div>`;
    }).join('') : '<div class="empty-state">Keine Talente angelegt.</div>'}
  </div>`;

  const skillsList = Object.values(state.skills).sort((a, b) => (a.origin || '').localeCompare(b.origin || ''));
  html += `<div class="panel"><div class="panel-title">Skills</div>
    ${skillsList.length ? skillsList.map(s => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(s.name)} <span class="tag">${escapeHtml(s.origin) || '—'}</span> <span class="tag">Lvl ${s.levelRequirement || 0}</span></div><div class="meta">${escapeHtml(s.effect) || '—'}</div></div>
        <div style="display:flex;gap:14px">
          ${s.secret ? `<label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none"><input type="checkbox" style="width:auto" ${unlocked.includes(s.id) ? 'checked' : ''} onchange="toggleUnlock('${c.id}','${s.id}')"> freigeschaltet</label>` : ''}
          <label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none"><input type="checkbox" style="width:auto" ${skillIds.includes(s.id) ? 'checked' : ''} onchange="toggleSkillTaken('${c.id}','${s.id}')"> gelernt</label>
        </div>
      </div>`).join('') : '<div class="empty-state">Keine Skills angelegt.</div>'}
  </div>`;

  const secretClubs = (c.clubIds || []).map(id => state.clubs[id]).filter(cl => cl && cl.secret);
  if (secretClubs.length) {
    html += `<div class="panel"><div class="panel-title">Club-Geheimnisse</div>
      ${secretClubs.map(cl => `
        <div class="roster-item">
          <div class="name">${escapeHtml(cl.name)}</div>
          <label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none"><input type="checkbox" style="width:auto" ${unlocked.includes(cl.id) ? 'checked' : ''} onchange="toggleUnlock('${c.id}','${cl.id}')"> freigeschaltet</label>
        </div>`).join('')}
    </div>`;
  }

  return html;
}

async function toggleUnlock(charId, itemId) {
  const c = state.characters[charId];
  const list = (c.unlockedIds || []).slice();
  const i = list.indexOf(itemId);
  if (i === -1) list.push(itemId); else list.splice(i, 1);
  await dbWrite('characters/' + charId + '/unlockedIds', list);
}
async function toggleSkillTaken(charId, skillId) {
  const c = state.characters[charId];
  const list = (c.skillIds || []).slice();
  const i = list.indexOf(skillId);
  if (i === -1) list.push(skillId); else list.splice(i, 1);
  await dbWrite('characters/' + charId + '/skillIds', list);
}
async function adjustRank(charId, talentId, delta, max) {
  const c = state.characters[charId];
  const ranks = { ...(c.talentRanks || {}) };
  const next = Math.max(0, Math.min(max ?? 99, (ranks[talentId] || 0) + delta));
  ranks[talentId] = next;
  await dbWrite('characters/' + charId + '/talentRanks', ranks);
}

// ── Regelwerk-Import ──
async function importCurriculum() {
  if (typeof CURRICULUM_SEED === 'undefined') { showToast('Regelwerk-Daten (curriculum-seed.js) nicht gefunden.'); return; }
  const n = CURRICULUM_SEED.talents.length + CURRICULUM_SEED.skills.length + CURRICULUM_SEED.professors.length + CURRICULUM_SEED.clubs.length;
  if (!confirm(`${n} Einträge aus dem Regelwerk importieren (${CURRICULUM_SEED.talents.length} Talente, ${CURRICULUM_SEED.skills.length} Skills, ${CURRICULUM_SEED.professors.length} Professoren, ${CURRICULUM_SEED.clubs.length} Clubs)? Bestehende Charaktere bleiben unangetastet.`)) return;
  const updates = {};
  CURRICULUM_SEED.talents.forEach(t => { updates['talents/' + t.id] = t; });
  CURRICULUM_SEED.skills.forEach(s => { updates['skills/' + s.id] = s; });
  CURRICULUM_SEED.professors.forEach(p => { updates['professors/' + p.id] = p; });
  CURRICULUM_SEED.clubs.forEach(c => { updates['clubs/' + c.id] = c; });
  await dbUpdate(updates);
  showToast(`Regelwerk importiert (${n} Einträge).`);
}
