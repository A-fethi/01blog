package com.zone01.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zone01.backend.dto.PostDTO;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.exception.PostNotFoundException;
import com.zone01.backend.exception.UnauthorizedActionException;
import com.zone01.backend.exception.UserNotFoundException;
import com.zone01.backend.repository.PostRepository;
import com.zone01.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Post createPost(Long userId, PostDTO postDTO) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Post post = new Post();
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setAuthor(author);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(java.time.LocalDateTime.now());

        return postRepository.save(post);
    }

    @Transactional
    public Post updatePost(Long postId, User loggedUser, PostDTO postDTO) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        if (!post.getAuthor().getId().equals(loggedUser.getId())) {
            throw new UnauthorizedActionException("You cannot edit this post");
        }

        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId, User loggedUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        if (!post.getAuthor().getId().equals(loggedUser.getId())) {
            throw new UnauthorizedActionException("You cannot delete this post");
        }

        postRepository.delete(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Post> getPostsByUser(Long userId) {
        return postRepository.findByAuthorId(userId);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }
}
