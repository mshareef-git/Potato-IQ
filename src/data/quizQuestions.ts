export interface QuizQuestion {
  id: string;
  title: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    title: "The Slanted Barn Riddle",
    prompt: "A rooster lays an egg on top of a slanted barn roof that slopes 45° to the left and 30° to the right. In which direction does the egg roll?",
    options: [
      "Left (steeper slope)",
      "Right (gentler slope)",
      "Straight down the ridge",
      "Roosters do not lay eggs"
    ],
    correctAnswer: "Roosters do not lay eggs",
    hint: "Have you tried looking at the question with greater emotional commitment?"
  },
  {
    id: "q2",
    title: "The Marathon Conundrum",
    prompt: "You are competing in a footrace and you sprint forward, overtaking the runner in second place. What position are you now in?",
    options: ["1st place", "2nd place", "3rd place", "Dead last"],
    correctAnswer: "2nd place",
    hint: "Do not overthink it, or underthink it, or think at all."
  },
  {
    id: "q3",
    title: "The Unnamed Peak",
    prompt: "Before Mount Everest was officially surveyed and documented by cartographers in 1856, what was the highest mountain on Earth?",
    options: ["K2", "Mount Everest", "Kilimanjaro", "Mount Olympus"],
    correctAnswer: "Mount Everest",
    hint: "Mountains usually exist before cartographers get paid to write about them."
  }
];
