package com.selfb.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String
            SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI selfBOpenApi() {
        SecurityScheme securityScheme =
                new SecurityScheme()
                        .name(
                                SECURITY_SCHEME_NAME
                        )
                        .type(
                                SecurityScheme.Type.HTTP
                        )
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description(
                                "Enter only the JWT access token."
                        );

        SecurityRequirement securityRequirement =
                new SecurityRequirement()
                        .addList(
                                SECURITY_SCHEME_NAME
                        );

        Components components =
                new Components()
                        .addSecuritySchemes(
                                SECURITY_SCHEME_NAME,
                                securityScheme
                        );

        Info information =
                new Info()
                        .title(
                                "SelfB Authentication API"
                        )
                        .version("1.0.0")
                        .description(
                                "REST API documentation for the SelfB authentication learning project."
                        )
                        .license(
                                new License()
                                        .name(
                                                "Learning Project"
                                        )
                        );

        return new OpenAPI()
                .info(information)
                .components(components)
                .addSecurityItem(
                        securityRequirement
                );
    }
}