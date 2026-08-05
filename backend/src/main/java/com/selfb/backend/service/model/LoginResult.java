package com.selfb.backend.service.model;

import com.selfb.backend.dto.response.LoginResponse;

public record LoginResult(
        LoginResponse loginResponse,
        IssuedRefreshToken refreshToken
) {
}