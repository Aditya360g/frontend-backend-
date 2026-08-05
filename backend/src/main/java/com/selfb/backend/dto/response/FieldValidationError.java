package com.selfb.backend.dto.response;

public record FieldValidationError(
        String field,
        String message
) {
}