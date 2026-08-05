package com.selfb.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshTokenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private UserEntity user;

    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 64,
            columnDefinition = "CHAR(64)"
    )
    private String tokenHash;

    @Column(
            name = "token_family_id",
            nullable = false,
            length = 36,
            columnDefinition = "CHAR(36)"
    )
    private String tokenFamilyId;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(
            name = "replaced_by_token_hash",
            length = 64,
            columnDefinition = "CHAR(64)"
    )
    private String replacedByTokenHash;

    @Column(
            name = "created_by_ip",
            length = 45
    )
    private String createdByIp;

    @Column(
            name = "user_agent",
            length = 255
    )
    private String userAgent;

    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @UpdateTimestamp
    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    protected RefreshTokenEntity() {
    }

    public RefreshTokenEntity(
            UserEntity user,
            String tokenHash,
            String tokenFamilyId,
            Instant expiresAt,
            String createdByIp,
            String userAgent
    ) {
        this.user = user;
        this.tokenHash = tokenHash;
        this.tokenFamilyId = tokenFamilyId;
        this.expiresAt = expiresAt;
        this.createdByIp = createdByIp;
        this.userAgent = userAgent;
    }

    public void revoke(
            Instant revokedAt,
            String replacedByTokenHash
    ) {
        this.revokedAt = revokedAt;
        this.replacedByTokenHash = replacedByTokenHash;
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public boolean isExpired(
            Instant currentTime
    ) {
        return expiresAt.isBefore(currentTime)
                || expiresAt.equals(currentTime);
    }

    public boolean isActive(
            Instant currentTime
    ) {
        return !isRevoked()
                && !isExpired(currentTime);
    }

    public Long getId() {
        return id;
    }

    public UserEntity getUser() {
        return user;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public String getTokenFamilyId() {
        return tokenFamilyId;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public String getReplacedByTokenHash() {
        return replacedByTokenHash;
    }

    public String getCreatedByIp() {
        return createdByIp;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}