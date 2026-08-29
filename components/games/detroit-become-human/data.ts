/**
 * "Detroit: The Last Six" — endgame demolition plan data.
 *
 * Row/magazine ids become progress keys as `plan::<id>` — stable forever,
 * never rename. Trophy ids in SIX are the real content ids from
 * content/games/detroit-become-human.md.
 *
 * Sources: PSNProfiles earned state (26 Dec 2025), PowerPyx roadmap +
 * per-chapter walkthroughs, GamerGuides, the DBH wiki, and 36 flowchart
 * screenshots from the save. Where sources disagreed (the Connor death
 * count especially) this follows the guide that enumerates its list.
 */

export type RowKind = "death" | "magz" | "key" | "warn";

export interface PlanRow {
  id: string;
  k: RowKind;
  /** Trusted static HTML (b/em/code only), rendered via innerHTML. */
  txt: string;
  met?: string[];
  why?: string;
}

export interface PlanChapter {
  ch: string;
  name: string;
  who: string;
  rows: PlanRow[];
}

export interface SixTrophy {
  id: string;
  n: string;
  t: "bronze" | "silver" | "gold" | "plat";
  d: string;
  w: string[];
}

export interface MagItem {
  n: number;
  t: string;
  /** Branch condition — only spawns when this is true. */
  b?: string;
  run?: 1 | 2;
}

export interface MagGroup {
  c: string;
  who: string;
  where: string;
  run: 1 | 2;
  items: MagItem[];
}

export const SIX: SixTrophy[] = [
  { id: "ill-be-back", n: "I'LL BE BACK", t: "silver", d: "Connor died and returned at every opportunity before reaching the end", w: ["Run 01", "8 deaths", "Hardest"] },
  { id: "just-a-machine", n: "JUST A MACHINE", t: "bronze", d: "Hank killed Connor", w: ["Run 01", "Free with death #5"] },
  { id: "escape-death", n: "ESCAPE DEATH", t: "bronze", d: "Kara and Alice escaped the recycling center", w: ["Run 01", "Kara must live"] },
  { id: "bookworm", n: "BOOKWORM", t: "silver", d: "Find every single magazine in the game", w: ["Run 01 + 02", "46 entries"] },
  { id: "these-are-our-stories", n: "THESE ARE OUR STORIES", t: "gold", d: "Spend 20,000 bonus points", w: ["Menu only", "5 minutes"] },
  { id: "detroit-master", n: "DETROIT MASTER", t: "plat", d: "Collected all trophies!", w: ["Auto"] },
];

export const FIRST: PlanRow[] = [
  { id: "f1", k: "key", txt: "Main Menu → <b>Extras</b>. Buy artwork, 3D models and soundtrack entries until your cumulative <b>spend</b> crosses 20,000.", why: "Banking points does nothing — the trophy counts what leaves your wallet. One full playthrough usually banks enough on its own, and you have three." },
  { id: "f2", k: "key", txt: "While you are in there, open <b>Extras → Magazines</b> and tick off everything you already have in the ledger below.", why: "Saves you re-collecting two dozen magazines you read back in December." },
];

