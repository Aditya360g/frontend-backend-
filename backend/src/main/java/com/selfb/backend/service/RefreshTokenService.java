package com.selfb.backend.service;

import com.selfb.backend.dto.response.SessionResponse;
import com.selfb.backend.entity.UserEntity;
import com.selfb.backend.service.model.IssuedRefreshToken;
import com.selfb.backend.service.model.RefreshTokenRotation;

import java.util.List;

public interface RefreshTokenService {

    IssuedRefreshToken issueToken(
            UserEntity user,
            String clientIp,
            String userAgent
    );

    RefreshTokenRotation rotateToken(
            String rawRefreshToken,
            String clientIp,
            String userAgent
    );

    void revokeToken(
            String rawRefreshToken
    );

    void revokeAllActiveTokensForUser(
            Long userId
    );

    List<SessionResponse> getActiveSessions(
            Long userId,
            String currentRefreshToken
    );

    void revokeSession(
            Long userId,
            Long sessionId
    );

    void revokeOtherSessions(
            Long userId,
            String currentRefreshToken
    );
}