package com.selfb.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(
                max = 190,
                message = "Email cannot exceed 190 characters."
        )
        String email,

        @NotBlank(message = "Password is required.")
        @Size(
                max = 100,
                message = "Password cannot exceed 100 characters."
        )
        String password
) {
}