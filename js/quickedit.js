// ═══════════════════════════════════════════════════════════════
// QUICK EDIT (GM) — a compact editor for anyone, opened from the ✎ button on
// the Status cards, scene cards and the character roster.
// Max LIFE comes first (it's what you change most), then pillars/skills and
// counters. Every field saves the moment it changes. The editor deliberately
// does NOT redraw when other updates arrive, so it can never steal focus
// while you type; it refreshes its own readouts instead.
// ═══════════════════════════════════════════════════════════════

let qeId = null;
let qeAdjustCurrent = true;   // raising max LIFE also raises current LIFE by the same amount

function openQuickEdit(id) {
  if (session.role !== 'gm' || !state.characters[id]) return;
  qeId = id;
  renderQuickEdit();
}
function closeQuickEdit() { qeId = null; document.getElementById('quick-edit')?.remove(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && qeId) closeQuickEdit(); });

function renderQuickEdit() {
  const c = state.characters[qeId];
  if (!c) { closeQuickEdit(); return; }
  let el = document.getElementById('quick-edit');
  if (!el) { el = document.createElement('div'); el.id = 'quick-edit'; document.body.appendChild(el); }
  const num = (path, val, label, cls) => `<label class="qe-f"><span>${label}</span><input type="number" ${cls ? `class="${cls}"` : ''} value="${val}" onchange="qeSet('${path}',this.value)"></label>`;
  el.innerHTML = `
    <div class="sm-backdrop" onclick="closeQuickEdit()"></div>
    <div class="sm-card qe-card" role="dialog" aria-label="Quick edit">
      <div class="ep-title">Quick edit — ${escapeHtml(c.name)}</div>

      <div class="qe-life">
        <div class="qe-row">
          <div class="qe-big"><span>Max LIFE</span>
            <div class="qe-step">
              <button class="gs-btn neg" onclick="qeMaxBy(-5)">−5</button><button class="gs-btn neg" onclick="qeMaxBy(-1)">−1</button>
              <input type="number" id="qe-max" value="${lifeMax(c)}" min="1" onchange="qeSetMax(this.value)" aria-label="Max LIFE">
              <button class="gs-btn pos" onclick="qeMaxBy(1)">+1</button><button class="gs-btn pos" onclick="qeMaxBy(5)">+5</button>
            </div></div>
          <label class="qe-f"><span>Current LIFE</span><input type="number" id="qe-life" value="${c.life}" onchange="qeSetLife(this.value)"></label>
        </div>
        <label class="chk"><input type="checkbox" ${qeAdjustCurrent ? 'checked' : ''} onchange="qeAdjustCurrent=this.checked"> Raising max also raises current LIFE</label>
        <div class="qe-formula" id="qe-formula"></div>
      </div>

      <div class="qe-sec">Pillars &amp; skills</div>
      <div class="qe-pillars">${PILLARS.map(p => `
        <div class="qe-pillar pillar-${p}"><div class="qe-ph">${p.toUpperCase()}</div>
          ${num('pillars/' + p, c.pillars[p], 'Pillar', 'qe-pin')}
          ${SKILLS_BY_PILLAR[p].map(s => num('skills/' + s, c.skills[s], STAT_LABEL(s))).join('')}
        </div>`).join('')}</div>

      <div class="qe-sec">Counters</div>
      <div class="qe-counters">${[['level', 'Level'], ['xp', 'XP'], ['focus', 'Focus'], ['energy', 'Energy'], ['stress', 'Stress'], ['ascension', 'Ascension'], ['ruin', 'Ruin'], ['detention', 'Detention']].map(([k, l]) => num(k, c[k], l)).join('')}</div>
      <button class="sm-btn" onclick="closeQuickEdit()">Done</button>
    </div>`;
  qeRefresh();
}

// refresh just the derived readouts (no redraw, so typing is never interrupted)
function qeRefresh() {
  const c = state.characters[qeId];
  const f = document.getElementById('qe-formula');
  if (!c || !f) return;
  const formula = lifeFormula(c);
  f.innerHTML = c.lifeOverride
    ? `Max LIFE is set by hand. The rules formula would give <strong>${formula}</strong> — (Body + Mind + Soul) × 2. <button class="btn small" onclick="qeUseFormula()">Use formula</button>`
    : `Max LIFE follows the rules formula: (Body + Mind + Soul) × 2 = <strong>${formula}</strong>. Editing it switches to a manual value.`;
  const m = document.getElementById('qe-max'); if (m && document.activeElement !== m) m.value = lifeMax(c);
  const l = document.getElementById('qe-life'); if (l && document.activeElement !== l) l.value = c.life;
}

async function qeSet(path, value) { await setField(qeId, path, value, true); qeRefresh(); }

async function qeSetMax(value) {
  const c = state.characters[qeId];
  if (!c) return;
  const v = Math.max(1, Number(value) || 1);
  const delta = v - lifeMax(c);
  let life = Number(c.life) || 0;
  if (qeAdjustCurrent && delta > 0) life += delta;
  life = Math.min(life, v);
  await dbUpdate({ [`characters/${c.id}/lifeOverride`]: true, [`characters/${c.id}/maxLife`]: v, [`characters/${c.id}/life`]: life });
  const m = document.getElementById('qe-max'); if (m) m.value = v;
  qeRefresh();
}
function qeMaxBy(d) { const c = state.characters[qeId]; if (c) qeSetMax(lifeMax(c) + d); }

async function qeSetLife(value) {
  const c = state.characters[qeId];
  if (!c) return;
  await dbWrite(`characters/${c.id}/life`, Math.min(lifeMax(c), Number(value) || 0));
  qeRefresh();
}
async function qeUseFormula() {
  const c = state.characters[qeId];
  if (!c) return;
  const f = lifeFormula(c);
  await dbUpdate({ [`characters/${c.id}/lifeOverride`]: false, [`characters/${c.id}/life`]: Math.min(c.life, f) });
  qeRefresh();
}
