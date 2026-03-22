
CREATE TABLE t_p8885754_chat_app_creation_5.clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    company VARCHAR(255),
    birthday DATE,
    status VARCHAR(50) DEFAULT 'active',
    source VARCHAR(100),
    notes TEXT,
    private_chat_id VARCHAR(100),
    tags TEXT[],
    avatar_url TEXT,
    city VARCHAR(100),
    social_links JSONB DEFAULT '{}',
    extra JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON t_p8885754_chat_app_creation_5.clients (email);
CREATE INDEX ON t_p8885754_chat_app_creation_5.clients (phone);
CREATE INDEX ON t_p8885754_chat_app_creation_5.clients (status);
CREATE INDEX ON t_p8885754_chat_app_creation_5.clients (created_at);
