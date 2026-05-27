/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import { INITIAL_COURSES, SAMPLE_CAREER_PATHS } from "./src/coursesData";
import { Role, Level, EnrollStatus, User, Enrollment, LessonProgress, Interaction, Wishlist } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// ==========================================
// IN-MEMORY DATABASE ENGINE (SEED DATA)
// ==========================================
let users: User[] = [
  {
    id: "user-current",
    email: "student@aistudio.edu",
    name: "Guest Student",
    role: Role.STUDENT,
    interests: ["Web Development"],
    targetSkills: ["React", "Express", "Tailwind CSS"],
    currentSkills: ["JavaScript", "HTML/CSS"],
    selectedCareerPath: "path-1", // Full Stack Engineer
  }
];

// Seed other users to enable REAL Collaborative Filtering simulations!
// We want users with shared courses so co-occurrence models are mathematically interesting.
const seed_users = [
  { id: "s-101", name: "Alice Kim", interests: ["Web Development", "Artificial Intelligence"] },
  { id: "s-102", name: "Devon Miller", interests: ["Artificial Intelligence", "Data Science"] },
  { id: "s-103", name: "Carlos Mendez", interests: ["Cybersecurity", "Web Development"] },
  { id: "s-104", name: "Tariq Ali", interests: ["Data Science", "Artificial Intelligence"] },
  { id: "s-105", name: "Maya Lin", interests: ["Web Development", "Cybersecurity"] }
];

const seed_enrollments: Enrollment[] = [
  // Alice Kim took full stack and deep learning
  { id: "se-1", userId: "s-101", courseId: "course-1", status: EnrollStatus.COMPLETED, startedAt: "2026-01-10T10:00:00Z" },
  { id: "se-2", userId: "s-101", courseId: "course-2", status: EnrollStatus.COMPLETED, startedAt: "2026-01-15T10:00:00Z" },
  
  // Devon took deep learning and LLM tech
  { id: "se-3", userId: "s-102", courseId: "course-2", status: EnrollStatus.COMPLETED, startedAt: "2026-02-10T11:00:00Z" },
  { id: "se-4", userId: "s-102", courseId: "course-5", status: EnrollStatus.ACTIVE, startedAt: "2026-02-12T11:00:00Z" },
  
  // Carlos took cybersecurity defense and full stack
  { id: "se-5", userId: "s-103", courseId: "course-4", status: EnrollStatus.COMPLETED, startedAt: "2026-03-01T12:00:00Z" },
  { id: "se-6", userId: "s-103", courseId: "course-1", status: EnrollStatus.ACTIVE, startedAt: "2026-03-05T12:00:00Z" },
  
  // Tariq took foundations datascience and LLM tech
  { id: "se-7", userId: "s-104", courseId: "course-3", status: EnrollStatus.COMPLETED, startedAt: "2026-04-01T09:00:00Z" },
  { id: "se-8", userId: "s-104", courseId: "course-5", status: EnrollStatus.COMPLETED, startedAt: "2026-04-05T09:00:00Z" },

  // Maya took full stack and cybersecurity defense
  { id: "se-9", userId: "s-105", courseId: "course-1", status: EnrollStatus.COMPLETED, startedAt: "2026-05-01T15:00:00Z" },
  { id: "se-10", userId: "s-105", courseId: "course-4", status: EnrollStatus.ACTIVE, startedAt: "2026-05-03T15:00:00Z" }
];

let enrollments: Enrollment[] = [...seed_enrollments];
let progress: LessonProgress[] = [];
let interactions: Interaction[] = [];
let wishlists: Wishlist[] = [];
let courses = [...INITIAL_COURSES];

// Helper to get active user
const getCurrentUser = () => users[0];

// ==========================================
// REST API ROUTES
// ==========================================

// Auth & User Profile endpoints
app.get("/api/auth/profile", (req, res) => {
  res.json(getCurrentUser());
});

