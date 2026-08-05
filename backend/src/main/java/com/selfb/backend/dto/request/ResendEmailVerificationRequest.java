package com.selfb.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResendEmailVerificationRequest(

        @NotBlank(
                message = "Email address is required."
        )
        @Email(
                message = "Enter a valid email address."
        )
        @Size(
                max = 190,
                message = "Email address cannot exceed 190 characters."
        )
        String email

) {
}