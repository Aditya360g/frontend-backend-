package com.selfb.backend.exception;

public class InvalidEmailVerificationTokenException
        extends RuntimeException {

    public InvalidEmailVerificationTokenException(
            String message
    ) {
        super(message);
    }
}