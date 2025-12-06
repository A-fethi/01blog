package com.zone01.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zone01.backend.entity.Subscription;
import com.zone01.backend.entity.User;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    boolean existsBySubscriberAndTarget(User subscriber, User target);
    Optional<Subscription> findBySubscriberAndTarget(User subscriber, User target);
    List<Subscription> findBySubscriber(User subscriber);
    List<Subscription> findBySubscriberId(Long subscriberId);
    List<Subscription> findByTarget(User target);
    List<Subscription> findByTargetId(Long targetId);
    long countByTarget(User target);
    long countBySubscriber(User subscriber);
}
