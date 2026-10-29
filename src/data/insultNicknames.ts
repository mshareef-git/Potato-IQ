export const INSULT_NICKNAMES: string[] = [
  "Smooth Brain",
  "Certified Potato",
  "Buffering Brain",
  "404 Brain Not Found",
  "Wet Noodle Thinker",
  "Soggy Biscuit",
  "Unpaid Intern of Intelligence",
  "Captain Obvious Jr.",
  "Half-Baked Samosa",
  "The Human Equivalent of an Empty Folder",
  "Professional Button Presser",
  "One Pea Running on Windows 98"
];

export function getRandomNickname(): string {
  const index = Math.floor(Math.random() * INSULT_NICKNAMES.length);
  return INSULT_NICKNAMES[index];
}