app.post("/api/auth/profile", (req, res) => {
  const { name, interests, targetSkills, currentSkills, selectedCareerPath } = req.body;
  const user = getCurrentUser();
  if (name !== undefined) user.name = name;
  if (interests !== undefined) user.interests = interests;
  if (targetSkills !== undefined) user.targetSkills = targetSkills;
  if (currentSkills !== undefined) user.currentSkills = currentSkills;
  if (selectedCareerPath !== undefined) user.selectedCareerPath = selectedCareerPath;
  res.json(user);
});

// Career paths
app.get("/api/career-paths", (req, res) => {
  res.json(SAMPLE_CAREER_PATHS);
});

// Courses Endpoints
app.get("/api/courses", (req, res) => {
  const { level, category, search } = req.query;
  let filtered = [...courses];

  if (level) {
    filtered = filtered.filter(c => c.level === level);
  }
  if (category) {
    filtered = filtered.filter(c => c.category === category);
  }
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(
      c => c.title.toLowerCase().includes(s) || 
           c.desc.toLowerCase().includes(s) || 
           c.skills.some(sk => sk.toLowerCase().includes(s)) ||
           c.tags.some(t => t.toLowerCase().includes(s))
    );
  }
  res.json(filtered);
});

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json(course);
});

// Enrollments Endpoints
app.get("/api/enrollments", (req, res) => {
  const user = getCurrentUser();
  const userEnrollments = enrollments.filter(e => e.userId === user.id);
  const detailed = userEnrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId);
    return {
      ...e,
      course
    };
  });
  res.json(detailed);
});

app.post("/api/enrollments", (req, res) => {
  const { courseId } = req.body;
  const user = getCurrentUser();
  
  const existing = enrollments.find(e => e.userId === user.id && e.courseId === courseId);
  if (existing) {
    return res.json(existing);
  }

  const newEnrollment: Enrollment = {
    id: `enroll-${Date.now()}`,
    userId: user.id,
    courseId,
    status: EnrollStatus.ACTIVE,
    startedAt: new Date().toISOString()
  };

  enrollments.push(newEnrollment);

  // Auto-record interaction
  interactions.push({
    id: `int-${Date.now()}`,
    userId: user.id,
    courseId,
    event: "enroll",
    ts: new Date().toISOString()
  });

  // Track state change
  const course = courses.find(c => c.id === courseId);
  if (course) {
    course.enrolledStudentsCount += 1;
  }

  res.json(newEnrollment);
});

// Progress Tracking Endpoints
app.get("/api/progress", (req, res) => {
  const user = getCurrentUser();
  const userProgress = progress.filter(p => p.userId === user.id);
  res.json(userProgress);
});

app.post("/api/progress", (req, res) => {
  const { courseId, lessonId, completed, secondsWatched } = req.body;
  const user = getCurrentUser();

  let entry = progress.find(p => p.userId === user.id && p.courseId === courseId && p.lessonId === lessonId);
  if (!entry) {
    entry = {
      userId: user.id,
      courseId,
      lessonId,
      completed: completed || false,
      secondsWatched: secondsWatched || 0,
      updatedAt: new Date().toISOString()
    };
    progress.push(entry);
  } else {
    if (completed !== undefined) entry.completed = completed;
    if (secondsWatched !== undefined) entry.secondsWatched = secondsWatched;
    entry.updatedAt = new Date().toISOString();
  }

  // If completed, check if all lessons are done to trigger automatic completion
  if (completed) {
    // Record interaction
    interactions.push({
      id: `int-${Date.now()}-${lessonId}`,
      userId: user.id,
      courseId,
      event: "finish_lesson",
      ts: new Date().toISOString(),
      meta: { lessonId }
    });

    const courseObj = courses.find(c => c.id === courseId);
    if (courseObj) {
      const allLessons = courseObj.lessons.map(l => l.id);
      const completedCount = progress.filter(p => p.userId === user.id && p.courseId === courseId && p.completed).length;
      
      // If course has no quiz, we can auto-complete. Otherwise, wait for quiz submission.
      if (completedCount >= allLessons.length && !courseObj.quiz) {
        const enrollment = enrollments.find(e => e.userId === user.id && e.courseId === courseId);
        if (enrollment && enrollment.status !== EnrollStatus.COMPLETED) {
          enrollment.status = EnrollStatus.COMPLETED;
          enrollment.completedAt = new Date().toISOString();
        }
      }
    }
  }

  res.json(entry);
});

