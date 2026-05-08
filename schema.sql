CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== 用户系统 =====
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nickname TEXT DEFAULT '',
    mbti TEXT DEFAULT '',
    zodiac TEXT DEFAULT '',
    birth_date TEXT DEFAULT '',
    gender TEXT DEFAULT '',
    hobbies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    summary TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 会话数据 =====
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL,
    result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, type)
);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    session_id TEXT PRIMARY KEY,
    profile_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 索引 =====
CREATE INDEX IF NOT EXISTS idx_assessments_sid ON assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_sid ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_ts ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_results_uid ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_type ON assessment_results(type);
