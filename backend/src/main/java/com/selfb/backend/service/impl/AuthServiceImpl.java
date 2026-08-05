package com.selfb.backend.service.impl;

import com.selfb.backend.config.properties.EmailVerificationProperties;
import com.selfb.backend.dto.request.LoginRequest;
import com.selfb.backend.dto.request.RegisterRequest;
import com.selfb.backend.dto.response.LoginResponse;
import com.selfb.backend.dto.response.UserResponse;
import com.selfb.backend.entity.UserEntity;
import com.selfb.backend.entity.UserRole;
import com.selfb.backend.exception.ConflictException;
import com.selfb.backend.exception.InvalidCredentialsException;
import com.selfb.backend.repository.UserRepository;
import com.selfb.backend.security.JwtTokenService;
import com.selfb.backend.service.AuthService;
import com.selfb.backend.service.EmailVerificationService;
import com.selfb.backend.service.RefreshTokenService;
import com.selfb.backend.service.model.IssuedEmailVerificationToken;
import com.selfb.backend.service.model.IssuedRefreshToken;
import com.selfb.backend.service.model.LoginResult;
import com.selfb.backend.service.model.RefreshResult;
import com.selfb.backend.service.model.RefreshTokenRotation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthServiceImpl
        implements AuthService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    AuthServiceImpl.class
            );

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager
            authenticationManager;

    private final JwtTokenService jwtTokenService;

    private final RefreshTokenService
            refreshTokenService;

    private final EmailVerificationService
            emailVerificationService;

    private final EmailVerificationProperties
            emailVerificationProperties;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenService jwtTokenService,
            RefreshTokenService refreshTokenService,
            EmailVerificationService emailVerificationService,
            EmailVerificationProperties emailVerificationProperties
    ) {
        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.authenticationManager =
                authenticationManager;

        this.jwtTokenService =
                jwtTokenService;

        this.refreshTokenService =
                refreshTokenService;

        this.emailVerificationService =
                emailVerificationService;

        this.emailVerificationProperties =
                emailVerificationProperties;
    }

    @Override
    @Transactional
    public UserResponse register(
            RegisterRequest request
    ) {
        String normalizedName =
                request.name().trim();

        String normalizedEmail =
                request.email()
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        if (
                userRepository
                        .existsByEmailIgnoreCase(
                                normalizedEmail
                        )
        ) {
            throw new ConflictException(
                    "An account with this email already exists."
            );
        }

        String passwordHash =
                passwordEncoder.encode(
                        request.password()
                );

        UserEntity user =
                new UserEntity(
                        normalizedName,
                        normalizedEmail,
                        passwordHash,
                        UserRole.USER
                );

        UserEntity savedUser;

        try {
            savedUser =
                    userRepository.saveAndFlush(
                            user
                    );
        } catch (
                DataIntegrityViolationException exception
        ) {
            throw new ConflictException(
                    "An account with this email already exists."
            );
        }

        IssuedEmailVerificationToken
                verificationToken =
                emailVerificationService.issueToken(
                        savedUser
                );

        String verificationLink =
                emailVerificationProperties
                        .getFrontendVerificationUrl()
                        + "?token="
                        + verificationToken.rawToken();

        LOGGER.info(
                "Development email verification link for {}: {}",
                savedUser.getEmail(),
                verificationLink
        );

        return toResponse(
                savedUser
        );
    }

    @Override
    @Transactional
    public LoginResult login(
            LoginRequest request,
            String clientIp,
            String userAgent
    ) {
        String normalizedEmail =
                request.email()
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            request.password()
                    )
            );
        } catch (
                AuthenticationException exception
        ) {
            throw new InvalidCredentialsException(
                    "Invalid email or password."
            );
        }

        UserEntity user =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid email or password."
                                )
                        );

        if (!user.isEmailVerified()) {
            throw new InvalidCredentialsException(
                    "Please verify your email address before signing in."
            );
        }

        IssuedRefreshToken refreshToken =
                refreshTokenService.issueToken(
                        user,
                        clientIp,
                        userAgent
                );

        return new LoginResult(
                createLoginResponse(user),
                refreshToken
        );
    }

    @Override
    @Transactional(
            noRollbackFor =
                    InvalidCredentialsException.class
    )
    public RefreshResult refresh(
            String rawRefreshToken,
            String clientIp,
            String userAgent
    ) {
        RefreshTokenRotation rotation =
                refreshTokenService.rotateToken(
                        rawRefreshToken,
                        clientIp,
                        userAgent
                );

        LoginResponse loginResponse =
                createLoginResponse(
                        rotation.user()
                );

        return new RefreshResult(
                loginResponse,
                rotation.refreshToken()
        );
    }

    @Override
    @Transactional
    public void logout(
            String rawRefreshToken
    ) {
        refreshTokenService.revokeToken(
                rawRefreshToken
        );
    }

    private LoginResponse createLoginResponse(
            UserEntity user
    ) {
        String accessToken =
                jwtTokenService.generateAccessToken(
                        user
                );

        return new LoginResponse(
                accessToken,
                "Bearer",
                jwtTokenService
                        .getAccessTokenExpirationSeconds(),
                toResponse(user)
        );
    }

    private UserResponse toResponse(
            UserEntity user
    ) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getPhone(),
                user.getBio(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}