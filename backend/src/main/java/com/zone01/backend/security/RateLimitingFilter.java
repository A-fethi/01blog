package com.zone01.backend.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bandwidth;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * RateLimitingFilter - Limits the number of requests a user can make.
 * 
 * Current configuration: 5 requests per second per IP address.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        // 5 requests per second
        Bandwidth limit = Bandwidth.builder()
        .capacity(5)
        .refillGreedy(5, Duration.ofSeconds(1))
        .build();
        
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Get client IP address
        String clientIp = request.getRemoteAddr();

        // Get or create bucket for this IP
        Bucket bucket = buckets.computeIfAbsent(clientIp, k -> createNewBucket());

        // Try to consume a token
        if (bucket.tryConsume(1)) {
            // Token consumed, continue with the request
            filterChain.doFilter(request, response);
        } else {
            // No tokens left, return 429 Too Many Requests
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", "1"); // Suggest retry after 1 second
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\": \"Too many requests\", \"message\": \"You have exceeded the rate limit of 2 requests per second.\"}");
        }
    }
}
