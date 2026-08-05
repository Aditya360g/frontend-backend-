package com.selfb.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank(message = "Name is required.")
        @Size(
                min = 2,
                max = 80,
                message = "Name must contain between 2 and 80 characters."
        )
        String name,

        @Size(
                max = 20,
                message = "Phone number cannot exceed 20 characters."
        )
        @Pattern(
                regexp = "^$|^[0-9+()\\-\\s]{7,20}$",
                message = "Enter a valid phone number."
        )
        String phone,

        @Size(
                max = 500,
                message = "Bio cannot exceed 500 characters."
        )
        String bio
) {
}