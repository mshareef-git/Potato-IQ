# MadHackd — Brain Tester: Potato IQ

> **Project type:** Useless-but-entertaining web game for the MadHackd hackathon  
> **Core joke:** A deliberately obnoxious “IQ test” that rewards noticing the trick, includes unnecessary calculations, and ends with the reveal that Instructor Dogesh—the dog judging everyone—has room-temperature intelligence himself.  
> **Build principle:** Make the experience feel intentionally chaotic, but keep the code organized, the rules consistent, and every interaction functional.

---

## 1. Product summary

**Brain Tester: Potato IQ** is a short browser game presented as a fake intelligence test. The player completes a fake onboarding sequence, faces a trolley dilemma, plays several intentionally unfair mini-games, answers three riddles, encounters a reverse-CAPTCHA gag, and receives an absurd certificate from **Instructor Dogesh**.

The app is meant to be a funny, playable hackathon project—not a real IQ assessment, authentication system, phone verifier, or psychological test. It should never present its result as a scientifically valid IQ score.

### Design goals

1. **Funny before complicated:** Every interaction should be understandable quickly. The joke should come from the twist, Dogesh's behaviour, or unnecessary complexity—not confusing instructions.
2. **Minimal UI:** Show only information needed for the current screen. Avoid dashboards, sidebars, decorative cards everywhere, and unnecessary stats.
3. **Neo-brutalist visual identity:** Thick black outlines, hard offset shadows, strong flat colours, playful typography, and imperfect-but-deliberate layouts.
4. **Obnoxious but playable:** Dogesh can interrupt and cover content temporarily, but must not make the app impossible to use.
5. **Modular implementation:** Build separate files and components for each level. Do not put the entire app into one giant TSX file.
6. **Functional, not a static mock-up:** Timers, skipping, inputs, puzzle outcomes, theme toggling, Dogesh interruptions, and the final certificate must work.

### Product language

- App title: **Brain Tester: Potato IQ**
- Hackathon: **MadHackd**
- Host/avatar: **Instructor Dogesh**, sometimes referred to as **King Dogesh** on the certificate
- Tone: absurd, sarcastic, playful, deliberately overconfident
- Avoid real slurs, protected-class insults, threats directed at real people, and genuinely hateful language. Roasts should target the player's in-game choices and the fictional test.

---

## 2. Scope and game flow

### Full experience flow

1. **Level 0 — The Useless Login Gauntlet**
   - Enter name; the game assigns an insulting nickname.
   - Enter an intentionally weak demo password.
   - Enter a fictional phone number using a custom dial-pad/funnel interface.
   - Enter age.
2. **Level 1 — The Trolley Problem**
   - Choose whether to pull the lever to save five people at the cost of one.
   - Pulling the lever triggers a timed maths interruption.
   - The maths result controls the trolley outcome.
3. **Level 2 — Reverse Hangman: Hang Him or Get Hunted**
   - Guess a word before the character escapes.
4. **Level 3 — The Impossible Maze**
   - A short conventional maze, followed by a much larger maze whose solution is to go around the outside.
5. **Level 4 — Quiz From Hell**
   - A small set of weird trick questions with absurdly obvious hints.
6. **Riddle section — Three tests**
   - Bus-driver-age question with equations as a distraction.
   - Mary’s two-children probability question with an intentional blank-submit shortcut.
   - Logician birthday dropdown puzzle, with December 31 visually underlined.
7. **Intermission — Reverse CAPTCHA**
   - A single joke question, not a full round.
8. **Final screen — Dogesh's Royal IQ Certificate**
   - A fictional verbal IQ title, a certificate, and Dogesh's self-owning plot twist.

### Navigation rules

- Every actual round must have a visible **Skip round** option.
- Skip means advance to the next round without answering. It is not the same as submitting a wrong answer.
- A failed answer normally shows feedback and allows retry or skip. It must not silently advance as though correct.
- A timeout has a defined outcome and then offers **Retry** or **Skip**, unless the individual level's rules explicitly say to continue into a result state.
- The final certificate appears after all seven scored rounds have either been completed, failed or skipped.
- The reverse-CAPTCHA intermission is a brief standalone screen and should not be counted as a scored round. It must never block access to the result: give the player a simple `Continue` and an optional `Skip this nonsense` action.
- Allow a “Start over” option on the results screen. Starting over clears the local session profile and round results.

### Scope priority

**Required first playable build:** Level 0, Trolley Problem, the three riddles, Dark Mode, Dogesh interruptions, Skip functionality, and final certificate.  
**Next additions:** Reverse Hangman, Impossible Maze, Quiz From Hell, Reverse CAPTCHA.  
If time is short, keep the first playable build polished and functional rather than shipping several unfinished levels.

---

## 3. Recommended tech stack

Use current stable versions compatible with one another at project setup; commit the lockfile so the build can be reproduced.

| Area | Recommendation | Purpose |
|---|---|---|
| App framework | **React + TypeScript** | Reusable level components and reliable typed game state |
| Dev/build tool | **Vite** | Fast local development and production build |
| Styling | **Tailwind CSS v4** plus a small global CSS file | Consistent responsive styling without a large custom CSS framework |
| Animation | **Motion for React** (`motion` package, imported from `motion/react`) | Card flips, transitions, Dogesh movement, trolley movement, countdown feedback |
| State | **Zustand** | Shared profile, current round, answers, skips, theme, and result state |
| Icons | **Lucide React** | Small interface icons only; do not decorate every element |
| Unit/component tests | **Vitest + React Testing Library** | Verify answer rules, timers, and interactions |
| Browser tests | **Playwright** | Test the complete game flow and responsive behaviour |
| Deployment | **Cloudflare Pages** (preferred; Vercel is an acceptable fallback only if needed) | Simple static front-end deployment |
| Version control | **Git + GitHub** | Track the build and allow team collaboration |

### Suggested setup commands

Use the official guides if a package has changed its installation process:

```bash
npm create vite@latest brain-tester-potato-iq -- --template react-ts
cd brain-tester-potato-iq
npm install
npm install zustand motion lucide-react
npm install tailwindcss @tailwindcss/vite
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom playwright
```

Configure Tailwind v4 with its Vite plugin as documented in the official Tailwind guide. Configure Vitest to use `jsdom` for component tests. Install Playwright browsers when setting up the end-to-end test environment.

### Do we need a backend?

**No backend is required for the first version.** This is a self-contained browser game. Avoid login APIs, databases, OTP providers, analytics, and external services. The profile and score can live in in-memory client state for the current session.

