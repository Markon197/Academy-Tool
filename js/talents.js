// ═══════════════════════════════════════════════════════════════
// TALENT MODULE
// Three content types, matching the real rule system (The Last Curriculum):
//  - "Talents": general, pure level-gated talents (no origin needed), can
//    be multi-rank (e.g. Level 4/8/12 = Rank I/II/III, stacking).
//  - "Skills": techniques bound to an Origin (professor discipline OR
//    club), additionally level-gated. Origin is free text (no strict
//    foreign key, since real data mixes clubs/professors/items freely).
//  - "Clubs": extracurricular membership, grants exactly one signature
//    ability (free text) + an optional overseeing professor.
// "Professors" are their own NPC entities with flavor (quote/oath/rules)
// and a GM-only secret field (secretNotes) that only becomes visible
// after a global reveal.
// "Secret" is a GM unlock flag that can exist on any of the three content
// types (not just origin-bound ones as before) — unlocked per character
// via character.unlockedIds when needed.
// Purpose for players: browse everything available to them on their own,
// without the GM having to read it out loud live at the table.
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
  if (!c) return '<div class="empty-state">No character found.</div>';
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

  let html = `<div class="panel"><div class="panel-title">General Talents (Level ${c.level})</div>
    ${talents.length ? talents.map(t => talentCardHtml(t, ranks[t.id] || 0, eligibleRanks(t, c.level))).join('') : '<div class="empty-state">No general talents available for your level.</div>'}
  </div>`;

  html += `<div class="panel"><div class="panel-title">Skills / Techniques</div>
    ${skills.length ? skills.map(s => skillCardHtml(s, skillIds.includes(s.id))).join('') : '<div class="empty-state">No skills available yet — you need access through a professor or club.</div>'}
  </div>`;

  (c.clubIds || []).forEach(cid => {
    const club = state.clubs[cid];
    if (!club) return;
    const clubHidden = club.secret && !unlocked.includes(club.id);
    html += `<div class="panel"><div class="panel-title">${escapeHtml(club.name)}</div>
      ${club.whatYouDo ? `<p class="note" style="margin-bottom:8px">${escapeHtml(club.whatYouDo)}</p>` : ''}
      ${clubHidden ? '<div class="empty-state">Your GM hasn\'t revealed this club\'s ability yet.</div>' : `<div class="card"><strong>Signature ability</strong><p style="margin-top:4px">${escapeHtml(club.unlockableText) || '—'}</p></div>`}
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
      ${p.tableRules ? `<p style="margin-bottom:6px"><strong>Rules at the table:</strong> ${escapeHtml(p.tableRules)}</p>` : ''}
      ${p.secretRevealed && p.secretNotes ? `<div class="card"><strong>Revealed</strong><p style="margin-top:4px;white-space:pre-wrap">${escapeHtml(p.secretNotes)}</p></div>` : ''}
    </div>`;
  });

  if (!(c.professorIds || []).length && !(c.clubIds || []).length) {
    html += '<div class="note">You haven\'t been assigned any professors or clubs yet — your GM does that in the Character module.</div>';
  }
  return html;
}

function talentCardHtml(t, currentRanks, maxRanks) {
  const thresholds = (t.levelRequirements && t.levelRequirements.length ? t.levelRequirements : [1]);
  const rankLabel = thresholds.length > 1 ? `Level ${thresholds.join(' / ')} · Rank ${currentRanks}/${thresholds.length}` : `from Level ${thresholds[0]}`;
  return `
  <div class="card talent-card ${currentRanks > 0 ? 'taken' : ''}">
    <div class="badge general">${escapeHtml(t.type) || 'Talent'} · ${rankLabel}</div>
    <h3>${escapeHtml(t.name)} ${currentRanks > 0 ? `<span class="tag on-card">✓ ${thresholds.length > 1 ? currentRanks + ' rank(s)' : 'taken'}</span>` : ''}</h3>
    <p style="margin-top:4px;white-space:pre-wrap">${escapeHtml(t.description) || '—'}</p>
  </div>`;
}

