ALTER TABLE users
    ADD COLUMN email_verified BIT(1) NOT NULL DEFAULT b'0'
    AFTER enabled;

UPDATE users
SET email_verified = b'1';

CREATE TABLE email_verification_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT uk_email_verification_token_hash
        UNIQUE (token_hash),

    CONSTRAINT fk_email_verification_token_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    INDEX idx_email_verification_user_id (user_id),
    INDEX idx_email_verification_expires_at (expires_at)
);