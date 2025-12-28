package com.zone01.backend.service;

import org.springframework.stereotype.Service;

import com.zone01.backend.entity.Like;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.repository.LikeRepository;

import jakarta.transaction.Transactional;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostService postService;
    private final NotificationService notificationService;

    public LikeService(LikeRepository likeRepository, PostService postService,
            NotificationService notificationService) {
        this.likeRepository = likeRepository;
        this.postService = postService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Like likePost(Long postId, User user) {
        Post post = postService.getPostById(postId);

        if (likeRepository.existsByUserAndPost(user, post)) {
            throw new IllegalStateException("You already liked this post");
        }

        Like like = new Like(user, post);
        Like savedLike = likeRepository.save(like);
        notificationService.createLikeNotification(user, post);
        return savedLike;
    }

    @Transactional
    public void unlikePost(Long postId, User user) {
        Post post = postService.getPostById(postId);
        Like like = likeRepository.findByUserAndPost(user, post)
                .orElseThrow(() -> new IllegalStateException("You haven't liked this post yet"));

        likeRepository.delete(like);
    }
}
