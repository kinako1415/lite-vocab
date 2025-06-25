export type AnswerType = "know" | "unknown" | "vague";

export interface QuizWord {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech?: string;
  example?: string;
}

export interface QuizAnswer {
  wordId: string;
  answerType: AnswerType;
  timestamp: number;
}

export interface QuizResult {
  totalWords: number;
  knowCount: number;
  unknownCount: number;
  vagueCount: number;
  answers: QuizAnswer[];
  completedAt: number;
}

export interface QuizProgress {
  currentIndex: number;
  totalWords: number;
  answers: QuizAnswer[];
}
