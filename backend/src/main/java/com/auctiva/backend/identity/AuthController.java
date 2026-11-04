package com.auctiva.backend.identity;

import com.auctiva.backend.identity.dto.AuthResponse;
import com.auctiva.backend.identity.dto.LoginRequest;
import com.auctiva.backend.identity.dto.RegisterRequest;
import com.auctiva.backend.identity.dto.RegistrationResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final TurnstileVerifier turnstileVerifier;

    public AuthController(AuthService authService, TurnstileVerifier turnstileVerifier) {
        this.authService = authService;
        this.turnstileVerifier = turnstileVerifier;
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest) {
        turnstileVerifier.verify(request.turnstileToken(), servletRequest.getRemoteAddr());
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<RegistrationResponse> verifyEmail(@RequestBody VerificationRequest request) {
        authService.verifyEmail(request.token());
        return ResponseEntity.ok(new RegistrationResponse("Your email address is verified. You can now sign in."));
    }

    public record VerificationRequest(String token) {
    }
}
