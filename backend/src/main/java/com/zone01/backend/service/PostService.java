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
        post.setAuthor(author);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        if (postDTO.getMedia() != null) {
            for (com.zone01.backend.dto.PostMediaDTO mDto : postDTO.getMedia()) {
                com.zone01.backend.entity.PostMedia media = new com.zone01.backend.entity.PostMedia();
                media.setMediaUrl(mDto.getMediaUrl());
                media.setMediaType(
                        mDto.getMediaType() != null ? mDto.getMediaType() : guessMediaType(mDto.getMediaUrl()));
                media.setPost(post);
                post.getMedia().add(media);
            }
        }

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

        // Update media: for simplicity, we replace all media
        if (postDTO.getMedia() != null) {
            post.getMedia().clear();
            for (com.zone01.backend.dto.PostMediaDTO mDto : postDTO.getMedia()) {
                com.zone01.backend.entity.PostMedia media = new com.zone01.backend.entity.PostMedia();
                media.setMediaUrl(mDto.getMediaUrl());
                media.setMediaType(
                        mDto.getMediaType() != null ? mDto.getMediaType() : guessMediaType(mDto.getMediaUrl()));
                media.setPost(post);
                post.getMedia().add(media);
            }
        }
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

    @Transactional
    public void hidePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        post.setHidden(true);
        postRepository.save(post);
    }

    @Transactional
    public void unhidePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        post.setHidden(false);
        postRepository.save(post);
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

    public long countAllPosts() {
        return postRepository.count();
    }

    public List<PostDTO> getPostsByUsername(String username, User currentUser) {
        List<Post> posts = postRepository.findVisibleByAuthorUsernameOrderByCreatedAtDesc(username);
        java.util.Set<Long> likedPostIds = currentUser != null ? likeRepository.findPostIdsLikedByUser(currentUser)
                : java.util.Collections.emptySet();

        return posts.stream()
                .map(post -> toDto(post, likedPostIds))
                .collect(Collectors.toList());
    }

    public List<PostDTO> getAllPostsDTO(User currentUser) {
        List<Post> posts = postRepository.findAllVisibleByOrderByCreatedAtDesc();
        java.util.Set<Long> likedPostIds = currentUser != null ? likeRepository.findPostIdsLikedByUser(currentUser)
                : java.util.Collections.emptySet();

        return posts.stream()
                .map(post -> toDto(post, likedPostIds))
                .collect(Collectors.toList());
    }

    public List<PostDTO> getAllPostsForAdmin() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(post -> toDto(post, java.util.Collections.emptySet()))
                .collect(Collectors.toList());
    }

    public List<PostDTO> getFeedPosts(User user) {
        var followedIds = subscriptionService.getFollowedAuthorIds(user);
        if (followedIds.isEmpty()) {
            return List.of();
        }
        List<Post> posts = postRepository.findVisibleByAuthorIdInOrderByCreatedAtDesc(followedIds);
        java.util.Set<Long> likedPostIds = user != null ? likeRepository.findPostIdsLikedByUser(user)
                : java.util.Collections.emptySet();

        return posts.stream()
                .map(post -> toDto(post, likedPostIds))
                .collect(Collectors.toList());
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    public PostDTO getPostDetails(Long id, User currentUser) {
        Post post = getPostById(id);
        boolean isLiked = currentUser != null && likeRepository.existsByUserAndPost(currentUser, post);
        return new PostDTO(post).withIsLiked(isLiked);
    }

    private PostDTO toDto(Post post, java.util.Set<Long> likedPostIds) {
        PostDTO postDTO = new PostDTO(post);
        return postDTO.withIsLiked(likedPostIds.contains(post.getId()));
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
