package com.zone01.backend.dto;

import java.time.LocalDateTime;
import com.zone01.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String avatarUrl;
    private boolean banned;
    private Long postCount;
    private Long subscriberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.avatarUrl = user.getAvatarUrl();
        this.banned = user.isBanned();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }

    public UserDTO withStats(long posts, long subscribers) {
        this.postCount = posts;
        this.subscriberCount = subscribers;
        return this;
    }

    public UserDTO hideSensitiveInfo() {
        this.id = null;
        this.email = null;
        this.role = null;
        this.banned = false;
        this.createdAt = null;
        this.updatedAt = null;
        return this;
    }
}