function skillCardHtml(s, taken) {
  return `
  <div class="card talent-card ${taken ? 'taken' : ''}">
    <div class="badge teacher">${escapeHtml(s.origin) || 'Origin'} · from Level ${s.levelRequirement || 0}${s.cooldownCost ? ' · ' + escapeHtml(s.cooldownCost) : ''}</div>
    <h3>${escapeHtml(s.name)} ${taken ? '<span class="tag on-card">✓ learned</span>' : ''}</h3>
    ${s.roll ? `<p class="sub" style="margin-top:4px">Roll: ${escapeHtml(s.roll)}</p>` : ''}
    <p style="margin-top:4px;white-space:pre-wrap">${escapeHtml(s.effect) || '—'}</p>
  </div>`;
}

// ═══════════════════ GM VIEW ═══════════════════
function renderGMTalents() {
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <nav id="tabs" style="padding:0;margin:0;border:none">
      <button class="${talentSubView === 'talents' ? 'active' : ''}" onclick="talentSubView='talents';renderTalents()">Talents</button>
      <button class="${talentSubView === 'skills' ? 'active' : ''}" onclick="talentSubView='skills';renderTalents()">Skills</button>
      <button class="${talentSubView === 'professors' ? 'active' : ''}" onclick="talentSubView='professors';renderTalents()">Professors</button>
      <button class="${talentSubView === 'clubs' ? 'active' : ''}" onclick="talentSubView='clubs';renderTalents()">Clubs</button>
      <button class="${talentSubView === 'unlocks' ? 'active' : ''}" onclick="talentSubView='unlocks';renderTalents()">Unlocks</button>
    </nav>
    <button class="btn small" onclick="importCurriculum()">📥 Import curriculum</button>
  </div>
  ${talentSubView === 'skills' ? renderSkillsAdmin()
    : talentSubView === 'professors' ? renderProfessorsAdmin()
    : talentSubView === 'clubs' ? renderClubsAdmin()
    : talentSubView === 'unlocks' ? renderUnlocksAdmin()
    : renderTalentsAdmin()}
  `;
}

// ── Talents admin ──
function renderTalentsAdmin() {
  const list = Object.values(state.talents).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Talents <button class="btn small" onclick="openTalentForm(null)">+ New talent</button></div>
    ${list.length ? list.map(t => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(t.name)} <span class="tag">${escapeHtml(t.type) || '—'}</span> <span class="tag">Lvl ${(t.levelRequirements || [1]).join('/')}</span>${t.secret ? ' <span class="tag">🔒 secret</span>' : ''}</div>
        <div class="meta">${escapeHtml(t.description) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openTalentForm('${t.id}')">✎</button>
          <button class="icon-btn" onclick="deleteTalent('${t.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">No talents created yet.</div>'}
  </div>
  ${talentFormDraft ? `
  <div class="panel">
    <div class="panel-title">${talentFormDraft.id ? 'Edit talent' : 'New talent'}</div>
    <div class="field"><label>Name</label><input type="text" value="${escapeAttr(talentFormDraft.name)}" oninput="talentFormDraft.name=this.value"></div>
    <div class="field"><label>Description</label><textarea oninput="talentFormDraft.description=this.value">${escapeHtml(talentFormDraft.description)}</textarea></div>
    <div class="grid cols-3">
      <div class="field"><label>Type (e.g. Fight, RP, Health...)</label><input type="text" value="${escapeAttr(talentFormDraft.type)}" oninput="talentFormDraft.type=this.value"></div>
      <div class="field"><label>Level(s), e.g. "1" or "4;8;12"</label><input type="text" value="${escapeAttr((talentFormDraft.levelRequirements||[1]).join(';'))}" oninput="talentFormDraft.levelRequirementsRaw=this.value"></div>
      <div class="field"><label style="display:flex;align-items:center;gap:6px;margin-top:18px"><input type="checkbox" style="width:auto" ${talentFormDraft.secret ? 'checked' : ''} onchange="talentFormDraft.secret=this.checked"> Secret (GM unlocks)</label></div>
    </div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveTalentForm()">Save</button><button class="btn" onclick="cancelTalentForm()">Cancel</button></div>
  </div>` : ''}`;
}

