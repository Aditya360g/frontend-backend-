package com.selfb.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(
        prefix = "app.security.refresh-token"
)
public class RefreshTokenProperties {

    private Duration expiration =
            Duration.ofDays(30);

    private String cookieName =
            "selfb_refresh_token";

    private String cookiePath =
            "/api/v1/auth";

    private String sameSite =
            "Lax";

    private boolean secureCookie =
            false;

    public Duration getExpiration() {
        return expiration;
    }

    public void setExpiration(
            Duration expiration
    ) {
        this.expiration = expiration;
    }

    public String getCookieName() {
        return cookieName;
    }

    public void setCookieName(
            String cookieName
    ) {
        this.cookieName = cookieName;
    }

    public String getCookiePath() {
        return cookiePath;
    }

    public void setCookiePath(
            String cookiePath
    ) {
        this.cookiePath = cookiePath;
    }

    public String getSameSite() {
        return sameSite;
    }

    public void setSameSite(
            String sameSite
    ) {
        this.sameSite = sameSite;
    }

    public boolean isSecureCookie() {
        return secureCookie;
    }

    public void setSecureCookie(
            boolean secureCookie
    ) {
        this.secureCookie = secureCookie;
    }
}