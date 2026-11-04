package com.auctiva.backend.identity;

import com.auctiva.backend.common.security.JwtService;
import com.auctiva.backend.identity.dto.AuthResponse;
import com.auctiva.backend.identity.dto.LoginRequest;
import com.auctiva.backend.identity.dto.RegisterRequest;
import com.auctiva.backend.identity.dto.RegistrationResponse;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;

    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager,
                        JwtService jwtService,
                        EmailVerificationService emailVerificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailVerificationService = emailVerificationService;
    }

    @Transactional
    public RegistrationResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                Role.BUYER
        );
        user.setEmailVerified(false);
        user.setTermsAcceptedAt(Instant.now());
        userRepository.saveAndFlush(user);
        emailVerificationService.createAndSend(user);

        return new RegistrationResponse("Check your inbox for a link to verify your email address.");
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User vanished after authentication"));
        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException("Verify your email address before signing in");
        }

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    @Transactional
    public AuthResponse loginWithVerifiedIdentity(String email, String fullName) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
            User newUser = new User(
                    normalizedEmail,
                    passwordEncoder.encode(UUID.randomUUID().toString()),
                    fullName,
                    Role.BUYER
            );
            newUser.setEmailVerified(true);
            newUser.setTermsAcceptedAt(Instant.now());
            return userRepository.save(newUser);
        });
        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
        }
        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    public void verifyEmail(String token) {
        emailVerificationService.verify(token);
    }
}
