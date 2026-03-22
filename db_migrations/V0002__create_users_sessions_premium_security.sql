
CREATE TABLE t_p8885754_chat_app_creation_5.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(64),
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p8885754_chat_app_creation_5.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p8885754_chat_app_creation_5.users(id),
    token VARCHAR(128) UNIQUE NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p8885754_chat_app_creation_5.premium_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES t_p8885754_chat_app_creation_5.users(id),
    plan VARCHAR(30) DEFAULT 'premium',
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    features JSONB DEFAULT '{"e2e_encryption": true, "file_sharing": true, "voice_calls": true, "video_calls": true, "priority_support": true, "custom_themes": true}'
);

CREATE TABLE t_p8885754_chat_app_creation_5.security_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p8885754_chat_app_creation_5.users(id),
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),
    device_info TEXT,
    status VARCHAR(20) DEFAULT 'success',
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON t_p8885754_chat_app_creation_5.sessions(token);
CREATE INDEX ON t_p8885754_chat_app_creation_5.sessions(user_id);
CREATE INDEX ON t_p8885754_chat_app_creation_5.sessions(expires_at);
CREATE INDEX ON t_p8885754_chat_app_creation_5.security_log(user_id);
CREATE INDEX ON t_p8885754_chat_app_creation_5.security_log(created_at);
