package com.zone01.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.zone01.backend.dto.CommentDTO;
import com.zone01.backend.entity.Comment;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.repository.CommentRepository;

import com.zone01.backend.exception.CommentNotFoundException;
import com.zone01.backend.exception.UnauthorizedActionException;
import jakarta.transaction.Transactional;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostService postService;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository, PostService postService,
            NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.postService = postService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Comment createComment(User user, Long postId, CommentDTO commentDTO) {
        Post post = postService.getPostById(postId);

        if (commentDTO.getContent() == null || commentDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }

        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setCreatedAt(java.time.LocalDateTime.now());
        comment.setUpdatedAt(java.time.LocalDateTime.now());
        Comment savedComment = commentRepository.save(comment);
        notificationService.createCommentNotification(user, post);
        return savedComment;
    }

    public List<Comment> getCommentsByPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new CommentNotFoundException(id));
    }

    @Transactional
    public Comment updateComment(Long commentId, User user, CommentDTO commentDTO) {
        Comment comment = getCommentById(commentId);
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new UnauthorizedActionException("You cannot edit this comment");
        }
        comment.setContent(commentDTO.getContent());
        comment.setUpdatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = getCommentById(commentId);
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new UnauthorizedActionException("You cannot delete this comment");
        }
        commentRepository.delete(comment);
    }

    public List<Comment> getCommentsByAuthor(User author) {
        return commentRepository.findByAuthor(author);
    }
}