// Wishlist Endpoints
app.get("/api/wishlist", (req, res) => {
  const user = getCurrentUser();
  const items = wishlists.filter(w => w.userId === user.id);
  res.json(items);
});

app.post("/api/wishlist", (req, res) => {
  const { courseId } = req.body;
  const user = getCurrentUser();
  const index = wishlists.findIndex(w => w.userId === user.id && w.courseId === courseId);

  if (index > -1) {
    wishlists.splice(index, 1);
    res.json({ wishlisted: false });
  } else {
    wishlists.push({
      id: `w-${Date.now()}`,
      userId: user.id,
      courseId
    });
    // Add interaction
    interactions.push({
      id: `int-${Date.now()}`,
      userId: user.id,
      courseId,
      event: "wishlist",
      ts: new Date().toISOString()
    });
    res.json({ wishlisted: true });
  }
});

// Quiz Submission Endpoints
app.post("/api/quiz/submit", (req, res) => {
  const { courseId, quizId, answers } = req.body; // answers is an array: [0, 1] (selected option indexes)
  const user = getCurrentUser();
  const courseObj = courses.find(c => c.id === courseId);

  if (!courseObj || !courseObj.quiz) {
    return res.status(400).json({ error: "Quiz not found for this course" });
  }

  const quiz = courseObj.quiz;
  let correctCount = 0;
  quiz.questions.forEach((q, index) => {
    if (answers[index] === q.answerIndex) {
      correctCount++;
    }
  });

  const totalQuestions = quiz.questions.length;
  const scorePct = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePct >= quiz.passPct;

  // Record interaction
  interactions.push({
    id: `int-${Date.now()}`,
    userId: user.id,
    courseId,
    event: "take_quiz",
    ts: new Date().toISOString(),
    meta: { scorePct, passed }
  });

  if (passed) {
    // Audit course enrollment: mark as COMPLETED
    const enrollment = enrollments.find(e => e.userId === user.id && e.courseId === courseId);
    if (enrollment) {
      enrollment.status = EnrollStatus.COMPLETED;
      enrollment.completedAt = new Date().toISOString();
      
      // Auto-unlock the taught skills! Append course skills to user's currentSkills
      courseObj.skills.forEach(skill => {
        if (!user.currentSkills.includes(skill)) {
          user.currentSkills.push(skill);
        }
      });
    }
  }

  res.json({
    scorePct,
    passed,
    correctCount,
    totalQuestions,
    userProfile: user
  });
});

// Interactions Tracker
app.post("/api/interactions", (req, res) => {
  const { courseId, event, meta } = req.body;
  const user = getCurrentUser();
  const interaction: Interaction = {
    id: `int-${Date.now()}`,
    userId: user.id,
    courseId,
    event,
    ts: new Date().toISOString(),
    meta
  };
  interactions.push(interaction);
  res.json({ ok: true });
});

// ==========================================================
// CENTRAL RECOMMENDATION ALGORITHM ENGINE (HYBRID & SKILLGAP)
// ==========================================================

