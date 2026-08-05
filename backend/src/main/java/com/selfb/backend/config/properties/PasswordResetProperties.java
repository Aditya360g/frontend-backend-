package com.selfb.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(
        prefix = "app.security.password-reset"
)
public class PasswordResetProperties {

    private Duration expiration =
            Duration.ofMinutes(15);

    private String resetUrl =
            "http://localhost:5173/reset-password";

    public Duration getExpiration() {
        return expiration;
    }

    public void setExpiration(
            Duration expiration
    ) {
        this.expiration = expiration;
    }

    public String getResetUrl() {
        return resetUrl;
    }

    public void setResetUrl(
            String resetUrl
    ) {
        this.resetUrl = resetUrl;
    }
}