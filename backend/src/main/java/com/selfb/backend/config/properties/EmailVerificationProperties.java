package com.selfb.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(
        prefix = "app.email-verification"
)
public class EmailVerificationProperties {

    private Duration expiration =
            Duration.ofHours(24);

    private String frontendVerificationUrl =
            "http://localhost:5173/verify-email";

    public Duration getExpiration() {
        return expiration;
    }

    public void setExpiration(
            Duration expiration
    ) {
        if (
                expiration == null
                || expiration.isZero()
                || expiration.isNegative()
        ) {
            throw new IllegalArgumentException(
                    "Email verification expiration must be positive."
            );
        }

        this.expiration = expiration;
    }

    public String getFrontendVerificationUrl() {
        return frontendVerificationUrl;
    }

    public void setFrontendVerificationUrl(
            String frontendVerificationUrl
    ) {
        if (
                frontendVerificationUrl == null
                || frontendVerificationUrl.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Frontend verification URL cannot be empty."
            );
        }

        this.frontendVerificationUrl =
                frontendVerificationUrl.trim();
    }
}