package com.zone01.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.zone01.backend.dto.CommentDTO;
import com.zone01.backend.entity.Comment;
import com.zone01.backend.entity.Post;
import com.zone01.backend.entity.User;
import com.zone01.backend.repository.CommentRepository;

import jakarta.transaction.Transactional;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostService postService;

    public CommentService(CommentRepository commentRepository, PostService postService) {
        this.commentRepository = commentRepository;
        this.postService = postService;
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
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    // public Comment getCommentById(Long id) {
    //     return commentRepository.findById(id)
    //         .orElseThrow(() -> new CommentNotFoundException(id));
    // }
    
    public List<Comment> getCommentsByAuthor(User author) {
        return commentRepository.findByAuthor(author);
    }
}