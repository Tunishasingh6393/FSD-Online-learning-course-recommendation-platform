# Online Learning & Course Recommendation Platform 🎓🤖

An industry-grade, full-stack learning management system and hybrid recommendation engine. This repository acts as a comprehensive **Proof-of-Work portfolio** demonstrating high-performance React client architectures, robust Express API routing, and multi-layered recommendation heuristics (Content-Based, Collaborative Filtering, and Persona-Oriented Career Skill-Gap Resolution) under a unified server-side setup.

---

## 1️⃣ Project Overview & Problem Solved

### The Problem
Most contemporary Massive Open Online Courses (MOOCs) suffer from **historically low completion rates (under 10%)**. This stems directly from:
- **Navigation Fatigue**: Users spend more time searching through bloated catalogs than studying.
- **Skill-Mismatch Blindness**: Systems suggest advanced curriculums to novices or repetitive basic tutorials to veteran professionals without knowing their historical background.
- **Disconnected Goals**: Courses are recommended as isolated items, instead of continuous, milestone-based paths directly leading to real-world career competencies (such as *Full-Stack Engineer* or *AI Practitioner*).

### The Solution: LearnSphere
**LearnSphere** bridges this gap by integrating a functional Learning Management System with an analytical **Dynamic Hybrid Recommender System** that drives active user engagement:
1. **Student Hub**: Displays a centralized personalized dashboard with diagnostic scores.
2. **"For You" Hybrid Feed**: Runs background scoring calculations merging **Content-Based Filtering** (matching student categories/interests) with **Collaborative Co-occurrence Math** (analyzing peer student patterns).
3. **Career Skill-Gap Analyzer**: Maps the student's active skills against target industry career models (like *Full-Stack* or *Deep Learning Engineer*), flagging missing skills and suggesting exact course bridges to close the gap.
4. **Interactive Classroom with AI Tutor**: Seamlessly serves lesson logs and quizzes, automatically unlocking credentials and skills upon passing, and features an integrated **Gemini-powered AI Study Coach** for instant code explanation.

---

## 2️⃣ Architecture & Math Foundations

```
+-------------------------------------------------------------------------+
|                          1. Presentation Layer (Vite + React)           |
|  [Student Hub Dashboard]    [Course Catalog]    [Classroom Video Player]   |
+----------------------------------------------------+--------------------+
                                                     |
                                        HTTP Fetch   |  JSON Payload
                                                     v
+-------------------------------------------------------------------------+
|                  2. REST Routing Controller (Express + TS)              |
|  /api/auth/*       /api/courses/*       /api/enrollments/*              |
|  /api/progress/*   /api/recommend/*     /api/explain* (Gemini SDK)      |
+----------------------------------------------------+--------------------+
                                                     |
                                   Memory Reference  |  State Synchronization
                                                     v
+-------------------------------------------------------------------------+
|              3. Analytical Hybrid Recommendation Engine                 |
+-------------------------------------------------------------------------+
|   A. Content-Based Scoring:                                             |
|      - Interest Matching (Category Alignment)                           |
|      - Missing Skills Cross-Mapping                                     |
|   B. Collaborative Co-occurrence:                                       |
|      - Analyzes historical peers with overlapping enrollment logs       |
|      - High weight given to popular courses among historical colleagues |
|   C. Level & Competency Tuning:                                         |
|      - Promotes challenging materials to advanced backgrounds           |
+-------------------------------------------------------------------------+
```

### Recommendation Scoring Formulas

The engine uses a rigorous heuristic scoring model for every candidate course $C$ for a given user $U$:

$$\text{Score}(C, U) = S_{\text{interests}}(C, U) + S_{\text{skills}}(C, U) + S_{\text{level}}(C, U) + S_{\text{collaborative}}(C, U) + S_{\text{popularity}}(C)$$

#### 1. Content Interest Score ($S_{\text{interests}}$)
If the course's primary topic category matches the expressed interests listed in the user's profile:
$$S_{\text{interests}}(C, U) = +40 \text{ points}$$

#### 2. Target Skill Alignments ($S_{\text{skills}}$)
For each skill taught by course $C$ that is listed as a target skill for the user $U$:
$$S_{\text{skills}}(C, U) = | \text{Skills}(C) \cap \text{TargetSkills}(U) | \times 15 \text{ points}$$