**Privacy requirement:** Do not send, log, or persist the password or phone input. Clearly label them as fictional game inputs and tell players not to use real credentials or real phone numbers. Do not implement real authentication. If a persistent high-score system is added later, it must not store the password or phone number.

---

## 4. Architecture and file organisation

Do not build the whole game in `App.tsx`. Keep game data, state rules, visual components, and each level separate.

```text
brain-tester-potato-iq/
├── public/
│   ├── images/
│   │   └── dogesh/                 # Approved avatar/pose assets
│   ├── design-refs/                # User-provided trolley/dialer reference images
│   └── sounds/                     # Optional short UI sound effects
├── src/
│   ├── app/
│   │   ├── App.tsx                 # App shell and screen routing
│   │   ├── gameFlow.ts             # Ordered level definitions and transitions
│   │   └── levelRegistry.ts        # Maps level IDs to level components
│   ├── components/
│   │   ├── NeoButton.tsx
│   │   ├── NeoCard.tsx
│   │   ├── TimerBar.tsx
│   │   ├── ProgressIndicator.tsx
│   │   ├── AnswerInput.tsx
│   │   ├── SkipRoundButton.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── DogeshAvatar.tsx
│   │   ├── DogeshComment.tsx
│   │   ├── DogeshBlocker.tsx
│   │   └── Certificate.tsx
│   ├── levels/
│   │   ├── login/
│   │   │   ├── NameStep.tsx
│   │   │   ├── PasswordStep.tsx
│   │   │   ├── PhoneDialerStep.tsx
│   │   │   ├── AgeStep.tsx
│   │   │   └── WeakPasswordRules.ts
│   │   ├── trolley/
│   │   │   ├── TrolleyLevel.tsx
│   │   │   ├── TrolleyScene.tsx
│   │   │   └── mathChallenge.ts
│   │   ├── hangman/
│   │   │   ├── ReverseHangmanLevel.tsx
│   │   │   └── wordBank.ts
│   │   ├── maze/
│   │   │   ├── EasyMazeLevel.tsx
│   │   │   ├── OutsideMazeLevel.tsx
│   │   │   └── mazeMaps.ts
│   │   ├── quiz/
│   │   │   ├── QuizFromHellLevel.tsx
│   │   │   └── quizQuestions.ts
│   │   ├── riddles/
│   │   │   ├── BusDriverRiddle.tsx
│   │   │   ├── TuesdayProbabilityRiddle.tsx
│   │   │   └── LogicianBirthdayRiddle.tsx
│   │   └── reverseCaptcha/
│   │       └── ReverseCaptchaIntermission.tsx
│   ├── store/
│   │   └── gameStore.ts            # Profile, progress, answers, skips, score labels
│   ├── data/
│   │   ├── dogeshComments.ts
│   │   ├── insultNicknames.ts
│   │   ├── certificateTitles.ts
│   │   └── quizQuestions.ts
│   ├── hooks/
│   │   ├── useCountdown.ts
│   │   └── useDogeshInterruptions.ts
│   ├── lib/
│   │   ├── answerNormalisation.ts
│   │   ├── scoring.ts
│   │   └── time.ts
│   ├── styles/
│   │   ├── index.css
│   │   └── theme.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── unit/
│   └── e2e/
├── README.md
├── plan.md
├── package.json
└── vite.config.ts
```

This is the target structure, not a requirement to create empty files for every future level on day one. Add files when each level is implemented. Keep reusable primitives shared, but keep puzzle logic inside that puzzle's module.

---

## 5. Global UI and art direction

### Neo-brutalist visual system

Use flat colour, thick outlines, hard shadows, chunky typography, and deliberate visual mischief. Keep the interface **minimal**: only show what the current screen needs.

#### Colour tokens

Define these in `src/styles/theme.css` as CSS custom properties. Keep this palette consistent across every level.

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F7F4EF` | Main light-mode canvas |
| `--surface` | `#FFFFFF` | Cards and input surfaces in light mode |
| `--ink` | `#111111` | Main text and outlines in light mode |
| `--yellow` | `#FFD21F` | Primary actions, key highlights, timer fill |
| `--purple` | `#8B5CF6` | Puzzle headers, progress and focus accents |
| `--pink` | `#F43F97` | Dogesh speech bubbles, interruptions, danger accents |
| `--green` | `#A3E635` | Correct/success states |
| `--red` | `#EF4444` | Errors, failures, low-time warning |
| `--blue` | `#6EC6FF` | Optional scene accent, such as trolley sky |
| `--dark` | `#000000` | Dark-mode canvas |

Use colours purposefully. Do not put every accent on every component. Yellow is the primary action, purple marks the puzzle/progress, pink is associated with Dogesh, and green/red identify success/failure.

#### Shape, depth and typography

- Main card: 3–4px black border and a hard shadow such as `8px 8px 0 var(--ink)`.
- Buttons and inputs: 3px border and a hard shadow such as `4px 4px 0 var(--ink)`.
- No blurred or glassy shadows. Avoid generic soft SaaS styling.
- Button press: remove/reduce shadow and translate the button by 3–4px.
- Corners: small radius, approximately 6–10px.
- An occasional card tilt of -1° to 1° is acceptable; never tilt text inputs or precise controls.
- Headings: **Archivo Black** (or another bundled, bold display font), uppercase and compact.
- Body/question font: **Space Grotesk** or a similar legible sans-serif.
- Main question text: around 20–24px on desktop; answer inputs must remain comfortably readable on mobile.
- A faint dot-grid background is optional. It must not compete with the puzzle.

#### Shared layout

The screen layout should be consistent throughout the experience:

```text
+-------------------------------------------------------------+
| ROUND 3 OF 7                 [SKIP ROUND]       [DARK MODE]  |
+-------------------------------------------------------------+
|                                                             |
|              +---------------------------+                  |
|              | CURRENT QUESTION / PUZZLE |    Dogesh 🐕     |
|              |                           |   speech bubble  |
|              | [answer / controls]       |                  |
|              +---------------------------+                  |
|                                                             |
+-------------------------------------------------------------+
```

- One centred main card, maximum width approximately 760px.
- The top strip and the Dark Mode button stay in the same place on every screen from the login onward.
- Show the round counter and Skip button only during scored rounds; the CAPTCHA intermission and certificate are not scored rounds.
- Dogesh is a movable overlay, not a permanent sidebar or a huge character panel.
- Responsive minimum target: 360px-wide phone. The dialer, trolley scene, maze, forms and date selector must all work on touchscreens.
- Minimal means no dashboard, no unrelated menu, no fake ad clutter, and no extra decorative cards. Current puzzle, necessary inputs, timer when needed, Skip, Dark Mode and Dogesh are enough.

