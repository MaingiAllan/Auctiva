package com.auctiva.backend.common.config;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Placeholder endpoint confirming the app boots and can reach the outside world.
 * Real modules will add their own controllers under their own packages.
 */
@RestController
public class HealthController {

    @GetMapping("/api/status")
    public Map<String, String> status() {
        return Map.of(
                "service", "auctiva-backend",
                "status", "ok"
        );
    }
}
