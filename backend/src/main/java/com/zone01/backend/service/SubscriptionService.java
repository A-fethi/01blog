package com.zone01.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.zone01.backend.entity.Subscription;
import com.zone01.backend.entity.User;
import com.zone01.backend.exception.UserNotFoundException;
import com.zone01.backend.repository.SubscriptionRepository;
import com.zone01.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, UserRepository userRepository,
            NotificationService notificationService) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Subscription subscribe(User subscriber, Long targetUserId) {
        if (subscriber.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot subscribe to yourself");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException(targetUserId));

        if (subscriptionRepository.existsBySubscriberAndTarget(subscriber, target)) {
            throw new IllegalStateException("Already subscribed to this user");
        }

        Subscription subscription = subscriptionRepository.save(new Subscription(subscriber, target));
        notificationService.createFollowNotification(subscriber, target);
        return subscription;
    }

    @Transactional
    public void unsubscribe(User subscriber, Long targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException(targetUserId));

        Subscription subscription = subscriptionRepository.findBySubscriberAndTarget(subscriber, target)
                .orElseThrow(() -> new IllegalStateException("Subscription not found"));

        subscriptionRepository.delete(subscription);
    }

    public long countSubscribers(User user) {
        return subscriptionRepository.countByTarget(user);
    }

    public long countSubscriptions(User user) {
        return subscriptionRepository.countBySubscriber(user);
    }

    public boolean isSubscribed(User subscriber, User target) {
        return subscriptionRepository.existsBySubscriberAndTarget(subscriber, target);
    }

    public List<Long> getFollowedAuthorIds(User subscriber) {
        return subscriptionRepository.findBySubscriber(subscriber)
                .stream()
                .map(subscription -> subscription.getTarget().getId())
                .toList();
    }

    public List<Subscription> getSubscriptions(User subscriber) {
        return subscriptionRepository.findBySubscriber(subscriber);
    }

    public List<Subscription> getSubscribers(User target) {
        return subscriptionRepository.findByTarget(target);
    }

    public List<User> getSubscriberUsers(User target) {
        return subscriptionRepository.findByTarget(target)
                .stream()
                .map(Subscription::getSubscriber)
                .toList();
    }
}
