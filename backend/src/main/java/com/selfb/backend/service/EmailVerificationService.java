package com.selfb.backend.service;

import com.selfb.backend.entity.UserEntity;
import com.selfb.backend.service.model.IssuedEmailVerificationToken;

public interface EmailVerificationService {

    IssuedEmailVerificationToken issueToken(
            UserEntity user
    );

    void verifyEmail(
            String rawToken
    );

    IssuedEmailVerificationToken resendVerificationToken(
            String email
    );
}