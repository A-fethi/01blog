package com.zone01.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zone01.backend.dto.NotificationDTO;
import com.zone01.backend.entity.Notification;
import com.zone01.backend.security.AppUserDetails;
import com.zone01.backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(@AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<NotificationDTO> notifications = notificationService.getNotifications(auth.getUser())
                .stream()
                .map(NotificationDTO::new)
                .toList();
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Notification notification = notificationService.markAsRead(notificationId, auth.getUser());
        return ResponseEntity.ok(new NotificationDTO(notification));
    }

    @PatchMapping("/{notificationId}/unread")
    public ResponseEntity<NotificationDTO> markAsUnread(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Notification notification = notificationService.markAsUnread(notificationId, auth.getUser());
        return ResponseEntity.ok(new NotificationDTO(notification));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        notificationService.markAllAsRead(auth.getUser());
        return ResponseEntity.ok(Map.of("message", "Notifications marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal AppUserDetails auth) {
        if (auth == null || auth.getUser() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        long count = notificationService.unreadCount(auth.getUser());
        return ResponseEntity.ok(Map.of("count", count));
    }
}