export const RUN1: PlanChapter[] = [
  { ch: "01", name: "The Hostage", who: "Connor", rows: [
    { id: "r1-01a", k: "death", txt: "Accept Daniel's demand and <b>send the helicopter away</b>, then choose <code>SACRIFICE SELF</code>. Connor pushes Daniel off the roof and takes a bullet on the way down.", met: ["Death 1 of 8", "Hank ▼"], why: "Falling after Emma also works if you fumble the prompt." },
  ] },
  { ch: "02", name: "Shades of Color", who: "Markus", rows: [
    { id: "r1-02a", k: "magz", txt: "<b>Magazine object.</b> Bench to Markus's right at the very start, beside the old man and his android. Scan with <code>R2</code>, read both covers.", met: ["#10", "#19"] },
  ] },
  { ch: "03", name: "A New Home", who: "Kara", rows: [
    { id: "r1-03a", k: "magz", txt: "<b>Magazine object.</b> Living/dining room table. Do Todd's chores first so you have free run of the room.", met: ["#1", "#22"] },
    { id: "r1-03b", k: "magz", txt: "<b>Magazine object.</b> Todd's master bedroom, on top of the cupboard by the speakers.", met: ["#11", "#23"] },
  ] },
  { ch: "05", name: "The Painter", who: "Markus", rows: [
    { id: "r1-05a", k: "magz", txt: "<b>Magazine object.</b> Low coffee table in front of the TV, between the sofas in Carl's living room.", met: ["#2", "#27"] },
  ] },
  { ch: "06", name: "Partners", who: "Connor", rows: [
    { id: "r1-06a", k: "key", txt: "<b>Find the deviant in the attic.</b> Follow the thirium trail down the hall, spot the outline where the ladder was, drag the kitchen chair over, open the hatch.", met: ["Mandatory"], why: "No attic deviant means no Interrogation chapter — and death #2 becomes impossible. This is the single most permanent mistake available on this run." },
    { id: "r1-06b", k: "death", txt: "Tank Hank hard: <code>SPILL HIS DRINK</code>, then <code>THREATEN</code> / <code>PERSIST</code>, <code>FIRM</code> at the vehicle, and deliberately botch the crime reconstruction.", met: ["Hank ▼▼▼"], why: "Spilling his drink is the biggest single hit available this early. You need every one of these — see the note at The Nest for why." },
    { id: "r1-06c", k: "magz", txt: "<b>Magazine object.</b> Kitchen counter of the crime-scene house.", met: ["#12", "#25"] },
  ] },
  { ch: "07", name: "Broken", who: "Markus", rows: [
    { id: "r1-07a", k: "key", txt: "<b>Push Leo.</b> Take the hostile branch when he shoves you.", met: ["Unlocks #29"], why: "This is what makes magazine #29 spawn on the precinct desk in Waiting for Hank. The peaceful branch gives #28 instead — you pick that one up on Run 02." },
  ] },
  { ch: "09", name: "The Interrogation", who: "Connor", rows: [
    { id: "r1-09a", k: "death", txt: "<code>PROBE ITS MEMORY</code> → <code>PROBE</code> → <code>GET UP</code>, then <code>COLD</code>, then <code>LEAVE ROOM</code> → <code>INTERVENE</code> when the officer starts beating it. The deviant grabs Chris's pistol, shoots Connor, then itself.", met: ["Death 2 of 8", "Hank ▼"], why: "Its corpse also banks a deviant body in evidence — you need at least one by Last Chance, Connor." },
  ] },
  { ch: "10", name: "Fugitives", who: "Kara", rows: [
    { id: "r1-10a", k: "magz", txt: "<b>Magazine object.</b> Laundromat, in the cupboard beside the entrance door.", met: ["#3", "#26"] },
    { id: "r1-10b", k: "key", txt: "Sleep wherever you like tonight — this run doesn't care.", why: "Run 02 needs the car or the motel. Here it makes no difference, because On the Run is going loud either way." },
  ] },
  { ch: "11", name: "Jericho", who: "Markus", rows: [
    { id: "r1-11a", k: "magz", txt: "<b>Magazine object.</b> Bench on your right immediately after Markus steps off the train.", met: ["#13", "#32"], why: "#32 (Android on the Run!) only spawns because Kara gets spotted in the next Kara chapter. If you play On the Run stealthily you get a redundant duplicate instead." },
  ] },
  { ch: "12", name: "Waiting for Hank…", who: "Connor", rows: [
    { id: "r1-12a", k: "magz", txt: "<b>Magazine object.</b> Desk in the middle of the precinct — scannable with <code>R2</code>.", met: ["#30", "#29"], why: "#29 is here because you pushed Leo in Broken. Its twin #28 is Run 02." },
    { id: "r1-12b", k: "death", txt: "Keep grinding Hank down: <code>BASKETBALL</code>, <code>ANTI-ANDROIDS</code>, then argue every point in the case discussion.", met: ["Hank ▼▼"], why: "There is no winning response in the case argument — every option is a negative. Good." },
  ] },
  { ch: "13", name: "On the Run", who: "Kara + Connor", rows: [
    { id: "r1-13a", k: "key", txt: "<b>Let Kara be spotted.</b> Trigger the pursuit and take it to the freeway.", met: ["Unlocks #32, #35"], why: "This is what feeds Connor his freeway death, and it is what makes the chase-branch magazines exist in Jericho and Zlatko." },
    { id: "r1-13b", k: "warn", txt: "<b>As Kara: pass every crossing QTE and win the struggle.</b> Kara and Alice must survive this chapter.", met: ["ESCAPE DEATH depends on it"], why: "This is the trap PowerPyx walks you into. A dead Kara here ends ESCAPE DEATH for the entire run." },
    { id: "r1-13c", k: "death", txt: "<b>As Connor:</b> Hank orders you not to follow onto the freeway. Follow anyway, then fail the lane QTE. Connor is hit by a truck.", met: ["Death 3 of 8", "Hank ▼"] },
    { id: "r1-13d", k: "magz", txt: "<b>Magazine object.</b> Wherever Kara slept — squat: left side of the living area; motel: in front of the TV; car: on the ground in front of it.", met: ["#31", "Canada"], why: "All three locations give the same magazine, so the sleeping choice carries no risk here." },
  ] },
  { ch: "15", name: "The Nest", who: "Connor", rows: [
    { id: "r1-15a", k: "magz", txt: "<b>Magazine object.</b> Table in the small side room on the right — entered <em>before</em> the main pigeon room. Grab it first, the chase kills your chance.", met: ["#20", "#33"] },
    { id: "r1-15b", k: "death", txt: "On the rooftop chase, stop pressing buttons during the first slide, or miss the greenhouse gap jump. Connor falls.", met: ["Death 4 of 8"] },
    { id: "r1-15c", k: "warn", txt: "<b>Known cost:</b> this death happens <em>before</em> Hank goes over the ledge, so you never get the ▼▼▼ from abandoning him.", why: "This is the one real friction between the two trophies. It is why you cannot skip a single ▼ in Partners, Waiting for Hank or The Eden Club." },
  ] },
  { ch: "17", name: "Zlatko", who: "Kara", rows: [
    { id: "r1-17a", k: "key", txt: "<b>Free the androids in the basement.</b>", met: ["Unlocks the scarred android"], why: "The scarred android is the diversion you want at the recall centre — it is the only one whose sacrifice doesn't cost you a trophy." },
    { id: "r1-17b", k: "magz", txt: "<b>Magazine object.</b> Upstairs bedroom nightstand, found while searching the house for Alice.", met: ["#34", "#35"], why: "#35 is here because Kara got chased in On the Run. Its twin #41 needs the stealth route — Run 02." },
  ] },
  { ch: "18", name: "Russian Roulette", who: "Connor", rows: [
    { id: "r1-18a", k: "key", txt: "<b>Look at the photo of Cole</b> while you are in Hank's house.", met: ["Unlocks PHOTO at The Bridge"], why: "Doesn't move the relationship, but it opens the PHOTO dialogue option you want in the confrontation." },
    { id: "r1-18b", k: "magz", txt: "<b>Magazine object.</b> Hank's bedroom, on the floor by the nightstand opposite the bathroom.", met: ["#4", "#5"] },
  ] },
  { ch: "20", name: "The Eden Club", who: "Connor", rows: [
    { id: "r1-20a", k: "death", txt: "<b>Both Tracis must end up destroyed.</b> Win the fight, then <code>SHOOT</code>.", met: ["Hank ▼▼▼", "Evidence body"], why: "Double duty: the biggest remaining hit to Hank, and their bodies guarantee you have a deviant in evidence for death #7." },
    { id: "r1-20b", k: "magz", txt: "<b>Magazine object.</b> On a crate at the back of the warehouse area.", met: ["#14", "#36"] },
  ] },
  { ch: "21", name: "The Pirates' Cove", who: "Kara", rows: [
    { id: "r1-21a", k: "magz", txt: "<b>Magazine object.</b> On the barrels where Kara sets down the flashlight.", met: ["#24", "#37"] },
  ] },
  { ch: "22", name: "The Bridge", who: "Connor", rows: [
    { id: "r1-22a", k: "warn", txt: "<b>Check the flowchart before you start this chapter.</b> Hank's status must read <code>HOSTILE</code>. TENSE or above and he threatens you, walks off to get drunk, and you lose both the trophy and death #5.", met: ["Point of no return"], why: "The scene's dialogue cannot save you — the outcome is decided by the accumulated stat you walk in with." },
    { id: "r1-22b", k: "magz", txt: "<b>Magazine object.</b> On the bench directly in front of you after Connor gets out of the car — <em>before</em> you go and talk to Hank.", met: ["#8", "#40"], why: "The conversation ends free-roam. Miss it and you replay the chapter." },
    { id: "r1-22c", k: "death", txt: "<code>PERSONAL QUESTION</code> → <code>PHOTO</code> → <code>STOP DRINKING</code> → <code>SOFTWARE</code> → <code>COLD</code> ×3 → <code>NOT ALIVE</code> → <code>NOTHING</code>. When the gun comes out: <b>never pick △ YES.</b>", met: ["Death 5 of 8", "JUST A MACHINE"], why: "△ YES is showing fear — the only positive response in the set. Everything else lets him pull the trigger." },
  ] },
  { ch: "23", name: "The Stratford Tower", who: "Markus", rows: [
    { id: "r1-23a", k: "magz", txt: "<b>Magazine object.</b> Floor 47, on the counter in the restaurant/cafeteria area after the elevator.", met: ["#6", "#38"], why: "PowerPyx labels this chapter Connor — it isn't, it's Markus's infiltration. Location is still right." },
  ] },
  { ch: "24", name: "Public Enemy", who: "Connor", rows: [
    { id: "r1-24a", k: "magz", txt: "<b>Magazine object.</b> In the kitchen area adjacent to the broadcast room.", met: ["#16", "#21"] },
    { id: "r1-24b", k: "death", txt: "Interrogate the androids in the kitchen and expose the deviant on the left. It pins your hand and rips out your thirium pump regulator — <b>let the 1:45 timer run out.</b>", met: ["Death 6 of 8", "Hank ▼"] },
  ] },
  { ch: "25", name: "Midnight Train", who: "Kara", rows: [
    { id: "r1-25a", k: "magz", txt: "<b>Magazine object.</b> Rose's kitchen table. Only pickable <em>after Rose leaves the house</em> and <em>before you open the door</em> for the officer.", met: ["#9", "CyberLife"], why: "The narrowest window in the game. If you answer the door first it is gone for the run." },
    { id: "r1-25b", k: "key", txt: "Hide everything properly and keep the officer's suspicion low. <b>Keep Luther alive.</b>", met: ["Best ESCAPE DEATH outcome"], why: "A live Luther escapes with you at the fence. He is not required, but the alternative is losing him." },
  ] },
  { ch: "26", name: "Capitol Park", who: "Markus", rows: [
    { id: "r1-26a", k: "warn", txt: "<b>Magazine object — turn left before you take a single step.</b> The instant you gain control of Markus, turn left. It is on a box right beside you.", met: ["#7", "#39"], why: "The most commonly missed magazine in the game. Move first and it disappears." },
    { id: "r1-26b", k: "key", txt: "<b>Free the androids from the store and run a violent demonstration.</b>", met: ["Unlocks #42"], why: "This is what makes Android Riot spawn at the start of Freedom March." },
  ] },
  { ch: "27", name: "Meet Kamski", who: "Connor", rows: [
    { id: "r1-27a", k: "warn", txt: "<b><code>DON'T SHOOT</code> Chloe.</b> Non-negotiable.", met: ["Protects death 7"], why: "Shoot her and Kamski hands you the Jericho key, the chapter ends early, and the Gavin confrontation — death #7 — never happens." },
    { id: "r1-27b", k: "magz", txt: "<b>Magazine object.</b> Entrance hall: <b>look at the picture on the right-hand wall first</b>, then the magazine appears on the cupboard beneath it.", met: ["#17", "#15"], why: "It genuinely does not spawn until you have viewed the picture." },
  ] },
  { ch: "28", name: "Freedom March", who: "Markus", rows: [
    { id: "r1-28a", k: "magz", txt: "<b>Two magazine objects</b>, both one or two steps to the left of where the chapter starts.", met: ["#18", "#42"], why: "#42 is only here because of the violent Capitol Park. #18 is unconditional." },
    { id: "r1-28b", k: "key", txt: "<b>Charge the police.</b>", met: ["Unlocks #43, #44"], why: "Makes the magazine spawn in Connor's Jericho segment at Crossroads. Without it that object does not exist at all." },
    { id: "r1-28c", k: "warn", txt: "<b>Keep Markus alive.</b> PowerPyx suggests letting him die here to save an hour.", why: "It doesn't break ESCAPE DEATH outright, but it removes your backup route and no source confirms Kara's recall-centre sequence is unchanged with Markus dead. Not worth the gamble for one hour." },
  ] },
  { ch: "29", name: "Last Chance, Connor", who: "Connor", rows: [
    { id: "r1-29a", k: "key", txt: "Gavin stops you in the hallway — pick <code>LEAVE</code> or <code>ANSWER</code> → <code>IRONIC</code>. Never <code>CALM</code>.", why: "With Hank hostile he resigns and walks out instead of helping you, so you handle the room alone." },
    { id: "r1-29b", k: "key", txt: "Take the key from Hank's desk, then <b>open the holding cell and release the prisoner</b> to distract the FBI agent. Terminal password: <code>FUCKINGPASSWORD</code>.", why: "This is the documented fallback for a hostile-Hank run. Death #7 survives it." },
    { id: "r1-29c", k: "death", txt: "Analyse the deviant body, get Jericho's location, and on the way out Gavin comes back — <b>don't press any buttons.</b>", met: ["Death 7 of 8"], why: "Needs a deviant body in evidence. The Tracis cover you. With none, Connor is decommissioned and the run is dead." },
  ] },
  { ch: "30", name: "Crossroads", who: "Connor + Kara", rows: [
    { id: "r1-30a", k: "death", txt: "<b>As Connor:</b> choose <code>REMAIN A MACHINE</code>, then lose the race to the gun — don't press anything. Markus shoots Connor.", met: ["Death 8 of 8"], why: "If Markus is dead you get the corridor variant instead: pick FIGHT and fail the QTEs. Both count." },
    { id: "r1-30b", k: "magz", txt: "<b>Magazine object.</b> When Connor first walks into Jericho — on a box at the back of the area, scannable with <code>R2</code>.", met: ["#43", "#44"], why: "Only exists because Markus charged the police at Freedom March." },
    { id: "r1-30c", k: "key", txt: "<b>As Kara: <code>SURRENDER</code> → <code>OBEY</code>.</b> Flowchart node reads “Kara &amp; Alice captured.”", met: ["Sets up ESCAPE DEATH"], why: "Escaping here is the good outcome — you deliberately want to be taken to Recall Center #5." },
  ] },
  { ch: "31", name: "Night of the Soul", who: "Markus", rows: [
    { id: "r1-31a", k: "key", txt: "Choose <b>Demonstration</b> (the peaceful path).", met: ["Unlocks #45"], why: "Its twin #46 needs Revolution plus a free Kara at the bus terminal — impossible on this run since she is captured. That one is Run 02." },
    { id: "r1-31b", k: "death", txt: "<b>I'LL BE BACK pops here</b>, on the flowchart transition out of this chapter. Connor does not need to survive the ending.", met: ["Trophy"] },
  ] },
  { ch: "32", name: "Battle for Detroit", who: "Markus + Kara", rows: [
    { id: "r1-32a", k: "magz", txt: "<b>Magazine object — Markus's segment.</b> On a bench on the right side of the android encampment.", met: ["#45"] },
    { id: "r1-32b", k: "key", txt: "<b>Kara — recall centre, step 1:</b> when soldiers demand someone move a body, <b>volunteer</b> and carry it. Saying nothing gets you separated from Alice and killed." },
    { id: "r1-32c", k: "key", txt: "<b>Step 2:</b> you can climb the truck to scout — but <b>never leave Alice behind.</b> Move between the blue containers, and when the drone's red light catches you, <code>REMAIN STILL</code>." },
    { id: "r1-32d", k: "key", txt: "<b>Step 3:</b> rejoin Alice in the processing line and ask the <b>scarred android</b> to create the diversion.", why: "Jerry and Ralph both cost you trophies, and Luther costs you HAPPY FAMILY. The scarred android — freed from Zlatko's basement — is the only clean sacrifice." },
    { id: "r1-32e", k: "death", txt: "<b>Step 4:</b> run right for the barbed wire, hit every QTE, and when the soldier catches you at the fence — <code>FIGHT</code> and win the prompts.", met: ["ESCAPE DEATH"], why: "Watch Alice's stress the whole way. At 100% she bolts for Kara and you both die if you don't intervene." },
  ] },
];

