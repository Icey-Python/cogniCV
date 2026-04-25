ry:

- Job Management:
  _ Full CRUD endpoints for job postings.
  _ Data isolation ensuring recruiters can only access and manage their own jobs.
- Data Ingestion & Storage:
  _ Cloudflare R2 (S3-compatible) integration for permanent resume file storage.
  _ RabbitMQ integration for asynchronous background processing. \* Automatic reconnection and error handling logic for the message broker.
- AI Resume Parsing (Normalization):
  _ PDF text extraction and normalization into a unified JSON schema using Gemini 2.0 Flash.
  _ Semantic spreadsheet mapping to handle varied column names without manual configuration.
  _ Worker-side batching (groups of 5) to optimize API latency and cost.
  _ Automated PII scrubbing (removal of names/contact info) during parsing to reduce bias.
- AI Screening & Scoring Engine:
  _ Weighted scoring model (40% Skills, 30% Experience, 15% Education, 15% Availability).
  _ Chunked evaluation logic to handle large applicant pools (20 per batch) without losing accuracy.
  _ Unified ranking system that combines internal platform applicants and external file uploads.
  _ Evidence-based reasoning generation for each candidate (Strengths, Gaps, Recommendations).

ab:

- Setup:
  _ Install dependencies when you pull
  _ Setup password reset and verification endpoints for user
  _ Move documentations to controllers from route groups
  _ Added initial recruiter seeding
  _ Updated the env variables, so please check (.env.example) and update it, if needed, using the env variables in the .env file
  _ Integrated user login with email and password
  \_ Integrated User Profile, and Organization endpoints
