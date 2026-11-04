package com.auctiva.backend.common.security;

import com.auctiva.backend.identity.AuthService;
import com.auctiva.backend.identity.dto.AuthResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuthLoginSuccessHandler implements AuthenticationSuccessHandler {

    private final ObjectProvider<AuthService> authServices;
    private final String frontendUrl;

    public OAuthLoginSuccessHandler(
            ObjectProvider<AuthService> authServices,
            @Value("${auctiva.frontend-url}") String frontendUrl) {
        this.authServices = authServices;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        Object termsAccepted = request.getSession(false) == null
                ? null
                : request.getSession(false).getAttribute("oauthTermsAccepted");
        if (!Boolean.TRUE.equals(termsAccepted)) {
            response.sendRedirect(frontendUrl + "/login?oauthError=terms_required");
            return;
        }
        request.getSession(false).removeAttribute("oauthTermsAccepted");

        OAuth2AuthenticationToken oauth = (OAuth2AuthenticationToken) authentication;
        OAuth2User principal = oauth.getPrincipal();
        String email = principal.getAttribute("email");
        Object verifiedClaim = principal.getAttribute("email_verified");
        boolean verified = Boolean.TRUE.equals(verifiedClaim) || "true".equalsIgnoreCase(String.valueOf(verifiedClaim));
        if (email == null || !verified) {
            response.sendRedirect(frontendUrl + "/login?oauthError=email_not_verified");
            return;
        }

        String name = principal.getAttribute("name");
        AuthResponse auth = authServices.getObject().loginWithVerifiedIdentity(email, name == null ? "" : name);
        String fragment = "access_token=" + encode(auth.token())
                + "&email=" + encode(auth.email())
                + "&role=" + encode(auth.role());
        response.sendRedirect(frontendUrl + "/auth/callback#" + fragment);
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
