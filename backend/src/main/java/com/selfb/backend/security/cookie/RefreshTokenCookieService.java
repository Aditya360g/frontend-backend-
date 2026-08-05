package com.selfb.backend.security.cookie;

import com.selfb.backend.config.properties.RefreshTokenProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Component
public class RefreshTokenCookieService {

    private final RefreshTokenProperties
            refreshTokenProperties;

    public RefreshTokenCookieService(
            RefreshTokenProperties refreshTokenProperties
    ) {
        this.refreshTokenProperties =
                refreshTokenProperties;
    }

    public ResponseCookie createCookie(
            String rawRefreshToken
    ) {
        if (
                rawRefreshToken == null
                || rawRefreshToken.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Refresh token cannot be empty."
            );
        }

        return ResponseCookie
                .from(
                        refreshTokenProperties
                                .getCookieName(),
                        rawRefreshToken
                )
                .httpOnly(true)
                .secure(
                        refreshTokenProperties
                                .isSecureCookie()
                )
                .sameSite(
                        refreshTokenProperties
                                .getSameSite()
                )
                .path(
                        refreshTokenProperties
                                .getCookiePath()
                )
                .maxAge(
                        refreshTokenProperties
                                .getExpiration()
                )
                .build();
    }

    public Optional<String> readToken(
            HttpServletRequest request
    ) {
        Cookie[] cookies =
                request.getCookies();

        if (
                cookies == null
                || cookies.length == 0
        ) {
            return Optional.empty();
        }

        return Arrays
                .stream(cookies)
                .filter(cookie ->
                        refreshTokenProperties
                                .getCookieName()
                                .equals(
                                        cookie.getName()
                                )
                )
                .map(Cookie::getValue)
                .filter(value ->
                        value != null
                        && !value.isBlank()
                )
                .findFirst();
    }

    public ResponseCookie deleteCookie() {
        return ResponseCookie
                .from(
                        refreshTokenProperties
                                .getCookieName(),
                        ""
                )
                .httpOnly(true)
                .secure(
                        refreshTokenProperties
                                .isSecureCookie()
                )
                .sameSite(
                        refreshTokenProperties
                                .getSameSite()
                )
                .path(
                        refreshTokenProperties
                                .getCookiePath()
                )
                .maxAge(Duration.ZERO)
                .build();
    }
}