// Content and collaborative filtering engine
app.get("/api/recommend/user", (req, res) => {
  const user = getCurrentUser();
  const targetCoursesCount = 4;

  // Filter out courses that the student has already enrolled in
  const studentEnrollments = enrollments.filter(e => e.userId === user.id);
  const enrolledCourseIds = new Set(studentEnrollments.map(e => e.courseId));
  const candidateCourses = courses.filter(c => !enrolledCourseIds.has(c.id));

  // If no candidates, return empty list
  if (candidateCourses.length === 0) {
    return res.json([]);
  }

  // Calculate recommendation score for each candidate course
  const scoredCandidates = candidateCourses.map(course => {
    let score = 0;
    const diagnostics: string[] = [];

    // --- 1. Content Filtering: Interests Matching (Category similarity) ---
    // User interests vs Course category
    const matchesCategory = user.interests.some(interest => 
      interest.toLowerCase().trim() === course.category.toLowerCase().trim()
    );
    if (matchesCategory) {
      score += 40;
      diagnostics.push(`Fits your interest in "${course.category}" (+40 pts)`);
    }

    // --- 2. Content Filtering: Skills Matching (Target skills requested) ---
    // Course skills taught vs User targetSkills requested
    const overlappingTargetSkills = course.skills.filter(skill => 
      user.targetSkills.some(t => t.toLowerCase() === skill.toLowerCase())
    );
    if (overlappingTargetSkills.length > 0) {
      const skillBonus = overlappingTargetSkills.length * 15;
      score += skillBonus;
      diagnostics.push(`Teaches your target skill(s): ${overlappingTargetSkills.join(", ")} (+${skillBonus} pts)`);
    }

    // --- 3. Content Filtering: Prior Knowledge Matching (Don't over-recommend beginner items if advanced) ---
    // Level scaling matching
    if (course.level === Level.BEGINNER && user.currentSkills.length > 4) {
      // Small penalty, encourage harder items
      score -= 5;
      diagnostics.push("Demoted slightly because standard content feels too easy for your background (-5 pts)");
    } else if (course.level === Level.ADVANCED && user.currentSkills.length > 1) {
      score += 10;
      diagnostics.push("Matches your growing skillset with advanced challenges (+10 pts)");
    }

    // --- 4. Collaborative Filtering: Co-enrollment Math ---
    // If user has active/completed enrollments, find other users who enrolled in those same courses.
    // What other courses are they enrolled in? Count frequency!
    let collaborativeScore = 0;
    if (enrolledCourseIds.size > 0) {
      // Find similar student entries in historical seed database
      const peers = new Set<string>();
      enrollments.forEach(e => {
        if (e.userId !== user.id && enrolledCourseIds.has(e.courseId)) {
          peers.add(e.userId);
        }
      });

      if (peers.size > 0) {
        let peerCount = 0;
        // Count how many peers took THIS candidate course
        enrollments.forEach(e => {
          if (peers.has(e.userId) && e.courseId === course.id) {
            peerCount++;
          }
        });

        if (peerCount > 0) {
          collaborativeScore = peerCount * 25;
          score += collaborativeScore;
          diagnostics.push(`Popular item: ${peerCount} other student(s) with your curriculum history also enrolled in this (+${collaborativeScore} pts)`);
        }
      }
    }

    // --- 5. Engagement Metrics (Popularity Boost) ---
    const popularityBonus = Math.min(course.enrolledStudentsCount / 300, 10);
    score += popularityBonus;
    
    return {
      course,
      score: Math.round(score),
      diagnostics
    };
  });

  // Sort candidates by final numerical score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Return the computed candidates
  res.json(scoredCandidates.slice(0, targetCoursesCount));
});

// Recommend similar (item-item content based similarity)
app.get("/api/recommend/similar", (req, res) => {
  const { courseId } = req.query;
  const courseRef = courses.find(c => c.id === courseId);
  if (!courseRef) {
    return res.status(404).json({ error: "Reference course not found" });
  }

  // Calculate similarity based on category + tags intersection
  const scored = courses
    .filter(c => c.id !== courseId)
    .map(c => {
      let score = 0;
      if (c.category === courseRef.category) score += 50;

      const sharedTags = c.tags.filter(t => courseRef.tags.includes(t));
      score += sharedTags.length * 15;

      const sharedSkills = c.skills.filter(s => courseRef.skills.includes(s));
      score += sharedSkills.length * 10;

      return { course: c, score };
    });

  scored.sort((a, b) => b.score - a.score);
  res.json(scored.slice(0, 3));
});

