package com.selfb.backend.repository;

import com.selfb.backend.entity.PasswordResetTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetTokenEntity, Long> {

    Optional<PasswordResetTokenEntity> findByTokenHash(
            String tokenHash
    );

    @Modifying(
            flushAutomatically = true,
            clearAutomatically = true
    )
    @Query("""
            UPDATE PasswordResetTokenEntity token
            SET token.revokedAt = :revokedAt
            WHERE token.user.id = :userId
              AND token.consumedAt IS NULL
              AND token.revokedAt IS NULL
            """)
    int revokeAllActiveTokensByUserId(
            @Param("userId") Long userId,
            @Param("revokedAt") Instant revokedAt
    );
}