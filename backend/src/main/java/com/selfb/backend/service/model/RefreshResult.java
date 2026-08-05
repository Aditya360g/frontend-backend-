package com.selfb.backend.service.model;

import com.selfb.backend.dto.response.LoginResponse;

public record RefreshResult(
        LoginResponse loginResponse,
        IssuedRefreshToken refreshToken
) {
}