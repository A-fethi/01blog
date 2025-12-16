package com.zone01.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.zone01.backend.dto.PostDTO;
import com.zone01.backend.entity.MediaType;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.exception.PostNotFoundException;
import com.zone01.backend.exception.UnauthorizedActionException;
import com.zone01.backend.exception.UserNotFoundException;
import com.zone01.backend.repository.CommentRepository;
import com.zone01.backend.repository.LikeRepository;
import com.zone01.backend.repository.PostRepository;
import com.zone01.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final SubscriptionService subscriptionService;
    private final NotificationService notificationService;

    public PostService(PostRepository postRepository,
            UserRepository userRepository,
            LikeRepository likeRepository,
            CommentRepository commentRepository,
            SubscriptionService subscriptionService,
            NotificationService notificationService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.subscriptionService = subscriptionService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Post createPost(Long userId, PostDTO postDTO) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Post post = new Post();
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setMediaUrl(postDTO.getMediaUrl());
        post.setMediaPreviewUrl(postDTO.getMediaPreviewUrl());
        post.setMediaType(postDTO.getMediaType());
        post.setAuthor(author);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(java.time.LocalDateTime.now());

        Post saved = postRepository.save(post);
        notificationService.notifySubscribers(saved, subscriptionService.getSubscriberUsers(author));
        return saved;
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
        post.setMediaUrl(postDTO.getMediaUrl());
        post.setMediaPreviewUrl(postDTO.getMediaPreviewUrl());
        post.setMediaType(postDTO.getMediaType());
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

    @Transactional
    public void deletePostAsAdmin(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        postRepository.delete(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Post> getPostsByUser(Long userId) {
        return postRepository.findByAuthorId(userId);
    }

    public long countPostsByUser(Long userId) {
        return postRepository.countByAuthorId(userId);
    }

    public List<PostDTO> getPostsByUsername(String username, User currentUser) {
        return postRepository.findByAuthorUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(post -> toDto(post, currentUser))
                .collect(Collectors.toList());
    }

    public List<PostDTO> getAllPostsDTO(User currentUser) {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> toDto(post, currentUser))
                .collect(Collectors.toList());
    }

    public List<PostDTO> getFeedPosts(User user) {
        var followedIds = subscriptionService.getFollowedAuthorIds(user);
        if (followedIds.isEmpty()) {
            return List.of();
        }
        return postRepository.findByAuthorIdInOrderByCreatedAtDesc(followedIds)
                .stream()
                .map(post -> toDto(post, user))
                .collect(Collectors.toList());
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    public PostDTO getPostDetails(Long id, User currentUser) {
        return toDto(getPostById(id), currentUser);
    }

    private PostDTO toDto(Post post, User currentUser) {
        long likes = likeRepository.countByPostId(post.getId());
        long comments = commentRepository.countByPostId(post.getId());
        boolean isLiked = currentUser != null && likeRepository.existsByUserAndPost(currentUser, post);
        PostDTO postDTO = new PostDTO(post);
        if (postDTO.getMediaType() == null && postDTO.getMediaUrl() != null) {
            postDTO.setMediaType(guessMediaType(postDTO.getMediaUrl()));
        }
        return postDTO.withCounts(likes, comments).withIsLiked(isLiked);
    }

    private MediaType guessMediaType(String mediaUrl) {
        if (mediaUrl == null) {
            return null;
        }
        String lower = mediaUrl.toLowerCase();
        if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".avi") || lower.contains("video")) {
            return MediaType.VIDEO;
        }
        return MediaType.IMAGE;
    }
}
