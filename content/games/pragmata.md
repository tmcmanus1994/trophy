---
slug: pragmata
title: Pragmata
platform: PS5
developer: Capcom
released: 2026-04-17
platinumName: Pragmata
difficulty: 6
hoursToPlat: 30
playthroughs: 2
missableCount: 1
psnProfilesGameId: 41027
accent: "#35D7F0"

phases:
  - id: p1
    title: "Step 1 — First playthrough + collectibles"
    summary: Finish the game on any difficulty (Lunatic is locked on run one) while grabbing collectibles and learning the shoot-and-hack rhythm.
  - id: p2
    title: "Step 2 — The Unknown Signal"
    summary: Post-story epilogue mode — 10 challenges gated behind 100% sector completion and buffed boss rematches, then the final boss again with the Black Box mod equipped.
  - id: p3
    title: "Step 3 — Lunatic playthrough"
    summary: A fresh New Game on Lunatic (not available in New Game+) — same route, tankier everything, bosses with enormous health pools.

trophies:
  - id: pragmata
    name: Pragmata
    type: platinum
    description: Obtain all trophies.
    phase: p3
    missable: false
    dlc: false
    requires: [lunar-supremacy, mini-hunter-supreme, master-of-the-simulator]
    note: |
      No DLC required.

  # ---------- STORY (Step 1) ----------

  - id: rendezvous
    name: Rendezvous
    type: bronze
    description: Make it to the Shelter.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: power-trip
    name: Power Trip
    type: bronze
    description: Restore power.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: the-purr-fect-guide
    name: The Purr-fect Guide
    type: bronze
    description: Reach the Comms Tower.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: another-pragmata
    name: Another Pragmata
    type: bronze
    description: Meet the trapped girl.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: entrusted-memory
    name: Entrusted Memory
    type: bronze
    description: Get the stop code.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: mission-unveiled
    name: Mission Unveiled
    type: bronze
    description: Make it to Nexus Tower.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: awakening
    name: Awakening
    type: bronze
    description: Fix up Diana.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: sentinel-breach
    name: Sentinel Breach
    type: bronze
    description: Take down the Sentinel.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: our-promise
    name: Our Promise
    type: gold
    description: Complete the game on any difficulty.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Easiest difficulty counts. Gates both Lunatic and Unknown Signal.

  # ---------- SHELTER / DIANA (Step 1) ----------

  - id: small-talk
    name: Small Talk
    type: bronze
    description: Talk to Diana in the Shelter.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: thanks-for-everything
    name: Thanks for Everything!
    type: bronze
    description: Receive a picture as a present.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Keep talking to Diana and gifting REMs; she hands over 4 pictures total
      across the game.

  - id: peekaboo
    name: Peekaboo
    type: bronze
    description: Win at hide-and-seek.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: for-me
    name: For Me?
    type: bronze
    description: Give an REM as a present.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: replicating-extraordinaire
    name: Replicating Extraordinaire!
    type: bronze
    description: Complete an REM series.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: blackout
    name: Blackout!
    type: silver
    description: Complete a Cabin Stamp Board.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      The "Cabin" robot NPC in the Shelter runs **4 Stamp Boards costing 9, 16,
      16 and 16 Cabin Coins.** Coins come from Safe Boxes, Diana's REM rewards
      and Training Sims. Only one board is needed for this trophy — but board
      completion also unlocks prints, so it feeds **Can't Stop, Won't Stop**.

  # ---------- TRAINING SIMS ----------

  - id: mister-simulator
    name: Mister Simulator
    type: bronze
    description: Complete the main objective in a Training Sim.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: master-of-the-simulator
    name: Master of the Simulator
    type: gold
    description: Complete the main objective in every Training Sim.
    phase: p2
    missable: false
    dlc: false
    requires: [mister-simulator]
    counter: 30
    note: |
      **30 Training Sim missions.** They unlock two ways: Shelter upgrades
      after each boss fight, and **Training Data collectibles** picked up in
      the world — so a missing sim usually means a missing collectible, not a
      missing boss.
      **Each sim has 1 main objective and 2 side objectives — you only need
      the main one.** Ignoring the side objectives makes almost all of them
      trivial; people lose hours trying to full-clear sims they didn't need to.
      Two sims double as trophy setups: **Sim 07 "Project Pierce"** for
      IT'S OVER 6000!, **Sim 10 "Mouse Trap"** for Round 'Em Up.

  # ---------- COLLECTIBLES / EXPLORATION ----------

  - id: red-zoned-and-loving-it
    name: Red-Zoned and Loving It
    type: silver
    description: Secure a Red Zone.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Short combat challenges behind Red Gate Keys, one set per area. All of
      them are required for 100% sector completion anyway.

  - id: youre-not-getting-away-that-easy
    name: You're Not Getting Away That Easy
    type: bronze
    description: Defeat a Sweeper bot.
    phase: p1
    missable: true
    dlc: false
    requires: []
    steps:
      - id: s1
        text: "MPA 03 — the small alley leading to the Slide REM"
      - id: s2
        text: "MPA 04 — the vertical room with the Cartridge Holder"
      - id: s3
        text: "Lunum Mines 02 — behind the pillar, behind the missile bot where you drop the container, just before Lunum Mines 03"
      - id: s4
        text: "Lunum Mines 03 — on top of the containers in the room with the movable crate leading to a Safe Box in each direction"
    note: |
      **The only missable trophy in the game.** Sweeper bots are small flyers
      that flee when you approach; you have to finish the hack matrix labyrinth
      while keeping them aimed at to kill one.
      **What makes it missable is spawn inconsistency** — reloading a save
      sometimes respawns one in the same spot and sometimes doesn't, so
      botching the hack repeatedly can burn a location permanently.
      **Stack the odds:** hit one with an **Overdrive Protocol** or **Stasis
      Net** first so it stops running while you work the matrix. Back up your
      save before attempting. The spawn list above is not exhaustive — there
      may be more — and you get two playthroughs' worth of chances.

  - id: wall-what-wall
    name: Wall? What Wall?
    type: bronze
    description: Find a Holo-Wall.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Fake walls hiding collectibles. Unlocks on its own during any collectible
      sweep.

  - id: well-spotted
    name: Well Spotted!
    type: bronze
    description: Shoot a Mini Cabin.
    phase: p1
    missable: false
    dlc: false
    requires: []

  - id: mini-hunter-supreme
    name: Mini-Hunter Supreme
    type: gold
    description: Shoot every Mini Cabin.
    phase: p2
    missable: false
    dlc: false
    requires: [well-spotted]
    steps:
      - id: s1
        text: "Solar Power Plant"
        target: 3
      - id: s2
        text: "Mass Production Array (MPA)"
        target: 3
      - id: s3
        text: "Terra Dome"
        target: 3
      - id: s4
        text: "Lunum Mines"
        target: 3
      - id: s5
        text: "Central Port"
        target: 3
    note: |
      **15 total, 3 per area.** Advanced Pragmatics has none — it has no
      collectibles at all, so don't sweep it.
      **The trap that hides these:** Mini Cabins are the one collectible type
      **excluded from 100% sector progress.** A sector can read 100% complete
      with all three of its Mini Cabins still unshot — so a finished
      completion bar tells you nothing here. Track them on their own.
      They're small robots; you shoot them rather than walk into them.

  - id: top-shelf-item
    name: Top-Shelf Item
    type: bronze
    description: Upgrade a weapon using Pure Lunum.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Early weapon upgrades cost only currency; past a certain level they also
      demand **Pure Lunum**. Spend one once.

  - id: cant-stop-wont-stop
    name: Can't Stop, Won't Stop
    type: silver
    description: Print all obtainable weapons, hacking nodes, and abilities during the main story.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      **Printing each item once is enough** — no need to max any level.
      Everything unlocks either automatically or via **Cabin Stamp Board**
      completion, so keep feeding Cabin Coins into boards as you get them.
      **Read the description literally: "during the main story."** If you're
      picking this up late, the safe place to nail it is the Lunatic run, on
      the way to the ending — not in a post-credits save.

  - id: cradle-surveyor
    name: Cradle Surveyor
    type: bronze
    description: Reach 100% sector progress in a sector.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      100% needs every Safe Box, Pure Lunum, Storage Expander, Training Data
      and Red Zone — **everything except Mini Cabins.**
      This is also the hidden gate on Unknown Signal: its challenges unlock off
      **100% completion in every sector**, even though no trophy says so.

  - id: escape-artist
    name: Escape Artist
    type: bronze
    description: Unlock every escape hatch.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Escape Hatches are the fast-travel network between the Shelter and each
      sector. Dying returns you to the Shelter, so an unlocked hatch is also
      your re-entry point.

  # ---------- COMBAT SETPIECES ----------

  - id: round-em-up
    name: Round 'Em Up
    type: silver
    description: Defeat three enemies at the same time with the Lim Recycler.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Two purpose-built spots.
      **MPA 05 – Lim Recycling Facility:** a room with 6 yellow floor plates;
      a group walks in, and once 3+ are standing on plates you hack the device
      on the left to burn them together. **Use a Decoy to herd stragglers on.**
      **Training Sim 10 – Mouse Trap:** trivially burns 12 at once.

  - id: courage-in-desperation
    name: Courage in Desperation
    type: silver
    description: Repel the LunaDigger while progressing through the Lunum Mines.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Multiple areas in the **Lunum Mines** have a LunaDigger roaming.
      **Drop to the ground to bait it out**, then fight it until it retreats.
      **Watch the sparkles erupting from the ground** — that's its tell; keep
      your distance from them or it lands the hit first.

  - id: can-i-borrow-that
    name: Can I Borrow That?
    type: silver
    description: Confuse a certain enemy and borrow its shield.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      **Lunum Mines 03 – Warehouse**, at the first Defender bot — the big one
      with 4 shields across its front. Hack it, and **route the hack through a
      Confuse node** to take the shield.

  - id: clean-up-on-aisle-three
    name: Clean Up on Aisle Three
    type: silver
    description: Cleanse three or more enemies at the same time.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Cleansing unlocks in **Advanced Pragmatics**; **Central Port** is where
      the opportunities are.
      **The trap: it must be 3 *corrupted* enemies, not regular ones.** Hold
      the cleanse and release only once three corrupted enemies have bunched up.

  - id: its-over-6000
    name: IT'S OVER 6000!
    type: silver
    description: Deal 6000 gunshot damage in one second.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      **Training Sim 07 – Project Pierce.** Fully charge the Charge Piercer and
      line up 3+ bots so one shot pierces through all of them.

  - id: who-needs-guns
    name: Who Needs Guns!?
    type: silver
    description: Deal 3000 hacking damage in a single hack.
    phase: p1
    missable: false
    dlc: false
    requires: []
    note: |
      Equip Diana's **Offense Mode** chip, hack once to open the enemy, then on
      the second hack route through as many offensive nodes as you can while
      unloading your gun into them before closing the hack.
      Failing all that, **the final encounter has a scripted 30,000-damage
      hack** — it cannot be missed.

  # ---------- UNKNOWN SIGNAL (Step 2) ----------

  - id: a-lunar-challenge
    name: A Lunar Challenge
    type: bronze
    description: Complete a mission in a special sector.
    phase: p2
    missable: false
    dlc: false
    requires: [our-promise]
    note: |
      The first of the 10 Unknown Signal pods. Clearing it re-opens the story
      regions via the tram.

  - id: the-right-man-for-the-job
    name: The Right Man for the Job
    type: gold
    description: Complete Unknown Signal.
    phase: p2
    missable: false
    dlc: false
    requires: [a-lunar-challenge]
    steps:
      - id: s1
        text: "Clear the opening pod challenge to re-open the tram network"
      - id: s2
        text: "Reach 100% collectible completion in every story sector — this is the hidden gate on most pods"
      - id: s3
        text: "Beat the buffed rematch bosses in Solar Power Plant, MPA, Terra Dome and Lunum Mines"
      - id: s4
        text: "Clear all 10 pod challenges to earn the Black Box mod"
      - id: s5
        text: "EQUIP BLACK BOX, then beat the buffed final boss and finish the game"
    note: |
      **The requirement nobody reads until it's too late: you must have the
      Black Box mod EQUIPPED during the ending.** Earning it is not enough —
      unequipped, you get neither the extra post-ending scene nor the trophy.
      The 10 pods sit in a Special Sector and range from combat to platforming.
      Most stay locked until the 100% sector sweeps and the four boss rematches
      are done, so the mode is really a completion check wearing an epilogue.

  # ---------- LUNATIC (Step 3) ----------

  - id: lunar-supremacy
    name: Lunar Supremacy
    type: gold
    description: Complete the game on Lunatic difficulty.
    phase: p3
    missable: false
    dlc: false
    requires: [our-promise]
    steps:
      - id: s1
        text: "Start a NEW GAME — Lunatic is not selectable in New Game+"
      - id: s2
        text: "Upgrade priority: health → Hugh's damage → Diana's hack damage. Weapon damage LAST (it only affects the yellow weapon slot)"
      - id: s3
        text: "Level Thrusters — each level is another dodge before the fuel runs dry"
      - id: s4
        text: "Hoard Safe Boxes and Pure Lunum harder than on run one; the damage upgrades are what shorten the boss fights"
      - id: s5
        text: "Trash mobs: Heat nodes + Combust Mode + Pulse Carbine to overheat fast, then Critical Shot through the purple node"
      - id: s6
        text: "FINAL BOSS — bank a full Deletion Protocol bar before entering (back up the save between attempts)"
      - id: s7
        text: "Final boss mods: Cheap Shot, Recursive Learning, Analog Aggression, Skirmisher, Optimal Performance, Close Quarters"
      - id: s8
        text: "Final boss loadout: Photon Laser + Jackhammer + Offense Mode, all three weapons leveled as high as possible"
      - id: s9
        text: "Open with Deletion Protocol, get behind it, dump every Photon Laser round into its back without releasing R2, then one Jackhammer shot plus follow-up before the stun ends"
      - id: s10
        text: "Mid-fight: dodge and hack to rebuild Deletion Protocol; punish openings with a fully charged Charge Piercer from the arena"
      - id: s11
        text: "At ~40-45% HP the second Deletion Protocol should be ready — grab the arena Photon Laser and repeat the opener to melt the rest"
    note: |
      **The hardest trophy in the game, and it's a patience test, not a wall.**
      Enemies are more aggressive with more health and damage; the real cost is
      boss health pools. You do get to print more weapons from the Shelter
      right from the start, which offsets some of it.

      **Weapon picks that carry the run:**
      - **Jackhammer** — huge damage even against enemies that aren't opened.
      - **Photon Laser** — damage ramps the longer you hold it, so **never
        release R2 mid-burn**; devastating after an Overdrive Protocol stun.
      - **Charge Piercer** — hold the charge permanently and release the instant
        an enemy opens.
      - **Critical Shot** — at low enemy health, purple nodes appear in the hack
        matrix; **route through the purple node before finishing the hack** for
        a massive hit on the stunned enemy.

      **The Combust combo does not transfer to bosses.** Heat nodes + Combust
      Mode + Pulse Carbine shreds regular enemies, but boss overheat gauges fill
      too slowly for it to be worth the setup.
---

Endgame pickup: 26 of 36 done and Unknown Signal is already cleared, so the ten
that remain fall into two clean piles. Pile one — the 15 Mini Cabins and the 30
Training Sims — can be swept right now in the existing post-story save, where
the enemies are soft and the tram goes everywhere; do that first, because Mini
Cabins are excluded from sector completion and a 100% bar has been quietly lying
about them this whole time. Pile two is everything that wants a story run:
`Can't Stop, Won't Stop` (description says "during the main story", so don't
gamble on a post-credits save), the missable Sweeper bot, and the three combat
setpieces in Lunum Mines and Central Port. Roll all of those into the Lunatic
playthrough rather than doing a throwaway third run — one New Game, four
trophies picked up in passing, and `Lunar Supremacy` at the end of it.
