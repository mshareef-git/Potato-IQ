export interface HangmanWord {
  word: string;
  hint: string;
}

export const HANGMAN_WORDS: HangmanWord[] = [
  { word: "POTATO", hint: "The undisputed king of starchy root vegetables." },
  { word: "DOGESH", hint: "Your supreme canine instructor and overlord." },
  { word: "BANANA", hint: "Yellow fruit often found in comedic slipping accidents." },
  { word: "CLUELESS", hint: "An accurate description of your test performance." },
  { word: "ESCAPEE", hint: "What this prisoner is desperately trying to become." }
];

export function getRandomWord(): HangmanWord {
  return HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
}
