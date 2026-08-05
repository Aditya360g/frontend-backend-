package com.selfb.backend.service;

import com.selfb.backend.dto.request.ForgotPasswordRequest;
import com.selfb.backend.dto.request.ResetPasswordRequest;

public interface PasswordResetService {

    void requestPasswordReset(
            ForgotPasswordRequest request,
            String clientIp,
            String userAgent
    );

    void resetPassword(
            ResetPasswordRequest request
    );
}