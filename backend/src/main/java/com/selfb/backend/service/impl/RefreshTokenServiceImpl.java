package com.selfb.backend.service.impl;

import com.selfb.backend.config.properties.RefreshTokenProperties;
import com.selfb.backend.dto.response.SessionResponse;
import com.selfb.backend.entity.RefreshTokenEntity;
import com.selfb.backend.entity.UserEntity;
import com.selfb.backend.exception.InvalidCredentialsException;
import com.selfb.backend.exception.ResourceNotFoundException;
import com.selfb.backend.repository.RefreshTokenRepository;
import com.selfb.backend.security.token.RefreshTokenGenerator;
import com.selfb.backend.service.RefreshTokenService;
import com.selfb.backend.service.model.IssuedRefreshToken;
import com.selfb.backend.service.model.RefreshTokenRotation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    private static final int
            MAX_TOKEN_GENERATION_ATTEMPTS = 5;

    private final RefreshTokenRepository
            refreshTokenRepository;

    private final RefreshTokenGenerator
            refreshTokenGenerator;

    private final RefreshTokenProperties
            refreshTokenProperties;

    public RefreshTokenServiceImpl(
            RefreshTokenRepository refreshTokenRepository,
            RefreshTokenGenerator refreshTokenGenerator,
            RefreshTokenProperties refreshTokenProperties
    ) {
        this.refreshTokenRepository =
                refreshTokenRepository;

        this.refreshTokenGenerator =
                refreshTokenGenerator;

        this.refreshTokenProperties =
                refreshTokenProperties;
    }

    @Override
    @Transactional
    public IssuedRefreshToken issueToken(
            UserEntity user,
            String clientIp,
            String userAgent
    ) {
        Objects.requireNonNull(
                user,
                "User cannot be null."
        );

        String tokenFamilyId =
                UUID.randomUUID().toString();

        return createAndSaveToken(
                user,
                tokenFamilyId,
                clientIp,
                userAgent
        );
    }

    @Override
    @Transactional(
            noRollbackFor =
                    InvalidCredentialsException.class
    )
    public RefreshTokenRotation rotateToken(
            String rawRefreshToken,
            String clientIp,
            String userAgent
    ) {
        String currentTokenHash =
                refreshTokenGenerator.hashToken(
                        rawRefreshToken
                );

        RefreshTokenEntity currentToken =
                refreshTokenRepository
                        .findByTokenHash(
                                currentTokenHash
                        )
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid refresh token."
                                )
                        );

        Instant currentTime =
                Instant.now();

        if (currentToken.isRevoked()) {
            revokeTokenFamily(
                    currentToken.getTokenFamilyId(),
                    currentTime
            );

            throw new InvalidCredentialsException(
                    "Refresh token reuse detected. Please sign in again."
            );
        }

        if (
                currentToken.isExpired(
                        currentTime
                )
        ) {
            currentToken.revoke(
                    currentTime,
                    null
            );

            refreshTokenRepository.save(
                    currentToken
            );

            throw new InvalidCredentialsException(
                    "Refresh token has expired. Please sign in again."
            );
        }

        GeneratedToken generatedToken =
                generateUniqueToken();

        Instant expiresAt =
                currentTime.plus(
                        refreshTokenProperties
                                .getExpiration()
                );

        RefreshTokenEntity replacementToken =
                new RefreshTokenEntity(
                        currentToken.getUser(),
                        generatedToken.tokenHash(),
                        currentToken.getTokenFamilyId(),
                        expiresAt,
                        normalizeMetadata(
                                clientIp,
                                45
                        ),
                        normalizeMetadata(
                                userAgent,
                                255
                        )
                );

        currentToken.revoke(
                currentTime,
                generatedToken.tokenHash()
        );

        refreshTokenRepository.save(
                currentToken
        );

        refreshTokenRepository.save(
                replacementToken
        );

        IssuedRefreshToken issuedRefreshToken =
                new IssuedRefreshToken(
                        generatedToken.rawToken(),
                        expiresAt
                );

        return new RefreshTokenRotation(
                currentToken.getUser(),
                issuedRefreshToken
        );
    }

    @Override
    @Transactional
    public void revokeAllActiveTokensForUser(
            Long userId
    ) {
        Instant revokedAt =
                Instant.now();

        List<RefreshTokenEntity> activeTokens =
                refreshTokenRepository
                        .findAllByUser_IdAndRevokedAtIsNull(
                                userId
                        );

        for (
                RefreshTokenEntity token
                : activeTokens
        ) {
            if (!token.isRevoked()) {
                token.revoke(
                        revokedAt,
                        null
                );
            }
        }

        refreshTokenRepository.saveAll(
                activeTokens
        );
    }

    @Override
    @Transactional
    public void revokeToken(
            String rawRefreshToken
    ) {
        if (
                rawRefreshToken == null
                || rawRefreshToken.isBlank()
        ) {
            return;
        }

        String tokenHash =
                refreshTokenGenerator.hashToken(
                        rawRefreshToken
                );

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .ifPresent(refreshToken -> {
                    if (!refreshToken.isRevoked()) {
                        refreshToken.revoke(
                                Instant.now(),
                                null
                        );

                        refreshTokenRepository.save(
                                refreshToken
                        );
                    }
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions(
            Long userId,
            String currentRefreshToken
    ) {
        Instant currentTime =
                Instant.now();

        String currentTokenHash = null;

        if (
                currentRefreshToken != null
                && !currentRefreshToken.isBlank()
        ) {
            currentTokenHash =
                    refreshTokenGenerator.hashToken(
                            currentRefreshToken
                    );
        }

        String finalCurrentTokenHash =
                currentTokenHash;

        return refreshTokenRepository
                .findAllByUser_IdAndRevokedAtIsNullOrderByUpdatedAtDesc(
                        userId
                )
                .stream()
                .filter(token ->
                        token.isActive(currentTime)
                )
                .map(token ->
                        new SessionResponse(
                                token.getId(),
                                token.getTokenFamilyId(),
                                token.getCreatedByIp(),
                                token.getUserAgent(),
                                token.getCreatedAt(),
                                token.getUpdatedAt(),
                                token.getExpiresAt(),
                                finalCurrentTokenHash != null
                                        && finalCurrentTokenHash.equals(
                                                token.getTokenHash()
                                        )
                        )
                )
                .toList();
    }

    @Override
    @Transactional
    public void revokeSession(
            Long userId,
            Long sessionId
    ) {
        RefreshTokenEntity sessionToken =
                refreshTokenRepository
                        .findByIdAndUser_Id(
                                sessionId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Session was not found."
                                )
                        );

        revokeTokenFamily(
                sessionToken.getTokenFamilyId(),
                Instant.now()
        );
    }

    @Override
    @Transactional
    public void revokeOtherSessions(
            Long userId,
            String currentRefreshToken
    ) {
        if (
                currentRefreshToken == null
                || currentRefreshToken.isBlank()
        ) {
            throw new InvalidCredentialsException(
                    "Current refresh token is missing. Please sign in again."
            );
        }

        String currentTokenHash =
                refreshTokenGenerator.hashToken(
                        currentRefreshToken
                );

        RefreshTokenEntity currentToken =
                refreshTokenRepository
                        .findByTokenHash(
                                currentTokenHash
                        )
                        .filter(token ->
                                Objects.equals(
                                        token.getUser().getId(),
                                        userId
                                )
                        )
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Current session is invalid. Please sign in again."
                                )
                        );

        Instant currentTime =
                Instant.now();

        if (!currentToken.isActive(currentTime)) {
            throw new InvalidCredentialsException(
                    "Current session has expired. Please sign in again."
            );
        }

        List<RefreshTokenEntity> otherSessions =
                refreshTokenRepository
                        .findAllByUser_IdAndRevokedAtIsNull(
                                userId
                        )
                        .stream()
                        .filter(token ->
                                !Objects.equals(
                                        token.getTokenFamilyId(),
                                        currentToken.getTokenFamilyId()
                                )
                        )
                        .filter(token ->
                                token.isActive(currentTime)
                        )
                        .toList();

        for (
                RefreshTokenEntity session
                : otherSessions
        ) {
            session.revoke(
                    currentTime,
                    null
            );
        }

        refreshTokenRepository.saveAll(
                otherSessions
        );
    }

    private IssuedRefreshToken createAndSaveToken(
            UserEntity user,
            String tokenFamilyId,
            String clientIp,
            String userAgent
    ) {
        GeneratedToken generatedToken =
                generateUniqueToken();

        Instant expiresAt =
                Instant.now().plus(
                        refreshTokenProperties
                                .getExpiration()
                );

        RefreshTokenEntity refreshToken =
                new RefreshTokenEntity(
                        user,
                        generatedToken.tokenHash(),
                        tokenFamilyId,
                        expiresAt,
                        normalizeMetadata(
                                clientIp,
                                45
                        ),
                        normalizeMetadata(
                                userAgent,
                                255
                        )
                );

        refreshTokenRepository.save(
                refreshToken
        );

        return new IssuedRefreshToken(
                generatedToken.rawToken(),
                expiresAt
        );
    }

    private void revokeTokenFamily(
            String tokenFamilyId,
            Instant revokedAt
    ) {
        List<RefreshTokenEntity> familyTokens =
                refreshTokenRepository
                        .findAllByTokenFamilyId(
                                tokenFamilyId
                        );

        for (
                RefreshTokenEntity familyToken
                : familyTokens
        ) {
            if (!familyToken.isRevoked()) {
                familyToken.revoke(
                        revokedAt,
                        null
                );
            }
        }

        refreshTokenRepository.saveAll(
                familyTokens
        );
    }

    private GeneratedToken generateUniqueToken() {
        for (
                int attempt = 1;
                attempt <= MAX_TOKEN_GENERATION_ATTEMPTS;
                attempt++
        ) {
            String rawToken =
                    refreshTokenGenerator
                            .generateToken();

            String tokenHash =
                    refreshTokenGenerator
                            .hashToken(rawToken);

            boolean alreadyExists =
                    refreshTokenRepository
                            .existsByTokenHash(
                                    tokenHash
                            );

            if (!alreadyExists) {
                return new GeneratedToken(
                        rawToken,
                        tokenHash
                );
            }
        }

        throw new IllegalStateException(
                "Unable to generate a unique refresh token."
        );
    }

    private String normalizeMetadata(
            String value,
            int maximumLength
    ) {
        if (
                value == null
                || value.isBlank()
        ) {
            return null;
        }

        String normalizedValue =
                value.trim();

        if (
                normalizedValue.length()
                <= maximumLength
        ) {
            return normalizedValue;
        }

        return normalizedValue.substring(
                0,
                maximumLength
        );
    }

    private record GeneratedToken(
            String rawToken,
            String tokenHash
    ) {
    }
}