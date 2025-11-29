-- Auto-enable pgvector extension when database is created
-- This script runs automatically when the PostgreSQL container starts for the first time
CREATE EXTENSION IF NOT EXISTS vector;
