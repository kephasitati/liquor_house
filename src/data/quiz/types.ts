/** A multiple-choice question. `answer` indexes `options`; `fact` is shown after answering. */
export interface Question {
  q: string;
  options: string[];
  answer: number;
  fact: string;
  /** What it's about. A game deals across topics so no two questions in a row feel the same. */
  topic?: string;
  /** Where Kenyan schools teach it: Social Studies in primary, History & Government in high school. */
  level?: "Primary" | "High school";
}
