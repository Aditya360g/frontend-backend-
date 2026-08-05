package com.selfb.backend.service.impl;

import com.selfb.backend.config.properties.PasswordResetProperties;
import com.selfb.backend.dto.request.ForgotPasswordRequest;
import com.selfb.backend.dto.request.ResetPasswordRequest;
import com.selfb.backend.entity.PasswordResetTokenEntity;
import com.selfb.backend.entity.UserEntity;
import com.selfb.backend.exception.InvalidPasswordResetTokenException;
import com.selfb.backend.repository.PasswordResetTokenRepository;
import com.selfb.backend.repository.UserRepository;
import com.selfb.backend.security.token.PasswordResetTokenGenerator;
import com.selfb.backend.service.PasswordResetService;
import com.selfb.backend.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
public class PasswordResetServiceImpl
        implements PasswordResetService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    PasswordResetServiceImpl.class
            );

    private final UserRepository userRepository;

    private final PasswordResetTokenRepository
            passwordResetTokenRepository;

    private final PasswordResetTokenGenerator
            passwordResetTokenGenerator;

    private final PasswordResetProperties
            passwordResetProperties;

    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenService
            refreshTokenService;

    public PasswordResetServiceImpl(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordResetTokenGenerator passwordResetTokenGenerator,
            PasswordResetProperties passwordResetProperties,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;

        this.passwordResetTokenRepository =
                passwordResetTokenRepository;

        this.passwordResetTokenGenerator =
                passwordResetTokenGenerator;

        this.passwordResetProperties =
                passwordResetProperties;

        this.passwordEncoder =
                passwordEncoder;

        this.refreshTokenService =
                refreshTokenService;
    }

    @Override
    @Transactional
    public void requestPasswordReset(
            ForgotPasswordRequest request,
            String clientIp,
            String userAgent
    ) {
        String normalizedEmail =
                request.email()
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        userRepository
                .findByEmailIgnoreCase(
                        normalizedEmail
                )
                .filter(
                        UserEntity::isEnabled
                )
                .ifPresent(user ->
                        createPasswordResetToken(
                                user,
                                clientIp,
                                userAgent
                        )
                );
    }

    @Override
    @Transactional
    public void resetPassword(
            ResetPasswordRequest request
    ) {
        String tokenHash =
                passwordResetTokenGenerator
                        .hashToken(
                                request.token()
                        );

        PasswordResetTokenEntity resetToken =
                passwordResetTokenRepository
                        .findByTokenHash(
                                tokenHash
                        )
                        .orElseThrow(
                                this::invalidTokenException
                        );

        Instant currentTime =
                Instant.now();

        if (
                !resetToken.isActive(
                        currentTime
                )
        ) {
            throw invalidTokenException();
        }

        UserEntity user =
                resetToken.getUser();

        String newPasswordHash =
                passwordEncoder.encode(
                        request.newPassword()
                );

        user.updatePassword(
                newPasswordHash
        );

        resetToken.consume(
                currentTime
        );

        userRepository.save(user);

        passwordResetTokenRepository
                .saveAndFlush(
                        resetToken
                );

        passwordResetTokenRepository
                .revokeAllActiveTokensByUserId(
                        user.getId(),
                        currentTime
                );

        refreshTokenService
                .revokeAllActiveTokensForUser(
                        user.getId()
                );
    }

    private void createPasswordResetToken(
            UserEntity user,
            String clientIp,
            String userAgent
    ) {
        Instant currentTime =
                Instant.now();

        passwordResetTokenRepository
                .revokeAllActiveTokensByUserId(
                        user.getId(),
                        currentTime
                );

        String rawToken =
                passwordResetTokenGenerator
                        .generateToken();

        String tokenHash =
                passwordResetTokenGenerator
                        .hashToken(
                                rawToken
                        );

        Instant expiresAt =
                currentTime.plus(
                        passwordResetProperties
                                .getExpiration()
                );

        PasswordResetTokenEntity resetToken =
                new PasswordResetTokenEntity(
                        user,
                        tokenHash,
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

        passwordResetTokenRepository
                .save(resetToken);

        LOGGER.info(
                "Development password reset link: {}",
                buildResetLink(rawToken)
        );
    }

    private String buildResetLink(
            String rawToken
    ) {
        String resetUrl =
                passwordResetProperties
                        .getResetUrl();

        String separator =
                resetUrl.contains("?")
                        ? "&"
                        : "?";

        return resetUrl
                + separator
                + "token="
                + rawToken;
    }

    private InvalidPasswordResetTokenException
    invalidTokenException() {
        return new InvalidPasswordResetTokenException(
                "Password reset link is invalid, expired or already used."
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
}