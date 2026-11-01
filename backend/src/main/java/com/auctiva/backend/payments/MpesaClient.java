package com.auctiva.backend.payments;

import com.fasterxml.jackson.databind.JsonNode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Talks to Safaricom Daraja (M-Pesa Express / STK Push). Runs on the server so the consumer
 * secret and passkey never reach a browser or phone.
 */
@Component
public class MpesaClient {

    public record StkResponse(String merchantRequestId, String checkoutRequestId) {
    }

    private final RestClient http;
    private final String baseUrl, consumerKey, consumerSecret, shortcode, passkey, callbackBaseUrl, callbackToken;
    private String token;
    private Instant tokenExpiry = Instant.EPOCH;

    public MpesaClient(@Value("${auctiva.mpesa.base-url}") String baseUrl,
                       @Value("${auctiva.mpesa.consumer-key:}") String consumerKey,
                       @Value("${auctiva.mpesa.consumer-secret:}") String consumerSecret,
                       @Value("${auctiva.mpesa.shortcode}") String shortcode,
                       @Value("${auctiva.mpesa.passkey:}") String passkey,
                       @Value("${auctiva.mpesa.callback-base-url:}") String callbackBaseUrl,
                       @Value("${auctiva.mpesa.callback-token:}") String callbackToken) {
        this.baseUrl = baseUrl;
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this.shortcode = shortcode;
        this.passkey = passkey;
        this.callbackBaseUrl = callbackBaseUrl;
        this.callbackToken = callbackToken;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(15000);
        this.http = RestClient.builder().requestFactory(factory).build();
    }

    private synchronized String accessToken() {
        if (token != null && Instant.now().isBefore(tokenExpiry)) {
            return token;
        }
        JsonNode res = http.get()
                .uri(baseUrl + "/oauth/v1/generate?grant_type=client_credentials")
                .headers(h -> h.setBasicAuth(consumerKey, consumerSecret))
                .retrieve()
                .body(JsonNode.class);
        token = res.path("access_token").asText();
        tokenExpiry = Instant.now().plusSeconds(Math.max(60, res.path("expires_in").asLong(3599) - 60));
        return token;
    }

    public StkResponse stkPush(String phone, long amount, UUID paymentId) {
        if (consumerKey.isBlank() || consumerSecret.isBlank() || passkey.isBlank()
                || callbackBaseUrl.isBlank() || callbackToken.isBlank()) {
            throw new MpesaException("M-Pesa is not configured");
        }
        try {
            String timestamp = LocalDateTime.now(ZoneId.of("Africa/Nairobi")).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String password = Base64.getEncoder().encodeToString((shortcode + passkey + timestamp).getBytes(StandardCharsets.UTF_8));
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("BusinessShortCode", shortcode);
            body.put("Password", password);
            body.put("Timestamp", timestamp);
            body.put("TransactionType", "CustomerPayBillOnline");
            body.put("Amount", amount);
            body.put("PartyA", phone);
            body.put("PartyB", shortcode);
            body.put("PhoneNumber", phone);
            body.put("CallBackURL", callbackBaseUrl + "/api/payments/mpesa/callback/" + callbackToken);
            body.put("AccountReference", paymentId.toString().substring(0, 8));
            body.put("TransactionDesc", "Auctiva");
            JsonNode res = http.post()
                    .uri(baseUrl + "/mpesa/stkpush/v1/processrequest")
                    .headers(h -> h.setBearerAuth(accessToken()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            if (res == null || !"0".equals(res.path("ResponseCode").asText())) {
                throw new MpesaException("M-Pesa rejected the request");
            }
            return new StkResponse(res.path("MerchantRequestID").asText(), res.path("CheckoutRequestID").asText());
        } catch (RestClientException ex) {
            throw new MpesaException("Could not reach M-Pesa");
        }
    }
}
