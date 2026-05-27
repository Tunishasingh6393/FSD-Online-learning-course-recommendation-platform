/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  STUDENT = "STUDENT",
  INSTRUCTOR = "INSTRUCTOR",
  ADMIN = "ADMIN"
}

export enum Level {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  interests: string[]; // e.g. ["Artificial Intelligence", "Web Development"]
  targetSkills: string[]; // e.g. ["React", "TensorFlow", "SQL"]
  selectedCareerPath?: string; // e.g. "Full Stack Developer", "AI Engineer"
  currentSkills: string[]; // e.g. ["JavaScript", "HTML/CSS"]
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answerIndex: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
  passPct: number; // e.g. 70
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl?: string;
  contentMd: string; // Markdown content for lesson
  durationMin: number;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  level: Level;
  category: string; // "Web Development", "Artificial Intelligence", "Data Science", "Cybersecurity"
  skills: string[]; // Skills taught by this course, e.g. ["React", "Express", "REST APIs"]
  tags: string[]; // Metadata tags, e.g. ["javascript", "fullstack", "node"]
  thumbUrl: string;
  author: string;
  lessons: Lesson[];
  quiz?: Quiz;
  ratingAverage: number;
  enrolledStudentsCount: number;
}

export enum EnrollStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED"
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollStatus;
  startedAt: string;
  completedAt?: string;
}

export interface LessonProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  secondsWatched: number;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  userId: string;
  courseId: string;
  event: "view" | "wishlist" | "enroll" | "start_lesson" | "finish_lesson" | "rate" | "take_quiz";
  ts: string;
  meta?: any;
}

export interface Wishlist {
  id: string;
  userId: string;
  courseId: string;
}

export interface CareerPath {
  id: string;
  title: string;
  desc: string;
  requiredSkills: string[];
}
