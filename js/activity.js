// ═══════════════════════════════════════════════════════════════
// ACTIVITY — the GM's notice board.
// Whenever a *player* changes something on their sheet (LIFE, Focus,
// Energy, Stress, using a technique, resting) an entry is written to
// state.activity. The GM sees an unread count on the bell in the header, a
// toast when something happens live, and the full list in a drawer.
// Rapid repeat changes to the same value (tapping + three times) merge into
// one entry ("Stress 1 → 4") instead of flooding the board.
// ═══════════════════════════════════════════════════════════════

const ACTIVITY_LIMIT = 100;
const COALESCE_MS = 20000;
const FIELD_LABEL = { life: 'LIFE', focus: 'Focus', energy: 'Energy', stress: 'Stress' };
let noticesOpen = false;
let noticeBaseline = null;   // newest entry timestamp already announced on this device

function noticesSeen() { try { return Number(localStorage.getItem('academy_notices_seen')) || 0; } catch (e) { return 0; } }
function setNoticesSeen(ts) { try { localStorage.setItem('academy_notices_seen', String(ts)); } catch (e) {} }
function activityList() { return Object.values(state.activity || {}).sort((a, b) => b.ts - a.ts); }

// A numeric value changed on a player's own sheet.
async function notifyChange(c, field, from, to) {
  if (session.role !== 'player' || from === to) return;
  const now = Date.now();
  const recent = activityList().find(a => a.charId === c.id && a.key === field && now - a.ts < COALESCE_MS);
  const label = FIELD_LABEL[field] || field;
  if (recent) {
    // keep the original starting value, update the end value
    const text = `${c.name}: ${label} ${recent.from} → ${to}`;
    await dbUpdate({ [`activity/${recent.id}/to`]: to, [`activity/${recent.id}/text`]: text, [`activity/${recent.id}/ts`]: now });
    return;
  }
  await writeActivity({ charId: c.id, who: c.name, key: field, from, to, text: `${c.name}: ${label} ${from} → ${to}` });
}

// Something happened that isn't a number change ("used Cleaving Arc").
async function notifyEvent(c, text) {
  if (session.role !== 'player') return;
  const full = `${c.name} ${text}`;
  if (activityList().some(a => a.key === 'event' && a.text === full && Date.now() - a.ts < 8000)) return;   // don't repeat identical taps
  await writeActivity({ charId: c.id, who: c.name, key: 'event', text: full });
}

async function writeActivity(entry) {
  const id = uid();
  const updates = { ['activity/' + id]: JSON.parse(JSON.stringify({ ...entry, id, ts: Date.now() })) };
  activityList().slice(ACTIVITY_LIMIT - 1).forEach(a => { updates['activity/' + a.id] = null; });
  await dbUpdate(updates);
}

// ── GM UI ──
function toggleNotices() {
  noticesOpen = !noticesOpen;
  document.getElementById('notices').classList.toggle('open', noticesOpen);
  if (noticesOpen) { noticesSeenAtOpen = noticesSeen(); renderNotices(); setNoticesSeen(Date.now()); updateNoticeBadge(); }
}

function updateNoticeBadge() {
  const btn = document.getElementById('notice-btn');
  if (!btn) return;
  const unread = noticesOpen ? 0 : activityList().filter(a => a.ts > noticesSeen()).length;
  document.getElementById('notice-count').textContent = unread;
  btn.classList.toggle('has-unread', unread > 0);
}

function timeAgo(ts) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return Math.round(s / 60) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  return new Date(ts).toLocaleDateString();
}

function renderNotices() {
  const root = document.getElementById('notices-body');
  if (!root) return;
  const list = activityList();
  root.innerHTML = `
    <div class="btn-row" style="margin-bottom:12px">
      <button class="btn small" onclick="setNoticesSeen(Date.now());updateNoticeBadge();renderNotices()">Mark all read</button>
      <button class="btn small danger" onclick="clearNotices()" ${list.length ? '' : 'disabled'}>Clear all</button>
    </div>
    ${list.length ? list.map(a => `
      <div class="notice ${a.ts > noticesSeenAtOpen ? 'new' : ''}" onclick="openNoticeChar('${a.charId}')">
        <div>${escapeHtml(a.text)}</div><div class="lr-sub">${timeAgo(a.ts)}</div>
      </div>`).join('') : '<div class="empty-state" style="padding:12px">Nothing yet. When a player changes something on their sheet it shows up here.</div>'}`;
}
let noticesSeenAtOpen = 0;

function openNoticeChar(id) {
  if (!state.characters[id]) return;
  toggleNotices();
  switchView('view-characters');
  openChar(id);
}
async function clearNotices() {
  if (!confirm('Clear the whole notice board?')) return;
  await dbWrite('activity', null);
  setNoticesSeen(Date.now());
}

// Called on every render: refresh the badge, keep the drawer current, and
// announce anything new that happened while the GM has the app open.
function checkActivity() {
  if (session.role !== 'gm') return;
  const list = activityList();
  const newest = list.length ? list[0].ts : 0;
  if (noticeBaseline === null) noticeBaseline = newest;   // don't announce history on load
  else if (newest > noticeBaseline) {
    const fresh = list.filter(a => a.ts > noticeBaseline);
    noticeBaseline = newest;
    if (!noticesOpen) showToast('🔔 ' + fresh[0].text + (fresh.length > 1 ? ` (+${fresh.length - 1} more)` : ''));
  }
  if (noticesOpen) { renderNotices(); setNoticesSeen(Date.now()); }
  updateNoticeBadge();
}
