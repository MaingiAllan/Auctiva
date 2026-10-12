package com.auctiva.backend.identity;

import com.auctiva.backend.common.security.JwtService;
import com.auctiva.backend.identity.dto.AuthResponse;
import com.auctiva.backend.identity.dto.LoginRequest;
import com.auctiva.backend.identity.dto.RegisterRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager,
                        JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.fullName(),
                Role.BUYER
        );
        userRepository.save(user);

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("User vanished after authentication"));

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }
}
