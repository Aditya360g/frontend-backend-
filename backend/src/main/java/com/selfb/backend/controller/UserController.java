package com.selfb.backend.controller;

import com.selfb.backend.dto.request.ChangePasswordRequest;
import com.selfb.backend.dto.request.UpdateProfileRequest;
import com.selfb.backend.dto.response.ApiResponse;
import com.selfb.backend.dto.response.SessionResponse;
import com.selfb.backend.dto.response.UserResponse;
import com.selfb.backend.security.cookie.RefreshTokenCookieService;
import com.selfb.backend.service.RefreshTokenService;
import com.selfb.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    private final RefreshTokenService
            refreshTokenService;

    private final RefreshTokenCookieService
            refreshTokenCookieService;

    public UserController(
            UserService userService,
            RefreshTokenService refreshTokenService,
            RefreshTokenCookieService refreshTokenCookieService
    ) {
        this.userService =
                userService;

        this.refreshTokenService =
                refreshTokenService;

        this.refreshTokenCookieService =
                refreshTokenCookieService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>>
    getCurrentUser(
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        UserResponse currentUser =
                userService.getCurrentUser(
                        jwt.getSubject()
                );

        ApiResponse<UserResponse> response =
                ApiResponse.success(
                        "Current user fetched successfully.",
                        currentUser,
                        request.getRequestURI()
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>>
    updateCurrentUser(
            @AuthenticationPrincipal Jwt jwt,

            @Valid
            @RequestBody
            UpdateProfileRequest updateRequest,

            HttpServletRequest request
    ) {
        UserResponse updatedUser =
                userService.updateCurrentUser(
                        jwt.getSubject(),
                        updateRequest
                );

        ApiResponse<UserResponse> response =
                ApiResponse.success(
                        "Profile updated successfully.",
                        updatedUser,
                        request.getRequestURI()
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>>
    changePassword(
            @AuthenticationPrincipal Jwt jwt,

            @Valid
            @RequestBody
            ChangePasswordRequest changePasswordRequest,

            HttpServletRequest request
    ) {
        userService.changePassword(
                jwt.getSubject(),
                changePasswordRequest
        );

        ApiResponse<Void> response =
                ApiResponse.success(
                        "Password changed successfully. Please sign in again.",
                        null,
                        request.getRequestURI()
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/sessions")
    public ResponseEntity<
            ApiResponse<List<SessionResponse>>
            >
    getActiveSessions(
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        UserResponse currentUser =
                userService.getCurrentUser(
                        jwt.getSubject()
                );

        String currentRefreshToken =
                refreshTokenCookieService
                        .readToken(request)
                        .orElse(null);

        List<SessionResponse> sessions =
                refreshTokenService
                        .getActiveSessions(
                                currentUser.id(),
                                currentRefreshToken
                        );

        ApiResponse<List<SessionResponse>> response =
                ApiResponse.success(
                        "Active sessions fetched successfully.",
                        sessions,
                        request.getRequestURI()
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me/sessions/others")
    public ResponseEntity<ApiResponse<Void>>
    revokeOtherSessions(
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        UserResponse currentUser =
                userService.getCurrentUser(
                        jwt.getSubject()
                );

        String currentRefreshToken =
                refreshTokenCookieService
                        .readToken(request)
                        .orElse(null);

        refreshTokenService
                .revokeOtherSessions(
                        currentUser.id(),
                        currentRefreshToken
                );

        ApiResponse<Void> response =
                ApiResponse.success(
                        "All other sessions logged out successfully.",
                        null,
                        request.getRequestURI()
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>>
    revokeSession(
            @AuthenticationPrincipal Jwt jwt,

            @PathVariable
            Long sessionId,

            HttpServletRequest request
    ) {
        UserResponse currentUser =
                userService.getCurrentUser(
                        jwt.getSubject()
                );

        refreshTokenService.revokeSession(
                currentUser.id(),
                sessionId
        );

        ApiResponse<Void> response =
                ApiResponse.success(
                        "Session logged out successfully.",
                        null,
                        request.getRequestURI()
                );

        return ResponseEntity.ok(response);
    }
}