function openTalentForm(id) {
  talentFormDraft = id ? { ...state.talents[id] } : { id: null, name: '', description: '', type: '', levelRequirements: [1], secret: false };
  renderTalents();
}
function cancelTalentForm() { talentFormDraft = null; renderTalents(); }
async function saveTalentForm() {
  if (!talentFormDraft.name.trim()) { showToast('Name is missing.'); return; }
  const id = talentFormDraft.id || uid();
  let levelRequirements = talentFormDraft.levelRequirements || [1];
  if (talentFormDraft.levelRequirementsRaw !== undefined) {
    const nums = talentFormDraft.levelRequirementsRaw.split(';').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    levelRequirements = nums.length ? nums : [1];
  }
  const t = { id, name: talentFormDraft.name.trim(), description: talentFormDraft.description || '', type: talentFormDraft.type || '', levelRequirements, secret: !!talentFormDraft.secret };
  await dbWrite('talents/' + id, t);
  talentFormDraft = null; renderTalents(); showToast('Talent saved.');
}
async function deleteTalent(id) {
  if (!confirm('Really delete this talent?')) return;
  await dbWrite('talents/' + id, null);
}

// ── Skills admin ──
function renderSkillsAdmin() {
  const list = Object.values(state.skills).sort((a, b) => (a.origin || '').localeCompare(b.origin || '') || a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Skills / Techniques <button class="btn small" onclick="openSkillForm(null)">+ New skill</button></div>
    ${list.length ? list.map(s => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(s.name)} <span class="tag">${escapeHtml(s.origin) || '—'}</span> <span class="tag">Lvl ${s.levelRequirement || 0}</span>${s.secret ? ' <span class="tag">🔒 secret</span>' : ''}</div>
        <div class="meta">${escapeHtml(s.effect) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openSkillForm('${s.id}')">✎</button>
          <button class="icon-btn" onclick="deleteSkill('${s.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">No skills created yet.</div>'}
  </div>
  ${skillFormDraft ? `
  <div class="panel">
    <div class="panel-title">${skillFormDraft.id ? 'Edit skill' : 'New skill'}</div>
    <div class="field"><label>Name</label><input type="text" value="${escapeAttr(skillFormDraft.name)}" oninput="skillFormDraft.name=this.value"></div>
    <div class="grid cols-3">
      <div class="field"><label>Origin (club/professor)</label><input type="text" value="${escapeAttr(skillFormDraft.origin)}" oninput="skillFormDraft.origin=this.value"></div>
      <div class="field"><label>Level</label><input type="number" min="0" value="${skillFormDraft.levelRequirement || 0}" oninput="skillFormDraft.levelRequirement=Number(this.value)"></div>
      <div class="field"><label>Cooldown / Cost</label><input type="text" value="${escapeAttr(skillFormDraft.cooldownCost)}" oninput="skillFormDraft.cooldownCost=this.value"></div>
    </div>
    <div class="field"><label>Roll (free text, e.g. "Body + Force")</label><input type="text" value="${escapeAttr(skillFormDraft.roll)}" oninput="skillFormDraft.roll=this.value"></div>
    <div class="field"><label>Effect</label><textarea oninput="skillFormDraft.effect=this.value">${escapeHtml(skillFormDraft.effect)}</textarea></div>
    <div class="field"><label style="display:flex;align-items:center;gap:6px"><input type="checkbox" style="width:auto" ${skillFormDraft.secret ? 'checked' : ''} onchange="skillFormDraft.secret=this.checked"> Secret (GM unlocks)</label></div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveSkillForm()">Save</button><button class="btn" onclick="cancelSkillForm()">Cancel</button></div>
  </div>` : ''}`;
}

function openSkillForm(id) {
  skillFormDraft = id ? { ...state.skills[id] } : { id: null, name: '', origin: '', cooldownCost: '', levelRequirement: 0, roll: '', effect: '', secret: false };
  renderTalents();
}
function cancelSkillForm() { skillFormDraft = null; renderTalents(); }
async function saveSkillForm() {
  if (!skillFormDraft.name.trim()) { showToast('Name is missing.'); return; }
  const id = skillFormDraft.id || uid();
  const sObj = { id, name: skillFormDraft.name.trim(), origin: skillFormDraft.origin || '', cooldownCost: skillFormDraft.cooldownCost || '', levelRequirement: Number(skillFormDraft.levelRequirement) || 0, roll: skillFormDraft.roll || '', effect: skillFormDraft.effect || '', secret: !!skillFormDraft.secret };
  await dbWrite('skills/' + id, sObj);
  skillFormDraft = null; renderTalents(); showToast('Skill saved.');
}
async function deleteSkill(id) {
  if (!confirm('Really delete this skill?')) return;
  await dbWrite('skills/' + id, null);
}

// ── Professors admin ──
function renderProfessorsAdmin() {
  const list = Object.values(state.professors).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Professors <button class="btn small" onclick="openProfessorForm(null)">+ New professor</button></div>
    ${list.length ? list.map(p => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(p.name)} ${p.pillar ? `<span class="tag">${escapeHtml(p.pillar)}</span>` : ''}${p.secretNotes ? ` <span class="tag">${p.secretRevealed ? '👁 revealed' : '🔒 secret'}</span>` : ''}</div>
        <div class="meta">${escapeHtml(p.titleRole) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openProfessorForm('${p.id}')">✎</button>
          <button class="icon-btn" onclick="deleteProfessor('${p.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">No professors created yet.</div>'}
  </div>
  ${professorFormDraft ? `
  <div class="panel">
    <div class="panel-title">${professorFormDraft.id ? 'Edit professor' : 'New professor'}</div>
    <div class="grid cols-2">
      <div class="field"><label>Name</label><input type="text" value="${escapeAttr(professorFormDraft.name)}" oninput="professorFormDraft.name=this.value"></div>
      <div class="field"><label>Pillar (BODY/MIND/SOUL...)</label><input type="text" value="${escapeAttr(professorFormDraft.pillar)}" oninput="professorFormDraft.pillar=this.value"></div>
    </div>
    <div class="field"><label>Title / Role</label><input type="text" value="${escapeAttr(professorFormDraft.titleRole)}" oninput="professorFormDraft.titleRole=this.value"></div>
    <div class="field"><label>Description</label><textarea oninput="professorFormDraft.description=this.value">${escapeHtml(professorFormDraft.description)}</textarea></div>
    <div class="field"><label>Quote</label><input type="text" value="${escapeAttr(professorFormDraft.quote)}" oninput="professorFormDraft.quote=this.value"></div>
    <div class="field"><label>Oath</label><textarea oninput="professorFormDraft.oath=this.value">${escapeHtml(professorFormDraft.oath)}</textarea></div>
    <div class="field"><label>Rules at the table</label><textarea oninput="professorFormDraft.tableRules=this.value">${escapeHtml(professorFormDraft.tableRules)}</textarea></div>
    <div class="field"><label>Vibe</label><input type="text" value="${escapeAttr(professorFormDraft.vibe)}" oninput="professorFormDraft.vibe=this.value"></div>
    <div class="field"><label>GM secret (secretNotes)</label><textarea oninput="professorFormDraft.secretNotes=this.value">${escapeHtml(professorFormDraft.secretNotes)}</textarea></div>
    <div class="field"><label style="display:flex;align-items:center;gap:6px"><input type="checkbox" style="width:auto" ${professorFormDraft.secretRevealed ? 'checked' : ''} onchange="professorFormDraft.secretRevealed=this.checked"> Secret already revealed (visible to all players)</label></div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveProfessorForm()">Save</button><button class="btn" onclick="cancelProfessorForm()">Cancel</button></div>
  </div>` : ''}`;
}

function openProfessorForm(id) {
  professorFormDraft = id ? { ...state.professors[id] } : { id: null, name: '', pillar: '', titleRole: '', description: '', quote: '', oath: '', tableRules: '', vibe: '', secretNotes: '', secretRevealed: false };
  renderTalents();
}
function cancelProfessorForm() { professorFormDraft = null; renderTalents(); }
async function saveProfessorForm() {
  if (!professorFormDraft.name.trim()) { showToast('Name is missing.'); return; }
  const id = professorFormDraft.id || uid();
  const p = { id, name: professorFormDraft.name.trim(), pillar: professorFormDraft.pillar || '', titleRole: professorFormDraft.titleRole || '', description: professorFormDraft.description || '', quote: professorFormDraft.quote || '', oath: professorFormDraft.oath || '', tableRules: professorFormDraft.tableRules || '', vibe: professorFormDraft.vibe || '', secretNotes: professorFormDraft.secretNotes || '', secretRevealed: !!professorFormDraft.secretRevealed };
  await dbWrite('professors/' + id, p);
  professorFormDraft = null; renderTalents(); showToast('Professor saved.');
}
async function deleteProfessor(id) {
  if (!confirm('Really delete this professor?')) return;
  await dbWrite('professors/' + id, null);
}

// ── Clubs admin ──
function renderClubsAdmin() {
  const list = Object.values(state.clubs).sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="panel">
    <div class="panel-title">Clubs / Extracurricular <button class="btn small" onclick="openClubForm(null)">+ New club</button></div>
    ${list.length ? list.map(c => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(c.name)}${c.professorId && state.professors[c.professorId] ? ` <span class="tag">${escapeHtml(state.professors[c.professorId].name)}</span>` : ''}${c.secret ? ' <span class="tag">🔒 secret</span>' : ''}</div>
        <div class="meta">${escapeHtml(c.whatYouDo) || '—'}</div></div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" onclick="openClubForm('${c.id}')">✎</button>
          <button class="icon-btn" onclick="deleteClub('${c.id}')">✕</button>
        </div>
      </div>`).join('') : '<div class="empty-state">No clubs created yet.</div>'}
  </div>
  ${clubFormDraft ? `
  <div class="panel">
    <div class="panel-title">${clubFormDraft.id ? 'Edit club' : 'New club'}</div>
    <div class="field"><label>Name</label><input type="text" value="${escapeAttr(clubFormDraft.name)}" oninput="clubFormDraft.name=this.value"></div>
    <div class="field"><label>What you do there</label><textarea oninput="clubFormDraft.whatYouDo=this.value">${escapeHtml(clubFormDraft.whatYouDo)}</textarea></div>
    <div class="field"><label>Signature ability (unlockable, free text)</label><textarea oninput="clubFormDraft.unlockableText=this.value">${escapeHtml(clubFormDraft.unlockableText)}</textarea></div>
    <div class="grid cols-2">
      <div class="field"><label>Overseeing professor</label>
        <select onchange="clubFormDraft.professorId=this.value||null">
          <option value="">— none —</option>
          ${Object.values(state.professors).map(p => `<option value="${p.id}" ${clubFormDraft.professorId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label style="display:flex;align-items:center;gap:6px;margin-top:18px"><input type="checkbox" style="width:auto" ${clubFormDraft.secret ? 'checked' : ''} onchange="clubFormDraft.secret=this.checked"> Secret (GM unlocks)</label></div>
    </div>
    <div style="display:flex;gap:8px"><button class="btn primary" onclick="saveClubForm()">Save</button><button class="btn" onclick="cancelClubForm()">Cancel</button></div>
  </div>` : ''}`;
}

function openClubForm(id) {
  clubFormDraft = id ? { ...state.clubs[id] } : { id: null, name: '', whatYouDo: '', unlockableText: '', professorId: null, secret: false };
  renderTalents();
}
function cancelClubForm() { clubFormDraft = null; renderTalents(); }
async function saveClubForm() {
  if (!clubFormDraft.name.trim()) { showToast('Name is missing.'); return; }
  const id = clubFormDraft.id || uid();
  const c = { id, name: clubFormDraft.name.trim(), whatYouDo: clubFormDraft.whatYouDo || '', unlockableText: clubFormDraft.unlockableText || '', professorId: clubFormDraft.professorId || null, secret: !!clubFormDraft.secret };
  await dbWrite('clubs/' + id, c);
  clubFormDraft = null; renderTalents(); showToast('Club saved.');
}
async function deleteClub(id) {
  if (!confirm('Really delete this club?')) return;
  await dbWrite('clubs/' + id, null);
}

// ── Unlocks admin ──
function renderUnlocksAdmin() {
  const chars = Object.values(state.characters).sort((a, b) => a.name.localeCompare(b.name));
  let html = `
  <div class="panel">
    <div class="panel-title">Unlocks per character</div>
    <select onchange="unlockCharId=this.value;renderTalents()">
      <option value="">— choose a character —</option>
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

  html += `<div class="panel"><p class="note">Professors: ${escapeHtml(profNames)} · Clubs: ${escapeHtml(clubNames)} (assigned in the Character module)</p></div>`;

  const talentsList = Object.values(state.talents).sort((a, b) => a.name.localeCompare(b.name));
  html += `<div class="panel"><div class="panel-title">Talents</div>
    ${talentsList.length ? talentsList.map(t => {
      const thresholds = t.levelRequirements && t.levelRequirements.length ? t.levelRequirements : [1];
      const cur = ranks[t.id] || 0;
      return `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(t.name)} <span class="tag">Lvl ${thresholds.join('/')}</span></div><div class="meta">${escapeHtml(t.description) || '—'}</div></div>
        <div style="display:flex;gap:10px;align-items:center">
          ${t.secret ? `<label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none"><input type="checkbox" style="width:auto" ${unlocked.includes(t.id) ? 'checked' : ''} onchange="toggleUnlock('${c.id}','${t.id}')"> unlocked</label>` : ''}
          <div style="display:flex;align-items:center;gap:4px">
            <button class="icon-btn" onclick="adjustRank('${c.id}','${t.id}',-1)">−</button>
            <span class="sub">${cur}/${thresholds.length} rank(s)</span>
            <button class="icon-btn" onclick="adjustRank('${c.id}','${t.id}',1,${thresholds.length})">+</button>
          </div>
        </div>
      </div>`;
    }).join('') : '<div class="empty-state">No talents created yet.</div>'}
  </div>`;

  const skillsList = Object.values(state.skills).sort((a, b) => (a.origin || '').localeCompare(b.origin || ''));
  html += `<div class="panel"><div class="panel-title">Skills</div>
    ${skillsList.length ? skillsList.map(s => `
      <div class="roster-item">
        <div><div class="name">${escapeHtml(s.name)} <span class="tag">${escapeHtml(s.origin) || '—'}</span> <span class="tag">Lvl ${s.levelRequirement || 0}</span></div><div class="meta">${escapeHtml(s.effect) || '—'}</div></div>
        <div style="display:flex;gap:14px">
          ${s.secret ? `<label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none"><input type="checkbox" style="width:auto" ${unlocked.includes(s.id) ? 'checked' : ''} onchange="toggleUnlock('${c.id}','${s.id}')"> unlocked</label>` : ''}
          <label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none"><input type="checkbox" style="width:auto" ${skillIds.includes(s.id) ? 'checked' : ''} onchange="toggleSkillTaken('${c.id}','${s.id}')"> learned</label>
        </div>
      </div>`).join('') : '<div class="empty-state">No skills created yet.</div>'}
  </div>`;

  const secretClubs = (c.clubIds || []).map(id => state.clubs[id]).filter(cl => cl && cl.secret);
  if (secretClubs.length) {
    html += `<div class="panel"><div class="panel-title">Club secrets</div>
      ${secretClubs.map(cl => `
        <div class="roster-item">
          <div class="name">${escapeHtml(cl.name)}</div>
          <label style="display:flex;align-items:center;gap:4px;width:auto;text-transform:none"><input type="checkbox" style="width:auto" ${unlocked.includes(cl.id) ? 'checked' : ''} onchange="toggleUnlock('${c.id}','${cl.id}')"> unlocked</label>
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

// ── Curriculum import ──
async function importCurriculum() {
  if (typeof CURRICULUM_SEED === 'undefined') { showToast('Curriculum data (curriculum-seed.js) not found.'); return; }
  const n = CURRICULUM_SEED.talents.length + CURRICULUM_SEED.skills.length + CURRICULUM_SEED.professors.length + CURRICULUM_SEED.clubs.length;
  if (!confirm(`Import ${n} entries from the curriculum (${CURRICULUM_SEED.talents.length} talents, ${CURRICULUM_SEED.skills.length} skills, ${CURRICULUM_SEED.professors.length} professors, ${CURRICULUM_SEED.clubs.length} clubs)? Existing characters are left untouched.`)) return;
  const updates = {};
  CURRICULUM_SEED.talents.forEach(t => { updates['talents/' + t.id] = t; });
  CURRICULUM_SEED.skills.forEach(s => { updates['skills/' + s.id] = s; });
  CURRICULUM_SEED.professors.forEach(p => { updates['professors/' + p.id] = p; });
  CURRICULUM_SEED.clubs.forEach(c => { updates['clubs/' + c.id] = c; });
  await dbUpdate(updates);
  showToast(`Curriculum imported (${n} entries).`);
}
