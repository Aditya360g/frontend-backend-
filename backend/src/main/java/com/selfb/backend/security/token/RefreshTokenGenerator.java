package com.selfb.backend.security.token;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Component
public class RefreshTokenGenerator {

    private static final int TOKEN_SIZE_BYTES = 64;

    private final SecureRandom secureRandom;

    public RefreshTokenGenerator() {
        this.secureRandom = new SecureRandom();
    }

    public String generateToken() {
        byte[] randomBytes =
                new byte[TOKEN_SIZE_BYTES];

        secureRandom.nextBytes(randomBytes);

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    public String hashToken(
            String rawToken
    ) {
        if (
                rawToken == null
                || rawToken.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Refresh token cannot be empty."
            );
        }

        try {
            MessageDigest messageDigest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] tokenHash =
                    messageDigest.digest(
                            rawToken.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat
                    .of()
                    .formatHex(tokenHash);
        }
        catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable.",
                    exception
            );
        }
    }
}