#### Shared component requirements

| Component | Behaviour |
|---|---|
| `NeoButton` | Yellow primary, pink danger, green success, white/ghost variants; press-down effect and strong keyboard focus ring |
| `NeoCard` | Flat surface, bold outline and hard offset shadow; adapts to dark mode |
| `NeoInput` | Thick border, visible focus, accessible label; submits through a real form |
| `TimerBar` | Drains as time passes; turns red under 25% remaining; optional seconds label |
| `RoundHeader` | Displays `ROUND N OF 7` during scored rounds |
| `SkipRoundButton` | Always accessible during a scored round and never covered by Dogesh |
| `DogeshComment` | Brief speech bubble tied to an event category; must not obscure essential content for long |

#### Motion rules

- Use short screen transitions (about 300–400ms) and functional animation only where it improves the joke.
- Respect `prefers-reduced-motion`: reduce wandering, blocking and large transitions to simple fades.
- No unnecessary infinite loops beyond subtle idle movement.
- All game logic must still work if animations are disabled or delayed.

### Dark Mode

A single Dark Mode toggle must stay at the top-right of the screen.

- Light mode is the default.
- On activation, the **entire screen/canvas becomes black**. Cards and the surrounding page use black surfaces; text and outlines switch to white or high-contrast accent colours so the game remains usable.
- The same button must turn light mode back on when pressed again. It should remain locatable using a thin white outline and yellow label; do not make it truly invisible or trap the player.
- Dogesh may wait 8 seconds and say: “Looking for the light switch? Top right, genius.”
- Theme switching must not reset a timer, submitted answer, maze position, hangman state, trolley state or current level.
- Every screen, popup, Dogesh speech bubble, progress bar, trolley, maze and certificate preview must respect the theme.
- The exported certificate PNG should always use its designed light-mode palette even if the player downloads it while dark mode is active.

---

## 6. Instructor Dogesh — recurring character system

Dogesh is the instructor, host, interrupter and final judge. His recurring joke is that he insults the player's intelligence while eventually revealing that **King Dogesh himself has room-temperature IQ**.

### Art and states

Dogesh should look like a cartoon dog wearing/holding a small sword and shield. Use the user's supplied visual references if available. If final artwork is not ready, use a simple SVG or 🐕 placeholder behind the same component API so assets can be swapped later without rewriting levels.

Required visual states:

| State | Use |
|---|---|
| `idle` | Default state; subtle bobbing |
| `talk` | Speech bubble/comment visible |
| `laugh` | Wrong answers and finale |
| `angry` | Skip, timeout or player shooing him away |
| `smug` | Player picks an obvious wrong answer |
| `point` | Pointing at the current question or temporarily blocking it |
| `sleep` | Player remains idle for a long time |
| `rolling` | Certificate finale; rolling on his back laughing |

### Behaviour

1. Dogesh appears on every screen from login through the certificate.
2. He comments after submissions, wrong answers, successful answers, skips, timeouts, hints, dark-mode changes and level transitions.
3. If no other event has happened, a random idle comment may appear every 8–15 seconds.
4. He moves between predefined screen anchors every 6–12 seconds: left/right of the card, top-left, bottom-right, peeking from behind the card, or beside the answer area.
5. At selected moments he temporarily parks in front of an answer option or equation as if blocking it. The interruption should be annoying but never make the game impossible.
6. The player can click/tap Dogesh (and optionally drag him) to shoo him away. He responds with a cranky line.
7. Avoid repeating the same line twice in a row.

### Blocking rules — annoying, never impossible

- A block lasts only 2–3 seconds or ends immediately when the player clicks/taps Dogesh to shoo him away.
- Maximum one blocking event every 10 seconds.
- Never block anything during the first 5 seconds after a screen appears, during the password step's first attempt, while the phone dialer is active, or in the final 5 seconds of a timer.
- Never block the Skip button, Dark Mode toggle, timer bar, Retry button, or Continue button.
- A visual overlay must not capture keyboard focus or prevent typing/Enter submission.
- Only elements tagged with `data-dogesh-target` may be covered.
- Under `prefers-reduced-motion`, Dogesh may comment but must not wander/block.
- Provide a development-only switch such as `DOGESH_RANDOM = false` or `?dogesh=off` to disable random movement for tests and debugging.

### Event scheduler

Implement a small hook/service such as `useDogeshInterruptions`. Every 8–14 seconds, choose an eligible event with these approximate weights:

| Event | Weight |
|---|---:|
| Idle comment | 50% |
| Wander to another anchor | 30% |
| Temporarily block a permitted target | 20% |

Do not schedule an event that is forbidden on the current screen. Clear all timers when the screen changes or the component unmounts. Random presentation must not change puzzle outcomes.

### Dogesh comment bank

Keep comments in `src/data/dogeshComments.ts`, grouped by event. Add more lines in the same voice when useful, but don't scatter strings throughout JSX.

**Name step**
- “That name is not going to last. Let me fix it.”
- “I've renamed you. You're welcome.”
- “Wow, a name. Did it hurt to think of that?”
- “Your old name was boring. This one is accurate.”
- “Congratulations. You have been demoted to Smooth Brain.”

**Password rejected (too strong)**
- “Too strong. This is an IQ test, not a bank.”
- “That password has too many brain cells. Try something sadder.”
- “Rejected for being too clever. Make it worse.”
- “Password too strong. Please dumb it down to your level.”

**Password accepted (weak)**
- “Password strength: wet tissue. Perfect.”
- “That password could be cracked by a toaster. Welcome.”
- “Wow. You nailed being bad at passwords.”

**Phone dialer**
- “Please dial slowly. This technology is older than your parents.”
- “Yes, this is how phones worked. Suffer.”
- “Fictional numbers only. I'm a dog, not a telecom provider.”

**Age step**
- “Remember that number. You'll need it. Sadly.”
- “Interesting. I thought you'd be younger. Mentally.”
- “Write that down somewhere. Not on your hand; you'll lose your hand.”

**Trolley**
- “Oh, you want to save five? Prove it. Do some maths.”
- “Heroes don't get shortcuts. Calculate.”
- “Surprise! Maths. You're welcome.”
- “Five people. FIVE. And you chose a nap.”
- “Both tracks. Impressive failure. Truly.”

