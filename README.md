# The Last Curriculum — Academy Tool

A live table companion for the *Last Curriculum* RPG: character sheets, combat, the
curriculum (talents / techniques / professors / clubs / archetypes), the Mission Ledger
and a loot library. Plain HTML/CSS/JS — no build step.

## Run it

Open `index.html` through any static server, e.g. `python -m http.server 8791`, or on Windows
without Python: `powershell -ExecutionPolicy Bypass -File serve.ps1`. Then choose **Demo: GM**
(or Demo: Player) on the login screen — no database needed.

For a real campaign, create a Firebase Realtime Database, use **Set up** to enter its URL and a GM
PIN, and give each player their character's PIN.

## Rules the tool implements (`js/rules.js`)

| Rule | Implementation |
|---|---|
| 3 Pillars (Body/Mind/Soul), 3 Skills each | Character sheet, editable by the GM |
| Roll d20 ≤ Pillar + Skill; 1 = crit, 20 = fumble | `gradeRoll` / roller drawer / one-click Moves |
| LIFE = (Body + Mind + Soul) × 2 | `lifeMax` (manual override available for NPCs) |
| 0 LIFE = down; death buffer = Body | `lifeStatus`, shown on sheet and combat card |
| Initiative = Body + Reflex, players first unless ambushed | Combat → *Sort by initiative* |
| 1 offensive + 1 neutral action, 1 reaction | Action pips on each combat card |
| Focus = 1 reroll | "Spend 1 Focus to reroll" on the roll result |
| Technique cooldowns / costs | Free text like `CD 2`, `Once per battle`, `Spend 1 Focus` is parsed and enforced |
| Three Seals per mission | Ledger tab |

### Real dice by default

The table rolls physical dice. Sheets show each move's target number ("roll a d20 at or under 17")
instead of roll buttons, and using a technique only applies its cost and cooldown. The GM can switch
on in-app rolling with the **Digital dice** checkbox in the header (stored as `settings.digitalRolls`).

### House-rule setting

"High success" and "Perfect success" are not precisely defined in the rule sheet. The tool treats a
roll exactly on the target (capped at 19) as *perfect* and a roll within 3 below it as *high*.
Change the window via `state.settings.highWindow`.

## Data

- `js/curriculum-seed.js` — talents, techniques, professors, clubs (from *The Last Curriculum - Overview.xlsx*)
- `js/loot-seed.js` — loot tables (from *LOOT.xlsx*)
- `js/rules-seed.js` — archetypes, mission loot, Mission 1 seals
- `js/demo.js` — demo characters, including the real Packson, Varn, Aethyrix and Gladius sheets.
  **The four PCs' stats are placeholders** until their real sheets are entered.

The Curriculum tab's **Import campaign data** button adds anything missing and never overwrites edits.

## Known limitations

- Access control is client-side only. A player who opens the browser dev tools can read the whole
  campaign tree (including GM notes and secrets). Fine for a trusted table; if that matters, lock the
  Firebase database down with security rules and move secrets to a GM-only path.
- PINs are stored in the database (the GM PIN base64-encoded, player PINs in plain text).

## Status tab (the live screen)

The first tab, and the default for everyone.

- **Players:** one screen with no scrolling — big LIFE with −5/−1/+1/+5, Focus/Energy/Stress counters, tap-to-toggle
  status effects, and the three pillars with their skills (tap a skill to see the number to roll under). Revealed
  allies/enemies show as a name and health band only. Starts in focus mode (header hidden); the ☰ button opens a menu.
- **GM:** all four players with big life controls, group actions (damage/heal/full heal/rest/clear effects), a live feed
  of what players changed, and a Scene section to bring allies and enemies in (👁 reveals or hides them to players).
- The old Combat tab is hidden for everyone; the **Combat tab** checkbox in the GM header brings it back.

## Deploying an update

Local scripts and styles in `index.html` carry a `?v=` stamp so browsers never mix old and new files after a deploy.
Re-stamp before pushing:

```
V=$(date +%Y%m%d%H%M); sed -i -E "s#(src=\"js/[a-z-]+\.js)(\?v=[0-9a-z]+)?\"#\1?v=$V\"#g; s#(href=\"css/[a-z-]+\.css)(\?v=[0-9a-z]+)?\"#\1?v=$V\"#g" index.html
```

(It only touches the local `js/` and `css/` references, not the Firebase CDN scripts.)
