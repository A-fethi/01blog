package com.zone01.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.zone01.backend.entity.Notification;
import com.zone01.backend.entity.NotificationType;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.repository.NotificationRepository;

import jakarta.transaction.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notifySubscribers(Post post, List<User> subscribers) {
        if (subscribers.isEmpty()) {
            return;
        }

        List<Notification> notifications = subscribers.stream()
                .filter(subscriber -> !subscriber.getId().equals(post.getAuthor().getId()))
                .map(subscriber -> {
                    Notification notification = new Notification(
                        subscriber,
                        post,
                        post.getAuthor().getUsername() + " published a new post");
                    notification.setType(NotificationType.NEW_POST);
                    return notification;
                })
                .toList();

        notificationRepository.saveAll(notifications);
    }

    public List<Notification> getNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    @Transactional
    public Notification markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, user)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .filter(notification -> !notification.isRead())
                .toList();

        if (!notifications.isEmpty()) {
            notifications.forEach(notification -> notification.setRead(true));
            notificationRepository.saveAll(notifications);
        }
    }

    public long unreadCount(User user) {
        return notificationRepository.countByRecipientAndReadIsFalse(user);
    }
}