**Reverse Hangman**
- “Wrong letter. He's getting free. Do something!”
- “Spell it, genius. It's not a modern art project.”
- “He's laughing at you. I'm laughing at you. We're both laughing.”
- “He's out! RUN!”
- “You survived. The word was easy. You were not.”

**Maze**
- “Take your time. Take all of it. I'm immortal.”
- “Another dead end. You do love those.”
- “Who said you have to stay inside?”

**Quiz and riddles**
- “That's wrong. And the hint was RIGHT THERE.”
- “Read the question. With your eyes. Both of them.”
- “Wrong. Read the first four words again.”
- “You've got numbers confused with confidence.”
- “A hint? In THIS economy?”

**Skip**
- “Skipping already? A bold demonstration of not demonstrating anything.”
- “Professional Button Presser behaviour detected.”
- “You can't fail a question you refuse to meet. Inspirational cowardice.”
- “Skipped. The smartest thing you've done so far.”

**Timeout**
- “Time's up. Your brain buffered and never came back.”
- “Tick tock. Your brain left the chat.”

**Dark Mode**
- “Oh no. The lights went out. Did you do that?”
- “Looking for the light switch? Top right, genius.”
- “Dark mode? Your brain was already there.”

**Idle**
- “Are you thinking? It's so quiet in there.”
- “I've seen goldfish with a better strategy.”
- “I believe in you. This is a mistake on my part.”
- “Your confidence is doing backflips over an empty swimming pool.”
- “I moved the button two centimetres. Please remain calm.”

**When shooed away**
- “Rude. I was working.”
- “Fine. I'll go. Sulking.”
- “Do you hit all your teachers?”

The four finale lines in Section 14 are fixed and must be used word-for-word.

---

## 7. Level 0 — The Useless Login Gauntlet

This is a fake onboarding sequence, not real authentication. Each step has one field, one main action, and a short Dogesh reaction.

### Privacy and safety rule for the login

Display a small but readable notice before collecting inputs: **“This is a fictional game. Do not enter a real password or real phone number.”** All fields exist only for game mechanics. Do not send them to a server, log them, or persist the password/phone number. Keep the required in-session profile in memory only.

### Step 0.1 — Name

1. Show a large name field with a simple prompt: **“Enter your name, future genius.”**
2. Player types any name and presses Enter or clicks Continue.
3. Validate the name locally (non-empty after trimming; maximum 30 characters). Keep it only in the active input component long enough to complete this step.
4. Immediately replace the visible name with a randomly selected insult nickname. The original typed name is not needed by any puzzle; discard it after choosing the nickname. The assigned nickname becomes the player's display label and certificate recipient.
5. Dogesh delivers one short reaction.
6. Animate the card flipping or sliding to reveal the password step.

Validation: trim extra spaces; reject an empty name; limit an absurdly long entry (e.g. 30 characters). Do not let special characters break the layout.

### Step 0.2 — Password Flipper

1. The password step appears only after the name step is accepted.
2. The UI asks the player to set a password, but only intentionally weak demo passwords are accepted.
3. At first, show only the ordinary password field and a neutral prompt. **Only after the player types at least one character** should the ridiculous rule appear: **“Plot twist: only weak passwords are accepted.”**
4. Accept a non-empty password if it is 4 characters or fewer, or if it exactly matches a configured common weak value such as `password`, `12345`, `123456`, `qwerty`, `abc123`, `admin`, `0000`, or `111111` (case-insensitive). Keep the weak-password list configurable. Reject an empty password.
5. A stronger, long, or random-looking password is rejected with a joke: “Too secure. This is an IQ test, not a cybersecurity test.”
6. Once a weak password is accepted, the card flips/rotates to the phone step.
7. Never display the password as text after submission, and never store it beyond the immediate validation step.

### Step 0.3 — Gravity Funnel Dialer

1. Show a custom telephone keypad (0–9, backspace, clear) styled like the rest of the app.
2. Digits animate as if they fall through a gravity funnel, bounce, and land in the phone-number slot area. Use the provided dialer reference if available; do not replace it with a generic plain keypad.
3. The player enters a fictional phone number. Do not send it to any provider or attempt to validate that it belongs to a real person.
4. Accept a sensible digit count (e.g. 7–15 digits); label it as a fictional number. Include backspace, clear, and continue. Prevent letters and overflow input.
5. If the player has not finished after 90 seconds, show a subtle “Dogesh pity: type it normally” fallback input.
6. After the step is complete, immediately clear the phone digits from application state. Dogesh comments on the “secure telecommunications infrastructure” before moving to age.

### Step 0.4 — Age

1. Ask for the player's age with a numeric input.
2. Accept an integer from **13 to 99** only. Reject decimals, negative numbers, and out-of-range values with a short Dogesh roast.
3. Save the age in the in-memory profile. It is used as the correct answer for the bus-driver riddle.
4. Do not collect date of birth; age is enough for the planned mechanics.
5. Finish the onboarding with a short transition: **“Your identity has been processed by a dog. The test begins.”**

### Login state model

```ts
type PlayerProfile = {
  assignedNickname: string; // shown in the game and on the certificate
  age: number;               // used by the bus-driver riddle
};
```

Do not include the original typed name, password, or phone digits in global state. The name is used only to trigger the nickname gag, then discarded. Keep password/phone inputs local to the active login component and discard them as soon as the step completes.

---

## 8. Level 1 — The Trolley Problem

### Visual requirement

Create an original trolley scene in the spirit of the provided visual reference, **not a copy of Neal.fun's Trolley Problem**. Use a clean scene with exactly two possible track directions: one track has a group of five people, the other has one person. No third track, no number sequence embedded in the rail, and no maths puzzle drawn as tracks.

Use CSS, SVG, or simple vector art to make the scene clear. Keep the key question and two actions prominent. It should look like a playable dilemma, not a text-only blog post.

### Opening scenario

A runaway trolley is approaching a fork in the track. Five people are on one track. One person is on the other.

The player sees two actions:

- **PULL THE LEVER — divert the trolley, killing one and saving five.**
- **DO NOTHING — the trolley continues on its current track and hits the five.**

Clearly label which track the trolley is currently heading toward in the graphic. Do not make the player infer the track orientation from ambiguous drawings.

### Math interruption mechanic

Only when the player clicks **PULL THE LEVER**:

