package com.selfb.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Name is required.")
        @Size(
                min = 2,
                max = 80,
                message = "Name must contain between 2 and 80 characters."
        )
        String name,

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(
                max = 190,
                message = "Email cannot exceed 190 characters."
        )
        String email,

        @NotBlank(message = "Password is required.")
        @Size(
                min = 8,
                max = 100,
                message = "Password must contain between 8 and 100 characters."
        )
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must contain uppercase, lowercase and number."
        )
        String password
) {
}