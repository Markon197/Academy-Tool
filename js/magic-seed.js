// ═══════════════════════════════════════════════════════════════
// MAGIC SCHOOLS — from "TLC - Magic Types.docx".
// Each school has a core mechanic (Stress, Malice, Instinct, Solar Intensity), its
// tables, and its techniques (active) and talents (passive).
//   TECHNIQUE = something you actively use (cooldown / cost / roll)
//   TALENT    = always on
// Entries marked (draft) are in the doc but look unfinished or come from another system.
// ═══════════════════════════════════════════════════════════════

const MAGIC_SCHOOLS = [
  {
    id: 'Psychomancy', color: '#b083e0', teacher: 'Prof. Ash',
    blurb: 'Magic that reaches into minds: commands, thoughts, emotions and memories. Taught by Prof. Seraphine Ash.',
    resource: null,
    sections: [
      { title: 'Soul-dependent power', lines: ['A psychomancer’s spells grow with their Soul. Puppet Thought gets harder to resist at Soul 6, longer at Soul 9 and can feel like the target’s own idea at Soul 12.', 'Resisted with Soul + Will. A target who resists realises something tried to enter their mind and gains +2 against that caster’s psychomancy for the rest of the scene.'] },
      { title: 'Also in the curriculum', lines: ['Psychostrike, Psychosteal and Psychosnap (Prof. Ash’s starter techniques) are listed under Techniques as Psychomancy.'] },
    ],
  },
  {
    id: 'Curseancy', color: '#e0546c', teacher: '',
    blurb: 'Curses, bad luck and cruelty. Powerful, but every cruel act feeds Malice.',
    resource: 'Malice',
    sections: [
      { title: 'Malice (core mechanic)', lines: [
        'You begin each day with 0 Malice.',
        'Gain +1 Malice when: a cursed target critically fails; a curse causes humiliation, panic or serious harm; you extend a curse instead of ending it; you curse someone out of anger, jealousy or spite; a target begs you to remove a curse and you refuse.',
        'At 3 Malice: +2 to Curseancy attack rolls, −2 to Empathy, healing and friendly persuasion rolls.',
        'At 5 Malice: roll a D6 on the Cruel Impulse table whenever Malice increases. You struggle to voluntarily end your curses.',
        'At 6 Malice: the GM may turn one harmless thought into a cruel action each scene. Malice cannot increase beyond 6.',
        'Reduce Malice by 1: voluntarily remove a useful curse / sincerely apologise to someone you harmed / accept humiliation or personal loss to protect another.',
        'Reset to 0: complete a meaningful act of mercy without reward.'] },
      { title: 'Cruel Impulse (D6, at 5+ Malice)', lines: [
        '1 Poisoned Tongue — you lose control of your speech for 1 action. The GM makes you reveal a secret, insult an ally or provoke the most dangerous nearby creature.',
        '2 Spite Bites Back — your strongest active curse is copied onto you for D3 rounds and cannot be removed by your own magic.',
        '3 Everybody Is Laughing — you become convinced everyone is mocking you: −5 to Presence, Empathy and concentration for D3 rounds; you cannot willingly accept help.',
        '4 The Cruelest Target — you immediately curse the nearest vulnerable creature (GM chooses: wounded allies, frightened characters, innocents). No action cost; normal cooldown applies.',
        '5 Words Leave Scars — every cruel thing you have said appears as cuts on your body: D10 damage, armour does not reduce it.',
        '6 Malice Takes Root — a whispering mouth, black eye or grasping hand grows on your body: +1 Stress. Until Malice falls below 3 it sometimes speaks your private thoughts aloud, and people who see it know you are corrupted.'] },
    ],
  },
  {
    id: 'Demonancy', color: '#ff7a59', teacher: '',
    blurb: 'Demon power fed by your own body. Every demon ability costs Stress, and Stress eventually breaks you.',
    resource: 'Stress',
    sections: [
      { title: 'Stress (core mechanic)', lines: [
        'Demon spells and abilities are all about dealing and managing Stress. Usually every demon spell creates 1 Stress for the character.',
        'At 6 Stress the character must roll a D6 on the Overload table. At 6 Stress you also gain a Ruin point.'] },
      { title: 'Overload (D6, at 6 Stress)', lines: [
        'Possession Surge — you lose control for 1 action. The GM controls your character (aggressive, efficient, not suicidal).',
        'Flesh Failure — your body partially gives in: take D10 damage.',
        'Something Crawls Out — a Lesser Demon crawls out of your mouth and keeps growing. It is hostile to everyone.',
        'Reality Slip — you phase briefly: negate all damage this round, then reappear in a slightly wrong position.',
        'The Whisper Approves — reduce all future Stress gain by 1 (min 0) for this fight… but something now knows you.',
        '(The document lists five results here; a sixth is not written yet.)'] },
    ],
  },
  {
    id: 'Animancy', color: '#5cc27f', teacher: '',
    blurb: 'Shape-shifting. The longer you stay an animal, the more Instinct takes over.',
    resource: 'Instinct',
    sections: [
      { title: 'Humanity and Instinct (core mechanic)', lines: [
        'The Animancer begins each day with 0 Instinct.',
        'Gain +1 Instinct when: remaining transformed for an entire scene; transforming while frightened, wounded or enraged; using an animal’s instincts to hunt or kill; sleeping in animal form; failing an Animancy roll.',
        'At 3 Instinct: −2 to social rolls requiring empathy, etiquette or restraint; +2 to tracking, perception and survival.',
        'At 5 Instinct: roll a D6 on the Feral Surge table whenever Instinct increases. You cannot voluntarily reduce Instinct without returning to human form.',
        'At 6 Instinct: you are trapped in your current animal form until your humanity is restored.',
        'Reduce Instinct by 1: share a meaningful human conversation / eat, rest or perform a familiar human routine / spend a quiet scene with the Familiar.',
        'Reset to 0: a full night’s rest in human form.'] },
      { title: 'Feral Surge (D6, at 5+ Instinct)', lines: [
        '1 Hunting Reflex — you pursue the nearest fleeing or wounded creature for 1 action. The GM controls your movement; you will not act suicidally.',
        '2 Territorial Display — choose the nearest unfamiliar creature as an intruder. You threaten, chase or attack it until it retreats or you succeed on Soul + Will.',
        '3 Speech Fails — your voice becomes growls, hisses or animal sounds: you cannot speak clearly or cast verbal spells for D3 rounds.',
        '4 Body Remembers — one animal trait remains after returning to human form (eyes, claws, fur, teeth, scent or tail): +2 to one relevant animal skill and −2 to social rolls until Instinct is reduced.',
        '5 Pack Confusion — you forget which companions are people and which are pack. Choose one ally as Pack and one as Rival; protect the Pack and distrust the Rival for the scene.',
        '6 Father Takes Control — your Familiar speaks with unnatural authority: reduce Instinct by 2, the Familiar chooses your next action. Something about his voice reveals he may not be an ordinary cat.'] },
    ],
  },
  {
    id: 'Sunmancy', color: '#e8c454', teacher: '',
    blurb: 'The Godmother: a support-controller who channels the sun to heal allies, expose corruption and punish supernatural evil. Her protection is warm but possessive: those she adopts become safer, but increasingly bound to her light.',
    resource: 'Solar Intensity',
    sections: [
      { title: 'Solar Intensity (core mechanic)', lines: [
        'At the start of each scene determine the current Solar Intensity from 0 to 5. The Godmother applies the listed modifier to all healing, cleansing, protection and radiant attack rolls.',
        '5 Zenith (cloudless, direct midday sun): +5. Radiant damage and healing are maximised; demons suffer −2 to resist Godmother spells.',
        '4 Bright Sun: +3. Cleansing spells may affect one level stronger afflictions.',
        '3 Daylight (ordinary daytime, light clouds): +1. No additional effect.',
        '2 Heavy Cloud (storm clouds, deep shade, dense forest): −1. Solar spell durations are reduced by 1 round.',
        '1 Moonlight (clear night with strong reflected moonlight): −3. Healing and radiant damage are halved; major curses and possessions cannot be cleansed.',
        '0 Sunless (cloudy night, underground, sealed interior, magical darkness): −5. Radiant attack spells deal minimum damage; healing and protection are halved; powerful Solar Magic cannot be cast.'] },
      { title: 'Solar exposure', lines: [
        'The Godmother uses the sunlight that actually reaches her, not just the weather outside.',
        'Moonlight is reflected sunlight and gives weak power. Mirrors may redirect sunlight but reduce Intensity by 1 per major reflection. Ordinary fire, lamps and electric light give no Intensity. Magically created sunlight gives an Intensity set by the spell, usually 2–4.',
        'Stored sunlight: see the Sun Vessel technique.'] },
      { title: 'Darkness Exposure', lines: [
        'When the Godmother stays at Solar Intensity 0 for too long, or when passed out, gain 1 Darkness Stress at the end of each scene. At 3 Stress, roll a D6 on this table whenever another point would be gained.',
        '1 The Light Abandons You — lose access to Solar spells for D3 rounds.',
        '2 Desperate Warmth — you drain warmth from the nearest living creature: it takes D6 damage and you heal the same. If no creature is near, take D6 damage instead.',
        '3 False Sunrise — you hallucinate a brilliant sunrise: blinded for 1 round, and you move toward the brightest visible object on your next action regardless of danger.',
        '4 Cast Out the Shadow — you identify the nearest creature as corrupted and immediately use an offensive or cleansing spell on it (GM chooses the target: demons, then cursed characters, then wounded allies).',
        '5 Something Answers — you call for the Godmother but something else responds: treat Solar Intensity as 3 for one spell, the spell gains +1 Stress, and an unknown entity now knows your location.',
        '6 Become the Beacon — your body erupts with unstable sunlight: Solar Intensity 5 around you for 1 round; nearby demons and cursed creatures take D10; you and nearby allies take D6. Afterwards you fall unconscious and Solar Intensity drops to 0.'] },
    ],
  },
  {
    id: 'Warfare', color: '#c9a227', teacher: '',
    blurb: 'Martial talents. (Only Parry is written down so far.)',
    resource: null,
    sections: [],
  },
  {
    id: 'Veritancy', color: '#5aa4e8', teacher: '',
    blurb: 'The document has a Veritancy heading but nothing written under it yet.',
    resource: null,
    sections: [],
  },
];

