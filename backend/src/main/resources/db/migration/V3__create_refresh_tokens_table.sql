CREATE TABLE refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,

    user_id BIGINT NOT NULL,

    token_hash CHAR(64) NOT NULL,

    token_family_id CHAR(36) NOT NULL,

    expires_at TIMESTAMP(6) NOT NULL,

    revoked_at TIMESTAMP(6) NULL,

    replaced_by_token_hash CHAR(64) NULL,

    created_by_ip VARCHAR(45) NULL,

    user_agent VARCHAR(255) NULL,

    created_at TIMESTAMP(6)
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6),

    updated_at TIMESTAMP(6)
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),

    CONSTRAINT uk_refresh_tokens_token_hash
        UNIQUE (token_hash),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    INDEX idx_refresh_tokens_user_id (user_id),

    INDEX idx_refresh_tokens_family_id (
        token_family_id
    ),

    INDEX idx_refresh_tokens_expires_at (
        expires_at
    )
);