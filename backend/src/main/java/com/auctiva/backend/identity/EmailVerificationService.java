package com.auctiva.backend.identity;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EmailVerificationService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private final EmailVerificationTokenRepository tokenRepository;
    private final ObjectProvider<JavaMailSender> mailSenders;
    private final String mailHost;
    private final String fromAddress;
    private final String frontendUrl;

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            ObjectProvider<JavaMailSender> mailSenders,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${auctiva.mail.from:}") String fromAddress,
            @Value("${auctiva.frontend-url}") String frontendUrl) {
        this.tokenRepository = tokenRepository;
        this.mailSenders = mailSenders;
        this.mailHost = mailHost;
        this.fromAddress = fromAddress;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public void createAndSend(User user) {
        JavaMailSender mailSender = mailSenders.getIfAvailable();
        if (mailHost.isBlank() || mailSender == null || fromAddress.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Email verification is not configured. Contact support.");
        }

        byte[] random = new byte[32];
        RANDOM.nextBytes(random);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        tokenRepository.save(new EmailVerificationToken(hash(rawToken), user, Instant.now().plus(24, ChronoUnit.HOURS)));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("Verify your Auctiva email address");
        message.setText("Confirm your email address within 24 hours:\n\n"
                + frontendUrl + "/verify-email?token=" + rawToken
                + "\n\nIf you did not create an Auctiva account, you can ignore this message.");
        mailSender.send(message);
    }

    @Transactional
    public void verify(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link is invalid or expired.");
        }
        EmailVerificationToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Verification link is invalid or expired."));
        if (!token.getExpiresAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link is invalid or expired.");
        }
        token.getUser().setEmailVerified(true);
        tokenRepository.delete(token);
    }

    private static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }
}
