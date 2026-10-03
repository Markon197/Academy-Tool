// ═══════════════════════════════════════════════════════════════
// LEDGER MODULE — the Mission Ledger.
// After each mission the faculty awards each student three seals
// (Mastery, Method, Conduct), each Golden / Silver / Iron / Cracked /
// Broken. A student's collection of seals is their reputation. Also
// shows the school-standing counters: Ascension, Ruin, detention hours.
// ═══════════════════════════════════════════════════════════════

const markById = id => SEAL_MARKS.find(m => m.id === id);

function sealBadge(markId) {
  const m = markById(markId);
  return m ? `<span class="seal seal-${m.id}" title="${escapeAttr(m.hint)}">${m.label}</span>` : '<span class="seal seal-none">—</span>';
}

function ledgerPCs() { return Object.values(state.characters).filter(c => !c.isNPC).sort((a, b) => a.name.localeCompare(b.name)); }
function sortedMissions() { return Object.values(state.missions || {}).sort((a, b) => (a.order || 0) - (b.order || 0)); }

// Average seal score per kind across every mission (for the reputation table).
function sealStats(charId) {
  const tot = { mastery: [], method: [], conduct: [] };
  const counts = Object.fromEntries(SEAL_MARKS.map(m => [m.id, 0]));
  sortedMissions().forEach(ms => {
    const s = (ms.seals || {})[charId];
    if (!s) return;
    SEAL_KINDS.forEach(k => { const m = markById(s[k.id]); if (m) { tot[k.id].push(m.score); counts[m.id]++; } });
  });
  const avg = k => tot[k].length ? (tot[k].reduce((a, b) => a + b, 0) / tot[k].length) : null;
  return { avg: { mastery: avg('mastery'), method: avg('method'), conduct: avg('conduct') }, counts };
}

function renderLedger() {
  const root = document.getElementById('ledger-root');
  if (!root) return;
  const gm = session.role === 'gm';
  const pcs = ledgerPCs();
  const missions = sortedMissions();
  const fmt = v => v === null ? '—' : v.toFixed(1);

  root.innerHTML = `
  <div class="panel">
    <div class="panel-title">Standing &amp; reputation</div>
    <div class="table-wrap"><table class="grid-table">
      <thead><tr><th>Student</th><th>Ascension</th><th>Ruin</th><th>Detention</th>${SEAL_KINDS.map(k => `<th title="${escapeAttr(k.hint)}">${k.label} avg</th>`).join('')}<th>Seals earned</th></tr></thead>
      <tbody>${pcs.map(c => {
        const st = sealStats(c.id);
        const me = session.charId === c.id;
        const ctl = (field) => gm ? `<button class="icon-btn" onclick="bump('${c.id}','${field}',-1,0)" aria-label="${field} down">−</button><strong>${c[field]}</strong><button class="icon-btn" onclick="bump('${c.id}','${field}',1,0)" aria-label="${field} up">+</button>` : `<strong>${c[field]}</strong>`;
        return `<tr class="${me ? 'me' : ''}"><td class="name">${escapeHtml(c.name)}</td><td>${ctl('ascension')}</td><td>${ctl('ruin')}</td><td>${ctl('detention')}</td>
          ${SEAL_KINDS.map(k => `<td>${fmt(st.avg[k.id])}<span class="sub"> / 5</span></td>`).join('')}
          <td>${SEAL_MARKS.filter(m => st.counts[m.id]).map(m => `<span class="seal seal-${m.id}">${st.counts[m.id]}× ${m.label}</span>`).join(' ') || '—'}</td></tr>`;
      }).join('') || '<tr><td colspan="8" class="empty-state">No player characters yet.</td></tr>'}</tbody>
    </table></div>
    <div class="note"><strong>Ascension</strong> = impressing the school. <strong>Ruin</strong> = harming its image or acting against its interests. Mark scale: Golden 5 · Silver 4 · Iron 3 · Cracked 2 · Broken 1.</div>
  </div>

  ${gm ? `<div class="panel"><div class="panel-title">New mission entry</div>
    <div class="inline"><input type="text" id="new-mission-name" placeholder="e.g. Mission 2 — The Teacher Beyond the Wall"><button class="btn primary" onclick="addMission()">+ Add to ledger</button></div></div>` : ''}

  ${missions.length ? missions.map(ms => missionHtml(ms, pcs, gm)).join('') : '<div class="panel"><div class="empty-state">The ledger is empty. Seals are awarded after each mission.</div></div>'}`;
}

function missionHtml(ms, pcs, gm) {
  const sealSelect = (charId, kind, cur) => gm
    ? `<select class="seal-select seal-${cur || 'none'}" onchange="setSeal('${ms.id}','${charId}','${kind}',this.value)" aria-label="${kind} seal"><option value="">—</option>${SEAL_MARKS.map(m => `<option value="${m.id}" ${cur === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}</select>`
    : sealBadge(cur);
  return `
  <div class="panel">
    <div class="panel-title"><span>${escapeHtml(ms.name)}</span>${gm ? `<button class="icon-btn" onclick="deleteMission('${ms.id}')" aria-label="Delete mission">✕</button>` : ''}</div>
    ${gm ? `<div class="field"><label>Notes</label><textarea onchange="setMissionNotes('${ms.id}',this.value)">${escapeHtml(ms.notes)}</textarea></div>` : (ms.notes ? `<p class="note" style="margin:0 0 10px">${escapeHtml(ms.notes)}</p>` : '')}
    <div class="table-wrap"><table class="grid-table">
      <thead><tr><th>Student</th>${SEAL_KINDS.map(k => `<th title="${escapeAttr(k.hint)}">Seal of ${k.label}</th>`).join('')}</tr></thead>
      <tbody>${pcs.map(c => { const s = (ms.seals || {})[c.id] || {}; return `<tr class="${session.charId === c.id ? 'me' : ''}"><td class="name">${escapeHtml(c.name)}</td>${SEAL_KINDS.map(k => `<td>${sealSelect(c.id, k.id, s[k.id])}</td>`).join('')}</tr>`; }).join('')}</tbody>
    </table></div>
  </div>`;
}

async function addMission() {
  const el = document.getElementById('new-mission-name');
  const name = el.value.trim();
  if (!name) { showToast('Give the mission a name.'); return; }
  const id = uid();
  const order = Math.max(0, ...sortedMissions().map(m => m.order || 0)) + 1;
  await dbWrite('missions/' + id, { id, name, notes: '', order, seals: {} });
  showToast('Mission added to the ledger.');
}
async function setSeal(missionId, charId, kind, value) { await dbWrite(`missions/${missionId}/seals/${charId}/${kind}`, value || null); }
async function setMissionNotes(id, v) { await dbWrite(`missions/${id}/notes`, v); }
async function deleteMission(id) {
  if (!confirm('Delete this mission and all of its seals?')) return;
  await dbWrite('missions/' + id, null);
}
