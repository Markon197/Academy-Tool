// ═══════════════════════════════════════════════════════════════
// Auto-generated from "The Last Curriculum - Overview.xlsx" (DM data).
// Talents/Skills/Professors/Clubs pulled 1:1 from the spreadsheet.
// Loaded into state via importCurriculum() (talents.js), triggered by
// the GM-only "Regelwerk importieren" button in the Talente tab.
// ═══════════════════════════════════════════════════════════════

const CURRICULUM_SEED = {
  "talents": [
    {
      "id": "tal_1",
      "name": "Backstabber",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your damage when attacking a target that is unaware, restrained, or engaged by an ally.",
      "secret": false
    },
    {
      "id": "tal_2",
      "name": "High Ground",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your damage when attacking from above, or defending while holding higher ground.",
      "secret": false
    },
    {
      "id": "tal_3",
      "name": "Opportunist",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your damage when attacking a target that is prone, stunned, or entangled.",
      "secret": false
    },
    {
      "id": "tal_4",
      "name": "Catcher",
      "type": "General",
      "levelRequirements": [
        1
      ],
      "description": "You are a rugby pro. +3 on catching things (+1 when it's an arrow)",
      "secret": false
    },
    {
      "id": "tal_5",
      "name": "Counterpunch",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+2 to your roll on your next attack against an enemy who just missed you with a melee attack.",
      "secret": false
    },
    {
      "id": "tal_6",
      "name": "Dirty Fighter",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when you exploit the environment for a cheap trick (sand, table flip, bottle smash, knee kick).",
      "secret": false
    },
    {
      "id": "tal_7",
      "name": "Power Swing",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when your intent is to break something (door, shield, lock, barrier) rather than strike cleanly.",
      "secret": false
    },
    {
      "id": "tal_8",
      "name": "Last Breath",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when you’re in your last 5 HP zone, and the roll is to survive, escape, or protect someone.",
      "secret": false
    },
    {
      "id": "tal_9",
      "name": "Executioner",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your damage when finishing an enemy who is already badly hurt or cannot defend properly (GM call).",
      "secret": false
    },
    {
      "id": "tal_10",
      "name": "Silent Step",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when hiding, sneaking, or staying unseen in confined/indoor spaces",
      "secret": false
    },
    {
      "id": "tal_11",
      "name": "Trap Sense",
      "type": "General",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when noticing pressure plates, tripwires, runes, or ambush signs before they trigger.",
      "secret": false
    },
    {
      "id": "tal_12",
      "name": "Tracker",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when following footprints, blood trails, scent, residue, or disturbed terrain.",
      "secret": false
    },
    {
      "id": "tal_13",
      "name": "Intimidating Presence",
      "type": "General",
      "levelRequirements": [
        1
      ],
      "description": "Gain +3 on Intidimation rolls made to threaten, pressure, or dominate.",
      "secret": false
    },
    {
      "id": "tal_14",
      "name": "Hall Pass Forgery",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when convincing staff you’re allowed to be somewhere you shouldn’t or when sneaking past staff during busy moments (bell, shift change, assemblies",
      "secret": false
    },
    {
      "id": "tal_15",
      "name": "Group Project Parasite",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when taking credit, redirecting blame, or quietly letting others do the work.",
      "secret": false
    },
    {
      "id": "tal_16",
      "name": "Perfect Attendance",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when appealing to rules, procedure, and “I was in class” credibility to avoid suspicion or punishment.",
      "secret": false
    },
    {
      "id": "tal_17",
      "name": "Rumour Shield",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when resisting social pressure, intimidation, or humiliation in front of other students.",
      "secret": false
    },
    {
      "id": "tal_18",
      "name": "Cafeteria Diplomacy",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when negotiating, trading, or de-escalating conflict",
      "secret": false
    },
    {
      "id": "tal_19",
      "name": "Reputation: Problem Student",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+1 to your roll when you lean into being underestimated, dismissed, or written off to get away with something.",
      "secret": false
    },
    {
      "id": "tal_20",
      "name": "Fierce Rival",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "You somehow always end up on other other side of her / him. You can't outrun your fierce rival",
      "secret": false
    },
    {
      "id": "tal_21",
      "name": "Aura Farming",
      "type": "General",
      "levelRequirements": [
        1
      ],
      "description": "+3 on Presence checks when aura farming. Wherever you are, there is somehow wind going through your hair and cape",
      "secret": false
    },
    {
      "id": "tal_22",
      "name": "Bullshiter",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 on Lying checks",
      "secret": false
    },
    {
      "id": "tal_23",
      "name": "The chronic late comer",
      "type": "General",
      "levelRequirements": [
        1
      ],
      "description": "You are always 5mins late. You always enter classes and meetups late. You always miss out on the first round of combat, but when you enter it's always a surprise",
      "secret": false
    },
    {
      "id": "tal_24",
      "name": "Fan Club",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "You have two to three devout fans who are useless in combat but will follow you around, be useful in non combat activities and will generally hype you up",
      "secret": false
    },
    {
      "id": "tal_25",
      "name": "Copycat Genius",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+2 to your roll when mimicking someone else’s technique, handwriting, accent, or spell style after seeing it once.",
      "secret": false
    },
    {
      "id": "tal_26",
      "name": "Class Clown Timing",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "+3 to your roll when using humour to distract, defuse, or buy time in a tense situation.",
      "secret": false
    },
    {
      "id": "tal_27",
      "name": "Say my name",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+1 to your roll when saying the name of the attack / Skill",
      "secret": false
    },
    {
      "id": "tal_28",
      "name": "SHOUTING MAKES THINGS BETTER",
      "type": "Fight",
      "levelRequirements": [
        1
      ],
      "description": "+1 to your roll when shouting during the attack",
      "secret": false
    },
    {
      "id": "tal_29",
      "name": "Second Wind",
      "type": "Health",
      "levelRequirements": [
        3
      ],
      "description": "Once per combat, regain a small chunk of HP after you drop an enemy, protect an ally, or survive a bad hit.",
      "secret": false
    },
    {
      "id": "tal_30",
      "name": "Mean Streak",
      "type": "Fight",
      "levelRequirements": [
        3
      ],
      "description": "+3 to your damage against enemies who already hurt you this fight.",
      "secret": false
    },
    {
      "id": "tal_31",
      "name": "Nerves of Steel",
      "type": "RP",
      "levelRequirements": [
        3
      ],
      "description": "+3 to your roll when resisting fear, panic, intimidation, gore, or supernatural pressure.",
      "secret": false
    },
    {
      "id": "tal_32",
      "name": "Relentless",
      "type": "Fight",
      "levelRequirements": [
        3
      ],
      "description": "If your first attack against an enemy fails, gain +2 on your roll to your next attack against the same target. Does not stack",
      "secret": false
    },
    {
      "id": "tal_33",
      "name": "Ritual Eye",
      "type": "General",
      "levelRequirements": [
        3
      ],
      "description": "+3 to your roll when identifying the weak point, anchor, flaw, or missing piece in a magical effect or summoning.",
      "secret": false
    },
    {
      "id": "tal_34",
      "name": "Not On My Watch",
      "type": "Fight",
      "levelRequirements": [
        3
      ],
      "description": "Once per combat, you may take a hit, effect, or consequence meant for an adjacent ally.",
      "secret": false
    },
    {
      "id": "tal_35",
      "name": "Unholy Pattern Recognition",
      "type": "",
      "levelRequirements": [
        6
      ],
      "description": "=+3 to your roll when connecting strange clues, repeated symbols, timelines, testimonies, or ritual fragments.",
      "secret": false
    },
    {
      "id": "tal_36",
      "name": "Walk It Off",
      "type": "",
      "levelRequirements": [
        6
      ],
      "description": "Once per combat, reduce the severity of one minor injury, condition, or painful consequence by pure stubbornness.",
      "secret": false
    },
    {
      "id": "tal_37",
      "name": "Unyielding Resolve",
      "type": "",
      "levelRequirements": [
        7
      ],
      "description": "Once per day, if you reach 0HP, you will stay standing with 1HP",
      "secret": false
    },
    {
      "id": "tal_38",
      "name": "Break the Sigil",
      "type": "",
      "levelRequirements": [
        7
      ],
      "description": "=+3 to your roll when your goal is to disrupt a ward, seal, summon, or magical structure instead of harming a person.",
      "secret": false
    },
    {
      "id": "tal_39",
      "name": "Final Revision",
      "type": "",
      "levelRequirements": [
        7
      ],
      "description": "Once per session, reroll a failed knowledge, study, or logic roll after taking a moment to rethink it.",
      "secret": false
    },
    {
      "id": "tal_40",
      "name": "Chain Reaction Spiral Master",
      "type": "",
      "levelRequirements": [
        8
      ],
      "description": "=+3 to your roll when using the environment to make one problem cause another - fire into panic, panic into movement, movement into collapse.",
      "secret": false
    },
    {
      "id": "tal_41",
      "name": "Soul Anchor",
      "type": "",
      "levelRequirements": [
        9
      ],
      "description": "+3 to your roll when resisting possession, spiritual corruption, identity loss, charm, or magical coercion.",
      "secret": false
    },
    {
      "id": "tal_42",
      "name": "I Know Your Type",
      "type": "",
      "levelRequirements": [
        9
      ],
      "description": "After observing an enemy for one round, gain +2 on future rolls against them for the rest of the scene.",
      "secret": false
    },
    {
      "id": "tal_43",
      "name": "One Good Hit",
      "type": "",
      "levelRequirements": [
        9
      ],
      "description": "Once per combat, add +5 damage to a successful attack that was built up with positioning, timing, or dramatic commitment.",
      "secret": false
    },
    {
      "id": "tal_44",
      "name": "Boss Fight Mentality",
      "type": "",
      "levelRequirements": [
        10
      ],
      "description": "=+3 to your roll when facing a clearly superior enemy, final encounter, monster phase shift, or overwhelming threat.",
      "secret": false
    },
    {
      "id": "tal_45",
      "name": "Appraise",
      "type": "Education",
      "levelRequirements": [
        5
      ],
      "description": "The character receives a bonus of +3 per rank when appraising / inspecting an object. With a successful check on MND+AU the character will perceive if an item is magic. The above bonus will apply.",
      "secret": false
    },
    {
      "id": "tal_46",
      "name": "Artisan",
      "type": "Education",
      "levelRequirements": [
        5
      ],
      "description": "This talent is learned individually for each different trade (bow maker, car- penter, stonemason, armorer, etc.), thus may be learned several times up\nto rank III. The character is skilled in the trade and gets a +3 bonus per talent rank on all checks regarding this trade. This applies to crafting new or repairing dam- aged items",
      "secret": false
    },
    {
      "id": "tal_47",
      "name": "Basher",
      "type": "Fight",
      "levelRequirements": [
        8
      ],
      "description": "If a melee attack is made with blunt weapons, axes or two-handed weapons and a coup is rolled, the defense against\nthis attack is lowered by 5 for each talent rank.",
      "secret": false
    },
    {
      "id": "tal_48",
      "name": "Beast Master",
      "type": "RP",
      "levelRequirements": [
        4
      ],
      "description": "The character has a keen sense for animals and gets a +3 bonus on all checks regarding interaction with animals. This also applies to all riding checks . Once every 24 hours and per talent rank he can convince any number of wild, aggressive or even starving beasts to spare him and two companions per talent rank (With a SOUL + EMPATHY Roll), provided they don’t act aggressively toward the animals. This is possible even for rabid or controlled animals, provided the check succeeds. This counts as the character’s action. The character has one attempt per talent rank",
      "secret": false
    },
    {
      "id": "tal_49",
      "name": "Blocker",
      "type": "Fight",
      "levelRequirements": [
        4,
        8,
        12
      ],
      "description": "The character knows how to defend effectively in battle. \n\nIn each round of combat in which the character does not take offensive action, does not use any movement and defends he gets +2 to his defense rolls per talent rank. This applies to all attacks which he is aware of and which are not made against his back. The character may use the same bonus to check against BOD+END to avoid being pushed back in combat. Once per fight per talent rank the Blocker may reroll when defending.",
      "secret": false
    },
    {
      "id": "tal_50",
      "name": "Brutal Blow",
      "type": "Fight",
      "levelRequirements": [
        5,
        10,
        15
      ],
      "description": "Once per talent rank and battle the character may raise his melee attack value by his BOD value. Several talent ranks may be used in a single blow",
      "secret": false
    },
    {
      "id": "tal_51",
      "name": "Caled Shot",
      "type": "Fight",
      "levelRequirements": [
        4,
        8,
        12
      ],
      "description": "Once per 24 hours and talent rank, the character may fire a precise shot on a ranged attack against which no defense roll\nmay be made.The Called Shot has to be announced ahead of the check roll for the ranged attack.",
      "secret": false
    },
    {
      "id": "tal_52",
      "name": "Charming",
      "type": "RP",
      "levelRequirements": [
        4,
        8,
        12
      ],
      "description": "The character gains a +2 bonus on all social interactions, +3 if interacting with the opposite sex. For example, this applies to trying to appear likeable or attempting to tell a convincing story.\nDwarves are prohibited from gaining this talent.",
      "secret": false
    },
    {
      "id": "tal_53",
      "name": "Close Combat",
      "type": "Fight",
      "levelRequirements": [
        4,
        8,
        12
      ],
      "description": "The character is a skilled melee fighter:\nHe receives a bonus of +1 per talent rank to his melee attacks.",
      "secret": false
    },
    {
      "id": "tal_54",
      "name": "Far Combat",
      "type": "Fight",
      "levelRequirements": [
        4,
        8,
        12
      ],
      "description": "The character is a skilled fighter from afar\nHe receives a bonus of +1 per talent rank to his attacks from 5m at least away.",
      "secret": false
    },
    {
      "id": "tal_55",
      "name": "Consuming Spirit",
      "type": "Fight",
      "levelRequirements": [
        5
      ],
      "description": "By sacrificing 5HP per talent rank the character may increase his Movement Rate by 2m per talent rank for D20/2 rounds. This counts as a free action.",
      "secret": false
    },
    {
      "id": "tal_56",
      "name": "Delay Death",
      "type": "Health",
      "levelRequirements": [
        5
      ],
      "description": "The Character may cheat death:\nIf he dies by the rules, he may continue to act as if he was alive for one additional round per talent rank. He may, however, not be decapitated, exploded, vaporized or in a similar state.",
      "secret": false
    },
    {
      "id": "tal_57",
      "name": "Devastating Strike",
      "type": "Fight",
      "levelRequirements": [
        4
      ],
      "description": "Once per 24 hours and per talent rank the Fighter may perform a devastating melee attack against which no defense\nroll is allowed. A Devastating Strike has to be announced before the melee attack is rolled. It may be used with one rank of another talent (e.g. Brutal Blow) for each rank in Devastating Strike",
      "secret": false
    },
    {
      "id": "tal_58",
      "name": "Diversion",
      "type": "RP",
      "levelRequirements": [
        4
      ],
      "description": "The character may once per day and talent rank divert a person’s attention by fast talking, shoving or other means.\nThe victim is distracted, all its checks against perception of pick pocketing etc. are lowered by -5 per talent rank. This\neffect lasts for (talent rank) rounds / 5 mins",
      "secret": false
    },
    {
      "id": "tal_59",
      "name": "Easy dodge",
      "type": "Fight",
      "levelRequirements": [
        4
      ],
      "description": "Once per talent rank and fight the character may completely ignore one attack against them (counts as a free action). The intent to avoid an attack must be announced before it is known whether a blow strikes or not or its damage. The talent is useless against area attacks.",
      "secret": false
    },
    {
      "id": "tal_60",
      "name": "Escape Death",
      "type": "Health",
      "levelRequirements": [
        4
      ],
      "description": "Once the character has less than 1 HP but is still alive, he heals 1 HP per talent rank every 5 rounds (-1 round per\ntalent rank). As soon as his HP reach positive numbers, the healing effect ceases and the character can spring back to action.",
      "secret": false
    },
    {
      "id": "tal_61",
      "name": "Expertise",
      "type": "Education",
      "levelRequirements": [
        1
      ],
      "description": "This talent is learned individually for each field of knowledge (Old myths, mathematics, science, astronomy,\ndwarven religion, etc.), so it may be acquired several times to maximum rank 3. The character mastered the particular field of knowledge and gets a +3 bonus to all checks per talent rank acquired for it.",
      "secret": false
    },
    {
      "id": "tal_62",
      "name": "Familiar",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "One animal per talent rank joins the characters. \nThe faithful animals follow simple, monosyllabic commands such as “Sit!” or “Attack!” and get +1 to Intellect.",
      "secret": false
    },
    {
      "id": "tal_63",
      "name": "Lively",
      "type": "Health",
      "levelRequirements": [
        3
      ],
      "description": "The character can take a serious beating.\nThey get +3 HP for each rank of this talent.",
      "secret": false
    },
    {
      "id": "tal_64",
      "name": "Fury",
      "type": "Fight",
      "levelRequirements": [
        6
      ],
      "description": "The character may reduce his defense by 1 point per talent rank and instead\nraise his melee attack by 2 points. This change may be readjusted each round of combat. Entering fury counts as a free action.",
      "secret": false
    },
    {
      "id": "tal_65",
      "name": "Grand Master",
      "type": "Education",
      "levelRequirements": [
        5
      ],
      "description": "The character may raise one of his core attributes (BOD, MND or SOL) by one point.",
      "secret": false
    },
    {
      "id": "tal_66",
      "name": "Hero's Luck",
      "type": "General",
      "levelRequirements": [
        8
      ],
      "description": "The character is truly blessed by fortune, he may repeat any dice roll once per day and talent rank.\nIf the character is not pleased with the outcome of the new roll, he may repeat the dice roll again if he has sufficient talent ranks.",
      "secret": false
    },
    {
      "id": "tal_67",
      "name": "Lighting Reflexes",
      "type": "Fight",
      "levelRequirements": [
        4
      ],
      "description": "The character can react quickly. In combat, he receives a +2 bonus per talent rank to his initiative.\nAdditionally he may once per battle and talent rank draw, change or pick up a weapon from the ground as a free action.",
      "secret": false
    },
    {
      "id": "tal_68",
      "name": "Lockpicking",
      "type": "Sneak",
      "levelRequirements": [
        1
      ],
      "description": "The character receives a bonus of +3 per talent rank on all checks to open locks.\nIn addition, for each talent rank the character may make a new attempt to open the same lock without receiving a\npenalty.",
      "secret": false
    },
    {
      "id": "tal_69",
      "name": "Marksman",
      "type": "Fight",
      "levelRequirements": [
        2
      ],
      "description": "The character is a skilled ranged attacker. He gets a bonus of +1 per talent rank to ranged attacks and targeted spell casting.",
      "secret": false
    },
    {
      "id": "tal_70",
      "name": "Master Climber",
      "type": "General",
      "levelRequirements": [
        1
      ],
      "description": "The character gains a bonus of +2 per talent rank on all climbing checks. The normal climbing speed of Movement Rate/2 is raised by 1m per talent rank.\nThe character may scale craning walls or may even climb along ceilings if they provide enough grip (protrusions, stalactites, small gaps). He may ignore any normal penalties when doing so.",
      "secret": false
    },
    {
      "id": "tal_71",
      "name": "Nasty shot",
      "type": "Fight",
      "levelRequirements": [
        4
      ],
      "description": "Once per talent rank and combat the character may add his Soul value to his Ranged Attack value. Several ranks\nof talent may be used for one shot.",
      "secret": false
    },
    {
      "id": "tal_72",
      "name": "Singer",
      "type": "RP",
      "levelRequirements": [
        5
      ],
      "description": "When siniging, the character gets a +3 bonus",
      "secret": false
    },
    {
      "id": "tal_73",
      "name": "Play Instrument",
      "type": "RP",
      "levelRequirements": [
        5
      ],
      "description": "When playing a certain kind of instrument of his choosing, the character gets a +3 bonus",
      "secret": false
    },
    {
      "id": "tal_74",
      "name": "Rascal",
      "type": "RP",
      "levelRequirements": [
        5
      ],
      "description": "The character receives a bonus of +3 per talent rank on all checks of social interaction involving bluffing, haggling or negotiating.",
      "secret": false
    },
    {
      "id": "tal_75",
      "name": "Pickpocket",
      "type": "RP",
      "levelRequirements": [
        1
      ],
      "description": "When attempting to pick pockets, the\ncharacter may add REFLEX once every 24 h per talent rank to his check value for pocket picking. He may use several talent ranks to boost the value for one check. This talent is usable with Thievery.",
      "secret": false
    },
    {
      "id": "tal_76",
      "name": "Resist Mancy",
      "type": "Fight",
      "levelRequirements": [
        4
      ],
      "description": "Mancy directed against the character get a penalty of 2 for each talent rank.",
      "secret": false
    },
    {
      "id": "tal_77",
      "name": "Salvo",
      "type": "Fight",
      "levelRequirements": [
        5
      ],
      "description": "Once per combat, in a single round of this combat, the character may shoot\nan additional missile per talent rank with a ranged weapon. The individual shots are treated as separate attacks, so\nthey can not be boosted several times, e.g. by the talent Nasty Shot. With multiple talent ranks, the ad-ditional shots may all be fired in one round or may be distributed over several rounds of combat.",
      "secret": false
    },
    {
      "id": "tal_78",
      "name": "Riding",
      "type": "",
      "levelRequirements": [
        1
      ],
      "description": "A character with this talent has learned to ride a steed. He can easily change the ndirection or speed of his riding animal\nby one category and may attack from horseback. The character gains a bonus of +2 per\ntalent rank for all checks on jumps or change of direction or changing speed by more than one category. When fight-\ning mounted, the character gains a +1 bonus against opponents fighting afoot.",
      "secret": false
    },
    {
      "id": "tal_79",
      "name": "Caregiver",
      "type": "Health",
      "levelRequirements": [
        4
      ],
      "description": "Gain +1 per talent rank to healing and protective mancy",
      "secret": false
    }
  ],
  "skills": [
    {
      "id": "skl_80",
      "name": "Pop Quiz",
      "origin": "Bookworms",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "Mind + Study",
      "effect": "Force one enemy to make a quick check - on failure they lose their next action (confused, hesitates).",
      "secret": false
    },
    {
      "id": "skl_81",
      "name": "Group Project",
      "origin": "Bookworms",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "Mind + Logic",
      "effect": "Two allies combine actions: one rolls, the other adds a small bonus effect (push, distract, cover, open a path).",
      "secret": false
    },
    {
      "id": "skl_82",
      "name": "Forbidden Section Prep",
      "origin": "Bookworms",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 3,
      "roll": "Mind + Study",
      "effect": "You “already saw something you shouldn’t have” - declare one specific weakness of a creature/trap type you’re facing.",
      "secret": false
    },
    {
      "id": "skl_83",
      "name": "Deja Read",
      "origin": "Bookworms / Item",
      "cooldownCost": "Once every 24 hours",
      "levelRequirement": 0,
      "roll": "Mind + Study",
      "effect": "Declare you already know one crucial fact . The GM must give you a useful truth.",
      "secret": false
    },
    {
      "id": "skl_84",
      "name": "Hold the Door!",
      "origin": "Craft",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "Mind + Craft",
      "effect": "Lock, bar, or ward a door instantly; it takes a serious effort to break through.",
      "secret": false
    },
    {
      "id": "skl_85",
      "name": "Workshop Hands",
      "origin": "Craft",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "Mind + Craft",
      "effect": "You can build/repair under pressure - quickly rig a barricade, splint, or tool; reduce the time by one step and it holds for the scene.",
      "secret": false
    },
    {
      "id": "skl_86",
      "name": "Disarm",
      "origin": "Duel / Item",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "",
      "effect": "On a successful melee hit, you may knock an item free on  (weapon, focus, key).",
      "secret": false
    },
    {
      "id": "skl_87",
      "name": "Shoulder Check",
      "origin": "Dungeonball",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "Bo+Fo+Re damage + pushback",
      "effect": "Move and make a melee attack; if it hits, target is pushed back and knocked off balance.",
      "secret": false
    },
    {
      "id": "skl_88",
      "name": "Cleave",
      "origin": "Dungeonball",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "No Roll",
      "effect": "If you drop a target, you may immediately attack a second nearby enemy.",
      "secret": false
    },
    {
      "id": "skl_89",
      "name": "Bodyguard",
      "origin": "Dungeonball",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 3,
      "roll": "No Roll",
      "effect": "Take a hit meant for an ally",
      "secret": false
    },
    {
      "id": "skl_90",
      "name": "Adrenal Burst",
      "origin": "Duel / Item",
      "cooldownCost": "Spend 1 Focus",
      "levelRequirement": 0,
      "roll": "No Roll",
      "effect": "Take one extra action immediately",
      "secret": false
    },
    {
      "id": "skl_91",
      "name": "Perfect Parry",
      "origin": "Duel/ Item",
      "cooldownCost": "Spend 1 Focus",
      "levelRequirement": 0,
      "roll": "No Roll",
      "effect": "Negate a melee hit against you. If you choose, immediately reposition 1 step.",
      "secret": false
    },
    {
      "id": "skl_92",
      "name": "Locker Cache",
      "origin": "Field Assignment Corps",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "",
      "effect": "Produce one small useful item you “stashed earlier” (chalk, string, mirror shard, bandage, salt, key blank).",
      "secret": false
    },
    {
      "id": "skl_93",
      "name": "Dead Silence",
      "origin": "Ghost /",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "",
      "effect": "For a short moment, you and your gear make no sound; ideal for slipping past patrols.",
      "secret": false
    },
    {
      "id": "skl_94",
      "name": "Reveal the Hidden",
      "origin": "Ghost / Murder / Item",
      "cooldownCost": "Spend 1 Focus",
      "levelRequirement": 0,
      "roll": "",
      "effect": "Expose one hidden thing: invisible mark, illusion seam, secret latch, concealed enemy.",
      "secret": false
    },
    {
      "id": "skl_95",
      "name": "Ask the Ghost",
      "origin": "Ghost Club / Item",
      "cooldownCost": "",
      "levelRequirement": 0,
      "roll": "",
      "effect": "You can see ghosts of dead students sometimes with a perception check",
      "secret": false
    },
    {
      "id": "skl_96",
      "name": "Pin the Lie (once per hour):",
      "origin": "Murder Club / Item",
      "cooldownCost": "Once every 12 hours",
      "levelRequirement": 0,
      "roll": "",
      "effect": "force a target to answer one question honestly or refuse with a visible tell",
      "secret": false
    },
    {
      "id": "skl_97",
      "name": "Hallway Sprint",
      "origin": "Parkour",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "",
      "effect": "You move twice and ignore opportunity attacks / reactions while sprinting.",
      "secret": false
    },
    {
      "id": "skl_98",
      "name": "I make the rules",
      "origin": "Prefect",
      "cooldownCost": "Spend 1 Focus, once per scene",
      "levelRequirement": 0,
      "roll": "",
      "effect": "Cancel one “special rule” of the encounter for a moment (fog lifts, silence breaks, gravity normalises) - it returns next round.",
      "secret": false
    },
    {
      "id": "skl_99",
      "name": "Psychostrike",
      "origin": "Prof. Ash / Psycholancy",
      "cooldownCost": "1 Round (1 hour)",
      "levelRequirement": 1,
      "roll": "Soul + Presence (Half Damage, half will check)",
      "effect": "Strike someone with an emotion or a memory",
      "secret": false
    },
    {
      "id": "skl_100",
      "name": "Psychosteal",
      "origin": "Prof. Ash / Psycholancy",
      "cooldownCost": "1 Round (1 hour)",
      "levelRequirement": 1,
      "roll": "Soul + Empathy (Half damage, half will check)",
      "effect": "Take an emotion or a memory away from  someone",
      "secret": false
    },
    {
      "id": "skl_101",
      "name": "Psychosnap",
      "origin": "Prof. Ash / Psycholancy",
      "cooldownCost": "1 Round (1 hour)",
      "levelRequirement": 1,
      "roll": "Soul + Will (Pure damage)",
      "effect": "Push your will onto the enemy, to physically hurt  them",
      "secret": false
    },
    {
      "id": "skl_102",
      "name": "Psychosmoke",
      "origin": "",
      "cooldownCost": "",
      "levelRequirement": 0,
      "roll": "",
      "effect": "",
      "secret": false
    },
    {
      "id": "skl_103",
      "name": "Everything is a Shield",
      "origin": "Prof. Ironwell",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 3,
      "roll": "",
      "effect": "Improvise a shield from junk - negate one hit, then it shatters.",
      "secret": false
    },
    {
      "id": "skl_104",
      "name": "Tripwire Step",
      "origin": "",
      "cooldownCost": "Once every 12 hours",
      "levelRequirement": 0,
      "roll": "",
      "effect": "You may cross a trapped area; if a trap triggers, you avoid the main effect (still makes noise).",
      "secret": false
    },
    {
      "id": "skl_105",
      "name": "Last Second Dodge",
      "origin": "",
      "cooldownCost": "Spend 1 Energy, once per scene",
      "levelRequirement": 0,
      "roll": "",
      "effect": "Turn a hit into a glancing blow: you take only a minor consequence.",
      "secret": false
    },
    {
      "id": "skl_106",
      "name": "Pin",
      "origin": "",
      "cooldownCost": "Once per battle / Every 6 hours",
      "levelRequirement": 0,
      "roll": "",
      "effect": "On a hit, immobilise a target for 1 round (or until they break free).",
      "secret": false
    },
    {
      "id": "skl_107",
      "name": "Focused Shot",
      "origin": "",
      "cooldownCost": "Spend 1 Focus, once per scene",
      "levelRequirement": 0,
      "roll": "",
      "effect": "Your ranged attack ignores cover and applies a disable (choose: slow, disarm, silence) for 1 round.",
      "secret": false
    },
    {
      "id": "skl_108",
      "name": "Rally",
      "origin": "",
      "cooldownCost": "Once per 24 hours",
      "levelRequirement": 0,
      "roll": "",
      "effect": "Remove 1 Stress from an ally who can see/hear you.",
      "secret": false
    },
    {
      "id": "skl_109",
      "name": "Cleaving Arc",
      "origin": "Prof. Ironwell / Martial Discipline",
      "cooldownCost": "Once per combat",
      "levelRequirement": 1,
      "roll": "Body + Force",
      "effect": "Swing your weapon in a wide arc hitting two enemies for only BO plus Force",
      "secret": false
    },
    {
      "id": "skl_110",
      "name": "Execution Strike",
      "origin": "Prof. Ironwell / Martial Discipline",
      "cooldownCost": "Once per combat",
      "levelRequirement": 1,
      "roll": "Body + Force",
      "effect": "Deliver a devastating focused strike dealing double damage to a single enemy",
      "secret": false
    },
    {
      "id": "skl_111",
      "name": "Shield Break",
      "origin": "Prof. Ironwell / Martial Discipline",
      "cooldownCost": "2 Rounds",
      "levelRequirement": 1,
      "roll": "Body + Force",
      "effect": "Strike with overwhelming force to shatter defenses and stagger the target",
      "secret": false
    },
    {
      "id": "skl_112",
      "name": "Sweeping Advance",
      "origin": "Prof. Ironwell / Martial Discipline",
      "cooldownCost": "Once per Combat",
      "levelRequirement": 2,
      "roll": "Body + Force",
      "effect": "Step forward aggressively striking two enemies and pushing them back",
      "secret": false
    },
    {
      "id": "skl_113",
      "name": "Iron Guard",
      "origin": "Prof. Ironwell / Martial Discipline",
      "cooldownCost": "2 Rounds",
      "levelRequirement": 1,
      "roll": "Body + Endurance",
      "effect": "Brace yourself in a defensive stance reducing incoming damage until your next turn",
      "secret": false
    },
    {
      "id": "skl_114",
      "name": "Groundbreaker",
      "origin": "Prof. Ironwell / Martial Discipline",
      "cooldownCost": "Once per combat",
      "levelRequirement": 2,
      "roll": "Body + Force",
      "effect": "Smash the ground with brutal force knocking all nearby enemies off balance",
      "secret": false
    }
  ],
  "professors": [
    {
      "id": "prof_115",
      "name": "Professor Ironwell",
      "pillar": "BODY",
      "playerConnectionNote": "Fad",
      "titleRole": "Master of Endurance & Applied Violence",
      "description": "A scarred veteran who teaches survival as a moral imperative.",
      "quote": "“If your body fails, your ideals die with it.”",
      "oath": "“I will never spare a student the truth of physical limits.”",
      "tableRules": "No excuses. If you show up tired, hurt, or unprepared, Ironwell makes it worse: the first physical setback each session becomes an Injury instead of Stress. He respects grit - if you push through, you gain +1 Ascension once per day. You cannot rest, and you cannot get healed. If he catches you you will have to bear the consequences",
      "vibe": "Drill instructor, battlefield medic, executioner of weak assumptions.",
      "secretNotes": "",
      "secretRevealed": false
    },
    {
      "id": "prof_116",
      "name": "Professor Vale",
      "pillar": "MIND",
      "playerConnectionNote": "",
      "titleRole": "Archivist of Forbidden Curricula",
      "description": "Brilliant, precise, and emotionally distant.",
      "quote": "“Ignorance is the only unforgivable sin.”",
      "oath": "“I will not intervene if knowledge alone could have saved you.”",
      "tableRules": "Ignorance is negligence. If you don’t know something you should know, Vale treats it like misconduct: the first time per day you’re caught guessing, mark +1 Ruin. If you can cite a source (notes, book, witness), gain +1 Focus once per day.",
      "vibe": "Cold mentor, puzzle master, lethal librarian.",
      "secretNotes": "",
      "secretRevealed": false
    },
    {
      "id": "prof_117",
      "name": "Professor Seraphine Ash",
      "pillar": "SOUL",
      "playerConnectionNote": "Prof. Ash \n\nDrusilla.",
      "titleRole": "Warden of Will & Communion",
      "description": "Soft-spoken, terrifyingly perceptive.",
      "quote": "“What you refuse to face will decide your end.”",
      "oath": "I will never take something without offering the opportunity for absolution or penance",
      "tableRules": "She sees through you. Once per day, Ash asks what you want or fear - if you answer honestly, remove 1 Stress. You cannot lie . If she catches you lying gain +1 Stress and she remembers.",
      "vibe": "Therapist-priest, confessor, judge of character.",
      "secretNotes": "Wants to drain ppl from emotions as they are holding back the chosen one\n\nshe has weird emotion bubbles. she believes that the chosen should be devout of any negative feelings. She teaches psycholancy, the art of manipulating emotions through magic.\n\nIs secretly the goddess of Dru's religion and wants to recruite her to be her successor. Has been 'spreading' the faith through psycholancy. Is fiercely loyal to the headmistress",
      "secretRevealed": false
    },
    {
      "id": "prof_118",
      "name": "Headmistress Sola",
      "pillar": "",
      "playerConnectionNote": "",
      "titleRole": "",
      "description": "",
      "quote": "",
      "oath": "",
      "tableRules": "",
      "vibe": "",
      "secretNotes": "",
      "secretRevealed": false
    }
  ],
  "clubs": [
    {
      "id": "club_119",
      "name": "Dueling Society",
      "membersNote": "Fad and Dalton",
      "whatYouDo": "Formal bouts, sparring ladders, challenge board rivalries",
      "unlockableText": "Perfect Parry (once per battle): negate one melee hit against you; access to the dueling ring + ranked matches.",
      "professorId": null,
      "professorNote": "Headmistress",
      "secret": false
    },
    {
      "id": "club_120",
      "name": "Prefect Corps",
      "membersNote": "Prefect Lucien",
      "whatYouDo": "Patrols, curfew enforcement, rule investigations",
      "unlockableText": "Talent: +1 to your roll when invoking school rules with authority; prefect badge (social leverage) + limited staff-corridor access.",
      "professorId": "prof_115",
      "professorNote": "Professor Ironwell",
      "secret": false
    },
    {
      "id": "club_121",
      "name": "Bookworm Club",
      "membersNote": "Prefect Lucien",
      "whatYouDo": "Restricted research, decoding marginalia, “borrowing” books",
      "unlockableText": "I Read Ahead (once per hour): ask the GM for one useful true fact about a creature, room, or rule; permanent Lore-style skill (GM-defined).",
      "professorId": "prof_116",
      "professorNote": "Professor Vale",
      "secret": false
    },
    {
      "id": "club_122",
      "name": "Ritual & Craft Workshop",
      "membersNote": "Drusilla",
      "whatYouDo": "Wards, alchemy, tool-making, dangerous experiments",
      "unlockableText": "Chalk Circle (once per battle): place a ward zone that weakens the next supernatural effect crossing it; personal kit + access to rare components.",
      "professorId": null,
      "professorNote": "",
      "secret": false
    },
    {
      "id": "club_123",
      "name": "Field Assignment Corps",
      "membersNote": "",
      "whatYouDo": "Voluntary missions, scouting trips, demon clean-ups",
      "unlockableText": "Adrenal Burst (once per battle): take one extra action immediately; quartermaster favour (extra basic gear on missions).",
      "professorId": "prof_115",
      "professorNote": "Professor Ironwell",
      "secret": false
    },
    {
      "id": "club_124",
      "name": "Choir of the Bell Tower",
      "membersNote": "",
      "whatYouDo": "Performances, coded songs, morale-building, influence",
      "unlockableText": "Rally (once per hour): remove 1 Stress from an ally who can hear you; invitations to high-status school events.",
      "professorId": "prof_117",
      "professorNote": "Seraphine Ash",
      "secret": false
    },
    {
      "id": "club_125",
      "name": "Murder Club",
      "membersNote": "Drusilla",
      "whatYouDo": "Mock trials, interrogations, reconstructing incidents",
      "unlockableText": "Pin the Lie (once per hour): force a target to answer one question honestly or refuse with a visible tell; access to sealed case files.",
      "professorId": "prof_116",
      "professorNote": "Professor Vale",
      "secret": false
    },
    {
      "id": "club_126",
      "name": "Caretaker’s Guild",
      "membersNote": "",
      "whatYouDo": "First aid, logistics, emergency drills, triage",
      "unlockableText": "Stabilise (once per battle): keep an ally frompassing out when he goes into minus health. Potions refilled between sessions.",
      "professorId": "prof_116",
      "professorNote": "Professor Vale",
      "secret": false
    },
    {
      "id": "club_127",
      "name": "Racing Parkour League (sport)",
      "membersNote": "",
      "whatYouDo": "High-speed racing, obstacle courses, reckless stunts",
      "unlockableText": "Breakneck Line (once per hour): win a pursuit beat or ignore difficult terrain/forced movement in a chase segment; tuned gear (GM-limited +1 to pursuits).",
      "professorId": null,
      "professorNote": "",
      "secret": false
    },
    {
      "id": "club_128",
      "name": "Dungeonball (sport)",
      "membersNote": "Dalton and Fad",
      "whatYouDo": "Brutal team sport: tackling, objectives, chaos",
      "unlockableText": "Shoulder Check (once per battle): shove/knock prone on a successful hit; once per battle, when you assist an ally they also get +1. If you win matches, get prestige and popularity",
      "professorId": "prof_115",
      "professorNote": "Professor Ironwell",
      "secret": false
    },
    {
      "id": "club_129",
      "name": "Ghost Club",
      "membersNote": "",
      "whatYouDo": "A group of students investigating the parnormal that happens in the school",
      "unlockableText": "You can see ghosts of dead students sometimes with a perception check, and get hints on how they died. You have a bit of a creepy aura",
      "professorId": null,
      "professorNote": "",
      "secret": false
    },
    {
      "id": "club_130",
      "name": "Theater Group",
      "membersNote": "",
      "whatYouDo": "",
      "unlockableText": "",
      "professorId": "prof_117",
      "professorNote": "Seraphine Ash",
      "secret": false
    }
  ]
};