// ── compact builders: S = technique, T = talent ──
let _mg = 0;
const MS = (school, name, level, cast, roll, cd, effect, extra) => ({ id: 'mg_s_' + (++_mg), name, school, origin: school, cast: cast || '', cooldownCost: cd || '', levelRequirement: level || 0, roll: roll || '', effect, secret: false, ...(extra || {}) });
const MT = (school, name, level, effect, extra) => ({ id: 'mg_t_' + (++_mg), name, school, type: school, levelRequirements: [level || 1], description: effect, secret: false, ...(extra || {}) });

const MAGIC_SEED = {
  skills: [
    // ── Psychomancy ──
    MS('Psychomancy', 'Puppet Thought', 4, 'Instant · Control', 'Soul + Presence', 'CD 5', 'Plants a simple command inside a target’s mind for 1 round. The target must follow it unless it would cause obvious self-destruction. Soul-dependent: Soul 6+ target suffers −2 on resistance rolls; Soul 9+ the command lasts 2 rounds if it fits the target’s emotions; Soul 12+ you may implant a command the target believes was their own idea. RESIST: Soul + Will — on resist the target realises something tried to enter their mind and gains +2 against your psychomancy for the rest of the scene.'),
    MS('Psychomancy', 'Overwrite Will', 7, 'Instant · Control', 'Soul + Presence', 'Once per battle', 'Force your will directly over a target’s mind for 1 round, turning them into a temporary extension of yourself. On success choose one: Confess — the target blurts out one truth they were trying to hide. (Other options are not written yet.)'),
    // ── Curseancy ──
    MS('Curseancy', 'You Are Cursed', 1, 'Instant · Attack', 'Soul + Presence', 'CD 3', 'Curse one Attribute or Skill for 5 rounds. Affected rolls suffer the D20/2 malus. The same effect cannot be cursed twice.'),
    MS('Curseancy', 'Cruel Nickname', 1, 'Instant · Attack', 'Soul + Presence', 'CD 3', 'Give the target a cursed name for 3 rounds. Whenever someone speaks the name, the target suffers −2 to its next roll. On crit: the target begins believing the name describes its true nature.'),
    MS('Curseancy', 'Splinter in the Mind', 2, 'Instant · Attack', 'Soul + Will', 'CD 3', 'Plant one irritating thought in the target’s mind for 3 rounds. Choose: doubt, jealousy, embarrassment or suspicion. The target suffers −3 when acting against the thought. On failure: the thought briefly affects you instead.'),
    MS('Curseancy', 'Curse of Knowledge', 2, 'Preparation', 'Mind + Craft', 'Once per day', 'Secretly curse one object. You always know if it is moved, opened, damaged or stolen. The roll determines range and duration.'),
    MS('Curseancy', 'Tongue of Thorns', 2, 'Instant · Attack', 'Soul + Presence', 'CD 4', 'Curse the target’s speech for 3 rounds. Whenever it lies, insults someone or casts a verbal spell it takes D6 damage. On crit: its words emerge as obvious whispers, hisses or screams.'),
    MS('Curseancy', 'Everything Goes Wrong', 3, 'Instant · Attack', 'Soul + Craft', 'Once per encounter', 'Curse the target with escalating bad luck for 3 rounds. The first failed roll suffers an additional minor complication; each further failure increases the severity. On crit: the curse lasts until the target succeeds on a difficult roll.'),
    MS('Curseancy', 'Borrowed Pain', 3, 'Reaction', 'Soul + Will', 'CD 3', 'When you take damage, transfer half of it to a cursed target. The target may resist with Soul + Will. On failure: you take the full damage and gain +1 Malice.'),
    MS('Curseancy', 'Make Them Laugh', 3, 'Instant · Attack', 'Soul + Presence', 'CD 4', 'Curse one target with uncontrollable laughter for 1 round. It cannot attack or cast spells requiring speech. Nearby enemies may become distracted or unsettled. On crit: the laughter continues for D3 rounds.'),
    MS('Curseancy', 'The Hurt Returns', 4, 'Sustained · Attack', 'Soul + Will', 'Once per encounter', 'Mark one target for 3 rounds. Whenever it damages another creature, it suffers half the damage dealt. On crit: it also experiences the victim’s fear or pain.'),
    MS('Curseancy', 'You Are Cursed to Dance!', 5, 'Instant · Attack', 'Soul + Reflex', 'CD 5', 'RESIST: Soul + Reflex. The target is seized by a twitching, unnatural dance for 1 round. It cannot attack but may defend if the action fits the dance. On crit: the dance lasts D3 rounds.'),
    MS('Curseancy', 'A Thousand Tiny Miseries', 5, 'Instant · Attack', 'Soul + Craft', 'Once per battle', 'Afflict one target with several minor curses for 5 rounds. Choose three: itching, blurred sight, whispered insults, clumsy hands, phantom insects, foul taste, stumbling or uncontrollable tears. Each gives −2 to relevant rolls. On crit: choose five. Gain +1 Malice.'),
    MS('Curseancy', 'The Joke Stops Being Funny', 6, 'Instant · Attack', 'Soul + Presence', 'Once per battle', 'Transform every active minor curse on one target into direct damage: D6 per active curse, and all consumed curses end. On crit: one curse remains active. Gain +1 Malice.'),
    // ── Demonancy (each: +1 Stress unless noted) ──
    MS('Demonancy', 'Demon Blood', 0, 'Instant', '', '+1 Stress', 'Take a bit of your demonic blood and infuse your weapon with it, adding poison damage of D4 on your next attacks.'),
    MS('Demonancy', 'Eat My Flesh', 1, 'Instant', 'Body + Endurance', '+1 Stress', 'Tear flesh and consume it: heal D10 (or D20/2). On failure: heal half and take 2 damage.'),
    MS('Demonancy', 'Bone Marionette', 4, 'Sustained · 3 rounds', 'Soul + Craft', '3 rounds · +1 Stress', 'Seize control of a target’s body, forcing their movement and actions for the duration. The target stays fully conscious and cannot use any of their skills. On failure: you only disrupt their control — the target suffers TN +3 to all rolls for 1 round. RESIST: Soul + Will.'),
    MS('Demonancy', 'Rend the Inside', 5, 'Instant', 'Soul + Force', '+1 Stress', 'Deal pure internal damage (ignores armor). If the target is wounded: +5 to the roll. On crit: the target is briefly stunned.'),
    MS('Demonancy', 'Grasp of the Below', 5, 'Sustained · 2 rounds', 'Soul + Force', '2 rounds · +1 Stress', 'A target is held by demonic limbs emerging from your back (every five dice rolls, one limb). On failure: targets are slowed instead. RESIST: Body + Force.'),
    MS('Demonancy', 'Walk Through Hell and Back', 5, 'Instant', 'Soul + Endurance', '+1 Stress', 'Disappear and reappear anywhere. Deal AOE damage on arrival. On failure: you reappear in a dangerous or exposed position.'),
    MS('Demonancy', 'Steal the Turn', 9, 'Instant', 'Soul + Reflex', '+2 Stress', 'Immediately take two full actions in a row. On failure: lose your next turn and take D6 damage.'),
    // ── Animancy ──
    MS('Animancy', 'Animal Form', 1, 'Sustained', 'Soul + Will', '', 'Transform into one ordinary, non-magical animal of small size or smaller. Gear and magical bonuses merge into the form. Mind, Soul and mental skills stay the same; physical Attributes, senses and movement become the animal’s. You cannot speak, cast spells or use complex equipment. Damage remains after returning to human form. Animal-control magic does not affect you. Gain +1 Instinct after one full scene transformed.'),
    MS('Animancy', 'Borrowed Shape', 2, 'Instant', 'Soul + Empathy', 'CD 3', 'Copy one visible animal feature for 3 rounds (night vision, claws, scent, gills, fur, climbing feet). Only one feature may be active. On failure: gain +1 Instinct.'),
    MS('Animancy', 'The Beast Remembers', 2, 'Instant', 'Soul + Empathy', 'Once per animal', 'Read the strongest recent instinct of a nearby animal: learn what it feared, hunted, protected or fled from. On crit: see a brief memory through its senses. Gain +1 Instinct if the memory involves violence or terror.'),
    MS('Animancy', 'Predator Form', 3, 'Sustained', 'Soul + Will', 'Once every 6 hours', 'Transform into a wolf, large cat or similar predator. Gain the animal’s physical Attributes, senses and natural attacks. You cannot speak or cast spells. When you wound a creature, roll Soul + Will or gain +1 Instinct.'),
    MS('Animancy', 'Call of the Pack', 3, 'Instant', 'Soul + Presence', 'Once per scene', 'Calm, guide or rally nearby ordinary animals. Friendly animals may follow one simple command; hostile animals hesitate for 1 round. At 3+ Instinct: +3 to the roll. At 5+ Instinct: animals treat you as one of their own, but humans find your behaviour unsettling.'),
    MS('Animancy', 'Great Beast Form', 5, 'Sustained', 'Soul + Force', 'Once per day', 'Transform into a bear or another approved large animal. Gain its physical Attributes, combat values and natural attacks. Transformation takes 1 round. You cannot speak or cast spells. Damage remains after returning to human form. Gain +1 Instinct immediately and after every full scene transformed.'),
    MS('Animancy', 'Familiar’s Warning', 1, 'Reaction · Familiar', '', 'Once per scene', 'Your cat Familiar warns you of immediate supernatural danger: gain +3 to one perception, resistance or initiative roll. The Familiar must be nearby and conscious.'),
    MS('Animancy', 'Nine Lives Between Us', 4, 'Reaction · Familiar', '', 'Once per session', 'When you or the Familiar would fall to 0 Life, the other may absorb half the damage. Both gain +1 Stress and the Familiar loses one of its Nine Lives.'),
    // ── Sunmancy (the Godmother) ──
    MS('Sunmancy', 'Godmother’s Embrace', 1, 'Instant', 'Soul + Empathy', 'CD 5', 'Heal one visible target: a beam of light heals the target for the check result in hit points. Daylight: normal healing. In the dark: halved.'),
    MS('Sunmancy', 'Sun Vessel', 2, 'Preparation · Solar Ritual', 'Soul + Craft', '', 'Store the current Solar Intensity inside an object. The vessel may later provide that Intensity for one spell. Max stored Intensity 3. The sunlight fades at the next sunrise. Only one Sun Vessel may be carried at a time.'),
    MS('Sunmancy', 'The Sun Sees You', 3, 'Instant', 'Soul + Presence', 'CD 3', 'Shine a light on a target for 5 rounds. Reveal illusions, disguises and magical concealment affecting it. Sense whether it is cursed, possessed or demonic. Daylight: allies gain +2 when attacking or investigating it.'),
    MS('Sunmancy', 'Scouring Light', 3, 'Instant · Attack', 'Soul + Will', 'CD 2', 'Deal magical damage to one target. Demons, undead and possessed entities suffer additional damage and cannot regenerate for 1 round.'),
    MS('Sunmancy', 'A Mother Knows', 5, 'Instant · Inquisition', 'Soul + Empathy', 'Once per 12 hours', 'Ask the target one emotionally charged question. Sense the strongest emotion connected to its answer and whether it deliberately lies. Against demons: glimpse the desire, pact or trauma it has reduced.'),
    MS('Sunmancy', 'Noon Without Mercy', 5, 'Instant · Attack', 'Soul + Presence', 'Once per battle', 'Strike a small area with concentrated sunlight. Reveal all creatures and remove illusions within the area. Demons and cursed creatures suffer heavy damage; ordinary creatures suffer moderate damage only if consciously condemned. Daylight: maximum damage. Night: sacrifice Life, stored sunlight or 1 Devotion to cast.'),
    MS('Sunmancy', 'Circle of the Kindly Sun', 6, 'Sustained', 'Soul + Presence', 'Once per encounter', 'Create a protective circle around yourself for 3 rounds. Allies inside gain resistance to fear, curses and possession; demons entering must pass a Will roll or be repelled. Daylight: allies inside recover minor Life each round. Night: reduced radius, but enemies inside cannot become invisible.'),
  ],
  talents: [
    MT('Psychomancy', 'Manipulator', 1, 'A master of magically affecting other people’s minds: +2 to all mind-affecting spells, and great at manipulating people in real life.'),
    MT('Warfare', 'Parry', 1, 'You have learned to parry melee attacks. If you have a close combat weapon drawn, gain +1 per talent rank to your Defense against any melee attack you are aware of that does not come from behind.'),
    // Curseancy
    MT('Curseancy', 'Salt in the Wound', 1, '+1 per talent rank when cursing a wounded, frightened, embarrassed or isolated target.'),
    MT('Curseancy', 'Lingering Spite', 2, 'Your curses last 1 additional round per talent rank. Voluntarily extending a curse beyond its normal duration gains +1 Malice.'),
    MT('Curseancy', 'Kick Them While They’re Down', 2, 'When a cursed target fails a roll, gain +2 to your next roll against it. On a critical failure: reduce one active cooldown by 1 round.'),
    MT('Curseancy', 'Misery Loves Company', 3, 'When a cursed target fails a roll, one nearby creature suffers −2 to its next roll. At Rank III you choose the affected creature.'),
    MT('Curseancy', 'Creeping Reputation', 3, 'People who witness your curses become uneasy around you. Gain +1 per talent rank to intimidation; suffer the same penalty to friendly first impressions.'),
    MT('Curseancy', 'Curse Eater', 4, 'Remove one curse from another creature and absorb it (gain +1 Malice). You may place the absorbed curse on another target within the same scene. Uses: once per day per talent rank.'),
    // Demonancy
    MT('Demonancy', 'Feed the Engine', 4, 'Each time you gain Stress, heal 2 HP. At 5+ Stress: heal 2 instead.'),
    MT('Demonancy', 'Efficient Corruption', 5, 'The first demon ability each combat generates 0 Stress.'),
    MT('Demonancy', 'Chain Casting', 5, 'If you use 2 demon abilities in one turn, the second gains +3. If you use 3, the third gains +5 and you immediately trigger Overload afterwards.'),
    MT('Demonancy', 'Spillover', 5, 'When you trigger Overload, deal small D6 AOE damage around you.'),
    MT('Demonancy', 'Absorb Life', 5, 'Whenever someone dies within 3m of you, absorb +2 HP.'),
    MT('Demonancy', 'Hold the Breaking Point', 9, 'You may go up to 8 Stress, BUT the Overload roll becomes a D8: 7–8 = something very bad (GM decides).'),
    MT('Demonancy', 'Blood Shield (draft)', 0, 'You may raise your defense by 2 if you sacrifice 2 HP. Lasts D20 rounds and counts as a free action.'),
    MT('Demonancy', 'Cooldown Sacrifice (draft)', 0, 'Sacrifice 1 HP per talent rank (a free action) to reduce the cooldown of a spell currently cooling down by 1 round per HP spent.'),
    MT('Demonancy', 'Demon Spawn (draft)', 0, 'Summon one additional demon per talent rank when performing a conjuration. The demons must be of identical type; no extra summoning circles or check rolls. If the summoning fails, all the demons gang up on the summoner.'),
    MT('Demonancy', 'Circle Master (draft)', 0, 'A master at drawing summoning circles: invest 2 additional hours of work per talent rank; the time needed is lowered by 15 minutes per initially required hour per talent rank; +1 bonus on summoning per talent rank, even with improvised circles.'),
    // Animancy
    MT('Animancy', 'Human Anchor', 1, 'Spending a quiet scene speaking with or caring for your Familiar removes 1 Instinct. The Familiar always recognises you in animal form. If the Familiar is absent, missing or unconscious, Instinct cannot be reduced below 2.'),
    // Sunmancy
    MT('Sunmancy', 'Child of the Sun', 1, 'Gain +1 per talent rank to healing, protective and radiant spells while in daylight. Rank II: resistance to fear and curses in direct sunlight. Rank III: once per scene, turn a failed Solar Magic roll into a partial success.'),
    MT('Sunmancy', 'Adopted by the Light', 2, 'After healing or protecting an ally, designate it as your Ward until the scene ends. You always know whether your Ward is injured, terrified, cursed or possessed. You may have 1 Ward per talent rank.'),
    MT('Sunmancy', 'Emotional Aftershock (Inquisition)', 2, 'Demons, possessed creatures and cursed targets damaged by you suffer a penalty to their next action. On crit: the target becomes frightened, remorseful, enraged or briefly lucid.'),
    MT('Sunmancy', 'No Shadow Without Shape (Inquisition)', 3, 'Gain +1 per talent rank when investigating curses, possession, demonic contracts and supernatural concealment. In direct sunlight: sense the direction a curse or possession originated from. Rank 2: recognise the magical signature of previously met demons and cults.'),
    MT('Sunmancy', 'Last Light of Evening (Healing)', 4, 'Once per night, when an ally would fall to 0 Life, leave them at 1 Life instead. After use: suffer −3 to healing rolls until dawn, or gain +1 Stress.'),
    MT('Sunmancy', 'The Congregation (Cult)', 7, 'Gain Devotion from followers, believers and grateful characters. Store 1 Devotion per talent rank. Spend 1 Devotion to strengthen a spell at night, reroll a healing or cleansing roll, extend a circle by 1 round or cast through a willing follower. Devotion is easier to gain from frightened or emotionally dependent characters.'),
  ],
};

// Which magic school (if any) a curriculum entry belongs to. Older entries only have a free-text
// origin like "Prof. Ash / Psycholancy", so we also look for a school's name in there.
const SCHOOL_ALIASES = { psycholancy: 'Psychomancy', psychomancy: 'Psychomancy', curseancy: 'Curseancy', curse: 'Curseancy', demonancy: 'Demonancy', animancy: 'Animancy', sunmancy: 'Sunmancy', solarmancy: 'Sunmancy', godmother: 'Sunmancy', warfare: 'Warfare', veritancy: 'Veritancy' };
function schoolOf(x) {
  if (x.school) return x.school;
  const tokens = ((x.origin || '') + ' / ' + (x.type || '')).toLowerCase().split(/[\/,&]+/).map(s => s.trim());
  for (const t of tokens) if (SCHOOL_ALIASES[t]) return SCHOOL_ALIASES[t];
  return '';
}
