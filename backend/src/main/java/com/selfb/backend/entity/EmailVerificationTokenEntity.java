package com.selfb.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(
        name = "email_verification_tokens",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_email_verification_token_hash",
                        columnNames = "token_hash"
                )
        },
        indexes = {
                @Index(
                        name = "idx_email_verification_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_email_verification_expires_at",
                        columnList = "expires_at"
                )
        }
)
public class EmailVerificationTokenEntity {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
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
            length = 64
    )
    private String tokenHash;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private Instant expiresAt;

    @Column(
            name = "used_at"
    )
    private Instant usedAt;

    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    protected EmailVerificationTokenEntity() {
    }

    public EmailVerificationTokenEntity(
            UserEntity user,
            String tokenHash,
            Instant expiresAt
    ) {
        this.user = Objects.requireNonNull(
                user,
                "User cannot be null."
        );

        if (
                tokenHash == null
                || tokenHash.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Token hash cannot be empty."
            );
        }

        this.tokenHash = tokenHash;

        this.expiresAt = Objects.requireNonNull(
                expiresAt,
                "Expiration time cannot be null."
        );
    }

    public void markAsUsed(
            Instant usedAt
    ) {
        if (this.usedAt != null) {
            return;
        }

        this.usedAt = Objects.requireNonNull(
                usedAt,
                "Used time cannot be null."
        );
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    public boolean isExpired(
            Instant currentTime
    ) {
        return !expiresAt.isAfter(currentTime);
    }

    public boolean isValid(
            Instant currentTime
    ) {
        return !isUsed()
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

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}