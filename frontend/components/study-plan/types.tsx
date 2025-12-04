import { PracticeSession } from "@/lib/types";

export interface TodoSession extends PracticeSession {
  priority?: "important" | "new-product" | "delayed";
  score?: number;
  examType?: "mock-exam";
}

export interface TodoSection {
  id: string;
  title: string;
  icon: string;
  todos: TodoSession[];
}
