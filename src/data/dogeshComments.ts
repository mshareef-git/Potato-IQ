export type DogeshEvent =
  | "intro"
  | "name"
  | "password-rejected"
  | "password-accepted"
  | "phone-dialer"
  | "age-step"
  | "trolley"
  | "hangman"
  | "maze"
  | "riddles"
  | "skip"
  | "timeout"
  | "dark-mode"
  | "idle"
  | "shooed"
  | "wrong-answer"
  | "correct-answer"
  | "spawn-gif";

export const DOGESH_COMMENTS: Record<DogeshEvent, string[]> = {
  intro: [
    "Welcome to your intellectual execution.",
    "Prepare your excuses now.",
    "I've seen smarter vegetables, but let's see."
  ],
  name: [
    "That name is not going to last. Let me fix it.",
    "I've renamed you. You're welcome.",
    "Wow, a name. Did it hurt to think of that?",
    "Your old name was boring. This one is accurate.",
    "Congratulations. You have been demoted to Smooth Brain."
  ],
  "password-rejected": [
    "Too strong! Dumb it down.",
    "Too strong. This is an IQ test, not a bank.",
    "That password has too many brain cells. Try something sadder.",
    "Rejected for being too clever. Make it worse.",
    "Password too strong. Please dumb it down to your level."
  ],
  "password-accepted": [
    "Password strength: wet tissue. Perfect.",
    "That password could be cracked by a toaster. Welcome.",
    "Wow. You nailed being bad at passwords."
  ],
  "phone-dialer": [
    "Please dial slowly. This technology is older than your parents.",
    "Yes, this is how phones worked. Suffer.",
    "Fictional numbers only. I'm a dog, not a telecom provider."
  ],
  "age-step": [
    "Remember that number. You'll need it. Sadly.",
    "Interesting. I thought you'd be younger. Mentally.",
    "Write that down somewhere. Not on your hand; you'll lose your hand."
  ],
  trolley: [
    "Oh, you want to save five? Prove it. Do some maths.",
    "Heroes don't get shortcuts. Calculate.",
    "Surprise! Maths. You're welcome.",
    "Five people. FIVE. And you chose a nap.",
    "Both tracks. Impressive failure. Truly."
  ],
  hangman: [
    "Wrong letter. He's getting free. Do something!",
    "Spell it, genius. It's not a modern art project.",
    "He's laughing at you. I'm laughing at you. We're both laughing.",
    "He's out! RUN!",
    "You survived. The word was easy. You were not."
  ],
  maze: [
    "Take your time. Take all of it. I'm immortal.",
    "Another dead end. You do love those.",
    "Who said you had to respect the walls?",
    "Who said you have to stay inside?"
  ],
  riddles: [
    "That's wrong. And the answer is right in front of you.",
    "Read the question. With your eyes. Both of them.",
    "Wrong. Read the very first sentence again.",
    "You've got numbers confused with confidence.",
    "A hint? In THIS economy?"
  ],
  skip: [
    "Skipping already? A bold demonstration of not demonstrating anything.",
    "Professional Button Presser behaviour detected.",
    "You can't fail a question you refuse to meet. Inspirational cowardice.",
    "Skipped. The smartest thing you've done so far."
  ],
  timeout: [
    "Time's up. Your brain buffered and never came back.",
    "Tick tock. Your brain left the chat."
  ],
  "dark-mode": [
    "Oh no. The lights went out. Did you do that?",
    "Looking for the light switch? Top right, genius.",
    "Dark mode? Your brain was already there."
  ],
  idle: [
    "Are you thinking? It’s so quiet in there.",
    "I believe in you. This is a mistake on my part.",
    "That answer came from the factory-reset part of your brain.",
    "Professional Button Presser behaviour detected.",
    "My dog bowl has a more promising applicant.",
    "You’re taking the test. I’m taking emotional damage.",
    "I've seen goldfish with a better strategy.",
    "Your confidence is doing backflips over an empty swimming pool."
  ],
  shooed: [
    "HEY! THAT WAS UNCALLED FOR!",
    "HOW DARE YOU STRIKE YOUR ROYAL INSTRUCTOR?!",
    "Rude! I was working on my thesis on your incompetence.",
    "Fine. I'll go. Sulking in the corner.",
    "Do you hit all your educators?"
  ],
  "wrong-answer": [
    "Wrong. That answer came from the factory-reset part of your brain.",
    "Incorrect! Even my chew toy knows this one.",
    "Have you considered guessing randomly? It might improve your score."
  ],
  "correct-answer": [
    "A broken clock is right twice a day.",
    "Did you look that up? Be honest.",
    "Fine, you got one right. Don't let it go to your head."
  ],
  "spawn-gif": [
    "Distraction incoming! Try focusing through THIS.",
    "Enjoy this retro pop-up from my personal collection.",
    "You looked bored. Here's some vintage internet chaos.",
    "Behold! A distraction engineered specifically to derail your thoughts."
  ]
};

export const CAPTCHA_IDLE_COMMENTS: string[] = [
  "Look at that webcam feed. Is that a potato or your face?",
  "Fourteen of your fingers are thoroughly confused right now.",
  "Your webcam has higher resolution than your problem solving.",
  "That tile does not belong there. Nor do you.",
  "I've seen smarter toasters solve CAPTCHAs faster.",
  "Hold still, you're scaring the computer vision model.",
  "Pinch harder. Maybe the puzzle will take pity on you.",
  "Fascinating. Organic intelligence at its absolute lowest frequency.",
  "Did your brain buffer while loading this puzzle?",
  "Even a dial-up modem could unscramble a face faster than this."
];

let lastComment = "";
let lastCaptchaComment = "";

export function getRandomComment(event: DogeshEvent): string {
  const pool = DOGESH_COMMENTS[event] || DOGESH_COMMENTS.idle;
  if (!pool.length) return "Woof.";
  
  // Avoid repeating the same line twice consecutively if possible
  const eligible = pool.length > 1 ? pool.filter(c => c !== lastComment) : pool;
  const picked = eligible[Math.floor(Math.random() * eligible.length)] || pool[0];
  lastComment = picked;
  return picked;
}

export function getRandomCaptchaComment(): string {
  const pool = CAPTCHA_IDLE_COMMENTS;
  const eligible = pool.filter(c => c !== lastCaptchaComment);
  const picked = eligible[Math.floor(Math.random() * eligible.length)] || pool[0];
  lastCaptchaComment = picked;
  return picked;
}

