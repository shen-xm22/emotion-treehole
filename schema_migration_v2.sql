-- ===== 情绪树洞 V2 迁移 — 多会话管理 =====
-- 请在 Supabase SQL Editor 中执行

-- 1. 树洞会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '新树洞',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. conversations 表增加 user_id 列（跨设备同步用）
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- 3. 索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_uid ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_uid ON conversations(user_id);
