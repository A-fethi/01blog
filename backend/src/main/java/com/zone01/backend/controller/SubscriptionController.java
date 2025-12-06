package com.zone01.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.SubscriptionDTO;
import com.zone01.backend.entity.Subscription;
import com.zone01.backend.entity.User;
import com.zone01.backend.security.AppUserDetails;
import com.zone01.backend.service.SubscriptionService;
import com.zone01.backend.service.UserService;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;

    public SubscriptionController(SubscriptionService subscriptionService, UserService userService) {
        this.subscriptionService = subscriptionService;
        this.userService = userService;
    }

    @PostMapping("/{targetId}")
    public ResponseEntity<SubscriptionDTO> subscribe(
            @PathVariable Long targetId,
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Subscription subscription = subscriptionService.subscribe(auth.getUser(), targetId);
        return ResponseEntity.status(HttpStatus.CREATED).body(new SubscriptionDTO(subscription));
    }

    @DeleteMapping("/{targetId}")
    public ResponseEntity<Map<String, String>> unsubscribe(
            @PathVariable Long targetId,
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        subscriptionService.unsubscribe(auth.getUser(), targetId);
        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionDTO>> mySubscriptions(@AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<SubscriptionDTO> subscriptions = subscriptionService.getSubscriptions(auth.getUser())
                .stream()
                .map(SubscriptionDTO::new)
                .toList();
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<Map<String, Long>> followerCount(@PathVariable String username) {
        User user = userService.requireByUsername(username);
        long count = subscriptionService.countSubscribers(user);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