#### 3. Collaborative Peer Co-occurrence ($S_{\text{collaborative}}$)
Let $P_U$ be the set of peer students who have enrolled in at least one course that user $U$ is also enrolled in. The score boost for candidate course $C$ is proportional to its popularity among those peer students:
$$S_{\text{collaborative}}(C, U) = | \{ p \in P_U \mid p \text{ is enrolled in } C \} | \times 25 \text{ points}$$

#### 4. Career Skill-Gap Delta (Closed Loops)
When analyzing specialized career tracks (e.g., *AI & Deep Learning Engineer*), courses are ranked based on their ability to resolve active "skill gaps":
$$\text{SkillGap}(U) = \text{RequiredSkills}(\text{CareerPath}_U) \setminus \text{CurrentSkills}(U)$$
$$\text{GapScore}(C, U) = | \text{Skills}(C) \cap \text{SkillGap}(U) | \times 30 \text{ points}$$

---

## 3️⃣ GitHub Showcase Directory Structure

This structure is organized according to industry best practices for decoupled MERN/full-stack projects:

```
Online-Learning-Course-Recommendation-Platform/
│
├── client/                      # Front-End Web Client (React 18+ / Vite / Tailwind)
│   ├── public/                  # Core static assets, logos & launcher configurations
│   ├── src/
│   │   ├── components/          # Reusable UI elements (UserProfileModal, CourseCards...)
│   │   ├── services/            # API integration layer for asynchronous HTTP fetch protocols
│   │   ├── types.ts             # Strict TypeScript models representing users, courses, and lessons
│   │   ├── App.tsx              # Central Reactive visual state and template routing
│   │   ├── index.css            # Tailwind directives and font injections
│   │   └── main.tsx             # Entry point bootstrapping React into the viewport
│   ├── package.json             # Front-end dependencies & scripts (Tailwind, Lucide, Motion)
│   └── tsconfig.json            # Front-end TypeScript configuration rules
│
├── server/                      # Back-End Server (Node.js / Express / TypeScript)
│   ├── config/                  # Database connections and engine presets (MongoDB/Memory)
│   ├── controllers/             # Action controllers handling business computations
│   ├── middleware/              # JWT credential token auth guards and input sanitizers
│   ├── models/                  # Database schemas and data structural validation models
│   ├── routes/                  # Express routing paths mapped to controllers
│   ├── utils/                   # Mathematics helpers, metrics, and algorithm helpers
│   ├── server.ts                # Integrated web server, API controllers, and static serving
│   └── package.json             # Backend configurations (Express, Gemini GenAI SDK, Esbuild)
│
├── README.md                    # This master documentation portfolio showcase
├── .env.example                 # Standardized system environmental variable outlines
├── .gitignore                   # Universal rules preventing commit leakages (node_modules, keys)
└── docs/                        # Screenshots, design wireframes, and project charts
```

### Folder Explanations
*   `client/src/components/`: Modular building blocks of the front-end interface, ensuring clean code separation instead of cramming logic into a single monolithic file.
*   `client/src/services/api.ts`: A centralized API driver containing clean, asynchronous handler methods for all backend capabilities.
*   `server/controllers/`: Contains the actual implementation of request/response endpoints, completely isolating business math from routing pathways.
*   `server/middleware/`: Handles security boundaries, authentication validations, CORS protocols, and header validations.
*   `server/models/`: Declares structures representing users, course syllabus nodes, interactive quizzes, progress records, and logs.

---

## 4️⃣ Tech Stack Design Options

| Feature | Option A: Easy | Option B: Intermediate (Recommended) | Option C: Advanced |
| :--- | :--- | :--- | :--- |
| **Front-End** | HTML5, Bootstrap, Vanilla JS | **Vite React, Tailwind CSS, Lucide, Motion** | Next.js, Redux, Sass, Framer Motion |
| **Back-End** | Express.js, CommonJS | **Express.js with TypeScript, Esbuild, tsx** | NestJS Framework, Fastify Core |
| **Database** | JSON File Mocking | **MongoDB Web Interface, Mongoose models** | PostgreSQL with Prisma, Redis, Meilisearch |
| **Auth** | Plain-text IDs | **Stateless JWT Claims with Profile Targets** | OAuth2 Popup Providers (Google/Github) |
| **AI Integration**| Mock Regex Responses | **Google GenAI SDK (Gemini 3.5 Flash)** | LangChain with Custom Vector DB RAG |

---

## 5️⃣ API Endpoints & Contract Matrix

All server routes are served under the baseline `/api` prefix.