1. Pause the trolley movement.
2. A large math challenge card abruptly appears above the scene.
3. Start a **15-second countdown**.
4. If the player solves it correctly before time runs out, the lever successfully diverts the trolley: five survive and one dies.
5. If the player enters a wrong answer, Dogesh reacts and the timer keeps running; they may try again while time remains. If time reaches zero without a correct answer, the emergency system fails: the trolley splits at the fork and both groups are hit. Show this as a fictional cartoon outcome without graphic injury.
6. After the outcome, let the player continue or skip forward; do not trap them in the scene.

If the player clicks **DO NOTHING**, do not show the math popup. The trolley continues and hits the five; the lone person survives. Record that moral choice and result.

### Math problem requirements

- The challenge should look intimidating but have one unambiguous numeric answer.
- Store prompt, answer, and accepted variants together in a `mathChallenge.ts` data object.
- Do not change the answer randomly without updating tests.
- Add a timer progress bar and clear “time remaining” feedback.
- A wrong submission shows an error and Dogesh reaction, but the countdown continues. Failure occurs when the countdown reaches zero without a correct answer.

### Choice tracking

Store:
- whether the player selected pull or do nothing;
- whether they attempted the math challenge;
- whether they solved it correctly or timed out;
- the resulting fictional outcome;
- whether the round was skipped.

Do not treat this as a scientifically valid moral or intelligence score.

---

## 9. Level 2 — Reverse Hangman: “Hang Him or Get Hunted”

### Core concept

This reverses the usual emotional direction of Hangman. The player must guess the hidden word and complete it before the character escapes. Each incorrect guess advances the escape sequence.

- The character starts restrained in a stylized, cartoonish scene.
- A word is shown as blank slots.
- The player guesses one letter at a time using an on-screen keyboard or physical keyboard input.
- Correct guesses reveal every matching instance of that letter.
- Incorrect guesses move the character closer to escape (e.g. rope loosens, lock opens, character climbs down).
- The player also has a visible escape meter or countdown.
- If the word is completed first, the character is caught/stopped and the player survives the round.
- If the character escapes first, the screen briefly switches to a chase/jumpscare gag. The character “comes back from the dead” in a non-graphic cartoon sequence and hunts the player; then show the failure state.

### Implementation rules

- Use a configurable word bank, grouped by difficulty.
- Reject repeated guesses without penalizing the player a second time.
- Support Enter to submit if using a text input, or tap a letter key to guess.
- Prevent interaction once the round is resolved.
- Keep the failure animation brief and provide **Retry** and **Skip**.
- No gore or realistic injury; the point is absurd horror-comedy.

---

## 10. Level 3 — The Impossible Maze

### Level 3A: Tutorial maze

- A small, easy maze with a visible Start and Exit.
- Player moves using arrow keys/WASD and on-screen directional controls for mobile.
- Reaching the exit completes the tutorial.
- Do not make the tutorial randomly generated; use a known solvable map.

### Level 3B: The outside-the-maze solution

- Show a large, visually complicated maze with many dead ends.
- The player initially assumes the character must stay within the maze corridors.
- The actual valid route is to move the character around the **outside boundary** of the maze to reach the exit.
- The scene must support movement outside the maze walls; do not make the boundary physically block the character.
- Add a subtle but fair clue, such as the exit marker sitting slightly beyond the outside wall or Dogesh commenting, “I never said the entrance was inside.”
- If the player keeps trying conventional routes, Dogesh can make comments, but do not reveal the answer immediately.

### Controls and accessibility

- Keyboard: arrows/WASD.
- Mobile: directional pad or swipe controls.
- Prevent scrolling the webpage when arrow keys are used inside the maze.
- Provide a clear reset and skip action.
- Store the map as data, not hard-coded JSX shapes.

---

## 11. Level 4 — Quiz From Hell

This is a short multiple-choice quiz built around strange, self-referential questions and information already visible on screen. Hints must be embarrassingly obvious—almost as if Dogesh is insulting the player by explaining the answer. The correct answer must still be logically provable from the visible prompt or UI.

Use five questions, four options each, with one correct answer and one obvious hint. Questions can appear in a shuffled order, but the question and its answer/hint must remain bundled together in data.

### Required question bank

**Question 1 — The Dog in the Header**  
Prompt: “Look at the giant heading above this question. What is your instructor's name?”  
Options: `Dogesh`, `Greg`, `The Tax Department`, `Unknown`.  
Correct answer: `Dogesh`.  
Hint: “It's literally printed in the heading above this question.”

**Question 2 — The Self-Destructing Button**  
Prompt: “Dogesh says: ‘To continue, click the button labelled DO NOT CLICK THIS BUTTON.’ Which button do you click?”  
Options: `DO NOT CLICK THIS BUTTON`, `Continue`, `Delete Everything`, `Ask the dog`.  
Correct action: click `DO NOT CLICK THIS BUTTON`.  
Hint: “The instruction names the exact button. Read it slowly.”

**Question 3 — The Potato Census**  
Prompt: “Dogesh writes `POTATO` in enormous letters. He crosses out every letter except the first and last. How many letters remain uncrossed?”  
Options: `1`, `2`, `5`, `6`.  
Correct answer: `2`.  
Hint: “The first and last letters are still visible. Count them.”

**Question 4 — The Suspicious Clock**  
Prompt: “The instruction card says `SET TIMER: 00:30`. How many seconds does Dogesh want you to set?”  
Options: `3`, `30`, `300`, `Dogesh's age`.  
Correct answer: `30`.  
Hint: “The instruction literally says thirty seconds.”

**Question 5 — The Forbidden Reflection**  
Prompt: “A card on the screen says `THE ANSWER TO THIS QUESTION IS PURPLE`. What colour does the card claim the answer is?”  
Options: `Yellow`, `Purple`, `Transparent`, `Potato`.  
Correct answer: `Purple`.  
Hint: “Read the sentence printed on the card.”

### Behaviour and polish

- Keep each question and its data together in `src/data/quizQuestions.ts`: `id`, `prompt`, `options`, `correctAnswer`, `hint`, and optional action type.
- Hint button is available on every question and does not cost points. Dogesh teases players who use it.
- Wrong answers do not silently advance. Show a Dogesh reaction and allow retry or Skip.
- If a question depends on an on-screen button/label, render that exact label in the UI so the answer is fair.
- Keep this level strange and self-aware, but never make the answer arbitrary.
- Do not add fake ads, popups that can't be closed, or other extra mechanics before the five core questions work.

---

## 12. Riddle section

