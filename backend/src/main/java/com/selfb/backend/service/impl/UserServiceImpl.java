package com.selfb.backend.service.impl;

import com.selfb.backend.dto.request.ChangePasswordRequest;
import com.selfb.backend.dto.request.UpdateProfileRequest;
import com.selfb.backend.dto.response.UserResponse;
import com.selfb.backend.entity.UserEntity;
import com.selfb.backend.exception.ConflictException;
import com.selfb.backend.exception.InvalidCredentialsException;
import com.selfb.backend.exception.ResourceNotFoundException;
import com.selfb.backend.repository.UserRepository;
import com.selfb.backend.service.RefreshTokenService;
import com.selfb.backend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenService refreshTokenService;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(
            String email
    ) {
        UserEntity user =
                findUserByEmail(email);

        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(
            String email,
            UpdateProfileRequest request
    ) {
        UserEntity user =
                findUserByEmail(email);

        String normalizedName =
                request.name().trim();

        String normalizedPhone =
                normalizeOptionalValue(
                        request.phone()
                );

        String normalizedBio =
                normalizeOptionalValue(
                        request.bio()
                );

        user.updateProfile(
                normalizedName,
                normalizedPhone,
                normalizedBio
        );

        UserEntity updatedUser =
                userRepository.saveAndFlush(user);

        return toResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(
            String email,
            ChangePasswordRequest request
    ) {
        UserEntity user =
                findUserByEmail(email);

        boolean currentPasswordMatches =
                passwordEncoder.matches(
                        request.currentPassword(),
                        user.getPasswordHash()
                );

        if (!currentPasswordMatches) {
            throw new InvalidCredentialsException(
                    "Current password is incorrect."
            );
        }

        boolean sameAsCurrentPassword =
                passwordEncoder.matches(
                        request.newPassword(),
                        user.getPasswordHash()
                );

        if (sameAsCurrentPassword) {
            throw new ConflictException(
                    "New password must be different from the current password."
            );
        }

        String newPasswordHash =
                passwordEncoder.encode(
                        request.newPassword()
                );

        user.updatePassword(
                newPasswordHash
        );

        userRepository.saveAndFlush(user);

        refreshTokenService
                .revokeAllActiveTokensForUser(
                        user.getId()
                );
    }

    private UserEntity findUserByEmail(
            String email
    ) {
        String normalizedEmail =
                email
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        return userRepository
                .findByEmailIgnoreCase(
                        normalizedEmail
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user was not found."
                        )
                );
    }

    private String normalizeOptionalValue(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String normalizedValue =
                value.trim();

        if (normalizedValue.isEmpty()) {
            return null;
        }

        return normalizedValue;
    }

    private UserResponse toResponse(
            UserEntity user
    ) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getPhone(),
                user.getBio(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}