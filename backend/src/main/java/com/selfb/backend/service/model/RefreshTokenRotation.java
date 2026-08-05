package com.selfb.backend.service.model;

import com.selfb.backend.entity.UserEntity;

public record RefreshTokenRotation(
        UserEntity user,
        IssuedRefreshToken refreshToken
) {
}