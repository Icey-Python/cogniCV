ry:
* Job Management:
       * Full CRUD endpoints for job postings.
       * Data isolation ensuring recruiters can only access and manage their own jobs.
* Data Ingestion & Storage:
       * Cloudflare R2 (S3-compatible) integration for permanent resume file storage.
       * RabbitMQ integration for asynchronous background processing.
       * Automatic reconnection and error handling logic for the message broker.
* AI Resume Parsing (Normalization):
       * PDF text extraction and normalization into a unified JSON schema using Gemini 2.0 Flash.
       * Semantic spreadsheet mapping to handle varied column names without manual configuration.
       * Worker-side batching (groups of 5) to optimize API latency and cost.
       * Automated PII scrubbing (removal of names/contact info) during parsing to reduce bias.
* AI Screening & Scoring Engine:
       * Weighted scoring model (40% Skills, 30% Experience, 15% Education, 15% Availability).
       * Chunked evaluation logic to handle large applicant pools (20 per batch) without losing accuracy.
       * Unified ranking system that combines internal platform applicants and external file uploads.
       * Evidence-based reasoning generation for each candidate (Strengths, Gaps, Recommendations).