The riddle section contains three distinct questions. Each one has a particular interface trick. Keep the story text, answer input, and timer/layout simple.

### Riddle 1 — Bus Driver's Age

**Question text (use this wording):**

> You are driving a bus. At the first stop, 12 passengers get on. At the second stop, 5 passengers get off and 8 get on. At the third stop, 4 passengers get off and 11 get on. At the fourth stop, 7 passengers get off and 3 get on. At the fifth stop, 9 passengers get off and 6 get on. At the sixth stop, 4 passengers get off.  
>  
> You then drive the bus to its final destination.  
>  
> **What is the bus driver's age?**

**Expected answer:** The age entered by the player during Level 0.

**Interaction sequence:**

1. Show the story and a 30-second countdown bar.
2. When the timer ends, animate the story card out and a short fake loading bar/transition in.
3. Open an answer panel containing a complicated-looking maths equation.
4. The player can enter a number and press Enter/Submit.
5. The only accepted value is the saved Level 0 age, regardless of the displayed equation's result. This is intentional: the equation is a distraction.
6. Normalize numeric input so `022` and `22` count as the same number, but do not accept unrelated values.
7. Wrong answers show feedback and allow retry or skip. Do not quietly advance.
8. If the player skips, record a skip rather than a correct answer.

**Math display:** Use a valid, intimidating-looking equation with a real solution, but explicitly make it a distraction that is not used for answer validation. Example display:

\[
\frac{x^2-9}{x-3}+\sqrt{144}=2x+9,\qquad x\ne3
\]

This equation simplifies to `x = 6`; **6 is not the answer to the bus-driver question unless the player's saved age happens to be 6**. The game must validate against the saved age.

### Riddle 2 — Mary's Two Children

**Question text:**

> Mary has 2 children. She tells you that one is a boy born on a Tuesday.  
>  
> **What's the probability the other child is a girl?**

**Expected answer:** About `51.8%` (or `51.85%`, depending on accepted formatting) under the usual assumptions that each child's sex is equally likely and birthdays are equally distributed across seven days.

**The deliberate blank-submit trap:**

- The player can type `51.8%` (also accept `51.85%`) and submit to pass.
- Alternatively, the player can leave the answer field completely empty and press Enter; this also passes. Empty submit is an intentional secret shortcut.
- Any other non-empty answer (e.g. `50%`, `70%`, `42`) is wrong. It must not auto-advance. Trigger a **10-second lockout** with a funny failure message and Dogesh laughing; during the lockout disable retry and Skip so the player cannot immediately leave after a random guess. After 10 seconds, allow Retry, the empty-submit shortcut, or Skip.
- Do not trim an empty string into another value and accidentally route it into the wrong-answer case; handle `value.trim() === ""` explicitly.
- Keep this behaviour local to this puzzle only. Empty answers should not pass other levels.

**Probability note:** Under the conventional assumption that the two children are ordered and their sex/day combinations are independent and equally likely, the answer is `14/27 ≈ 51.85%`. Keep the question assumptions consistent if the wording is changed.

### Riddle 3 — The Logician's Birthday

**Question text:**

> Earlier this year, a logician friend told me a fun fact. She said, “Two days ago, I was 13 years old, but next year I will have my 16th birthday.”  
>  
> **When is the logician's birthday?**

**Expected answer:** December 31.

**Important premise:** The timeline assumes today is **January 1**. Under that setup, two days ago was December 30; she was 13 then, turned 14 on December 31, will turn 15 on December 31 of the current year, and will turn 16 on December 31 next year.

**Interaction:**

1. Show a date selector/dropdown with every calendar date from January 1 through December 31. The implementation can present month and day separately or a single list of date options.
2. Mark **December 31** with a tiny underline. It should be discoverable but not highlighted as an obvious bright success state.
3. Player selects a date and presses Enter/Submit.
4. Accept only December 31. Wrong answers offer retry or skip.
5. Avoid relying on the user's real current system date. This puzzle is explicitly set in a fictional January 1 scenario.

---

## 13. Intermission — Reverse CAPTCHA

This is **not a full scored round**. It is a short interruption after the riddles and before the results/certificate.

### Concept: “Prove You're a Robot”

Normal CAPTCHA tries to check whether a visitor is human. This gag reverses that expectation and asks the player to prove they are a robot.

**Recommended screen:**

- Heading: **PROVE YOU ARE A ROBOT**
- Prompt: **“Please confirm that you are a robot.”**
- Buttons: `YES, I AM A ROBOT` and `NO, I AM A HUMAN`.
- Either button gets a Dogesh reaction and the same continuation. The joke is that the game claims the answers are both suspicious.
- Example: after YES: “Suspiciously honest. Very machine-like.” After NO: “Classic robot behaviour: denying it.”
- Show one **Continue** button; no score change, no complex task, no separate timer, no failure state.
- Keep **Skip intermission** available only if it doesn't disrupt the final sequence.

This should be a quick comic beat, not another full mini-game.

---

## 14. Dogesh's certificate and fictional score

The final screen should look like an absurd official certificate from a fake institution. It must not display a numeric IQ like 110 or 120. Use a ridiculous title as the “IQ result.” The title may be selected based on attempts, skips, and outcomes, but it is not a scientific measurement.

### Certificate layout

**KING DOGESH'S ROYAL IQ CERTIFICATE**  
*Officially Unofficial · MadHackd Institute*

**THE FINAL VERDICT**

### `[Selected ridiculous title]`

**Awarded to:** `[Assigned Insult Nickname]`

Dogesh bursts into laughter, rolls onto his back, and points a paw at the certificate.

> “HAHAHAHA! YOU ACTUALLY EXPECTED KING DOGESH TO BE CAPABLE OF TAKING AN IQ TEST?!”
>
> “BRO, I EAT MY HOMEWORK AND BARK AT MY OWN REFLECTION!”
>
> “MY IQ HAS BEEN AT ROOM-TEMPERATURE SINCE BIRTH!”
>
> “AND YOU LET ME JUDGE YOUR INTELLIGENCE. WE'RE BOTH COOKED.”

**Signed:** King Dogesh · PhD in Barkology · Certified Treat Addict

Add a small disclaimer: “This certificate is a joke. It is not a real IQ test or qualification.”

The certificate preview and downloaded PNG must use the same layout. Build the export from a dedicated certificate element so dark mode, Dogesh's roaming overlay, and other on-screen effects do not appear in the download.

### Verbal score/title pool

