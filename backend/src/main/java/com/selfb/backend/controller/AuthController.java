package com.selfb.backend.controller;

import com.selfb.backend.config.properties.EmailVerificationProperties;
import com.selfb.backend.dto.request.ForgotPasswordRequest;
import com.selfb.backend.dto.request.LoginRequest;
import com.selfb.backend.dto.request.RegisterRequest;
import com.selfb.backend.dto.request.ResendEmailVerificationRequest;
import com.selfb.backend.dto.request.ResetPasswordRequest;
import com.selfb.backend.dto.response.ApiResponse;
import com.selfb.backend.dto.response.LoginResponse;
import com.selfb.backend.dto.response.UserResponse;
import com.selfb.backend.exception.InvalidCredentialsException;
import com.selfb.backend.security.cookie.RefreshTokenCookieService;
import com.selfb.backend.service.AuthService;
import com.selfb.backend.service.EmailVerificationService;
import com.selfb.backend.service.PasswordResetService;
import com.selfb.backend.service.model.IssuedEmailVerificationToken;
import com.selfb.backend.service.model.LoginResult;
import com.selfb.backend.service.model.RefreshResult;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    AuthController.class
            );

    private final AuthService authService;

    private final PasswordResetService
            passwordResetService;

    private final EmailVerificationService
            emailVerificationService;

    private final EmailVerificationProperties
            emailVerificationProperties;

    private final RefreshTokenCookieService
            refreshTokenCookieService;

    public AuthController(
            AuthService authService,
            PasswordResetService passwordResetService,
            EmailVerificationService emailVerificationService,
            EmailVerificationProperties emailVerificationProperties,
            RefreshTokenCookieService refreshTokenCookieService
    ) {
        this.authService =
                authService;

        this.passwordResetService =
                passwordResetService;

        this.emailVerificationService =
                emailVerificationService;

        this.emailVerificationProperties =
                emailVerificationProperties;

        this.refreshTokenCookieService =
                refreshTokenCookieService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>>
    register(
            @Valid
            @RequestBody
            RegisterRequest request,

            HttpServletRequest httpRequest
    ) {
        UserResponse registeredUser =
                authService.register(request);

        ApiResponse<UserResponse> response =
                ApiResponse.success(
                        "Registration successful.",
                        registeredUser,
                        httpRequest.getRequestURI()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>>
    login(
            @Valid
            @RequestBody
            LoginRequest request,

            HttpServletRequest httpRequest
    ) {
        String clientIp =
                httpRequest.getRemoteAddr();

        String userAgent =
                httpRequest.getHeader(
                        HttpHeaders.USER_AGENT
                );

        LoginResult loginResult =
                authService.login(
                        request,
                        clientIp,
                        userAgent
                );

        ResponseCookie refreshTokenCookie =
                refreshTokenCookieService
                        .createCookie(
                                loginResult
                                        .refreshToken()
                                        .rawToken()
                        );

        ApiResponse<LoginResponse> response =
                ApiResponse.success(
                        "Login successful.",
                        loginResult.loginResponse(),
                        httpRequest.getRequestURI()
                );

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookie.toString()
                )
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>>
    refresh(
            HttpServletRequest httpRequest
    ) {
        String rawRefreshToken =
                refreshTokenCookieService
                        .readToken(httpRequest)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Refresh token is missing. Please sign in again."
                                )
                        );

        String clientIp =
                httpRequest.getRemoteAddr();

        String userAgent =
                httpRequest.getHeader(
                        HttpHeaders.USER_AGENT
                );

        RefreshResult refreshResult =
                authService.refresh(
                        rawRefreshToken,
                        clientIp,
                        userAgent
                );

        ResponseCookie rotatedCookie =
                refreshTokenCookieService
                        .createCookie(
                                refreshResult
                                        .refreshToken()
                                        .rawToken()
                        );

        ApiResponse<LoginResponse> response =
                ApiResponse.success(
                        "Access token refreshed successfully.",
                        refreshResult.loginResponse(),
                        httpRequest.getRequestURI()
                );

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        rotatedCookie.toString()
                )
                .body(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>>
    forgotPassword(
            @Valid
            @RequestBody
            ForgotPasswordRequest request,

            HttpServletRequest httpRequest
    ) {
        String clientIp =
                httpRequest.getRemoteAddr();

        String userAgent =
                httpRequest.getHeader(
                        HttpHeaders.USER_AGENT
                );

        passwordResetService
                .requestPasswordReset(
                        request,
                        clientIp,
                        userAgent
                );

        ApiResponse<Void> response =
                ApiResponse.success(
                        "If an account exists for this email, a password reset link has been generated.",
                        null,
                        httpRequest.getRequestURI()
                );

        return ResponseEntity
                .ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>>
    resetPassword(
            @Valid
            @RequestBody
            ResetPasswordRequest request,

            HttpServletRequest httpRequest
    ) {
        passwordResetService
                .resetPassword(request);

        ApiResponse<Void> response =
                ApiResponse.success(
                        "Password reset successful. Please sign in again.",
                        null,
                        httpRequest.getRequestURI()
                );

        return ResponseEntity
                .ok(response);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>>
    verifyEmail(
            @RequestParam(name = "token")
            String token,

            HttpServletRequest httpRequest
    ) {
        emailVerificationService
                .verifyEmail(token);

        ApiResponse<Void> response =
                ApiResponse.success(
                        "Email address verified successfully.",
                        null,
                        httpRequest.getRequestURI()
                );

        return ResponseEntity
                .ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>>
    resendVerification(
            @Valid
            @RequestBody
            ResendEmailVerificationRequest request,

            HttpServletRequest httpRequest
    ) {
        IssuedEmailVerificationToken issuedToken =
                emailVerificationService
                        .resendVerificationToken(
                                request.email()
                        );

        String verificationLink =
                emailVerificationProperties
                        .getFrontendVerificationUrl()
                        + "?token="
                        + issuedToken.rawToken();

        LOGGER.info(
                "Development email verification link for {}: {}",
                request.email(),
                verificationLink
        );

        ApiResponse<Void> response =
                ApiResponse.success(
                        "A new email verification link has been generated.",
                        null,
                        httpRequest.getRequestURI()
                );

        return ResponseEntity
                .ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>>
    logout(
            HttpServletRequest httpRequest
    ) {
        refreshTokenCookieService
                .readToken(httpRequest)
                .ifPresent(authService::logout);

        ResponseCookie deletedCookie =
                refreshTokenCookieService
                        .deleteCookie();

        ApiResponse<Void> response =
                ApiResponse.success(
                        "Logout successful.",
                        null,
                        httpRequest.getRequestURI()
                );

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        deletedCookie.toString()
                )
                .body(response);
    }
}