export const RUN2: PlanChapter[] = [
  { ch: "A", name: "Chain A — Broken through Zlatko", who: "11 chapters", rows: [
    { id: "r2-a0", k: "key", txt: "<b>Chapter select → Broken</b>, then play continuously through to Zlatko. Do not skip ahead.", why: "The two magazines in this chain sit behind decisions made three and seven chapters earlier. Jumping straight to them spawns nothing." },
    { id: "r2-a1", k: "key", txt: "<b>Broken:</b> do <em>not</em> push Leo. Let him win.", met: ["Unlocks #28"] },
    { id: "r2-a2", k: "magz", txt: "<b>Waiting for Hank… </b> — precinct desk. You now get the other cover.", met: ["#28"] },
    { id: "r2-a3", k: "key", txt: "<b>Fugitives:</b> sleep in the <b>abandoned car or the motel</b>. Not the abandoned house.", met: ["Gates #41"] },
    { id: "r2-a4", k: "key", txt: "<b>On the Run:</b> sneak past <b>every single officer completely unseen.</b> No chase, no highway.", met: ["Gates #41"], why: "Any sighting flips the branch back to #35, which you already have." },
    { id: "r2-a5", k: "magz", txt: "<b>Zlatko</b> — upstairs bedroom nightstand.", met: ["#41"], why: "Sources conflict slightly on the direction of this branch. Four guides agree stealth gives #41. If it doesn't appear, the chase route is the fallback — but you already ran that in Run 01, so check Extras first." },
  ] },
  { ch: "B", name: "Chain B — Crossroads through the ending", who: "3 chapters", rows: [
    { id: "r2-b0", k: "key", txt: "<b>Chapter select → Crossroads</b>, play through Battle for Detroit.", why: "Short chain — the decision and the magazine are two chapters apart." },
    { id: "r2-b1", k: "key", txt: "<b>Crossroads (Kara):</b> escape instead of surrendering — <code>PLAY DEAD</code> → <code>REMAIN STILL</code>. Kara and Alice must stay free.", met: ["Gates #46"] },
    { id: "r2-b2", k: "key", txt: "<b>Night of the Soul:</b> choose <b>Revolution</b> this time.", met: ["Gates #46"] },
    { id: "r2-b3", k: "magz", txt: "<b>Battle for Detroit (Kara)</b> — right side of the bus terminal, at the pile of suitcases.", met: ["#46"], why: "Kara and Alice must both be alive and free to reach the terminal at all." },
    { id: "r2-b4", k: "key", txt: "Finish the chapter. <b>BOOKWORM</b> pops on the flowchart screen, and <b>DETROIT MASTER</b> follows immediately.", met: ["Platinum"] },
  ] },
];

