package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.Subscription;

import lombok.Data;

@Data
public class SubscriptionDTO {
    private Long id;
    private Long subscriberId;
    private Long targetId;
    private String targetUsername;
    private String targetAvatarUrl;
    private String subscriberUsername;
    private String subscriberAvatarUrl;
    private LocalDateTime createdAt;

    public SubscriptionDTO(Subscription subscription) {
        this.id = subscription.getId();
        this.subscriberId = subscription.getSubscriber().getId();
        this.subscriberUsername = subscription.getSubscriber().getUsername();
        this.subscriberAvatarUrl = subscription.getSubscriber().getAvatarUrl();
        this.targetId = subscription.getTarget().getId();
        this.targetUsername = subscription.getTarget().getUsername();
        this.targetAvatarUrl = subscription.getTarget().getAvatarUrl();
        this.createdAt = subscription.getCreatedAt();
    }
}
