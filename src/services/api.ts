/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Course, Enrollment, LessonProgress, CareerPath } from "../types";

const BASE_URL = ""; // Relative paths since API is proxy-served from port 3000

export const api = {
  // Profile
  getProfile: async (): Promise<User> => {
    const res = await fetch(`${BASE_URL}/api/auth/profile`);
    return res.json();
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Career paths
  getCareerPaths: async (): Promise<CareerPath[]> => {
    const res = await fetch(`${BASE_URL}/api/career-paths`);
    return res.json();
  },

  // Courses
  getCourses: async (filters?: { level?: string; category?: string; search?: string }): Promise<Course[]> => {
    const query = new URLSearchParams();
    if (filters?.level) query.append("level", filters.level);
    if (filters?.category) query.append("category", filters.category);
    if (filters?.search) query.append("search", filters.search);

    const res = await fetch(`${BASE_URL}/api/courses?${query.toString()}`);
    return res.json();
  },

  getCourseById: async (id: string): Promise<Course> => {
    const res = await fetch(`${BASE_URL}/api/courses/${id}`);
    if (!res.ok) throw new Error("Course not found");
    return res.json();
  },

  // Enrollments
  getEnrollments: async (): Promise<(Enrollment & { course: Course })[]> => {
    const res = await fetch(`${BASE_URL}/api/enrollments`);
    return res.json();
  },

  enroll: async (courseId: string): Promise<Enrollment> => {
    const res = await fetch(`${BASE_URL}/api/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId })
    });
    return res.json();
  },

  // Progress
  getProgress: async (): Promise<LessonProgress[]> => {
    const res = await fetch(`${BASE_URL}/api/progress`);
    return res.json();
  },

  updateProgress: async (data: { courseId: string; lessonId: string; completed?: boolean; secondsWatched?: number }): Promise<LessonProgress> => {
    const res = await fetch(`${BASE_URL}/api/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Wishlist
  getWishlist: async (): Promise<{ id: string; userId: string; courseId: string }[]> => {
    const res = await fetch(`${BASE_URL}/api/wishlist`);
    return res.json();
  },

  toggleWishlist: async (courseId: string): Promise<{ wishlisted: boolean }> => {
    const res = await fetch(`${BASE_URL}/api/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId })
    });
    return res.json();
  },

  // Quiz submission
  submitQuiz: async (data: { courseId: string; quizId: string; answers: number[] }): Promise<{ scorePct: number; passed: boolean; correctCount: number; totalQuestions: number; userProfile: User }> => {
    const res = await fetch(`${BASE_URL}/api/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Recommendations
  getUserRecommendations: async (): Promise<{ course: Course; score: number; diagnostics: string[] }[]> => {
    const res = await fetch(`${BASE_URL}/api/recommend/user`);
    return res.json();
  },

  getSimilarRecommendations: async (courseId: string): Promise<{ course: Course; score: number }[]> => {
    const res = await fetch(`${BASE_URL}/api/recommend/similar?courseId=${courseId}`);
    return res.json();
  },

  getSkillGapRecommendations: async (): Promise<{ pathName: string; requiredSkills: string[]; currentSkills: string[]; missingSkills: string[]; recommendations: { course: Course; coveredSkills: string[]; score: number }[] }> => {
    const res = await fetch(`${BASE_URL}/api/recommend/skillgap`);
    return res.json();
  },

  // Gemini explainer
  askAiCoach: async (topic: string, context: string): Promise<{ explanation: string }> => {
    const res = await fetch(`${BASE_URL}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, context })
    });
    return res.json();
  }
};