export const MAGS: MagGroup[] = [
  { c: "Shades of Color", who: "Markus", where: "Bench to Markus's right at the very start, beside the old man and his android. Scan with R2.", run: 1, items: [
    { n: 10, t: "Tech Addict — Secrets of Androids" }, { n: 19, t: "Green Earth — Climate Change-Up" }] },
  { c: "A New Home", who: "Kara", where: "Two objects. First on the living/dining room table (do Todd's chores first); second in Todd's master bedroom, on top of the cupboard.", run: 1, items: [
    { n: 1, t: "Century — Connecting the Dots" }, { n: 22, t: "All Sports — Android Power!" },
    { n: 11, t: "Tech Addict — The Price of Life" }, { n: 23, t: "All Sports — Android QB" }] },
  { c: "The Painter", who: "Markus", where: "Low coffee table in front of the TV, between the sofas in Carl's living room.", run: 1, items: [
    { n: 2, t: "Century — The North Pole: Why Russia Wants It" }, { n: 27, t: "Detroit Today — Life Found on Titan!" }] },
  { c: "Partners", who: "Connor", where: "Kitchen counter of the murder-house crime scene.", run: 1, items: [
    { n: 12, t: "Tech Addict — Is Your Android Spying on You?" }, { n: 25, t: "Gossips Weekly — Android Sex Officially Better!" }] },
  { c: "Fugitives", who: "Kara", where: "Laundromat, in the cupboard next to the entrance door.", run: 1, items: [
    { n: 3, t: "Century — The Bee-Line to Disaster" }, { n: 26, t: "Gossips Weekly — It's Time to Face the Music" }] },
  { c: "Waiting for Hank…", who: "Connor", where: "Desk in the middle of the precinct, scannable with R2. One cover is always #30; the other depends on Broken.", run: 1, items: [
    { n: 30, t: "Detroit Today — Ivanoff Says “Niet”!" },
    { n: 29, t: "Detroit Today — The Three Laws of Robotic Parenting", b: "Only if Markus PUSHED Leo in Broken", run: 1 },
    { n: 28, t: "Detroit Today — Famous Detroit Painter Dies", b: "Only if Markus did NOT attack Leo in Broken", run: 2 }] },
  { c: "On the Run", who: "Kara", where: "Location follows where Kara slept — squat: left side of the living area; motel: in front of the TV; car: on the ground in front of it. All three give the same magazine.", run: 1, items: [
    { n: 31, t: "Detroit Today — Cyber-Wildlife" }] },
  { c: "Jericho", who: "Markus", where: "Bench on your right immediately after Markus steps off the train.", run: 1, items: [
    { n: 13, t: "Tech Addict — Android Astronauts (to Explore Io)" },
    { n: 32, t: "Detroit Today — Android on the Run!", b: "Only if Kara was SPOTTED in On the Run and fled the freeway", run: 1 }] },
  { c: "The Nest", who: "Connor", where: "Table in the small side room on the right, entered before you reach the main pigeon room.", run: 1, items: [
    { n: 20, t: "Green Earth — Past the Tipping Point" }, { n: 33, t: "Detroit Today — Red Ice Epidemic" }] },
  { c: "Zlatko", who: "Kara", where: "Upstairs bedroom nightstand, found while searching the house for Alice. One cover is always #34.", run: 1, items: [
    { n: 34, t: "Detroit Today — Arctic Tensions Escalate" },
    { n: 35, t: "Detroit Today — How Androids Alter Your Brain", b: "Only if Kara was SPOTTED in On the Run", run: 1 },
    { n: 41, t: "Detroit Today — AX400 Getaway", b: "Only if Kara slept in the car/motel AND was completely unseen in On the Run", run: 2 }] },
  { c: "Russian Roulette", who: "Connor", where: "Hank's bedroom, on the floor by the nightstand opposite the bathroom.", run: 1, items: [
    { n: 4, t: "Century — Tainted Love" }, { n: 5, t: "Century — Time to Pull the Plug" }] },
  { c: "The Eden Club", who: "Connor", where: "On a crate at the back of the warehouse area.", run: 1, items: [
    { n: 14, t: "Tech Addict — The First Immortals Are Among Us" }, { n: 36, t: "Detroit Today — The New Super-Powers" }] },
  { c: "The Pirates' Cove", who: "Kara", where: "On the barrels where Kara puts down the flashlight.", run: 1, items: [
    { n: 24, t: "Gossips Weekly — All-Android Band Tipped for Music Prize" }, { n: 37, t: "Detroit Today — USS Iowa Missing" }] },
  { c: "The Bridge", who: "Connor", where: "On the bench straight in front of you after Connor gets out of the car — grab it BEFORE talking to Hank.", run: 1, items: [
    { n: 8, t: "Century — The Mysterious Mister Kamski" }, { n: 40, t: "Detroit Today — Markets Predict War" }] },
  { c: "The Stratford Tower", who: "Markus", where: "Floor 47, on the counter in the restaurant/cafeteria area after the elevator.", run: 1, items: [
    { n: 6, t: "Century — President Warren: A Woman in Trouble" }, { n: 38, t: "Detroit Today — G.I. Android" }] },
  { c: "Public Enemy", who: "Connor", where: "In the kitchen area adjacent to the broadcast room.", run: 1, items: [
    { n: 16, t: "Tech Addict — Bleeding Blue" }, { n: 21, t: "Green Earth — Clean Food Craze" }] },
  { c: "Midnight Train", who: "Kara", where: "Rose's kitchen table. Only after Rose leaves the house, and before you open the door for the officer.", run: 1, items: [
    { n: 9, t: "Century — World War Three" }] },
  { c: "Capitol Park", who: "Markus", where: "Turn left the instant you gain control — before taking a single step. On a box beside you. If you move, it disappears.", run: 1, items: [
    { n: 7, t: "Century — An Android for President?" }, { n: 39, t: "Detroit Today — Who Is It?" }] },
  { c: "Meet Kamski", who: "Connor", where: "Entrance hall. Look at the picture on the right-hand wall FIRST — the magazine then spawns on the cupboard beneath it.", run: 1, items: [
    { n: 17, t: "Tech Addict — Space Tourism on the Rise" }, { n: 15, t: "Tech Addict — CyberLife's “Fortune Teller” Computer" }] },
  { c: "Freedom March", who: "Markus", where: "Both one or two steps to the left of where the chapter starts.", run: 1, items: [
    { n: 18, t: "Tech Addict — The Eastern Space Race" },
    { n: 42, t: "Detroit Today — Android Riot", b: "Only if Markus freed the store androids and ran a violent demonstration in Capitol Park", run: 1 }] },
  { c: "Crossroads (Connor)", who: "Connor", where: "On a box at the back of the area when Connor first enters Jericho. Scannable with R2.", run: 1, items: [
    { n: 43, t: "Detroit Today — Detroit in Chaos", b: "Only if Markus CHARGED the police in Freedom March", run: 1 },
    { n: 44, t: "Detroit Today — Android Terror in Detroit", b: "Only if Markus CHARGED the police in Freedom March", run: 1 }] },
  { c: "Battle for Detroit (Markus)", who: "Markus", where: "On a bench on the right side of the android encampment.", run: 1, items: [
    { n: 45, t: "Detroit Today — They Defy Us", b: "Only if Markus chose DEMONSTRATION in Night of the Soul", run: 1 }] },
  { c: "Battle for Detroit (Kara)", who: "Kara", where: "Right side of the bus terminal, at the pile of suitcases.", run: 2, items: [
    { n: 46, t: "Detroit Today — Civil War in Detroit", b: "Only if Markus chose REVOLUTION and Kara + Alice are free and alive", run: 2 }] },
];