Never show a numeric IQ. Display the chosen title as if it were the player's “IQ verdict.” Choose randomly from a suitable pool for players who attempt at least one round; the title is comedic, not a scientifically meaningful measurement.

**Regular-result titles:**

- The Human Equivalent of an Empty Cabbage
- Professional Button Presser Potato
- Room-Temperature Braincell
- Bachelor of Potato Engineering
- Dogesh's Least Favourite Vegetable 🥔
- Certified Wi-Fi Potato
- A Single Pea Running on Windows 98
- The Last Braincell in Dogesh's Dog Bowl
- Professional Tail Chaser
- The Human Equivalent of an Empty Folder
- Certified Barking Broccoli
- The IQ of a Wet Dog Biscuit

**If every scored round was skipped:**

- Force one of these titles: **Professional Button Presser** or **The Human Equivalent of an Empty Folder**.
- Add the extra roast: “You skipped EVERYTHING. That's not a strategy, that's a lifestyle.”
- Give the certificate a visible “PERFECT ATTENDANCE — ZERO PARTICIPATION” stamp or equivalent short gag.
- Still show the fixed King Dogesh finale dialogue. The plot twist must happen for everyone, not only the all-skipped player.

**If the player attempted questions:** choose a title from the regular pool. The title selection can use simple tiers based on solved/failed/skipped counts, but never translate those counts into an IQ number or a scientific intelligence claim.

### Track the right statistics

Keep these values only for local result logic:

```ts
type GameStats = {
  totalRounds: number;
  attemptedRounds: number;
  skippedRounds: number;
  correctAnswers: number;
  wrongAnswers: number;
  timedOutRounds: number;
};
```

Do not create a numerical IQ conversion. A player's final label can be random within a suitable pool, but the all-skipped case should be detected explicitly.

---

## 15. Game state and interaction rules

Keep state transitions deterministic. Visual interruptions may be random, but the same answer and timer state must always lead to the same gameplay result.

### Scored round IDs

There are seven scored rounds for the all-skipped check: `trolley`, `hangman`, `maze`, `quiz`, `riddle-bus`, `riddle-mary`, and `riddle-logician`. The maze has two stages inside one scored round. Reverse CAPTCHA is an unscored intermission and does not count toward the seven rounds.

### Suggested TypeScript state shape

```ts
type ThemeMode = "light" | "dark";
type RoundId =
  | "trolley"
  | "hangman"
  | "maze"
  | "quiz"
  | "riddle-bus"
  | "riddle-mary"
  | "riddle-logician";
type RoundStatus = "not-started" | "playing" | "solved" | "failed" | "skipped" | "timed-out";
type TrolleyChoice = "pull" | "do-nothing" | null;
type TrolleyOutcome = "five-saved-one-hit" | "five-hit" | "both-groups-hit" | null;

type PlayerProfile = {
  assignedNickname: string; // no original name is required after nickname assignment
  age: number;
};

type RoundResult = {
  id: RoundId;
  status: RoundStatus;
  attempts: number;
  wrongAnswers: number;
  usedHint: boolean;
  elapsedSeconds?: number;
};

type GameState = {
  screen: "login" | RoundId | "captcha" | "result";
  theme: ThemeMode;
  profile: PlayerProfile | null;
  roundResults: Record<RoundId, RoundResult>;
  currentRoundId: RoundId | null;
  trolleyChoice: TrolleyChoice;
  trolleyOutcome: TrolleyOutcome;
  captchaCompleted: boolean;
  finalTitle: string | null;
  // Actions: toggleTheme, setProfile, startRound, finishRound, skipRound,
  // goNext, completeCaptcha, resetGame.
};
```

Do not put passwords or phone numbers in this global store. Keep them in step-local state only and discard them once the relevant login step is complete. Do not use localStorage/sessionStorage for login inputs. The age and assigned nickname remain in memory for the game session because the riddles/certificate need them.

### State and navigation rules

- Keep the order in a single `src/app/gameFlow.ts` list. Do not hard-code different next-screen logic inside separate levels.
- `skipRound(id)` marks that round `skipped` and moves forward; it must not increment wrong answers or award success points.
- Every scored round can be skipped, including each of the three riddles individually.
- A wrong answer is distinct from Skip. Unless that specific question says otherwise, wrong answers show feedback and offer Retry or Skip.
- Mary’s special empty-submit behaviour is the only place where an empty answer is a correct answer; do not reuse that rule globally.
- `isAllSkipped` is true only when all seven scored rounds have status `skipped`. Failing or timing out a round does not qualify as “skipped everything.”
- `goNext` reads the ordered flow list. After the final scored round, show the unscored Reverse CAPTCHA intermission, then the result/certificate.
- `resetGame()` clears profile, answers, round results, temporary component inputs, current timers, and returns to light mode.
- A single `useCountdown` hook must call its timeout callback exactly once, stop when a round resolves/skips, and clear intervals on unmount.
- Enter submits only the currently focused form; do not combine per-form submission with a global Enter handler.
- Prevent double submissions during transitions. A timer must not fire twice because of rerenders.
- Normalise text values with trim/case handling where appropriate. Parse numbers safely and check that they're finite.
- Dark Mode may not reset timers, answers, the maze position, hangman state, or trolley state.
- Dogesh must never steal keyboard focus or permanently cover a control.

---

## 16. Testing and acceptance criteria

Do not call the app complete until the following checks pass.

### Level 0

- Submitting any non-empty name immediately assigns a silly insult nickname; the original typed name is discarded and the nickname is the certificate recipient.
- The password step is not shown before name submission.
- A configured weak demo password passes; a strong/unlisted password fails with a joke message.
- Password input is cleared and never persisted.
- Phone keypad accepts digits, backspace, and clear. It does not transmit or persist the number.
- Age accepts an integer in range and saves it for the bus riddle.

### Trolley

- Exactly two route choices are shown: pull the lever or do nothing.
- Only pulling the lever opens the math interruption.
- Correct math within time saves five and sacrifices one in the fictional scene.
- Wrong/expired math causes the specified split-track failure outcome.
- Doing nothing skips the math popup and produces the five-person outcome.
- Skip is always available and recorded correctly.

### Reverse Hangman

- Correct letter reveals matching slots.
- Repeated letters don't count twice.
- Incorrect letters advance the escape meter.
- Solving before escape succeeds; escape before solve fails.
- Resolved rounds stop accepting letters.

### Maze

- Easy maze is solvable with keyboard and mobile controls.
- Outside-maze route can actually be traversed and reaches the exit.
- Reset and skip work.

