package com.selfb.backend.service;

import com.selfb.backend.dto.request.ChangePasswordRequest;
import com.selfb.backend.dto.request.UpdateProfileRequest;
import com.selfb.backend.dto.response.UserResponse;

public interface UserService {

    UserResponse getCurrentUser(
            String email
    );

    UserResponse updateCurrentUser(
            String email,
            UpdateProfileRequest request
    );

    void changePassword(
            String email,
            ChangePasswordRequest request
    );
}