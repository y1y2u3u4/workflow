CREATE TABLE tasks_llm
(
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    sku TEXT,
    user_input TEXT,
    llm_output TEXT,
    created_at timestamptz
);
DROP TABLE IF EXISTS scripts;
-- CREATE TABLE scripts
-- (
--     id SERIAL PRIMARY KEY,
--     user_email VARCHAR(255) NOT NULL,
--     type TEXT,
--     description TEXT,
--     script_name TEXT,
--     script_url TEXT,
--     script_lyric TEXT,
--     created_at timestamptz,
--     status SMALLINT
-- );

DROP TABLE IF EXISTS video_scripts;
-- CREATE TABLE video_scripts
-- (
--     id SERIAL PRIMARY KEY,
--     user_email VARCHAR(255) NOT NULL,
--     description TEXT,
--     video_name TEXT,
--     script_name TEXT,
--     video_lyric TEXT,
--     script_lyric TEXT,
--     video_scripts_url TEXT,
--     created_at timestamptz,
--     status SMALLINT
-- );

-- psql "postgresql://postgres.hhejytvevukefsbykjrh:LTzFuL10npCShwcv@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

-- \i /Users/zgq/1.project/Doraemon/SmartRPA_background/data/install.sql
-- \q