| Method | Endpoint | Description | Payload Pattern | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/auth/profile` | Retrieves current logged-in user profile, interests, and skills | *None* | Session |
| **POST** | `/api/auth/profile` | Updates user parameters, targets, and selected career paths | `{ name, interests: [], targetSkills: [] }` | Session |
| **GET** | `/api/courses` | Lists all courses matching search query or categories | *Query filters: search, category, level* | Public |
| **GET** | `/api/courses/:id` | Returns complete details of a specific course, lessons, and quizzes | *None* | Public |
| **POST** | `/api/enrollments` | Enrolls student in a course, updates count in DB | `{ courseId: "string" }` | Session |
| **POST** | `/api/progress` | Updates watched duration or checks off lesson completion | `{ courseId, lessonId, completed: true }` | Session |
| **POST** | `/api/quiz/submit` | Validates correct answers, scores percent, and unlocks skills | `{ courseId, quizId, answers: [0, 2] }` | Session |
| **GET** | `/api/recommend/user` | Outputs scored recommendation catalog from Hybrid filtering | *None* | Session |
| **GET** | `/api/recommend/similar`| Exposes content similarities for "Because you viewed..." recommendations | *Query: courseId* | Public |
| **GET** | `/api/recommend/skillgap`| Flags missing career goals, lists required, gap skills, and solutions | *None* | Session |
| **POST** | `/api/explain` | Requests Gemini 3.5 Flash to tutor the student on a topic | `{ topic: "React State", context: "string" }` | Session |

---

## 6️⃣ Interactive Walkthrough & Virtual Simulation

This project features a fully functioning interactive simulator to demonstrate the system live:

1.  **Select a Target Track**: Go to your profile settings, choose **Full Stack Engineer** or **AI & Deep Learning Engineer**, and add specific interests (e.g., *Artificial Intelligence*).
2.  **Observe Re-calibration**: Your Student Hub recalibrates instantly! Spot how the **Career Skill-Gap Analyzer** calculates your exact outstanding skill gaps, while your personalized **"For You"** feed recommends matching high-score solutions (e.g., *Intro to Neural Networks* earns an instant **Collaborative Peer Lift**).
3.  **Simulate Learning**: Click **Enroll**, watch interactive markdown lessons, and take the **Integrated MCQ Quiz ASSESSMENT**.
4.  **Unlock Credentials**: Pick the correct solutions, submit, and watch the platform grant you the badge, mark the course **COMPLETED**, and add those skills to your **Mastered Skills** array!
5.  **Use AI Study Coach**: Need coding help? Type any technical query in the sidebar chat block, and **Gemini 3.5 Flash** will generate an interactive explanation.

---

## 7️⃣ Step-by-Step Installation & Local Execution

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm package manager

### Configuration
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Online-Learning-Course-Recommendation-Platform.git
   cd Online-Learning-Course-Recommendation-Platform
   ```
2. Build configurations:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
   PORT=3000
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Launch dev environment:
   ```bash
   npm run dev
   ```
5. Build and launch production output:
   ```bash
   npm run build
   npm start
   ```

---

## 8️⃣ Interview Preparation Q&A 💬

### Q1. How does the recommendation system solve the "Cold Start" problem?
**Answer:** The system uses a hybrid approach. For new students with empty enrollment profiles, collaborative peer filtering has no historical overlap. Thus, the model gracefully degrades to a combination of **high-CTR popularity rankings** paired with **Content-Based Interest Filtering** based on the student's initial profile settings (Web Development, AI, etc.) ensuring they see relevant content immediately.

### Q2. Why did you choose a monolithic Express bundle over standard separate frontend/backend hosts?
**Answer:** Decoupling frontends and backends exposes cookies or authentication credentials to Cross-Site Scripting (XSS). Bundling and proxy-serving both folders under a single secure, self-contained server operating on the same port eliminates pre-flight CORS overhead and guarantees that secrets (such as the `GEMINI_API_KEY`) remain securely on the server-side, never exposed to user web application containers.

### Q3. Explain the math behind the co-occurrence collaborative filtering implementation in your code.
**Answer:** When analyzing a candidate course $C$ for a student $U$, we look at $U$'s active enrollments. We query our database to select peer student records who are also enrolled in those physical courses. We then count the frequency at which those peers enrolled in other database items. Candidates that have high enrollment overlap with peers get a collaborative weight boost of $+25$ points per co-occurrence, mirroring standard ALS consumer patterns.

---

*Designed and engineered with care to serve as a high-precision portfolio asset.*
