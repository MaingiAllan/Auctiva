package com.auctiva.backend.identity.dto;

public record AuthResponse(String token, String email, String role) {
}
