package com.auctiva.backend.identity.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank
                @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
                @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                        message = "Password must include lowercase, uppercase, and a number")
                String password,
        @NotBlank @Size(max = 255) String fullName,
        @NotBlank String turnstileToken,
        @AssertTrue(message = "Accept the Terms and Privacy Policy to continue")
                boolean agreedToTerms
) {
}
