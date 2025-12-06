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
    private String subscriberUsername;
    private LocalDateTime createdAt;

    public SubscriptionDTO(Subscription subscription) {
        this.id = subscription.getId();
        this.subscriberId = subscription.getSubscriber().getId();
        this.subscriberUsername = subscription.getSubscriber().getUsername();
        this.targetId = subscription.getTarget().getId();
        this.targetUsername = subscription.getTarget().getUsername();
        this.createdAt = subscription.getCreatedAt();
    }
}