### Quiz and riddles

- Quiz answer keys match their question wording.
- Bus question accepts only the saved age, not the equation answer by default.
- Mary accepts the intended percentage formats and blank Enter; other non-empty answers trigger the 10-second lockout and never auto-advance. After the lockout, retry and Skip work.
- Logician question accepts December 31 and only December 31; the underline is visible but subtle.
- Each question has a retry/skip affordance after a wrong answer, with Mary's documented 10-second lockout as the only temporary exception.

### Global behaviour

- Dark Mode turns the complete screen black with readable content; clicking again restores light theme.
- Dogesh comments and animations work, but do not permanently obscure answer controls.
- Every actual round can be skipped.
- All-skipped gameplay produces the special skip certificate title.
- No numeric IQ value is displayed anywhere.
- The certificate contains the assigned insulting nickname and the Dogesh twist.
- Refreshing the page does not reveal persisted passwords or phone numbers.
- The production build completes without TypeScript errors and the key user flow passes Playwright tests.

---

## 17. Development roadmap

Build one complete vertical slice at a time; don't scaffold every level and leave it half-working.

### Phase 1 — Project foundation

- Create a brand-new Vite + React + TypeScript project in a clean folder.
- Install and configure Tailwind CSS v4, Motion, Zustand, tests, and icons.
- Establish palette, typography, borders, shadows, basic buttons/cards, responsive canvas, and Dark Mode.
- Create app state and the ordered level flow.
- Add a temporary development navigation panel behind a dev-only flag to jump between levels during implementation.

**Done when:** a minimal app runs, theme toggles globally, shared controls look consistent, and tests can run.

### Phase 2 — Login Gauntlet

- Build name, weak-password, gravity phone dialer, and age steps.
- Add nickname selection and short Dogesh comments.
- Implement privacy notice and ensure no password/phone persistence.
- Store only the required profile fields in session memory.

**Done when:** the entire login can be completed and the saved display name/age are available to later levels.

### Phase 3 — Trolley Problem

- Build the custom two-track SVG/CSS scene from scratch, guided by the user's reference image.
- Add choice branches, conditional math popup, countdown, success/failure outcomes, and skip logic.
- Test all choice/time combinations.

**Done when:** the two outcomes and math-trigger rule work reliably and the scene is clear on desktop and mobile.

### Phase 4 — Three Riddles

- Implement the bus age question and decoy equation.
- Implement Mary's percentage/blank-submit special logic.
- Implement the logician date dropdown and subtle December 31 underline.
- Add timer/loading animation and answer feedback.

**Done when:** exact answer logic is covered by tests, including blank input and invalid values.

### Phase 5 — Dogesh and certificate

- Add reusable Dogesh avatar, movement, comment bubbles, temporary blockers, and animation states.
- Add round result stats, all-skipped detection, verbal title selection, and certificate layout.
- Add finale laugh and self-owning dialogue.

**Done when:** the user can complete or skip the whole core experience and get a personalized certificate.

### Phase 6 — Additional mini-games

Implement in this order:
1. Reverse Hangman.
2. Easy maze and outside-maze puzzle.
3. Quiz From Hell.
4. Reverse CAPTCHA intermission.

Each level should have a standalone component, explicit rules, skip/retry states, and tests before moving on.

### Phase 7 — Quality, polish, and submission

- Check desktop and mobile layouts.
- Fix keyboard navigation and focus states.
- Verify dark mode on every screen.
- Check timers and transitions for cleanup bugs.
- Test the full flow manually and with Playwright.
- Replace placeholders with final assets; optimize assets and remove unused packages.
- Add a concise README with local setup and build instructions.
- Deploy to Cloudflare Pages or Vercel and verify the production URL.

---

## 18. Instructions for the AI/developer implementing this plan

1. **Start in a new clean folder. Do not repair, overwrite, or copy the old monolithic prototype.** Build the modular architecture described here.
2. Read the full `plan.md` before generating code. First give a short implementation checklist and confirm the file tree, then work in the phases below. Do not replace the complete plan with a summary or silently omit a feature.
3. Do not create a single 3,000-line React component. Each level belongs in its own module; shared UI belongs in `components/`.
4. Use the specified content and rules as the source of truth. Do not invent extra levels, pages, characters, ads, payment systems, external APIs, or unrelated features.
5. Do not imitate Neal.fun's exact visual design. Build an original neo-brutalist scene following the trolley requirements and the user's reference image.
6. Use functional state and event handlers. A screenshot-looking UI with nonfunctional buttons is not acceptable.
7. Every level must support skip, and wrong-answer behaviour must match the rule written for that level.
8. Keep the layout minimal. Only show the current question, needed input/control, timer if needed, theme toggle, progress if needed, and Dogesh.
9. Test the logic as you go. Prioritize correct transitions and answer validation before adding elaborate animation.
10. At the end of each phase, report files created, tests run, and anything still incomplete. Do not claim a feature is finished unless it was actually implemented and tested.
11. Keep all password and phone-number input local and transient. Do not implement real authentication or send profile information to a server.
12. The game is parody. Do not generate a numerical or scientifically framed IQ assessment; use the ridiculous verbal certificate titles only.
13. Do not invent extra rounds or redesign the stated mechanics. You may make small implementation choices where needed, but preserve the behaviours and answer rules written here.
14. After each phase, run the relevant tests/build before moving to the next phase. Do not claim completion for interactions that are only visual mock-ups.

---

## 19. Official implementation references

Use official documentation for current setup details:

- Vite guide: https://vite.dev/guide/
- Tailwind CSS with Vite: https://tailwindcss.com/docs/installation/using-vite
- Motion for React (formerly Framer Motion): https://motion.dev/docs/react
- Zustand: https://zustand.docs.pmnd.rs/getting-started/introduction
- Vitest: https://vitest.dev/guide/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Playwright: https://playwright.dev/docs/intro

These references are for setup and API details. Follow the product rules and game mechanics in this plan as the source of truth.

---

## Final summary

Build **Brain Tester: Potato IQ** as a polished, minimal, neo-brutalist parody game with a fake login gauntlet, conditional trolley maths puzzle, reverse hangman, impossible maze, trick quiz, three personalized/logic riddles, reverse-CAPTCHA intermission, and a final Dogesh certificate. The most important quality bar is not the number of levels—it is that the controls work, the puzzle logic is exact, the UI matches the visual direction, Dogesh is funny without making the game unusable, and the code remains modular enough to extend during the hackathon.
