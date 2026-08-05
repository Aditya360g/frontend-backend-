package com.selfb.backend.repository;

import com.selfb.backend.entity.EmailVerificationTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface EmailVerificationTokenRepository
        extends JpaRepository<
                EmailVerificationTokenEntity,
                Long
        > {

    Optional<EmailVerificationTokenEntity>
    findByTokenHash(
            String tokenHash
    );

    List<EmailVerificationTokenEntity>
    findAllByUser_IdAndUsedAtIsNull(
            Long userId
    );

    List<EmailVerificationTokenEntity>
    findAllByExpiresAtBefore(
            Instant currentTime
    );

    boolean existsByTokenHash(
            String tokenHash
    );
}