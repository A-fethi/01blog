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

    public LikeService(LikeRepository likeRepository, PostService postService) {
        this.likeRepository = likeRepository;
        this.postService = postService;
    }

    @Transactional
    public Like likePost(Long postId, User user) {
        Post post = postService.getPostById(postId);

        if (likeRepository.existsByUserAndPost(user, post)) {
            System.err.println("Post already liked");
        }

        Like like = new Like(user, post);
        return likeRepository.save(like);
    }

    @Transactional
    public void unlikePost(Long postId, User user) {
        Post post = postService.getPostById(postId);
        Like like = likeRepository.findByUserAndPost(user, post).orElseThrow();
        
        likeRepository.delete(like);
    }
}