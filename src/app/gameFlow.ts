export type RoundId =
  | "trolley"
  | "hangman"
  | "maze"
  | "riddles";

export type ScreenId = "intro" | "login" | RoundId | "captcha" | "result";

export const SCORED_ROUND_IDS: RoundId[] = [
  "trolley",
  "hangman",
  "maze",
  "riddles"
];

export const FLOW_ORDER: ScreenId[] = [
  "intro",
  "login",
  "trolley",
  "hangman",
  "maze",
  "riddles",
  "captcha",
  "result"
];

export function getRoundIndex(id: RoundId): number {
  return SCORED_ROUND_IDS.indexOf(id) + 1;
}

export function getNextScreen(current: ScreenId): ScreenId {
  const currentIndex = FLOW_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex >= FLOW_ORDER.length - 1) {
    return "result";
  }
  return FLOW_ORDER[currentIndex + 1];
}

export function isScoredRound(screen: ScreenId): screen is RoundId {
  return SCORED_ROUND_IDS.includes(screen as RoundId);
}

