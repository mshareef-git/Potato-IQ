import { create } from 'zustand';
import { FLOW_ORDER, getNextScreen, RoundId, SCORED_ROUND_IDS, ScreenId } from '../app/gameFlow';
import { getCertificateTitle } from '../data/certificateTitles';

export type ThemeMode = "light" | "dark";
export type RoundStatus = "not-started" | "playing" | "solved" | "failed" | "skipped" | "timed-out";
export type TrolleyChoice = "pull" | "do-nothing" | null;
export type TrolleyOutcome = "five-saved-one-hit" | "five-hit" | "both-groups-hit" | null;

export interface PlayerProfile {
  assignedNickname: string;
  age: number;
}

export interface RoundResult {
  id: RoundId;
  status: RoundStatus;
  attempts: number;
  wrongAnswers: number;
  usedHint: boolean;
  elapsedSeconds?: number;
}

export interface GameState {
  screen: ScreenId;
  theme: ThemeMode;
  profile: PlayerProfile | null;
  roundResults: Record<RoundId, RoundResult>;
  currentRoundId: RoundId | null;
  trolleyChoice: TrolleyChoice;
  trolleyOutcome: TrolleyOutcome;
  captchaCompleted: boolean;
  finalTitle: string | null;
  finalExtraRoast: string | null;
  finalStamp: string | null;
  isAllSkipped: boolean;
  riddleSubIndex: number; // 1, 2, or 3

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setProfile: (profile: PlayerProfile) => void;
  setScreen: (screen: ScreenId) => void;
  startRound: (id: RoundId) => void;
  recordAttempt: (id: RoundId, isWrong?: boolean) => void;
  finishRound: (id: RoundId, status: RoundStatus, usedHint?: boolean) => void;
  skipRound: (id: RoundId) => void;
  setTrolleyOutcome: (choice: TrolleyChoice, outcome: TrolleyOutcome) => void;
  setRiddleSubIndex: (subIndex: number) => void;
  skipRiddleSub: () => void;
  completeCaptcha: () => void;
  goNext: () => void;
  resetGame: () => void;
}

const initialRoundResults: Record<RoundId, RoundResult> = {
  trolley: { id: "trolley", status: "not-started", attempts: 0, wrongAnswers: 0, usedHint: false },
  hangman: { id: "hangman", status: "not-started", attempts: 0, wrongAnswers: 0, usedHint: false },
  maze: { id: "maze", status: "not-started", attempts: 0, wrongAnswers: 0, usedHint: false },
  riddles: { id: "riddles", status: "not-started", attempts: 0, wrongAnswers: 0, usedHint: false },
};

export const useGameStore = create<GameState>((set, get) => ({
  screen: "intro",
  theme: "light",

  profile: null,
  roundResults: { ...initialRoundResults },
  currentRoundId: null,
  trolleyChoice: null,
  trolleyOutcome: null,
  captchaCompleted: false,
  finalTitle: null,
  finalExtraRoast: null,
  finalStamp: null,
  isAllSkipped: false,
  riddleSubIndex: 1,

  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    set({ theme: next });
  },

  setTheme: (theme) => {
    set({ theme });
  },

  setProfile: (profile) => set({ profile }),

  setScreen: (screen) => {
    const isRound = SCORED_ROUND_IDS.includes(screen as RoundId);
    set({
      screen,
      currentRoundId: isRound ? (screen as RoundId) : null
    });
  },

  startRound: (id) => {
    set((state) => ({
      currentRoundId: id,
      roundResults: {
        ...state.roundResults,
        [id]: {
          ...state.roundResults[id],
          status: "playing"
        }
      }
    }));
  },

  recordAttempt: (id, isWrong = false) => {
    set((state) => {
      const prev = state.roundResults[id];
      return {
        roundResults: {
          ...state.roundResults,
          [id]: {
            ...prev,
            attempts: prev.attempts + 1,
            wrongAnswers: isWrong ? prev.wrongAnswers + 1 : prev.wrongAnswers
          }
        }
      };
    });
  },

  finishRound: (id, status, usedHint = false) => {
    set((state) => ({
      roundResults: {
        ...state.roundResults,
        [id]: {
          ...state.roundResults[id],
          status,
          usedHint: usedHint || state.roundResults[id].usedHint
        }
      }
    }));
  },

  skipRound: (id) => {
    set((state) => ({
      roundResults: {
        ...state.roundResults,
        [id]: {
          ...state.roundResults[id],
          status: "skipped"
        }
      }
    }));
    get().goNext();
  },

  setTrolleyOutcome: (trolleyChoice, trolleyOutcome) => {
    set({ trolleyChoice, trolleyOutcome });
  },

  setRiddleSubIndex: (riddleSubIndex) => {
    set({ riddleSubIndex });
  },

  skipRiddleSub: () => {
    const cur = get().riddleSubIndex;
    if (cur < 3) {
      set({ riddleSubIndex: cur + 1 });
    } else {
      // Last riddle skipped -> complete riddles as skipped
      get().skipRound('riddles');
    }
  },

  completeCaptcha: () => {
    set({ captchaCompleted: true });
    get().goNext();
  },

  goNext: () => {
    const current = get().screen;
    const next = getNextScreen(current);

    if (next === "result") {
      const results = get().roundResults;
      const allSkipped = SCORED_ROUND_IDS.every(
        (id) => results[id].status === "skipped"
      );
      const titleInfo = getCertificateTitle(allSkipped);

      set({
        screen: "result",
        currentRoundId: null,
        isAllSkipped: allSkipped,
        finalTitle: titleInfo.title,
        finalExtraRoast: titleInfo.extraRoast || null,
        finalStamp: titleInfo.stamp || null
      });
    } else {
      const isRound = SCORED_ROUND_IDS.includes(next as RoundId);
      set({
        screen: next,
        currentRoundId: isRound ? (next as RoundId) : null,
        riddleSubIndex: next === 'riddles' ? 1 : get().riddleSubIndex
      });
    }
  },

  resetGame: () => {
    set({
      screen: "intro",
      theme: "light",

      profile: null,
      roundResults: { ...initialRoundResults },
      currentRoundId: null,
      trolleyChoice: null,
      trolleyOutcome: null,
      captchaCompleted: false,
      finalTitle: null,
      finalExtraRoast: null,
      finalStamp: null,
      isAllSkipped: false,
      riddleSubIndex: 1
    });
  }
}));