// Recommend Skill-Gap Closing Courses
app.get("/api/recommend/skillgap", (req, res) => {
  const user = getCurrentUser();
  
  // Find missing skills = user target career path required skills MINUS current skills
  let requiredSkills: string[] = [];
  let pathTitle = "Professional Track";
  
  if (user.selectedCareerPath) {
    const pathObj = SAMPLE_CAREER_PATHS.find(p => p.id === user.selectedCareerPath);
    if (pathObj) {
      requiredSkills = pathObj.requiredSkills;
      pathTitle = pathObj.title;
    }
  } else {
    requiredSkills = user.targetSkills;
  }

  const currentSet = new Set(user.currentSkills.map(s => s.toLowerCase()));
  const missingSkills = requiredSkills.filter(skill => !currentSet.has(skill.toLowerCase()));

  // If enrollment has already completed courses teaching those missing skills, filter out.
  const studentEnrollments = enrollments.filter(e => e.userId === user.id);
  const enrolledCourseIds = new Set(studentEnrollments.map(e => e.courseId));

  const recommendations = courses
    .filter(c => !enrolledCourseIds.has(c.id))
    .map(c => {
      // Count how many missing skills are taught by this course
      const coveredMissing = c.skills.filter(skill => 
        missingSkills.some(m => m.toLowerCase() === skill.toLowerCase())
      );
      
      const score = coveredMissing.length * 30; // 30 points per aligned skill gap closed!

      return {
        course: c,
        coveredSkills: coveredMissing,
        score
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  res.json({
    pathName: pathTitle,
    requiredSkills,
    currentSkills: user.currentSkills,
    missingSkills,
    recommendations: recommendations.slice(0, 3)
  });
});

// ==========================================
// SERVER-SIDE GEMINI AI TUTOR INTELLIGENCE
// ==========================================
app.post("/api/explain", async (req, res) => {
  const { topic, context } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    // Offline simulation mode
    return res.json({
      explanation: `### AI Study Coach - Simulation Mode 💡

*You are currently viewing a mock study outline. Add a real \`GEMINI_API_KEY\` to your environment configuration to enable instant live explanations!*

For the topic **"${topic}"** in **${context}**:

1. **Fundamental Definition**: This encapsulates core software designs. In educational platforms, this translates to clear abstraction metrics.
2. **Core Best Practice**: Always isolate states in separate visual modules. Minimize side effects and verify data sanitization pipelines with every transaction.
3. **Common Pitfall**: Over-engineering simple structures. Always start with straightforward designs and iterate incrementally.

*Provide your secrets in AI Studio to unlock immediate responses powered by Gemini 3.5 Flash!*`
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are "AI Study Coach", a friendly, brilliant EdTech mentor helping an ambitious student. 
    Explain topics in clear, accessible language, using clean modern Markdown, bullets, and concise code blocks. Avoid filler or promotional jargon. Be encouraging and direct.`;

    const modelPrompt = `The student is taking a course titled "${context}". 
    Explain the following topic or quiz question clearly: "${topic}". 
    Focus on code patterns, practical applications, and core lessons. Keep your length to 2-3 structured paragraphs maximum.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: modelPrompt,
      config: {
        systemInstruction: systemPrompt
      }
    });

    res.json({ explanation: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Failed to connect to AI study service. " + (err.message || "") });
  }
});

// ==========================================
// VITE OR STATIC FILE MIDDLEWARE MOUNTING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Online Learning Platform running on http://localhost:${PORT}`);
  });
}

startServer();
