package com.selfb.backend.service.model;

import java.time.Instant;

public record IssuedRefreshToken(
        String rawToken,
        Instant expiresAt
) {
}