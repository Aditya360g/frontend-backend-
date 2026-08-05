package com.selfb.backend.service.model;

import java.time.Instant;

public record IssuedEmailVerificationToken(
        String rawToken,
        Instant expiresAt
) {

    public IssuedEmailVerificationToken {
        if (
                rawToken == null
                || rawToken.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Raw email verification token cannot be empty."
            );
        }

        if (expiresAt == null) {
            throw new IllegalArgumentException(
                    "Email verification token expiration cannot be null."
            );
        }
    }
}