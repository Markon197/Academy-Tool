// ═══════════════════════════════════════════════════════════════
// WORLD CLOCK
// The GM controls the exact in-world time (settings.clock = minutes since
// Day 1, 00:00) and can move it forward or back. Players only ever see an
// APPROXIMATE time of day: Dawn, Morning, Midday, Afternoon, Evening, Night.
//
// TIMED COOLDOWNS (built, OFF by default — settings.timeCooldowns):
// techniques whose cooldown is measured in hours or days ("Once every 6
// hours", "Once per day") record "ready at world-time X" instead of waiting
// for a manual Rest. When the clock reaches X they are ready again by
// themselves. Round-based and per-battle cooldowns are unaffected.
// ═══════════════════════════════════════════════════════════════

const DAY_MIN = 1440;
const PERIODS = [
  { id: 'night', label: 'Night', icon: '🌙', from: 0 },
  { id: 'dawn', label: 'Dawn', icon: '🌅', from: 5 * 60 },
  { id: 'morning', label: 'Morning', icon: '🌤️', from: 7 * 60 },
  { id: 'midday', label: 'Midday', icon: '☀️', from: 11 * 60 },
  { id: 'afternoon', label: 'Afternoon', icon: '⛅', from: 14 * 60 },
  { id: 'evening', label: 'Evening', icon: '🌆', from: 17 * 60 },
  { id: 'night', label: 'Night', icon: '🌙', from: 20 * 60 },
];

function worldMinutes() { const m = Number(state.settings?.clock); return Number.isFinite(m) ? m : 480; }   // default: Day 1, 08:00
function timedCooldownsOn() { return !!state.settings?.timeCooldowns; }

function clockParts(m) {
  const t = ((Math.round(m) % DAY_MIN) + DAY_MIN) % DAY_MIN;
  return { day: Math.floor(m / DAY_MIN) + 1, h: Math.floor(t / 60), min: t % 60, minuteOfDay: t };
}
const pad2 = n => String(n).padStart(2, '0');
function fmtClock(m) { const p = clockParts(m); return `${pad2(p.h)}:${pad2(p.min)}`; }
function periodOf(m) { const t = clockParts(m).minuteOfDay; return PERIODS.filter(p => p.from <= t).pop(); }

function fmtDuration(min) {
  min = Math.max(0, Math.round(min));
  if (min < 60) return `${min} min`;
  const d = Math.floor(min / DAY_MIN), h = Math.floor((min % DAY_MIN) / 60), m = min % 60;
  if (d) return `${d} d${h ? ' ' + h + ' h' : ''}`;
  return `${h} h${m ? ' ' + m + ' min' : ''}`;
}

// ── GM controls ──
async function setWorldMinutes(m) {
  m = Math.max(0, Math.round(m));
  await dbWrite('settings/clock', m);
  if (timedCooldownsOn()) await refreshTimedCooldowns();
}
async function advanceTime(delta) { await setWorldMinutes(worldMinutes() + delta); }

// jump to the NEXT time the given period begins (e.g. "Morning" from 14:30 -> tomorrow 07:00)
async function skipToPeriod(id) {
  if (!id) return;
  const p = id === 'night' ? PERIODS[6] : PERIODS.find(x => x.id === id);
  const now = worldMinutes(), dayStart = Math.floor(now / DAY_MIN) * DAY_MIN;
  let target = dayStart + p.from;
  if (target <= now) target += DAY_MIN;
  await setWorldMinutes(target);
}
async function setExactTime() {
  const day = Math.max(1, Number(document.getElementById('ck-day')?.value) || 1);
  const [h, m] = (document.getElementById('ck-time')?.value || '08:00').split(':').map(Number);
  await setWorldMinutes((day - 1) * DAY_MIN + (h || 0) * 60 + (m || 0));
}
async function setTimedCooldowns(on) {
  await dbWrite('settings/timeCooldowns', !!on);
  if (on) await refreshTimedCooldowns();
}

// Tidy up timed cooldowns the clock has already passed. (A cooldown past its time already
// reads as ready everywhere; this just removes the stale record.)
async function refreshTimedCooldowns() {
  const now = worldMinutes(), updates = {};
  Object.values(state.characters).forEach(c => Object.entries(c.cooldowns || {}).forEach(([k, v]) => {
    if (v && typeof v === 'object' && (Number(v.until) || 0) <= now) updates[`characters/${c.id}/cooldowns/${k}`] = null;
  }));
  if (Object.keys(updates).length) await dbUpdate(updates);
}

// A long rest: 8 hours pass, and everyone's "until rest" / "per battle" techniques come back.
// Timed cooldowns are NOT cleared by the rest itself — they come back when their hours have passed.
async function longRest() {
  await advanceTime(8 * 60);
  const updates = {};
  Object.values(state.characters).filter(c => !c.isNPC).forEach(c => Object.entries(c.cooldowns || {}).forEach(([k, v]) => {
    if (v === 'rest' || v === 'battle' || typeof v === 'number') updates[`characters/${c.id}/cooldowns/${k}`] = null;
  }));
  if (Object.keys(updates).length) await dbUpdate(updates);
  showToast('Long rest — 8 hours pass.');
}

// ── what each side sees ──
// Players: the approximate time of day only, never the hour.
function clockBadgeHtml() {
  const p = periodOf(worldMinutes());
  return `<span class="clock-badge" data-period="${p.id}" title="Time of day">${p.icon} ${p.label}</span>`;
}

// GM: the full control panel.
function clockPanelHtml() {
  const now = worldMinutes(), p = periodOf(now), parts = clockParts(now);
  const step = (d, label) => `<button class="btn ${d < 0 ? '' : ''}" onclick="advanceTime(${d})">${label}</button>`;
  return `
  <div class="gs-clock" data-period="${p.id}">
    <div class="ck-face"><span class="ck-ico">${p.icon}</span>
      <div><div class="ck-time">${fmtClock(now)}</div><div class="ck-day">Day ${parts.day} · ${p.label} <span class="sub">(players see only “${p.label}”)</span></div></div></div>
    <div class="ck-ctl">
      <div class="btn-row">${step(-60, '−1 h')}${step(-15, '−15 min')}${step(15, '+15 min')}${step(60, '+1 h')}${step(240, '+4 h')}</div>
      <div class="btn-row">
        <select onchange="skipToPeriod(this.value);this.value=''" aria-label="Skip to"><option value="">Skip to…</option>${['dawn', 'morning', 'midday', 'afternoon', 'evening', 'night'].map(id => `<option value="${id}">${PERIODS.find(x => x.id === id).label}</option>`).join('')}</select>
        <button class="btn" onclick="longRest()" title="8 hours pass; 'until rest' and 'per battle' techniques come back">Long rest (8 h)</button>
      </div>
      <div class="btn-row ck-set"><label>Day <input type="number" id="ck-day" min="1" value="${parts.day}" class="ck-in"></label>
        <label>Time <input type="time" id="ck-time" value="${fmtClock(now)}" class="ck-in"></label>
        <button class="btn small" onclick="setExactTime()">Set</button></div>
    </div>
    <label class="chk ck-timed" title="Experimental. Techniques with hour/day cooldowns become ready again by themselves when the clock passes their time. Off = they wait for a manual Rest."><input type="checkbox" ${timedCooldownsOn() ? 'checked' : ''} onchange="setTimedCooldowns(this.checked)"> Timed cooldowns <span class="sub">(off — hour/day cooldowns follow this clock)</span></label>
  </div>`;
}
