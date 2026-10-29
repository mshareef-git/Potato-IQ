export type DogeshEvent =
  | "name"
  | "password-rejected"
  | "password-accepted"
  | "phone-dialer"
  | "age-step"
  | "trolley"
  | "hangman"
  | "maze"
  | "quiz"
  | "riddles"
  | "skip"
  | "timeout"
  | "dark-mode"
  | "idle"
  | "shooed"
  | "wrong-answer"
  | "correct-answer";

export const DOGESH_COMMENTS: Record<DogeshEvent, string[]> = {
  name: [
    "That name is not going to last. Let me fix it.",
    "I've renamed you. You're welcome.",
    "Wow, a name. Did it hurt to think of that?",
    "Your old name was boring. This one is accurate.",
    "Congratulations. You have been demoted to Smooth Brain."
  ],
  "password-rejected": [
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
    "Who said you have to stay inside?"
  ],
  quiz: [
    "That's wrong. And the hint was RIGHT THERE.",
    "Read the question. With your eyes. Both of them.",
    "Wrong. Read the first four words again.",
    "You've got numbers confused with confidence.",
    "A hint? In THIS economy?"
  ],
  riddles: [
    "That's wrong. And the hint was RIGHT THERE.",
    "Read the question. With your eyes. Both of them.",
    "Wrong. Read the first four words again.",
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
    "Are you thinking? It's so quiet in there.",
    "I've seen goldfish with a better strategy.",
    "I believe in you. This is a mistake on my part.",
    "Your confidence is doing backflips over an empty swimming pool.",
    "I moved the button two centimetres. Please remain calm."
  ],
  shooed: [
    "Rude. I was working.",
    "Fine. I'll go. Sulking.",
    "Do you hit all your teachers?"
  ],
  "wrong-answer": [
    "Wrong. But points for trying so aggressively bad.",
    "Incorrect! Even the dog knows this one.",
    "Have you considered guessing randomly? It might improve your score."
  ],
  "correct-answer": [
    "A broken clock is right twice a day.",
    "Did you look that up? Be honest.",
    "Fine, you got one right. Don't let it go to your head."
  ]
};

let lastComment = "";

export function getRandomComment(event: DogeshEvent): string {
  const pool = DOGESH_COMMENTS[event] || DOGESH_COMMENTS.idle;
  if (!pool.length) return "Woof.";
  
  // Avoid repeating the same line twice consecutively if possible
  const eligible = pool.length > 1 ? pool.filter(c => c !== lastComment) : pool;
  const picked = eligible[Math.floor(Math.random() * eligible.length)] || pool[0];
  lastComment = picked;
  return picked;
}
