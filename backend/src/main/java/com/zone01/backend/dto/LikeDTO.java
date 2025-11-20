package com.zone01.backend.dto;

import java.time.LocalDateTime;

import com.zone01.backend.entity.Like;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeDTO {

    private Long id;
    private UserDTO user;
    private Long postId;
    private LocalDateTime createdAt;

    public LikeDTO(Like like) {
        this.id = like.getId();
        this.user = new UserDTO(like.getUser());
        this.postId = like.getPost().getId();
        this.createdAt = like.getCreatedAt();
    }
}
