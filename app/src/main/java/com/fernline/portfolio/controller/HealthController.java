package com.fernline.portfolio.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Actuator already gives us a full health endpoint on the management
 * port (9090) — that's what Nagios and the k8s probes hit. This one
 * lives on the main app port (8080) purely so the browser can fetch
 * it same-origin for the little status pill in the UI; the browser
 * can't fetch cross-port without CORS, and actuator doesn't send
 * CORS headers by default.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        );
    }
}
