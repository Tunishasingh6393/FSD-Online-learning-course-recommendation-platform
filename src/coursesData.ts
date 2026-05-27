/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, Level, CareerPath } from "./types";

export const SAMPLE_CAREER_PATHS: CareerPath[] = [
  {
    id: "path-1",
    title: "Full Stack Engineer",
    desc: "Build modern web client interfaces and scale APIs with back-end database stores.",
    requiredSkills: ["React", "Express", "Node.js", "MongoDB", "Tailwind CSS"]
  },
  {
    id: "path-2",
    title: "AI & Deep Learning Engineer",
    desc: "Train machine learning models, create neural networks, and deploy prompt-engineered cognitive pipelines.",
    requiredSkills: ["TensorFlow", "PyTorch", "Deep Learning", "Python", "LLMs", "RAG"]
  },
  {
    id: "path-3",
    title: "Cybersecurity Analyst",
    desc: "Audit digital systems, defend web applications, and implement secure authentication protocols.",
    requiredSkills: ["Cryptography", "Auth Sec", "OWASP Top 10", "Network Sec"]
  },
  {
    id: "path-4",
    title: "Data Scientist",
    desc: "Analyze business metrics, build regressions, and construct stunning visual storytelling graphics.",
    requiredSkills: ["D3.js", "Python", "Pandas", "Data Visualization"]
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Advanced Full-Stack Web Development",
    subtitle: "Scale secure Express API servers and build reactive state dashboards.",
    desc: "Master the integration of modern single page applications with headless servers. This course covers everything from architectural routing and custom middleware to JSON Web Token credential structures, CORS configuration, and scalable schema models.",
    level: Level.ADVANCED,
    category: "Web Development",
    skills: ["React", "Express", "Node.js", "MongoDB"],
    tags: ["web", "fullstack", "node", "javascript"],
    thumbUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    author: "Dr. Sarah Jenkins",
    ratingAverage: 4.8,
    enrolledStudentsCount: 1420,
    lessons: [
      {
        id: "c1-l1",
        courseId: "course-1",
        title: "Architecture of Modern Full-Stack Platforms",
        durationMin: 12,
        order: 1,
        contentMd: `### Architecture of Full-Stack Frameworks

Modern web architecture cleanly decouples the visual presentation layer (React SPA) from execution environments (Express REST servers).

#### Primary Architectural Concepts:
1. **Client Interface State**: Managed reactively. Keeps local memory buffers synchronized with the server via HTTP fetch operations.
2. **Reverse Proxying**: Nginx acts as a firewall and orchestrator, routing inbound internet packets exclusively to our app listening on local PORT metrics.
3. **Stateless API Strategy**: The backend maintains no persistent connection references. Rather, authorization tokens verify user identity with each inbound client envelope.

#### Essential Setup:
To initialize an Express server in TypeScript with CORS enabled:
\`\`\`ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
\`\`\`
`
      },
      {
        id: "c1-l2",
        courseId: "course-1",
        title: "Stateless Security: JWT Implementation & Route Guards",
        durationMin: 18,
        order: 2,
        contentMd: `### Understanding JSON Web Tokens (JWT)

A JSON Web Token represents securely transferrable identity packets in Web app security. Rather than query active tables on every route, we encrypt a localized user profile payload.

#### Anatomy of a Token:
- **Header**: Specifies signature algorithm (usually HMAC SHA256).
- **Payload**: Contains non-sensitive claims (user ID, permissions, expiration date).
- **Signature**: Formed by concatenating header + encoded payload with a server-held secret key.

#### Verifying a Route Guard in Express:
\`\`\`ts
import jwt from 'jsonwebtoken';

export function tokenGuard(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
\`\`\`
`
      }
    ],
    quiz: {
      id: "quiz-1",
      courseId: "course-1",
      title: "Full-Stack Security & JWT Assessment",
      questions: [
        {
          q: "Which property is a critical advantage of utilizing stateless JSON Web Tokens for API requests?",
          options: [
            "It automatically encrypts the complete user database.",
            "The backend server does not need to store active session references in memory.",
            "It completely bypasses the need for client-side routing.",
            "It speeds up database compression queries."
          ],
          answerIndex: 1
        },
        {
          q: "What component is used in JWT to guarantee that the client has not tampered with the payload data?",
          options: [
            "The SSL routing layer",
            "The browser local Storage cache",
            "The Crytographic Signature verified via a server-only secret",
            "The CORS pre-flight origin list"
          ],
          answerIndex: 2
        }
      ],
      passPct: 100
    }
  },
  {
    id: "course-2",
    title: "Intro to Neural Networks & Deep Learning",
    subtitle: "Train multi-layered networks and map learning curves in Python.",
    desc: "Demystify Deep Learning from absolute fundamentals. Understand gradient descent algorithms, feedforward propagation patterns, backpropagation math, and modern optimization strategies using standard packages.",
    level: Level.INTERMEDIATE,
    category: "Artificial Intelligence",
    skills: ["TensorFlow", "Deep Learning", "Python"],
    tags: ["ai", "machinelearning", "python"],
    thumbUrl: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=600&auto=format&fit=crop&q=80",
    author: "Prof. Alex Rivera",
    ratingAverage: 4.9,
    enrolledStudentsCount: 980,
    lessons: [
      {
        id: "c2-l1",
        courseId: "course-2",
        title: "Perceptrons & The Algebra of Activation Structures",
        durationMin: 15,
        order: 1,
        contentMd: `### Perceptrons & Multi-layer Models

An artificial neural network consists of layers of nodes. Each connection holds a **weight** scalar, combined with a **bias** constant offset.

#### The Math of a Single Neuron:
The combined signal acts as:
$$z = \\sum w_i x_i + b$$

We apply an activation function $a = \\sigma(z)$ to map the signal values. Most modern architectures employ the ReLU function:
$$f(x) = \\max(0, x)$$

This prevents the notorious *vanishing gradient* problem during deeper chain-rule models.
`
      },
      {
        id: "c2-l2",
        courseId: "course-2",
        title: "Gradient Descent Optimization & Objective Loss",
        durationMin: 22,
        order: 2,
        contentMd: `### Gradient Descent and Loss Functions

At its core, model training represents mathematical multi-variable minimization.

#### Cost Optimization Loop:
1. **Feedforward**: Inbound vector runs through layers to emit a network candidate prediction.
2. **Compute Cost**: Loss function measures variance between correct metrics and candidate output.
3. **Backpropagation**: Compute partial derivatives of objective loss with respect to every active connection parameter.
4. **Update Weights**: Scale parameter changes according to learning rate $\\alpha$:
   $$w \\leftarrow w - \\alpha \\frac{\\partial L}{\\partial w}$$
`
      }
    ],
    quiz: {
      id: "quiz-2",
      courseId: "course-2",
      title: "Anatomy of Deeper Neural Structures Quiz",
      questions: [
        {
          q: "Why is the ReLU (Rectified Linear Unit) activation function heavily preferred over standard Sigmoid function in deep neural net learning hidden layers?",
          options: [
            "ReLU restricts all output parameters between -1 and +1.",
            "It computes faster and avoids the vanishing gradient problem since its slope does not saturate to zero.",
            "It forces all negative weights to transition into positive scalar offsets.",
            "It executes only on single core processors."
          ],
          answerIndex: 1
        },
        {
          q: "During neural network parameter tuning, what does the learning rate variable represent?",
          options: [
            "The execution frequency rate of multi-threaded memory caches.",
            "The speed at which raw data files are loaded into training sets.",
            "The size of the scaling step taken along the loss gradient curve during optimization updates.",
            "The active rating score assigned to trained algorithms."
          ],
          answerIndex: 2
        }
      ],
      passPct: 100
    }
  },
  {
    id: "course-3",
    title: "Data Science Foundations with D3.js and Python",
    subtitle: "Map datasets to responsive SVG documents and read statistics.",
    desc: "Learn data science visually. Acquire foundational techniques to dissect tabular datasets with Pandas, configure basic descriptive statistics, and map multi-variable vectors directly to interactive SVG illustrations with D3.",
    level: Level.BEGINNER,
    category: "Data Science",
    skills: ["D3.js", "Python", "Data Visualization"],
    tags: ["datascience", "d3", "python", "stats"],
    thumbUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    author: "Elena Petrova",
    ratingAverage: 4.6,
    enrolledStudentsCount: 840,
    lessons: [
      {
        id: "c3-l1",
        courseId: "course-3",
        title: "Taming Data with Python's Pandas",
        durationMin: 14,
        order: 1,
        contentMd: `### Data Exploration Foundations

Data Scientists spend up to 80% of their schedules pruning and structuring datasets. Pandas is the supreme tool for high-performance tabular datasets inside Python environments.

#### Core structures:
- **Series**: One-dimensional column array.
- **DataFrame**: Two-dimensional table with labeled axes.

#### Essential Operations:
\`\`\`python
import pandas as pd

# Reading structure and mapping statistics
df = pd.read_csv('learners.csv')
print(df.describe()) # Instant stats summaries
print(df.groupby('category')['score'].mean())
\`\`\`
`
      },
      {
        id: "c3-l2",
        courseId: "course-3",
        title: "Data Visualization & Expressing SVG Nodes via D3.js",
        durationMin: 20,
        order: 2,
        contentMd: `### Declartive Visualization: Enter D3.js

D3.js (Data-Driven Documents) allows declaring exact mappings between numbers in code and graphic vectors inside standard HTML layouts.

#### Enter-Update-Exit Pattern:
D3 binds data directly to elements, performing declarative loops:
\`\`\`js
import * as d3 from 'd3';

const svg = d3.select("svg");
const bars = svg.selectAll("rect")
  .data([40, 80, 150]);

// Create elements for new data items
bars.enter()
  .append("rect")
  .attr("y", 10)
  .attr("height", 30)
  .attr("width", d => d)
  .attr("fill", "steelblue");
\`\`\`
`
      }
    ],
    quiz: {
      id: "quiz-3",
      courseId: "course-3",
      title: "Pandas and D3 Mapping Principles Quiz",
      questions: [
        {
          q: "What is the primary action performed during a standard D3.js .enter() operation loop?",
          options: [
            "It authenticates incoming users into visualizations.",
            "It identifies data items that do not have matching visual HTML/SVG elements and instantiates them.",
            "It terminates outdated animations.",
            "It computes Pearson correlation metrics."
          ],
          answerIndex: 1
        },
        {
          q: "Which data structure represents a primary 2D labeled sheet inside Python's Pandas?",
          options: [
            "Series List",
            "Tuple Matrix",
            "DataFrame",
            "Key-Value Dict"
          ],
          answerIndex: 2
        }
      ],
      passPct: 100
    }
  },
  {
    id: "course-4",
    title: "Defensive Cybersecurity & Web App Sec",
    subtitle: "Scan secure headers, verify TLS sessions, and understand attackers.",
    desc: "A rigorous journey into defensive system architecture. Protect web applications from standard attack vectors. Understand hashing mechanics, CSRF anti-forgery, CORS sandbox limits, and system audits.",
    level: Level.INTERMEDIATE,
    category: "Cybersecurity",
    skills: ["Cryptography", "Auth Sec", "OWASP Top 10", "Network Sec"],
    tags: ["security", "cybersecurity", "websec"],
    thumbUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
    author: "Marcus Vance",
    ratingAverage: 4.7,
    enrolledStudentsCount: 650,
    lessons: [
      {
        id: "c4-l1",
        courseId: "course-4",
        title: "The OWASP Top 10 Vulnerability Landscape",
        durationMin: 16,
        order: 1,
        contentMd: `### Understanding Common Threats

Web vulnerabilities emerge due to improper sanitization of control streams and authorization gaps.

#### Classic Exploit Patterns:
1. **SQL Injection (SQLi)**: Injecting raw executable clauses directly into parameter inputs.
2. **Cross-Site Scripting (XSS)**: Injecting client-executable javascript onto other learners' visual dashboards.
3. **Broken Authorization**: Assuming client-passed parameters (such as a 'userId' request field) are authentic without server verification.

#### Mitigating SQL Injection with Parameterized Queries:
Never concatenate input strings:
\`\`\`ts
// BAD: connection.query("SELECT * FROM users WHERE code = " + inputString);
// GOOD:
connection.query("SELECT * FROM users WHERE code = ?", [inputString]);
\`\`\`
`
      },
      {
        id: "c4-l2",
        courseId: "course-4",
        title: "Hashing vs. Symmetric Encryption: Architectural Security",
        durationMin: 18,
        order: 2,
        contentMd: `### Cryptographic Storage & Transport

Secure storage of user claims is a non-negotiable architectural element.

#### Keys Diffences:
- **Hashing**: One-way transformation (irreversible). Excellent for checking passwords. Output length is absolute (e.g. SHA-256 is always 256 bits).
- **Encryption**: Two-way symmetric conversion. Requires keys to lock and subsequently unlock data payloads (e.g., standard AES constraints).

Never store passwords in plain-text. Verify inputs using secure hashing functions (like bcrypt with dynamic random salt vectors).
`
      }
    ],
    quiz: {
      id: "quiz-4",
      courseId: "course-4",
      title: "OWASP Defenses & Cryptography Basics Quiz",
      questions: [
        {
          q: "Why is password verification handled using a one-way Cryptographic Hash instead of symmetric encryption?",
          options: [
            "Hashing is 10 times smaller in terms of database storage.",
            "It is mathematically irreversible, meaning a compromised database yields no plain-text credentials.",
            "Passwords must be encrypted so the developer can tell them to the user via helpline chat.",
            "Hashing only works with numbers."
          ],
          answerIndex: 1
        },
        {
          q: "What is the industry-standard methodology for preventing SQL Injection attacks?",
          options: [
            "Disabling all GET endpoints in the routing controller.",
            "Using prepared statements with parameterized input queries.",
            "Restricting browser client CSS styling sheets.",
            "Encrypting the index.html page."
          ],
          answerIndex: 1
        }
      ],
      passPct: 100
    }
  },
  {
    id: "course-5",
    title: "Building LLM Tech: Prompt Engineering & Retrieval Augmentation",
    subtitle: "Integrate LLMs, parse JSON prompts, and coordinate vectors.",
    desc: "A hands-on engineering guide to building cognitive search apps. Harness pre-trained Large Language Models, configure semantic embeddings, and write Retrieval-Augmented Generation (RAG) loops.",
    level: Level.BEGINNER,
    category: "Artificial Intelligence",
    skills: ["Python", "LLMs", "RAG"],
    tags: ["ai", "llm", "prompting", "python"],
    thumbUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
    author: "Nadia Cho",
    ratingAverage: 4.85,
    enrolledStudentsCount: 1120,
    lessons: [
      {
        id: "c5-l1",
        courseId: "course-5",
        title: "Foundations of Large Language Models & Prompt Engineering",
        durationMin: 12,
        order: 1,
        contentMd: `### Context Windows & Logical prompts

Prompt engineering utilizes semantic text constraints to force pre-trained language vectors to emit structural outputs such as clean JSON.

#### Elements of highly effective prompts:
- **System Role**: Defines the style, competence, and constraints.
- **Dynamic Context**: Inject relevant data before asking the question.
- **Output Format Guidelines**: Explicit instructions (e.g., "Return a list of keys inside a single block").

To achieve consistent outputs, set low parameters for **temperature** (closer to 0.0) to eliminate unpredictable deviations.
`
      },
      {
        id: "c5-l2",
        courseId: "course-5",
        title: "Retrieval-Augmented Generation (RAG) Architectures",
        durationMin: 20,
        order: 2,
        contentMd: `### The Limits of Embeddings & RAG

Large Language Models suffer from absolute knowledge cutoffs and hallucinations when queried about proprietary or fresh databases.

#### The RAG solution flow:
1. **Index**: Split documents, pass text blocks to embedding models, store floats in a **Vector Database**.
2. **Retrieve**: Convert a user's prompt into semantic float vectors, locate nearest items using *cosine similarity*.
3. **Augment**: Stitch retrieved snippets directly into the LLM's query context.
4. **Generate**: Query LLM with the augmented context so it generates answers grounded in absolute facts.
`
      }
    ],
    quiz: {
      id: "quiz-5",
      courseId: "course-5",
      title: "RAG Loops and Context Window Principles Quiz",
      questions: [
        {
          q: "What bottleneck does Retrieval-Augmented Generation (RAG) specifically address in generative AI?",
          options: [
            "It compiles Python models into native WebAssembly code.",
            "It resolves the issue of hallucination and model knowledge limits by retrieving proven dynamic reference pages.",
            "It automatically increases the size of trained network weights.",
            "It replaces the need for standard vector embeddings."
          ],
          answerIndex: 1
        }
      ],
      passPct: 100
    }
  },
  {
    id: "course-6",
    title: "Mastering React, Vite and Tailwind CSS",
    subtitle: "Create modular user interfaces with high-speed rendering pipelines.",
    desc: "A structural dive into contemporary UI layouts. Understand Vite bundling architecture, declarative custom hooks, CSS compilation patterns, and standard fluid responsive principles.",
    level: Level.BEGINNER,
    category: "Web Development",
    skills: ["React", "Tailwind CSS"],
    tags: ["web", "frontend", "css"],
    thumbUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=80",
    author: "Elena Petrova",
    ratingAverage: 4.75,
    enrolledStudentsCount: 1560,
    lessons: [
      {
        id: "c6-l1",
        courseId: "course-6",
        title: "Virtual DOM & Structural Component Lifecycle Hooks",
        durationMin: 11,
        order: 1,
        contentMd: `### Declartive State Optimization

React models rendering using a virtual DOM representation. This isolates states changes, updating only altered nodes in the browser layout.

#### Core React Rules:
- **State Immutability**: Always call the updater function rather than mutably changing variables.
- **Hook Rules**: Hook calls must occur at the top level of functions.

Example of standard custom clean rendering:
\`\`\`ts
import { useState, useEffect } from 'react';

export function DynamicCounter({ increment }) {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + increment)}>
      Increment: {count}
    </button>
  );
}
\`\`\`
`
      }
    ],
    quiz: {
      id: "quiz-6",
      courseId: "course-6",
      title: "React Components & Tailwind Layouts Quiz",
      questions: [
        {
          q: "Which property is a critical requirement of utilizing React hooks?",
          options: [
            "They must run inside standard global try-catch wrappers.",
            "They must be called exclusively at the top level of functional components.",
            "They should only be triggered after the complete document has loaded.",
            "They can be used freely inside standard dynamic for loops."
          ],
          answerIndex: 1
        }
      ],
      passPct: 100
    }
  }
];