export const TRAPS: Array<{ h: string; p: string }> = [
  { h: "Missing the attic deviant", p: "In Partners. No attic deviant means the Interrogation chapter never happens, which means death #2 is gone and I'LL BE BACK is impossible for the entire run. Thirium trail → ladder outline → kitchen chair → hatch." },
  { h: "Shooting Chloe at Kamski's", p: "Kamski hands you the Jericho location as a reward and the chapter ends early — so the Gavin confrontation, and death #7, never occurs. Always DON'T SHOOT." },
  { h: "Letting Kara die on the freeway", p: "PowerPyx actively recommends this to shorten the Connor run. It destroys ESCAPE DEATH: no living Kara means no capture at Crossroads and no recall centre. Pass her QTEs." },
  { h: "Hank above HOSTILE at The Bridge", p: "At TENSE or higher he threatens Connor and leaves to get drunk. You lose JUST A MACHINE and death #5 in the same moment. Check the flowchart relationship status before you start the chapter." },
  { h: "No deviant body in evidence", p: "By Last Chance, Connor you need at least one. Killing both Tracis at The Eden Club guarantees it. Without one, Connor is decommissioned and the run ends there." },
  { h: "Using chapter select for I'LL BE BACK", p: "Every source says this needs one continuous New Story run from The Hostage. The “replay from chapter select” workaround is unverified — don't bet 6 hours on it." },
  { h: "Moving at the start of Capitol Park", p: "The magazine sits beside you and vanishes if you take a single step first. It is the most-missed collectible in the game." },
  { h: "Answering the door at Midnight Train", p: "The kitchen magazine can only be taken after Rose leaves and before the officer comes in. Open the door first and it is gone for that run." },
  { h: "Playing on Casual", p: "Several of Connor's failure states — the freeway collisions especially — are documented as Experienced-only. Casual auto-passes QTEs you are deliberately trying to fail." },
];

