# CogniCV — Product Requirements Document

> **Umurava AI Hackathon** · AI Products for the Human Resources Industry
> Version 1.0 · 3-Member Team · April 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement & Win Strategy](#2-problem-statement--win-strategy)
3. [Product Scope & Features](#3-product-scope--features)
4. [AI Engine Design](#4-ai-engine-design)
5. [System Architecture](#5-system-architecture)
6. [Database Schema](#6-database-schema)
7. [API Endpoint Reference](#7-api-endpoint-reference)
8. [Team Responsibilities](#8-team-responsibilities)
9. [Sprint Plan](#9-sprint-plan)
10. [Dummy Data Strategy](#10-dummy-data-strategy)
11. [Environment Variables](#11-environment-variables)
12. [Judging Criteria Checklist](#12-judging-criteria-checklist)

---

## 1. Project Overview

| Field               | Detail                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **Product Name**    | CogniCV — AI-Powered Talent Screening Platform                                                            |
| **Hackathon Theme** | An Innovation Challenge to Build AI Products for the HR Industry                                          |
| **Sponsor**         | Umurava Africa                                                                                            |
| **Tech Stack**      | Next.js · Node.js · TypeScript · MongoDB · Gemini API · Redux Toolkit · Tailwind CSS                      |
| **Repositories**    | `cognicv-frontend` (Next.js) · `cognicv-backend` (Node.js + TypeScript)                                   |
| **Core Goal**       | Build a production-grade AI recruiter tool that screens, scores, ranks, and explains candidate shortlists |

**CogniCV** is an intelligent talent screening platform built for Umurava's recruiter ecosystem. It solves the two core pain points of modern hiring — high application volume and inconsistent cross-profile comparison — using Google's Gemini API as its reasoning engine. CogniCV ingests structured talent profiles from the Umurava platform and unstructured data from external sources (CSV uploads, PDF resumes), evaluates all candidates simultaneously against a job's requirements, and returns a transparent, explainable ranked shortlisted

---

## 2. Problem Statement & Win Strategy

### 2.1 Core Problems

- Recruiters process hundreds of applications manually, extending time-to-hire by days or weeks.
- Comparing candidates across diverse profile formats leads to inconsistent, subjective decisions.
- Most AI-assisted tools lack explainability — recruiters can't trust or act on a black-box ranking.

### 2.2 How We Win Each Judging Criterion

| Judging Criterion            | Our Winning Angle                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI & Engineering Prowess** | Multi-candidate batch Gemini prompting, weighted scoring engine, strict JSON output schema, documented prompt engineering rationale, retry/fallback logic |
| **UX & Product Design**      | Clean recruiter-first Next.js dashboard, spotlight shortlist view, per-candidate reasoning cards, mobile-responsive Tailwind UI, skeleton loaders         |
| **HR / Talent Acquisition**  | Bias-awareness prompt layer, skills gap analysis per candidate, availability flags, explainable shortlist tied to specific job criteria                   |
| **Business Relevance**       | Dual-mode ingestion (Umurava platform + external), schema-compliant design, Vercel + Railway deploy, multi-tenant ready architecture                      |

---

## 3. Product Scope & Features

### 3.1 Scenario 1 — Umurava Platform Screening

Recruiters create a job and CogniCV screens structured Talent Profiles (Umurava schema) against job requirements via the Gemini AI layer.

| Feature                  | Description                                                                      | Priority    |
| ------------------------ | -------------------------------------------------------------------------------- | ----------- |
| Job Creation Form        | Title, description, required skills, experience level, location, employment type | Must Have   |
| Talent Profile Ingestion | Load schema-compliant profiles from MongoDB (seeded dummy data)                  | Must Have   |
| AI Screening Trigger     | Batch-evaluate all applicants in a single Gemini prompt call                     | Must Have   |
| Ranked Shortlist View    | Top 10 or Top 20 candidates sorted by match score (0–100)                        | Must Have   |
| Candidate Reasoning Card | AI-generated Strengths, Gaps, and Recommendation per candidate                   | Must Have   |
| Score Breakdown          | Weighted sub-scores: Skills, Experience, Education, Availability                 | Should Have |
| Shortlist Export         | Download ranked list as CSV or PDF                                               | Should Have |

### 3.2 Scenario 2 — External Job Board Screening

Recruiters upload applicant data via CSV/Excel or PDF resumes. The same AI engine processes and ranks this data.

| Feature             | Description                                                                    | Priority    |
| ------------------- | ------------------------------------------------------------------------------ | ----------- |
| CSV / Excel Upload  | Drag-and-drop upload with column mapping UI                                    | Must Have   |
| PDF Resume Upload   | Multi-file PDF upload with AI-powered text extraction                          | Must Have   |
| Resume Parsing      | Gemini-powered extraction of structured candidate objects from raw resume text | Must Have   |
| Unified Screening   | External candidates ranked on the same scoring model as platform profiles      | Must Have   |
| Ingestion Audit Log | Show parsed, skipped, and flagged profile counts post-upload                   | Should Have |

---

## 4. AI Engine Design

### 4.1 Scoring Model

CogniCV uses a weighted scoring model applied consistently across all candidates:

| Dimension            | Weight | What It Evaluates                                                                |
| -------------------- | ------ | -------------------------------------------------------------------------------- |
| Skills Match         | 40%    | Required skills vs. candidate's declared skills, levels, and years of experience |
| Experience Relevance | 30%    | Role titles, industry fit, responsibilities, recency of relevant work            |
| Education Fit        | 15%    | Degree level, field of study alignment with job requirements                     |
| Availability         | 15%    | Availability status, employment type match, start date                           |

**Total Score: 0–100.** Top 10 or Top 20 candidates are surfaced as the shortlist.

### 4.2 Prompt Architecture

Each AI screening run consists of two prompt types:

#### Master Screening Prompt (Scenario 1 & 2)

```
SYSTEM:
You are an expert talent acquisition specialist. Your task is to evaluate candidates
for a job role and return a strict JSON array ranked by match score.

Evaluation rules:
- Score only job-relevant attributes. Ignore name, gender, and nationality.
- Apply the following weights: Skills (40%), Experience (30%), Education (15%),
  Availability (15%).
- For each candidate return: rank, candidateId, matchScore (0-100),
  subScores { skills, experience, education, availability },
  strengths (array of 3 strings), gaps (array of 2-3 strings),
  recommendation (1 sentence).
- Return ONLY valid JSON. No preamble, no markdown, no explanation outside the array.

JOB CRITERIA:
{jobCriteriaJSON}

CANDIDATES:
{candidatesJSON}
```

#### Resume Parsing Prompt (Scenario 2)

```
SYSTEM:
Extract structured candidate data from the following resume text and return a JSON
object conforming exactly to this schema: {talentProfileSchema}.
Return ONLY valid JSON. If a field cannot be determined, use null.

RESUME TEXT:
{rawResumeText}
```

### 4.3 AI Safeguards

| Safeguard                   | Implementation                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bias Awareness**          | System prompt explicitly instructs Gemini to exclude name, location, and nationality from scoring                                             |
| **JSON Schema Enforcement** | Backend validates Gemini's response against a TypeScript Zod schema before storing                                                            |
| **Fallback Prompts**        | If response fails validation, a correction prompt is sent: `"Your previous response was invalid JSON. Return only the corrected JSON array."` |
| **Retry Logic**             | Up to 3 retries with exponential backoff on Gemini API errors                                                                                 |
| **Candidate Normalisation** | PDF/CSV candidates are mapped to the Umurava TalentProfile schema before entering the scoring pipeline                                        |

### 4.4 AI Output Structure (Per Candidate)

```json
{
  "rank": 1,
  "candidateId": "abc123",
  "matchScore": 87,
  "subScores": {
    "skills": 90,
    "experience": 85,
    "education": 80,
    "availability": 95
  },
  "strengths": [
    "5+ years of Node.js with documented production deployments",
    "Strong TypeScript and REST API design background",
    "Available immediately for full-time engagement"
  ],
  "gaps": [
    "No direct experience with MongoDB; primarily PostgreSQL",
    "No certifications in cloud infrastructure"
  ],
  "recommendation": "Strong hire — skills and experience closely match the role; minor DB ramp-up expected."
}
```

---

## 5. System Architecture

### 5.1 Layer Overview

| Layer                  | Technology                                                     | Responsibility                                                                 |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Frontend**           | Next.js 14 (App Router) · React · Redux Toolkit · Tailwind CSS | Recruiter dashboard, job forms, shortlist visualisation, upload interfaces     |
| **Backend API**        | Node.js · TypeScript · Express · REST                          | Business logic, AI orchestration, data ingestion, auth                         |
| **AI Layer**           | Gemini 1.5 Flash API (mandatory)                               | Job-candidate matching, scoring, ranking, reasoning generation, resume parsing |
| **Database**           | MongoDB · Mongoose                                             | Jobs, Applicants, ScreeningResults, Users collections                          |
| **File Handling**      | Multer · pdf-parse · SheetJS                                   | PDF and CSV/Excel parsing pipeline                                             |
| **Auth**               | JWT + bcrypt                                                   | Recruiter account management                                                   |
| **Hosting — Frontend** | Vercel                                                         | Next.js deployment                                                             |
| **Hosting — Backend**  | Railway / Render                                               | Node.js API server                                                             |
| **Hosting — DB**       | MongoDB Atlas                                                  | Cloud-hosted database                                                          |

### 5.2 AI Screening Data Flow

```
1. RECRUITER creates job → POST /api/jobs → stored in MongoDB
         ↓
2. APPLICANTS LOADED → platform profiles from DB  OR  file upload parsed & normalised
         ↓
3. PROMPT BUILT → backend constructs structured Gemini prompt (job + all candidates)
         ↓
4. GEMINI CALL → single batch request to Gemini Flash API
         ↓
5. RESPONSE VALIDATED → Zod schema check; correction prompt sent on failure (up to 3x)
         ↓
6. RESULTS STORED → ScreeningResult document saved to MongoDB
         ↓
7. SHORTLIST SERVED → GET /api/screening/:jobId/results → ranked list with reasoning
         ↓
8. UI RENDERS → recruiter views interactive shortlist, expands reasoning cards
```

### 5.3 Repository Structure

#### `cognicv-frontend`

```
src/
├── app/
│   ├── (auth)/login · register
│   ├── dashboard/
│   ├── jobs/[id]/
│   │   ├── page.tsx          # Job detail + applicant upload
│   │   └── results/page.tsx  # Shortlist view
│   └── jobs/new/page.tsx
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── jobs/                 # JobForm, JobCard
│   ├── screening/            # ShortlistCard, ReasoningModal, ScoreBar
│   └── upload/               # CsvUploader, PdfUploader, ParseStatus
├── store/                    # Redux slices: jobs, screening, auth
├── lib/                      # API client, utils
└── types/                    # Shared TypeScript interfaces
```

#### `cognicv-backend`

```
src/
├── routes/
│   ├── auth.ts
│   ├── jobs.ts
│   ├── applicants.ts
│   └── screening.ts
├── controllers/              # Business logic per route
├── models/                   # Mongoose schemas
├── services/
│   ├── gemini.service.ts     # Gemini API client + prompt builders
│   ├── parser.service.ts     # PDF + CSV parsing
│   └── normaliser.service.ts # External → TalentProfile mapping
├── middleware/               # Auth, error handling, validation
├── scripts/seed.ts           # Dummy data generator
└── types/                    # Shared TypeScript interfaces
```

---

## 6. Database Schema

### `users`

```ts
{
  _id: ObjectId,
  name: string,
  email: string,          // unique
  passwordHash: string,
  createdAt: Date
}
```

### `jobs`

```ts
{
  _id: ObjectId,
  title: string,
  description: string,
  requiredSkills: string[],
  experienceLevel: "Entry" | "Junior" | "Mid" | "Senior" | "Lead",
  type: "Full-time" | "Part-time" | "Contract",
  location: string,
  createdBy: ObjectId,    // ref: users
  createdAt: Date
}
```

### `talentProfiles` _(Umurava Schema — must not be modified)_

```ts
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string,
  headline: string,
  bio?: string,
  location: string,
  skills: { name: string, level: "Beginner"|"Intermediate"|"Advanced"|"Expert", yearsOfExperience: number }[],
  languages?: { name: string, proficiency: "Basic"|"Conversational"|"Fluent"|"Native" }[],
  experience: { company: string, role: string, startDate: string, endDate: string, description: string, technologies: string[], isCurrent: boolean }[],
  education: { institution: string, degree: string, fieldOfStudy: string, startYear: number, endYear: number }[],
  certifications?: { name: string, issuer: string, issueDate: string }[],
  projects: { name: string, description: string, technologies: string[], role: string, link?: string, startDate: string, endDate: string }[],
  availability: { status: "Available"|"Open to Opportunities"|"Not Available", type: "Full-time"|"Part-time"|"Contract", startDate?: string },
  socialLinks?: { linkedin?: string, github?: string, portfolio?: string }
}
```

### `externalApplicants`

```ts
{
  _id: ObjectId,
  jobId: ObjectId,
  source: "csv" | "pdf",
  rawText: string,
  parsedProfile: TalentProfile,   // normalised to Umurava schema shape
  parsingStatus: "success" | "partial" | "failed"
}
```

### `screeningResults`

```ts
{
  _id: ObjectId,
  jobId: ObjectId,
  rankedCandidates: {
    rank: number,
    candidateId: ObjectId,
    profileSource: "platform" | "external",
    matchScore: number,
    subScores: { skills: number, experience: number, education: number, availability: number },
    strengths: string[],
    gaps: string[],
    recommendation: string,
    profileSnapshot: TalentProfile   // stored at time of screening
  }[],
  createdAt: Date
}
```

---

## 7. API Endpoint Reference

| Method   | Endpoint                   | Description                                       |
| -------- | -------------------------- | ------------------------------------------------- |
| `POST`   | `/api/auth/register`       | Create recruiter account                          |
| `POST`   | `/api/auth/login`          | Login, return JWT                                 |
| `GET`    | `/api/jobs`                | List all jobs for authenticated recruiter         |
| `POST`   | `/api/jobs`                | Create a new job                                  |
| `GET`    | `/api/jobs/:id`            | Get single job detail                             |
| `PUT`    | `/api/jobs/:id`            | Update job                                        |
| `DELETE` | `/api/jobs/:id`            | Delete job                                        |
| `GET`    | `/api/jobs/:id/applicants` | List all applicants (platform + external) for job |
| `POST`   | `/api/jobs/:id/upload/csv` | Upload CSV applicant file                         |
| `POST`   | `/api/jobs/:id/upload/pdf` | Upload PDF resume files                           |
| `POST`   | `/api/jobs/:id/screen`     | Trigger AI screening run                          |
| `GET`    | `/api/jobs/:id/results`    | Get ranked shortlist with reasoning               |
| `GET`    | `/api/profiles`            | Browse / seed platform talent profiles            |

---

## 8. Team Responsibilities

> Each member owns a distinct product slice aligned to the three hackathon specialisations: Frontend, Backend, and AI.

---

### 🎨 Member 1 — Frontend Engineer

**Tech Skills Required**

- Next.js 14 (App Router, server components)
- React + Redux Toolkit + RTK Query
- Tailwind CSS + shadcn/ui
- Framer Motion (micro-animations)
- React Hook Form + Zod (form validation)
- Recharts (score visualisations)
- Axios / Fetch (API integration)

**Responsibilities**

1. Recruiter auth UI — login, register pages, protected route middleware
2. Job creation and editing form — multi-skill tag input, experience level selector, full Zod validation
3. Jobs dashboard — list view with status indicators and quick-action buttons
4. Applicant upload interface — CSV drag-and-drop zone and PDF multi-upload with live parse status feedback
5. Shortlist dashboard — ranked candidate cards with animated score bars, rank badge, and expand/collapse reasoning
6. Candidate detail modal — full profile snapshot, AI reasoning card, sub-score breakdown using Recharts
7. Shortlist export button — triggers CSV and PDF download from backend
8. Global loading states, skeleton screens, and error boundary handling
9. Responsive layout for desktop and tablet viewports

---

### ⚙️ Member 2 — Backend Engineer

**Tech Skills Required**

- Node.js + TypeScript + Express
- MongoDB + Mongoose (schema design)
- REST API design
- Multer (file upload middleware)
- pdf-parse (PDF text extraction)
- SheetJS + csv-parse (Excel and CSV ingestion)
- JWT + bcrypt (authentication)
- Zod (request and response validation)
- dotenv (environment config)

**Responsibilities**

1. MongoDB schema design and Mongoose models: `User`, `Job`, `TalentProfile`, `ExternalApplicant`, `ScreeningResult`
2. Auth API: `POST /auth/register`, `POST /auth/login`, JWT middleware for protected routes
3. Jobs API: full CRUD endpoints with recruiter ownership checks
4. Applicant ingestion API: platform profile loader and file upload endpoints
5. PDF parsing pipeline: extract raw text from uploaded resumes using `pdf-parse`
6. CSV/Excel parsing pipeline: map spreadsheet columns to TalentProfile schema with a per-row validation report
7. AI orchestration endpoint: construct Gemini prompt, call AI service, validate JSON response, store `ScreeningResult`
8. Screening results API: serve ranked shortlist with pagination and filter-by-score support
9. Seed script (`scripts/seed.ts`): generate 50+ dummy `TalentProfile` records conforming strictly to the Umurava schema
10. Error handling middleware, request logging, and basic rate limiting

---

### 🤖 Member 3 — AI / Full-Stack Integration Engineer

**Tech Skills Required**

- Gemini 1.5 Flash API (Google AI SDK for Node.js)
- Prompt engineering (zero-shot, few-shot, structured output)
- JSON schema enforcement in LLM responses
- TypeScript interface and Zod schema design for AI output
- Resume normalisation and data mapping logic
- AI explainability patterns
- Faker.js (realistic test data generation)
- Next.js API routes (light FE–BE bridge if needed)

**Responsibilities**

1. Design and document the **master screening prompt**: job criteria injection format, candidate batch structure, weighted scoring instructions, bias-awareness directives
2. Design and document the **resume parsing prompt**: extract structured TalentProfile JSON from raw resume text
3. Implement the `GeminiService` wrapper: API client, prompt builders, retry logic (up to 3x with exponential backoff), timeout handling
4. Define the AI response TypeScript interfaces and Zod validation schemas
5. Implement the **JSON validation layer**: if Gemini output fails schema validation, fire a correction prompt automatically
6. Build the **candidate normalisation pipeline**: map parsed CSV/PDF data to the Umurava TalentProfile schema before scoring
7. Write the dummy data generator using Faker.js — realistic schema-compliant profiles across 10+ role archetypes and 5 experience levels
8. Produce the **AI decision flow documentation** for the README and hackathon evaluation
9. Assist Member 1 with wiring the shortlist API data to reasoning card UI components

---

## 9. Sprint Plan

| Phase                         | Duration   | Deliverables                                                                                                                                            |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0 — Setup**           | Day 1 (4h) | Both repos created and structured, env vars configured, MongoDB Atlas cluster live, Gemini API key tested, Vercel + Railway deployments linked to repos |
| **Phase 1 — Foundation**      | Day 1–2    | Auth (BE + FE), Job CRUD, Mongoose schemas, seed script with 50 dummy profiles, basic dashboard shell with navigation                                   |
| **Phase 2 — Core AI**         | Day 2–3    | Master screening prompt designed and tested, batch screening endpoint live, Zod validation layer, results stored in MongoDB                             |
| **Phase 3 — File Ingestion**  | Day 3      | CSV parsing pipeline, PDF parsing pipeline, external applicant normalisation service, upload UI complete with parse status                              |
| **Phase 4 — Shortlist UI**    | Day 3–4    | Ranked shortlist view, animated score bars, candidate reasoning cards, detail modal, export functionality                                               |
| **Phase 5 — Polish & Deploy** | Day 4–5    | Error handling, loading states, mobile responsiveness, README + AI flow documentation, final Vercel + Railway production deploy, full demo run-through  |

---

## 10. Dummy Data Strategy

Member 3 will use **Faker.js** to generate 50+ realistic `TalentProfile` records that strictly conform to the Umurava schema. The seed script will produce profiles covering:

- **5 experience levels**: Entry (0–1y), Junior (1–3y), Mid (3–5y), Senior (5–8y), Lead (8y+)
- **10+ role archetypes**: Backend, Frontend, Full-Stack, Data Engineer, ML Engineer, DevOps, QA, Product Manager, UI/UX, Mobile
- **Varied skill sets** using the schema's `name` / `level` / `yearsOfExperience` structure
- **Realistic education and certification histories**
- **Mixed availability statuses**: Available, Open to Opportunities, Not Available
- **African-first location data**: Nairobi, Lagos, Kigali, Accra, Cape Town, Kampala, Dar es Salaam — aligned with Umurava's market

Run with:

```bash
cd cognicv-backend
npx ts-node src/scripts/seed.ts
```

---

## 11. Environment Variables

### `cognicv-backend/.env`

```env
GEMINI_API_KEY=your_google_ai_studio_key
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_random_32_char_secret
PORT=3001
```

### `cognicv-frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001   # Railway URL in production
```

---

## 12. Judging Criteria Checklist

Use this before submission to verify every scoring dimension is demonstrable in the live app.

### ✅ AI & Engineering Prowess

- [ ] Gemini API integrated and calling correctly
- [ ] Batch multi-candidate prompt in a single API call
- [ ] Weighted scoring model (Skills 40 / Experience 30 / Education 15 / Availability 15)
- [ ] Structured JSON output enforced via Zod schema
- [ ] Fallback correction prompt on invalid Gemini response
- [ ] Retry logic with exponential backoff
- [ ] Resume-to-schema normalisation pipeline for PDF/CSV
- [ ] Prompt engineering documented in README

### ✅ UX & Product Design

- [ ] Clean recruiter dashboard with intuitive navigation
- [ ] Animated score bars and rank badges on shortlist cards
- [ ] Expandable per-candidate reasoning cards
- [ ] Drag-and-drop upload UI with live parse status
- [ ] Skeleton loaders and empty states on all views
- [ ] Mobile-responsive layout
- [ ] Export shortlist as CSV or PDF

### ✅ HR / Talent Acquisition

- [ ] Bias-awareness layer in AI prompt (name/location excluded from scoring)
- [ ] Skills gap analysis visible per candidate
- [ ] Availability and employment type flags surfaced in cards
- [ ] Each shortlisted candidate has a clear recommendation sentence
- [ ] Dual screening scenarios (platform profiles + external uploads) both functional
- [ ] Top 10 / Top 20 shortlist configurable by recruiter

### ✅ Business Relevance

- [ ] Multi-tenant auth (recruiters have isolated job views)
- [ ] Scalable MongoDB schema with indexed fields
- [ ] Live production URL on Vercel + Railway
- [ ] Umurava TalentProfile schema fully respected, no core fields modified
- [ ] Schema extensibility demonstrated (AI scores stored as extended fields)
- [ ] README with architecture diagram, setup instructions, and AI decision flow

---

> _Build as if this goes live at scale within Umurava's ecosystem._
> **CogniCV — Umurava AI Hackathon 2025**
