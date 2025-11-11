package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.Comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO {

    private Long id;
    private String content;
    private String commentUsername;
    private Long commentId;
    private Long postId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor from Comment entity
    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.commentId = comment.getAuthor().getId();
        this.commentUsername = comment.getAuthor().getUsername();
        this.postId = comment.getPost().getId();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
    }
}
