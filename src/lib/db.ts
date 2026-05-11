import Dexie, { type EntityTable } from 'dexie';

export interface Course {
  id?: number;
  title: string;
  fileData: string; // base64
  mimeType: string;
  summary: string;
  createdAt: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface CourseQuiz {
  id?: number;
  courseId: number;
  questions: QuizQuestion[];
  completed: boolean;
  score: number;
}

export class LearningAppDB extends Dexie {
  courses!: EntityTable<Course, 'id'>;
  quizzes!: EntityTable<CourseQuiz, 'id'>;

  constructor() {
    super('LearningAppDB');
    this.version(1).stores({
      courses: '++id, title, createdAt',
      quizzes: '++id, courseId, completed'
    });
  }
}

export const db = new LearningAppDB();
