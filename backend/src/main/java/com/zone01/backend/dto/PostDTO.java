package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.MediaType;
import com.zone01.backend.entity.Post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;
    private Long authorId;
    private String authorUsername;
    private String mediaUrl;
    private String mediaPreviewUrl;
    private MediaType mediaType;
    private Long likeCount;
    private Long commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;

    public PostDTO(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorId = post.getAuthor().getId();
        this.authorUsername = post.getAuthor().getUsername();
        this.mediaUrl = post.getMediaUrl();
        this.mediaPreviewUrl = post.getMediaPreviewUrl();
        this.mediaType = post.getMediaType();
        this.createdAt = post.getCreatedAt();
        this.updateAt = post.getUpdatedAt();
    }

    public PostDTO withCounts(long likes, long comments) {
        this.likeCount = likes;
        this.commentCount = comments;
        return this;
    }
}
