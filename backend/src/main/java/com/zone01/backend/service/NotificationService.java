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
                .map(subscriber -> new Notification(
                        subscriber,
                        post.getAuthor(),
                        post,
                        NotificationType.NEW_POST,
                        post.getAuthor().getUsername() + " published a new post: " + post.getTitle()))
                .toList();

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void createLikeNotification(User actor, Post post) {
        if (actor.getId().equals(post.getAuthor().getId())) {
            return;
        }
        Notification notification = new Notification(
                post.getAuthor(),
                actor,
                post,
                NotificationType.LIKE,
                actor.getUsername() + " liked your post: " + post.getTitle());
        notificationRepository.save(notification);
    }

    @Transactional
    public void createCommentNotification(User actor, Post post) {
        if (actor.getId().equals(post.getAuthor().getId())) {
            return;
        }
        Notification notification = new Notification(
                post.getAuthor(),
                actor,
                post,
                NotificationType.COMMENT,
                actor.getUsername() + " commented on your post: " + post.getTitle());
        notificationRepository.save(notification);
    }

    @Transactional
    public void createShareNotification(User actor, Post post) {
        if (actor.getId().equals(post.getAuthor().getId())) {
            return;
        }
        Notification notification = new Notification(
                post.getAuthor(),
                actor,
                post,
                NotificationType.SHARE,
                actor.getUsername() + " shared your post: " + post.getTitle());
        notificationRepository.save(notification);
    }

    @Transactional
    public void createFollowNotification(User actor, User recipient) {
        Notification notification = new Notification(
                recipient,
                actor,
                actor.getId(),
                NotificationType.FOLLOW,
                actor.getUsername() + " started following you");
        notificationRepository.save(notification);
    }

    @Transactional
    public void createReportNotification(User actor, Long targetId, String type, List<User> admins) {
        List<Notification> notifications = admins.stream()
                .map(admin -> new Notification(
                        admin,
                        actor,
                        targetId,
                        NotificationType.REPORT,
                        actor.getUsername() + " reported a " + type))
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
    public Notification markAsUnread(Long notificationId, User user) {
        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, user)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(false);
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
