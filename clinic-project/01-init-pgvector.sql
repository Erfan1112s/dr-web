-- Enables the pgvector extension used by the "embedding vector" column on
-- the Knowledge model in prisma/schema.prisma. Without this, Prisma's
-- migration fails because Postgres doesn't know the "vector" type.
--
-- This runs automatically the first time the "db" container initializes
-- its data directory (docker-entrypoint-initdb.d convention).
CREATE EXTENSION IF NOT EXISTS vector;
