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
    private Long actorId;
    private String actorUsername;
    private String actorAvatarUrl;
    private Long targetId;
    private LocalDateTime createdAt;

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType() != null ? notification.getType().name() : "NEW_POST";
        this.message = notification.getMessage();
        this.read = notification.isRead();
        this.postId = notification.getPost() != null ? notification.getPost().getId() : null;
        if (notification.getActor() != null) {
            this.actorId = notification.getActor().getId();
            this.actorUsername = notification.getActor().getUsername();
            this.actorAvatarUrl = notification.getActor().getAvatarUrl();
        }
        this.targetId = notification.getTargetId();
        this.createdAt = notification.getCreatedAt();
    }
}
