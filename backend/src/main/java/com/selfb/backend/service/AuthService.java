package com.selfb.backend.service;

import com.selfb.backend.dto.request.LoginRequest;
import com.selfb.backend.dto.request.RegisterRequest;
import com.selfb.backend.dto.response.UserResponse;
import com.selfb.backend.service.model.LoginResult;
import com.selfb.backend.service.model.RefreshResult;

public interface AuthService {

    UserResponse register(
            RegisterRequest request
    );

    LoginResult login(
            LoginRequest request,
            String clientIp,
            String userAgent
    );

    RefreshResult refresh(
            String rawRefreshToken,
            String clientIp,
            String userAgent
    );

    void logout(
            String rawRefreshToken
    );
}