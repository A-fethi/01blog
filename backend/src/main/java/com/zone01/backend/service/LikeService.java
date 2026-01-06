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

        return likeRepository.findByUserAndPost(user, post)
                .orElseGet(() -> {
                    Like like = new Like(user, post);
                    Like savedLike = likeRepository.save(like);
                    notificationService.createLikeNotification(user, post);
                    return savedLike;
                });
    }

    @Transactional
    public void unlikePost(Long postId, User user) {
        Post post = postService.getPostById(postId);
        likeRepository.findByUserAndPost(user, post)
                .ifPresent(likeRepository::delete);
    }
}
