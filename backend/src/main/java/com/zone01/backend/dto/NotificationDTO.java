package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.Notification;

import lombok.Data;

@Data
public class NotificationDTO {
    private Long id;
    private String type;
    private String message;
    private boolean read;
    private Long postId;
    private LocalDateTime createdAt;

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType().name();
        this.message = notification.getMessage();
        this.read = notification.isRead();
        this.postId = notification.getPost() != null ? notification.getPost().getId() : null;
        this.createdAt = notification.getCreatedAt();
    }
}
