package com.selfb.backend.service.impl;

import com.selfb.backend.config.properties.EmailVerificationProperties;
import com.selfb.backend.entity.EmailVerificationTokenEntity;
import com.selfb.backend.entity.UserEntity;
import com.selfb.backend.exception.InvalidEmailVerificationTokenException;
import com.selfb.backend.exception.ResourceNotFoundException;
import com.selfb.backend.repository.EmailVerificationTokenRepository;
import com.selfb.backend.repository.UserRepository;
import com.selfb.backend.security.token.EmailVerificationTokenGenerator;
import com.selfb.backend.service.EmailVerificationService;
import com.selfb.backend.service.model.IssuedEmailVerificationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class EmailVerificationServiceImpl
        implements EmailVerificationService {

    private static final int
            MAX_TOKEN_GENERATION_ATTEMPTS = 5;

    private final EmailVerificationTokenRepository
            emailVerificationTokenRepository;

    private final UserRepository
            userRepository;

    private final EmailVerificationTokenGenerator
            emailVerificationTokenGenerator;

    private final EmailVerificationProperties
            emailVerificationProperties;

    public EmailVerificationServiceImpl(
            EmailVerificationTokenRepository
                    emailVerificationTokenRepository,
            UserRepository userRepository,
            EmailVerificationTokenGenerator
                    emailVerificationTokenGenerator,
            EmailVerificationProperties
                    emailVerificationProperties
    ) {
        this.emailVerificationTokenRepository =
                emailVerificationTokenRepository;

        this.userRepository =
                userRepository;

        this.emailVerificationTokenGenerator =
                emailVerificationTokenGenerator;

        this.emailVerificationProperties =
                emailVerificationProperties;
    }

    @Override
    @Transactional
    public IssuedEmailVerificationToken issueToken(
            UserEntity user
    ) {
        Objects.requireNonNull(
                user,
                "User cannot be null."
        );

        if (user.getId() == null) {
            throw new IllegalArgumentException(
                    "User must be saved before issuing a verification token."
            );
        }

        if (user.isEmailVerified()) {
            throw new InvalidEmailVerificationTokenException(
                    "Email address is already verified."
            );
        }

        Instant currentTime =
                Instant.now();

        invalidatePreviousTokens(
                user.getId(),
                currentTime
        );

        GeneratedToken generatedToken =
                generateUniqueToken();

        Instant expiresAt =
                currentTime.plus(
                        emailVerificationProperties
                                .getExpiration()
                );

        EmailVerificationTokenEntity verificationToken =
                new EmailVerificationTokenEntity(
                        user,
                        generatedToken.tokenHash(),
                        expiresAt
                );

        emailVerificationTokenRepository.save(
                verificationToken
        );

        return new IssuedEmailVerificationToken(
                generatedToken.rawToken(),
                expiresAt
        );
    }

    @Override
    @Transactional
    public void verifyEmail(
            String rawToken
    ) {
        if (
                rawToken == null
                || rawToken.isBlank()
        ) {
            throw new InvalidEmailVerificationTokenException(
                    "Email verification token is required."
            );
        }

        String tokenHash =
                emailVerificationTokenGenerator.hashToken(
                        rawToken.trim()
                );

        EmailVerificationTokenEntity verificationToken =
                emailVerificationTokenRepository
                        .findByTokenHash(tokenHash)
                        .orElseThrow(() ->
                                new InvalidEmailVerificationTokenException(
                                        "Email verification token is invalid."
                                )
                        );

        Instant currentTime =
                Instant.now();

        if (verificationToken.isUsed()) {
            throw new InvalidEmailVerificationTokenException(
                    "Email verification token has already been used."
            );
        }

        if (verificationToken.isExpired(currentTime)) {
            throw new InvalidEmailVerificationTokenException(
                    "Email verification token has expired."
            );
        }

        UserEntity user =
                verificationToken.getUser();

        if (!user.isEmailVerified()) {
            user.verifyEmail();

            userRepository.save(
                    user
            );
        }

        verificationToken.markAsUsed(
                currentTime
        );

        emailVerificationTokenRepository.save(
                verificationToken
        );
    }

    @Override
    @Transactional
    public IssuedEmailVerificationToken resendVerificationToken(
            String email
    ) {
        String normalizedEmail =
                normalizeEmail(email);

        UserEntity user =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User account was not found."
                                )
                        );

        if (user.isEmailVerified()) {
            throw new InvalidEmailVerificationTokenException(
                    "Email address is already verified."
            );
        }

        return issueToken(
                user
        );
    }

    private void invalidatePreviousTokens(
            Long userId,
            Instant invalidatedAt
    ) {
        List<EmailVerificationTokenEntity> activeTokens =
                emailVerificationTokenRepository
                        .findAllByUser_IdAndUsedAtIsNull(
                                userId
                        );

        for (
                EmailVerificationTokenEntity token
                : activeTokens
        ) {
            if (!token.isUsed()) {
                token.markAsUsed(
                        invalidatedAt
                );
            }
        }

        emailVerificationTokenRepository.saveAll(
                activeTokens
        );
    }

    private GeneratedToken generateUniqueToken() {
        for (
                int attempt = 1;
                attempt <= MAX_TOKEN_GENERATION_ATTEMPTS;
                attempt++
        ) {
            String rawToken =
                    emailVerificationTokenGenerator
                            .generateToken();

            String tokenHash =
                    emailVerificationTokenGenerator
                            .hashToken(rawToken);

            boolean alreadyExists =
                    emailVerificationTokenRepository
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
                "Unable to generate a unique email verification token."
        );
    }

    private String normalizeEmail(
            String email
    ) {
        if (
                email == null
                || email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Email address is required."
            );
        }

        return email.trim();
    }

    private record GeneratedToken(
            String rawToken,
            String tokenHash
    ) {
    }
}