package com.selfb.backend.dto.response;

import java.time.Instant;

public record SessionResponse(

        Long sessionId,

        String tokenFamilyId,

        String ipAddress,

        String userAgent,

        Instant signedInAt,

        Instant lastActivityAt,

        Instant expiresAt,

        boolean currentSession
) {
}