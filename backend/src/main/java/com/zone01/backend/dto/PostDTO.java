package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.Post;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;

    public PostDTO(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorId = post.getAuthor().getId();
        this.authorUsername = post.getAuthor().getUsername();
        this.createdAt = post.getCreatedAt();
        this.updateAt = post.getUpdatedAt();
    }
}
