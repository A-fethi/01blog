package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.Like;
import com.zone01.backend.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeDTO {

    private Long id;
    private User user;
    private Long postId;
    private LocalDateTime createdAt;

    public LikeDTO(Like like) {
        this.id = like.getId();
        this.user = like.getUser();
        this.postId = like.getPost().getId();
        this.createdAt = like.getCreatedAt();
    }
}
