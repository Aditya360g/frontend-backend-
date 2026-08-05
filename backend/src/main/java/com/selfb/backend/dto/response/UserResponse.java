package com.selfb.backend.dto.response;

import com.selfb.backend.entity.UserRole;

import java.time.Instant;

public record UserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        boolean enabled,
        String phone,
        String bio,
        Instant createdAt,
        Instant updatedAt
) {
}