export const CHAPTERS: Array<[string, number]> = [
  ["The Hostage", 51], ["Shades of Color", 58], ["A New Home", 89], ["Stormy Night", 28], ["The Painter", 61],
  ["Partners", 75], ["Broken", 68], ["From the Dead", 78], ["The Interrogation", 45], ["Fugitives", 41],
  ["Jericho", 82], ["Waiting for Hank…", 84], ["On the Run", 28], ["Time to Decide", 80], ["The Nest", 67],
  ["Zlatko", 59], ["Russian Roulette", 63], ["Spare Parts", 57], ["The Eden Club", 56], ["The Pirates' Cove", 87],
  ["The Bridge", 52], ["The Stratford Tower", 75], ["Public Enemy", 35], ["Midnight Train", 61], ["Capitol Park", 38],
  ["Meet Kamski", 45], ["Freedom March", 69], ["Last Chance, Connor", 50], ["Crossroads — Kara", 49], ["Crossroads — Connor", 13],
  ["Night of the Soul — Markus", 36], ["Night of the Soul — Connor", 0], ["Battle for Detroit — Markus Revolution", 24],
  ["Battle for Detroit — Kara Leaving Detroit", 58], ["Battle for Detroit — Connor at CyberLife Tower", 49],
  ["Battle for Detroit — Connor's Last Mission", 0],
];

export const DEATH_IDS = [
  "r1-01a", "r1-09a", "r1-13c", "r1-15b", "r1-22c", "r1-24b", "r1-29c", "r1-30a",
];

export const MAG_IDS = MAGS.flatMap((g) => g.items.map((i) => `mag-${i.n}`));

/** Plan rows that, once all checked, mean the trophy is in hand. */
export const TROPHY_GATES: Record<string, string[]> = {
  "these-are-our-stories": ["f1"],
  "ill-be-back": DEATH_IDS,
  "just-a-machine": ["r1-22c"],
  "escape-death": ["r1-32e"],
  bookworm: MAG_IDS,
};
