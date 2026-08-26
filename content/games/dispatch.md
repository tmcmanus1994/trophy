---
slug: dispatch
title: Dispatch
platform: PS5
developer: AdHoc Studio
released: 2025-10-22
missableCount: 1
accent: "#4FD8EB"

trophies:
  - id: h4ck3d-by-r0b3rt
    name: H4CK3D BY R0B3RT
    type: gold
    description: Succeed on all 28 hacking levels — one save file, zero failures.
    missable: true
    dlc: false
    requires: []
    note: |
      **Rules:** You must **succeed**, not just attempt — if you fail a hack,
      reload your last save immediately. Turn **OFF** Unlimited Hacking
      Attempts (Settings › General). Progress does NOT stack across save
      files. Scene select works for mop-up.
    stepGroups:
      - id: ep1
        title: Pivot
      - id: ep2
        title: Onboard
      - id: ep3
        title: Turnover
      - id: ep4
        title: Restructure
      - id: ep5
        title: Team Building
      - id: ep6
        title: Moving Parts
      - id: ep7
        title: Retrospective
      - id: ep8
        title: Synergy
    steps:
      - id: ep1-broken-tablet
        group: ep1
        text: Shroud's Hideout — hack the broken tablet
        detail: Tutorial hack during the base infiltration. Can't be failed.
        tags: [story]

      - id: ep2-bidet
        group: ep2
        text: Cray Cray Bidet — fix the malfunctioning bidet
        detail: Third task of the early shift. No timer, can't be failed.
        tags: [story]
      - id: ep2-museum-hack
        group: ep2
        text: Museum Robbery — "Hack into the system"
        detail: Send a hero, then choose the hack option when interference hits. Easy to resolve another way.
        tags: [missable, timed]
      - id: ep2-donuts-cameras
        group: ep2
        text: Granny's Donuts — hack the cameras
        detail: During Invisigal's scene.
        code: Up, Down, Left, Left
        tags: [story]
      - id: ep2-donuts-sprinklers
        group: ep2
        text: Granny's Donuts — hack the water sprinklers
        detail: Immediately after the cameras.
        code: Up, Down, Left, Up
        tags: [story, timed]

      - id: ep3-flambae-tank
        group: ep3
        text: Flambae Sabotage — "Unlock the tank"
        detail: >
          #1 MOST MISSED. Only triggers if you dispatch Flambae with any hero
          EXCEPT Prism early in Shift 1. Prism's synergy prevents the sabotage
          entirely.
        code: Left, Down, Down
        tags: [danger, missable]
      - id: ep3-scammer-computer
        group: ep3
        text: Hack the Scammer — hack the scammer's computer
        detail: >
          Shift 1 disruption. You must pick the hack over "Investigate the
          Tip" — you only get one. Waveform-matching hack.
        tags: [missable]
      - id: ep3-bank-vault
        group: ep3
        text: Bank Robbery — trap the robbers in the vault
        detail: Shift 2. Send a hero, then choose to lock the vault. Three stages.
        code: "① Down, Right, Right, Up ② Right, Right, Up, Right ③ Down, Right, Down, Right, Up, Right, Up"
        tags: [missable]
      - id: ep3-jewellery-cam-1
        group: ep3
        text: Jewellery Store — camera override #1
        detail: Invisigal's fight. First antivirus appears here.
        tags: [story]
      - id: ep3-jewellery-cam-2
        group: ep3
        text: Jewellery Store — camera override #2
        detail: Pre-activate tracks to slip past the antivirus.
        tags: [story]
      - id: ep3-jewellery-lights
        group: ep3
        text: Jewellery Store — light/system override
        detail: Final story hack of the chapter. Completing all three also helps Invisigal's outcome.
        tags: [story]

      - id: ep4-aisle9-sprinklers
        group: ep4
        text: Superhero Squabble in Aisle 9 — activate sprinklers
        detail: Shift 1 disruption choice — pick the hack, don't resolve it another way.
        tags: [missable]
      - id: ep4-discern-target
        group: ep4
        text: Discern the Target — hack the computer
        detail: Shift 2. Antivirus attacks immediately — plan your route to the green exit node first.
        code: Left, Left, Up, Right, Right, Down
        tags: [story]

      - id: ep5-stalker-files
        group: ep5
        text: Stalker at the Film Shoot — "Delete all of his files"
        detail: >
          Shift 1. Send a hero, then pick the delete/hack option. Two
          sequences (some guides list them swapped — trust the screen).
        code: Right, Left, Left · Left, Left, Right, Right
        tags: [missable]
      - id: ep5-west-torrance
        group: ep5
        text: West Torrance — restart the power
        detail: Blackout sequence, Shift 2. Order of the three doesn't matter.
        tags: [story]
      - id: ep5-central-torrance
        group: ep5
        text: Central Torrance — restart the power
        detail: Blackout sequence, Shift 2.
        code: Up, Left, Right
        tags: [story]
      - id: ep5-east-torrance
        group: ep5
        text: East Torrance — restart the power
        detail: Spawns antiviruses — bonus shot at the Anti-Antivirus Club trophy.
        tags: [story]

      - id: ep6-cyberbully
        group: ep6
        text: Cyberbully — kick the hacker out & ID them
        detail: Shift 1 disruption with a timer and antivirus.
        code: Up, Up, Down, Left, Right, Left
        tags: [missable, timed]
      - id: ep6-warehouse-trace
        group: ep6
        text: Warehouse — trace the Astral Pulse signal
        detail: Dock finale begins. Only 3 hacking lives per sequence here.
        code: Up, Up, Right
        tags: [story]
      - id: ep6-warehouse-door
        group: ep6
        text: Warehouse — hack the door open
        code: Left, Left, Up, Right
        tags: [story, timed]
      - id: ep6-warehouse-speakers
        group: ep6
        text: Warehouse — hack the speaker tower
        tags: [story, timed]
      - id: ep6-warehouse-crane
        group: ep6
        text: Warehouse — hack the crane
        detail: Antivirus present.
        code: Left, Left, Left, Right
        tags: [story, timed]
      - id: ep6-warehouse-safe
        group: ep6
        text: Warehouse — hack the safe
        detail: Hardest hack of the episode; multiple antiviruses. Second shot at Anti-Antivirus Club.
        tags: [story]

      - id: ep7-runaway-car
        group: ep7
        text: Runaway Car — stop the runaway car
        detail: Standard shift hack.
        code: Left, Right, Right, Left
        tags: [story]

      - id: ep8-tracker-flambae
        group: ep8
        text: Locate the Tracker — Flambae
        detail: Happens naturally while rescuing Flambae as the Southlands burns.
        tags: [story]
      - id: ep8-tracker-second
        group: ep8
        text: Locate the Tracker — Sonar/Coupé or Waterboy/Phenomaman
        detail: >
          Which pair appears depends on your earlier roster choices. The
          tracker you don't pick first is NOT a failure — do it after.
        tags: [story]
      - id: ep8-lockdown-doors
        group: ep8
        text: Lockdown — unlock doors and exits for the students
        detail: If your route removed the Mindf*cker hack (see below), the trophy pops right here.
        code: Left, Left, Right, Up
        tags: [story]
      - id: ep8-mindfucker-brain
        group: ep8
        text: Defeat Mindf*cker — hack the brain
        detail: >
          #2 MOST MISSED. Do NOT finish Sonar/Coupé quickly — drop their
          health low, keep dispatching regular calls, and stall until the
          brain hack appears. Mid-hack the controls REVERSE (up=down,
          left=right). Doesn't exist if you imprisoned Mindf*cker in an
          earlier episode — the trophy pops at Lockdown instead.
        tags: [danger, missable, timed]
---

**Update your game first.** This trophy was bugged at a 0% unlock rate until
PS5 patch 1.000.007 (Nov 2025). If you already did every hack, it should pop
just by launching the game or switching to that save slot. If it doesn't,
the game isn't counting your save — run the checklist on a single playthrough.

Passwords are community-reported and can vary — always trust the on-screen
prompts. Tracking just this one trophy for now; the full Dispatch list comes
later.
